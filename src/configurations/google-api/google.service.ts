import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive',
];
@Injectable()
export class GoogleService {
  constructor(private config: ConfigService) {}
  private oauth2Client = new google.auth.OAuth2({
    clientId: this.config.get('CLIENT_ID'),
    clientSecret: this.config.get('CLIENT_SECRET'),
    redirectUri: this.config.get('REDIRECT_URL'),
  });
  private gmail = google.gmail({
    version: 'v1',
    auth: this.oauth2Client,
  });
  private drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  private setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  createSigninUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }
  async shakeHandRefreshToken(refreshToken: string) {
    this.setCredentials(undefined, refreshToken);
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  async createTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getProfile(accessToken: string) {
    try {
      this.setCredentials(accessToken);
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });
      return response.data;
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }

  async getFile(fileId: string, accessToken: string) {
    try {
      this.setCredentials(accessToken);
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );

      let pdfBuffer = [];
      return new Promise((resolve, reject) => {
        response.data
          .on('data', (chunk) => {
            pdfBuffer.push(chunk);
          })
          .on('end', () => {
            const buffer = Buffer.concat(pdfBuffer);
            resolve(buffer);
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }
  async getAllPdfFiles(accessToken: string) {
    try {
      this.setCredentials(accessToken);
      const response = await this.drive.files.list({
        q: "mimeType='application/pdf'",
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
      });
      return response.data.files.map(({ id, name }) => ({
        id,
        name,
      }));
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }
  async uploadFileToDrive(file: Express.Multer.File, accessToken: string) {
    try {
      this.setCredentials(accessToken);

      const { originalname, mimetype, buffer } = file;

      const fileMetadata = {
        name: originalname,
      };

      const media = {
        mimeType: mimetype,
        body: new Readable({
          read() {
            this.push(buffer);
            this.push(null);
          },
        }),
      };
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      return { id: response.data.id, originalname };
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }
  async deleteFile(fileId: string, accessToken: string) {
    try {
      this.setCredentials(accessToken);
      await this.drive.files.delete({ fileId });
      return { id: fileId };
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }

  async getFilePublickLink(fileId: string, accessToken: string) {
    try {
      this.setCredentials(accessToken);
      const res = await this.drive.files.get({
        fileId,
        fields: 'webViewLink',
      });
      const webViewLink = res.data.webViewLink;
      return webViewLink;
    } catch (error) {
      if (error.status === 401)
        throw new UnauthorizedException('Invalid access tokens provided');
      throw new Error(error);
    }
  }
}
