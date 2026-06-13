import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private db: DatabaseService,
    private ai: AiService,
    private events: EventsGateway,
  ) {}

  async globalSearch(query: string, scopeFilter: any = {}) {
    if (!query || query.trim().length === 0) {
      return { documents: [], teams: [] };
    }

    try {
      // 1. Semantic search in Qdrant via AiService
      const vectorStore = (this.ai as any).vectorStore;
      let documents = [];
      
      if (vectorStore) {
        const retriever = vectorStore.asRetriever({
          k: 5,
          filter: scopeFilter,
        });
        
        const docs = await retriever.invoke(query);
        // Map Langchain docs to our DB documents by matching content or metadata if possible
        // For MVP, we will just return the raw retrieved text as "matches"
        documents = docs.map((d: any) => ({
          title: d.metadata?.title || 'Knowledge Match',
          snippet: d.pageContent.substring(0, 150) + '...',
          source: d.metadata?.source || 'Document',
        }));
      }

      // 2. Keyword search in PostgreSQL for Teams
      const teams = await this.db.team.findMany({
        where: {
          name: { contains: query },
        },
        take: 3,
      });

      // 3. Log Analytics
      const totalResults = documents.length + teams.length;
      await this.db.searchEvent.create({
        data: {
          query,
          success: totalResults > 0,
          resultsCount: totalResults,
        },
      });

      this.events.server.emit('analytics-updated');

      return {
        documents,
        teams,
      };
    } catch (e) {
      this.logger.error('Search failed:', e);
      // Log failure
      await this.db.searchEvent.create({
        data: {
          query,
          success: false,
          resultsCount: 0,
        },
      });
      this.events.server.emit('analytics-updated');
      throw e;
    }
  }

  async getSearchAnalytics() {
    const totalSearches = await this.db.searchEvent.count();
    const failedSearches = await this.db.searchEvent.count({ where: { success: false } });
    
    return {
      totalSearches,
      failedSearches,
      failureRate: totalSearches > 0 ? (failedSearches / totalSearches) * 100 : 0,
    };
  }
}
