import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';

class SimpleMemoryStore {
  docs: Document[] = [];
  async addDocuments(docs: Document[]) {
    this.docs.push(...docs);
  }
  async similaritySearch(query: string, k: number, filterFunc?: any) {
    let results = this.docs;
    if (filterFunc) results = results.filter(filterFunc);
    return results.slice(0, k);
  }
  asRetriever({ k, filter }: any) {
    return {
      invoke: async (q: string) => {
        let results = this.docs;
        if (filter && Object.keys(filter).length > 0) {
          results = results.filter(d => {
            for (const key of Object.keys(filter)) {
              if (d.metadata[key] !== filter[key]) return false;
            }
            return true;
          });
        }
        return results.slice(0, k);
      }
    };
  }
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private llm: ChatGoogleGenerativeAI;
  public vectorStore: SimpleMemoryStore;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    private events: EventsGateway,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    this.llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0,
    });

    this.vectorStore = new SimpleMemoryStore();
    this.logger.log('Memory vector store initialized');
  }

  public updateApiKey(newApiKey: string) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: newApiKey,
      model: 'gemini-2.5-flash',
      temperature: 0,
    });
    this.logger.log('Gemini API Key updated dynamically.');
  }

  async askQuestion(question: string, scopeFilter: any = {}): Promise<string> {
    try {
      // MemoryVectorStore filter function takes the Document object
      const filterFunc = (doc: Document) => {
        if (!scopeFilter || Object.keys(scopeFilter).length === 0) return true;
        for (const key of Object.keys(scopeFilter)) {
          if (doc.metadata[key] !== scopeFilter[key]) return false;
        }
        return true;
      };

      const docs = await this.vectorStore.similaritySearch(question, 5, filterFunc);
      const context = docs.map((doc: any) => doc.pageContent).join('\n\n');

      const prompt = `You are an enterprise knowledge base AI Copilot.
You have access to company documents provided in the Context below.
If the user's question can be answered using the Context, answer it based on the documents.
If the Context does not contain the specific company information needed, DO NOT output a generic error message. Instead, respond naturally as a helpful AI assistant:
1. Politely mention that you don't have the specific company documents for their exact query.
2. Provide a helpful, general response or advice based on your broader AI knowledge, noting that their specific company policy might differ.
Always be conversational, friendly, and act as a true intelligent assistant.

Context:
${context || 'No documents available for this context.'}

Question: ${question}

Answer:`;

      const response = await this.llm.invoke(prompt);
      return response.content as string;
    } catch (error) {
      this.logger.error('Error asking question:', error);
      return "An error occurred while processing your request.";
    }
  }

  async askQuestionStream(question: string, clientId: string, scopeFilter: any = {}): Promise<void> {
    try {
      this.events.server.to(clientId).emit('chat-stream-start');

      const filterFunc = (doc: Document) => {
        if (!scopeFilter || Object.keys(scopeFilter).length === 0) return true;
        for (const key of Object.keys(scopeFilter)) {
          if (doc.metadata[key] !== scopeFilter[key]) return false;
        }
        return true;
      };

      const docs = await this.vectorStore.similaritySearch(question, 5, filterFunc);
      const context = docs.map((doc: any) => doc.pageContent).join('\n\n');

      const sources = docs.map((doc: any) => ({
        title: doc.metadata?.source || 'Unknown Source',
        id: doc.metadata?.documentId
      }));
      // Remove duplicates
      const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.id, item])).values());

      const prompt = `You are an enterprise knowledge base AI Copilot.
You have access to company documents provided in the Context below.
If the user's question can be answered using the Context, answer it based on the documents.
If the Context does not contain the specific company information needed, DO NOT output a generic error message. Instead, respond naturally as a helpful AI assistant:
1. Politely mention that you don't have the specific company documents for their exact query.
2. Provide a helpful, general response or advice based on your broader AI knowledge, noting that their specific company policy might differ.
Always be conversational, friendly, and act as a true intelligent assistant. Provide a well-formatted markdown response.

Context:
${context || 'No documents available for this context.'}

Question: ${question}

Answer:`;

      const stream = await this.llm.stream(prompt);

      for await (const chunk of stream) {
        if (chunk.content) {
          this.events.server.to(clientId).emit('chat-stream-chunk', chunk.content);
        }
      }

      this.events.server.to(clientId).emit('chat-stream-end', { sources: context.trim() ? uniqueSources : [] });
    } catch (error) {
      this.logger.error('Error streaming question:', error);
      this.events.server.to(clientId).emit('chat-stream-error', 'An error occurred while processing your request.');
    }
  }

  async addDocuments(docs: Document[]): Promise<void> {
    try {
      await this.vectorStore.addDocuments(docs);
      this.logger.log(`Added ${docs.length} documents to memory store.`);
    } catch (error) {
      this.logger.error('Failed to add documents:', error);
      throw error;
    }
  }

  async detectKnowledgeGaps(teamId?: string) {
    const failedSearches = await this.db.searchEvent.findMany({
      where: { success: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalSearches = await this.db.searchEvent.count();
    const failedSearchesCount = await this.db.searchEvent.count({ where: { success: false } });
    const searchFailureRate = totalSearches > 0 ? (failedSearchesCount / totalSearches) * 100 : 0;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const outdatedDocuments = await this.db.document.count({
      where: { updatedAt: { lt: sixMonthsAgo } }
    });

    const knowledgeScore = Math.max(0, 100 - (searchFailureRate * 2) - (outdatedDocuments * 0.1));
    const metrics = {
      searchFailureRate: searchFailureRate.toFixed(1),
      outdatedDocuments,
      knowledgeScore: Math.round(knowledgeScore)
    };

    if (failedSearches.length === 0) return { gaps: [], metrics };

    const searchQueries = failedSearches.map(s => s.query).join('\n');

    const prompt = `
      The following are search queries that employees have recently searched for, but the knowledge base returned ZERO results or failed:
      ${searchQueries}

      Analyze these queries and identify the top 3 missing knowledge gaps in the organization.
      Format your response as a JSON array with 'gap' (string) and 'recommendation' (string) for what document needs to be created.
    `;

    const response = await this.llm.invoke(prompt);
    
    try {
      const contentStr = response.content as string;
      const jsonStr = contentStr.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(jsonStr);
      const gaps = Array.isArray(parsed) ? parsed : (parsed.gaps || []);
      return { gaps, metrics };
    } catch (e) {
      this.logger.error('Failed to parse knowledge gaps json', e);
      return { gaps: [], metrics };
    }
  }

  async generateSummary(documentId: string) {
    const doc = await this.db.document.findUnique({ where: { id: documentId }});
    if (!doc || !doc.content) throw new Error('Document has no content to summarize');

    const prompt = `Summarize the following document into a concise executive summary and 3 key bullet points.\n\nDocument Title: ${doc.title}\n\nContent: ${doc.content.substring(0, 25000)}`;
    const response = await this.llm.invoke(prompt);
    
    return response.content as string;
  }
}
