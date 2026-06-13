import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private db: DatabaseService,
    private ai: AiService,
    private events: EventsGateway,
  ) {}

  async processDocumentInline(documentId: string, filePath?: string, mimetype?: string) {
    try {
      this.logger.log(`Processing document ${documentId}...`);
      const document = await this.db.document.findUnique({
        where: { id: documentId },
      });

      if (!document) throw new Error('Document not found');

      this.events.broadcastToTeam('global', 'document-status', { id: documentId, status: 'PROCESSING', step: 'Extracting Text' });

      let rawContent = document.content || '';

      if (document.sourceType === 'FILE' && filePath) {
        if (mimetype === 'application/pdf') {
          const pdf = require('pdf-parse');
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(dataBuffer);
          rawContent = pdfData.text;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filePath.endsWith('.docx')) {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ path: filePath });
          rawContent = result.value;
        } else {
          rawContent = fs.readFileSync(filePath, 'utf8');
        }
        
        await this.db.document.update({
          where: { id: documentId },
          data: { content: rawContent },
        });
      }

      if (!rawContent) throw new Error('No content to process');

      this.events.broadcastToTeam('global', 'document-status', { id: documentId, status: 'PROCESSING', step: 'Chunking Content' });

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await textSplitter.createDocuments([rawContent], [
        {
          source: document.title,
          documentId: document.id,
          ownerId: document.ownerId,
          teamId: document.teamId,
          scope: document.scope,
        },
      ]);

      this.events.broadcastToTeam('global', 'document-status', { id: documentId, status: 'PROCESSING', step: 'Generating Embeddings' });

      await this.ai.addDocuments(docs);

      await this.db.document.update({
        where: { id: documentId },
        data: { status: 'READY' },
      });

      this.events.broadcastToTeam('global', 'document-status', { id: documentId, status: 'READY', step: 'Completed' });

      this.logger.log(`Successfully ingested document ${documentId}`);
    } catch (error: any) {
      this.logger.error(`Failed to ingest document ${documentId}`, error?.stack);
      await this.db.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      this.events.broadcastToTeam('global', 'document-status', { id: documentId, status: 'FAILED', step: 'Error' });
    }
  }

  async uploadManualText(
    title: string,
    content: string,
    ownerId: string,
    teamId?: string,
    scope: string = 'PERSONAL',
  ) {
    const document = await this.db.document.create({
      data: {
        title,
        content,
        sourceType: 'MANUAL_TEXT',
        status: 'PROCESSING',
        ownerId,
        teamId,
        scope,
      },
    });

    // Fire and forget processing
    this.processDocumentInline(document.id).catch(e => console.error(e));

    this.logger.log(`Started processing document ${document.id}`);
    return document;
  }

  async uploadFile(
    file: Express.Multer.File,
    title: string,
    ownerId: string,
    teamId?: string,
    scope: string = 'PERSONAL',
  ) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    
    const fileKey = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileKey);
    fs.writeFileSync(filePath, file.buffer);

    let owner = await this.db.user.findFirst();
    if (!owner) {
      owner = await this.db.user.create({
        data: {
          slackId: 'MVP_USER',
          name: 'MVP Admin',
          email: 'admin@mvp.com',
          role: 'ORG_ADMIN'
        }
      });
    }

    const document = await this.db.document.create({
      data: {
        title,
        fileKey,
        sourceType: 'FILE',
        status: 'PROCESSING',
        ownerId: owner.id,
        teamId,
        scope,
      },
    });

    // Fire and forget processing
    this.processDocumentInline(document.id, filePath, file.mimetype).catch(e => console.error(e));

    this.logger.log(`Started processing file document ${document.id}`);
    return document;
  }

  async getAllDocuments() {
    return this.db.document.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        scope: true,
        updatedAt: true,
      }
    });
  }

  async getDocument(id: string) {
    return this.db.document.findUnique({
      where: { id }
    });
  }

  async deleteDocument(id: string) {
    return this.db.document.delete({ where: { id } });
  }

  async getDocumentVersions(id: string) {
    return this.db.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { versionNum: 'desc' },
    });
  }
}
