import * as Minio from "minio";
import { env } from "../config/env.js";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const getBucket = () => env.MINIO_BUCKET;

export const initMinio = async () => {
  const bucket = getBucket();
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
    await minioClient.setBucketPolicy(
      bucket,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicGetObjects",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      }),
    );
  }
};
