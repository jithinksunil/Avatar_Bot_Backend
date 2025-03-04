import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { GoogleService } from 'src/configurations/google-api/google.service';
import { MulterService } from 'src/configurations/multer/multer.service';
import { OpenAiService } from 'src/configurations/openAi/openAi.service';
import { PrismaService } from 'src/configurations/prisma/prisma.service';
import * as pdf from 'pdf-parse';
@Injectable()
export class AnalyserService {
  constructor(
    private commonService: CommonService,
    private OpenAiService: OpenAiService,
    private googleService: GoogleService,
    private prisma: PrismaService,
    private multer: MulterService,
  ) {}
  async getAnswer(fileId: string, question: string, accessToken: string) {
    const extractedText = await this.commonService.extractFromFile(
      fileId,
      accessToken,
    );
    let file = await this.prisma.file.findUnique({
      where: { gDriveId: fileId },
      select: { questions: true },
    });
    if (!file) {
      file = await this.prisma.file.create({
        data: {
          gDriveId: fileId,
        },
        select: {
          questions: true,
        },
      });
    }

    const previousQuestions: string[] = file.questions.map(
      (item) => item.question,
    );

    const answer = await this.OpenAiService.analyseWithOpenAi(
      extractedText,
      question,
      previousQuestions,
    );
    file = await this.prisma.file.update({
      where: { gDriveId: fileId },
      data: { questions: { create: { question, answer } } },
      select: { questions: true },
    });
    return { questions: file.questions };
  }

  async getAutoGeneratedQuestions(accessToken: string) {
    const files = await this.googleService.getAllPdfFiles(accessToken);
    return { files };
  }

  async generateQuestions(fileId: string) {
    const buffer = await this.multer.getFileBuffer(fileId);
    const text = await pdf(buffer).then(function (data) {
      return data.text;
    });
  }

  async getAllQuestions(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { gDriveId: fileId },
      select: { questions: true },
    });

    return { questions: file?.questions || [] };
  }
}
