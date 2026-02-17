import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class R2Uploader {
  client: S3Client | null = null;
  bucketName: string | null = null;
  publicDomain: string | null = null;
  enabled = false;

  constructor(private logger: any) {
    this._initialize();
  }

  _initialize() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secret = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || null;
    this.publicDomain =
      process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN ||
      "tac-public-imgs.iddagents.com";
    if (!accountId || !accessKey || !secret || !this.bucketName) {
      this.logger.info(
        "R2 upload disabled - missing required environment variables",
      );
      return;
    }
    try {
      this.client = new S3Client({
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        region: "us-east-1",
        credentials: { accessKeyId: accessKey, secretAccessKey: secret } as any,
      });
      this.enabled = true;
      this.logger.info(
        `R2 upload enabled - bucket: ${this.bucketName}, domain: ${this.publicDomain}`,
      );
    } catch (e) {
      this.logger.warn(`Failed to initialize R2 client: ${e}`);
      this.enabled = false;
    }
  }

  async uploadFile(
    filePath: string,
    objectKey?: string,
  ): Promise<string | null> {
    if (!this.enabled || !this.client || !this.bucketName) return null;
    if (!path.isAbsolute(filePath))
      filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`File not found at absolute path: ${filePath}`);
      return null;
    }
    if (!objectKey) objectKey = `adw/review/${path.basename(filePath)}`;
    try {
      const body = fs.readFileSync(filePath);
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: body,
        }),
      );
      return `https://${this.publicDomain}/${objectKey}`;
    } catch (e) {
      this.logger.error(`Failed to upload ${filePath} to R2: ${e}`);
      return null;
    }
  }

  async uploadScreenshots(
    screenshots: string[],
    adwId: string,
  ): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    for (const s of screenshots) {
      if (!s) continue;
      const key = `adw/${adwId}/review/${path.basename(s)}`;
      const url = await this.uploadFile(s, key);
      map[s] = url || s;
    }
    return map;
  }
}
