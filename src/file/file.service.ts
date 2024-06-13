import { Injectable } from '@nestjs/common';
import { MulterService } from 'src/configurations/multer/multer.service';
@Injectable()
export class FileService {
  constructor(private multer: MulterService) {}
  async uploadFile(file: Express.Multer.File): Promise<any> {
    const fileId = await this.multer.uploadImage(file);
    return { message: 'File Uploaded', fileId };
  }
}
