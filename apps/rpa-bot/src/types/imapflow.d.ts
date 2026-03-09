/**
 * Type declarations for imapflow (dynamically imported, optional dependency).
 * Only used when IMAP_HOST is configured for 2FA OTP retrieval.
 * Install with: npm install imapflow
 */
declare module 'imapflow' {
  export class ImapFlow {
    constructor(options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
      logger: boolean | object;
    });
    connect(): Promise<void>;
    logout(): Promise<void>;
    getMailboxLock(mailbox: string): Promise<{ release(): void }>;
    search(query: {
      from?: string;
      since?: Date;
    }): Promise<number[]>;
    fetchOne(
      uid: number,
      options: { source: boolean }
    ): Promise<{ source: Buffer }>;
  }
}
