import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { minioClient } from "../src/shared/utils/minio.js";
import {
  courseSeeds,
  toCourseSeedData,
  type CourseSeed,
  type CourseSeedData,
} from "./course-seed-data.js";

const courseBucket = "course";
const assetsDir = fileURLToPath(new URL("./assets", import.meta.url));

interface CourseSeedClient {
  readonly course: {
    findFirst(input: {
      readonly where: { readonly value: CourseSeed["value"] };
      readonly select: { readonly id: true };
    }): Promise<{ readonly id: string } | null>;
    update(input: {
      readonly where: { readonly id: string };
      readonly data: CourseSeedData;
    }): Promise<unknown>;
    create(input: { readonly data: CourseSeedData }): Promise<unknown>;
  };
}

interface CourseAssetStorage {
  ensureBucket(): Promise<void>;
  putCourseAsset(input: {
    readonly fileName: string;
    readonly content: Buffer;
  }): Promise<void>;
}

interface SeedCoursesOptions {
  readonly client: CourseSeedClient;
  readonly storage: CourseAssetStorage;
  readonly readAsset: (fileName: string) => Promise<Buffer>;
}

export const createCourseAssetStorage = (): CourseAssetStorage => ({
  ensureBucket: async () => {
    const exists = await minioClient.bucketExists(courseBucket);
    if (!exists) {
      await minioClient.makeBucket(courseBucket);
      await minioClient.setBucketPolicy(
        courseBucket,
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "CourseReadObjects",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${courseBucket}/*`],
            },
          ],
        }),
      );
    }
  },
  putCourseAsset: async ({ fileName, content }) => {
    await minioClient.putObject(
      courseBucket,
      fileName,
      content,
      content.length,
      {
        "Content-Type": "image/png",
      },
    );
  },
});

export const readCourseAsset = (fileName: string) =>
  readFile(join(assetsDir, fileName));

export const seedCourses = async ({
  client,
  storage,
  readAsset,
}: SeedCoursesOptions) => {
  let created = 0;
  let updated = 0;
  let uploadedAssets = 0;

  await storage.ensureBucket();

  for (const course of courseSeeds) {
    const content = await readAsset(course.assetFileName);
    await storage.putCourseAsset({ fileName: course.assetFileName, content });
    uploadedAssets++;

    const existingCourse = await client.course.findFirst({
      where: { value: course.value },
      select: { id: true },
    });

    if (existingCourse) {
      await client.course.update({
        where: { id: existingCourse.id },
        data: toCourseSeedData(course),
      });
      updated++;
      continue;
    }

    await client.course.create({ data: toCourseSeedData(course) });
    created++;
  }

  return { created, updated, uploadedAssets };
};
