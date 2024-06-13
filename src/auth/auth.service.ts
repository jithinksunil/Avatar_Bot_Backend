import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleService } from 'src/configurations/google-api/google.service';

@Injectable()
export class AuthService {
  constructor(private googleService: GoogleService) {}
  signinWithGoogle() {
    const url = this.googleService.createSigninUrl();
    return { url };
  }
  async generateGoogleTokens(code: string) {
    if (!code) throw new BadRequestException('Code not present');
    const { access_token, refresh_token } =
      await this.googleService.createTokens(code);
    return {
      tokens: { accessToken: access_token, refreshToken: refresh_token },
      message: 'Sign in successfull',
    };
  }
  async newAccessToken(refreshToken: string) {
    const { access_token } =
      await this.googleService.shakeHandRefreshToken(refreshToken);
    return { accessToken: access_token, message:'Already Signed in' };
  }

  async getProfile(accessToken: string) {
    const res = await this.googleService.getProfile(accessToken);
    return { email: res.emailAddress };
  }
}
