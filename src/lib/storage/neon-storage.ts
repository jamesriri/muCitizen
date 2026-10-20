import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class NeonStorageService {
  private static client: S3Client | null = null;
  private static readonly BUCKET_NAME = "service-attachments";

  private static getClient(): S3Client {
    if (!this.client) {
      const endpoint = process.env.AWS_ENDPOINT_URL_S3;
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION || "us-east-2";

      if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error(
          "Neon Object Storage environment variables are not configured.",
        );
      }

      this.client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true,
      });
    }
    return this.client;
  }

   // Uploads an attachment to the OBS bucket and returns its public URL
  static async uploadAttachment(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const s3 = this.getClient();
    const sanitizedKey = `requests/${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: sanitizedKey,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    return `${process.env.AWS_ENDPOINT_URL_S3}/${this.BUCKET_NAME}/${sanitizedKey}`;
  }
}
