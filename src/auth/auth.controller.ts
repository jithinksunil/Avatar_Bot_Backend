import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('/google/signin')
  signinWithGoogle() {
    return this.authService.signinWithGoogle();
  }
  @Get('/google/generate-token')
  genarateGoogleTokens(@Query() query: { code: string }) {
    return this.authService.generateGoogleTokens(query.code);
  }
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Post('/google/refresh')
  newAccessToken(@Body() body: RefreshTokenDto) {
    return this.authService.newAccessToken(body.refreshToken);
  }

  @Get('/profile')
  getProfile(@Headers('authorization') accessToken: string) {
    return this.authService.getProfile(accessToken);
  }
}
