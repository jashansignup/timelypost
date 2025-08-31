import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { redis } from "./db";
import slugify from "slugify";
import {
  S3_ALLOWED_CONTENT_TYPES,
  S3_ALLOWED_EXTENSIONS,
  S3_BUCKET_ENDPOINT,
} from "./constants";
import { MediaType } from "@repo/database";

// S3 client of the amazon s3 storage don't use this directly to upload the files always use the pre-signed url
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface GeneratePreSignedUrlS3Props {
  path: string;
  fileName: string;
  contentType: string;
  pathKey: string;
  type: MediaType;
  size: number;
}

export const generatePreSignedUrlS3 = async ({
  path,
  fileName,
  contentType,
  pathKey,
  type,
  size,
}: GeneratePreSignedUrlS3Props): Promise<{
  url: string;
  redisStoreId: string;
}> => {
  const ext = fileName
    .substring(fileName.lastIndexOf("."))
    .toLowerCase() as (typeof S3_ALLOWED_EXTENSIONS)[number];
  if (!S3_ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file extension: ${ext}`);
  }

  const uniqueFileName =
    uuidv4() + "." + slugify(ext, { lower: true, strict: true });

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    // Build key without a leading slash; if path is empty, just the filename
    Key: `${path}/${uniqueFileName}`,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 10 * 60 });
  const redisStoreId = `s3-pre-signed-url-${uuidv4()}`;

  // !TODO: fix it
  console.warn("Please add the expiry of the files like 76 from s3 handler");
  await redis.set(
    redisStoreId,
    JSON.stringify({
      url,
      name: fileName,
      pathKey,
      publicUrl: `${S3_BUCKET_ENDPOINT}/${path}/${uniqueFileName}`,
      type,
      size,
    })
  );
  return {
    url,
    redisStoreId,
  };
};
