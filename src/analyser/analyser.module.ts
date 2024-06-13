import { Module } from '@nestjs/common';
import { AnalyserService } from './analyser.service';
import { AnalyserController } from './analyser.controller';
import { CommonModule } from 'src/common/common.module';
import { GoogleModule } from 'src/configurations/google-api/google.module';
import { OpenAiModule } from 'src/configurations/openAi/openAi.module';
import { PrismaModule } from 'src/configurations/prisma/prisma.module';

@Module({
  imports: [CommonModule, GoogleModule, OpenAiModule, PrismaModule],
  providers: [AnalyserService],
  controllers: [AnalyserController],
})
export class AnalyserModule {}
