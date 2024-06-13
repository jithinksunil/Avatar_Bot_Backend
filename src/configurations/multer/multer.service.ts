import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import axios from 'axios';

v2.config({
  cloud_name: 'df8w69xon',
  api_key: '818129511951146',
  api_secret: '_R4yasVlyG3hpD01R8M1Fbz4i6I',
});
@Injectable()
export class MulterService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiErrorResponse | String> {
    return new Promise((resolve) => {
      const uploadStream = v2.uploader.upload_stream((error, result) => {
        if (error) {
          throw new BadRequestException('File connot be uploaded');
        }
        resolve(result.public_id);
      });
      uploadStream.end(file.buffer);
    });
  }
  async getFileBuffer(publicId: string): Promise<Buffer> {
    const url = v2.url(publicId, { resource_type: 'image' }); // Adjust resource_type and format as needed
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}
