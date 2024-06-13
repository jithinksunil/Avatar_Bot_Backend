import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleModule } from 'src/configurations/google-api/google.module';

@Module({
  imports: [GoogleModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
