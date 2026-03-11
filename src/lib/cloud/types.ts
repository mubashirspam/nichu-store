export interface ClonedFile {
  id: string;
  webViewLink: string;
}

export interface CloudAccount {
  id: string;
  provider: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  email: string | null;
}
