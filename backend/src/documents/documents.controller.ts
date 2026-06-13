import { Controller, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

export class UploadManualTextDto {
  title: string;
  content: string;
  ownerId: string;
  teamId?: string;
  scope?: string;
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.uploadFile(
      file,
      body.title || file.originalname,
      body.ownerId,
      body.teamId,
      body.scope,
    );
  }

  @Get()
  async getAllDocuments() {
    return this.documentsService.getAllDocuments();
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    return this.documentsService.getDocumentVersions(id);
  }
}
