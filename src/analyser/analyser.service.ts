import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { GoogleService } from 'src/configurations/google-api/google.service';
import { OpenAiService } from 'src/configurations/openAi/openAi.service';
import { PrismaService } from 'src/configurations/prisma/prisma.service';

@Injectable()
export class AnalyserService {
  constructor(
    private commonService: CommonService,
    private OpenAiService: OpenAiService,
    private googleService: GoogleService,
    private prisma: PrismaService,
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
  async getAllPdfFiles(accessToken: string) {
    const files = await this.googleService.getAllPdfFiles(accessToken);
    return { files };
  }

  async getAllQuestions(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { gDriveId: fileId },
      select: { questions: true },
    });

    return { questions: file?.questions || [] };
  }
}
