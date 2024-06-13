import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { GoogleModule } from 'src/configurations/google-api/google.module';

@Module({
  imports: [GoogleModule],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
