import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    console.log('This is the Pdf analyser api');
    return { message: 'Pdf analyser api' };
  }
}
