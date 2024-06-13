import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from 'src/configurations/multer/multer.module';

@Module({
  imports: [MulterModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
