import { describe, expect, test, vi } from "vitest";
import {
  courseSeeds,
  courseSeedValues,
  toCourseSeedData,
} from "./course-seed-data.js";
import { seedCourses } from "./course-seed-service.js";

const createCourseClient = () => {
  const findFirst = vi
    .fn()
    .mockResolvedValueOnce({ id: "course-gk" })
    .mockResolvedValue(null);
  const update = vi.fn().mockResolvedValue({});
  const create = vi.fn().mockResolvedValue({});

  return {
    course: {
      findFirst,
      update,
      create,
    },
  };
};

const createAssetStorage = () => ({
  ensureBucket: vi.fn().mockResolvedValue(undefined),
  putCourseAsset: vi.fn().mockResolvedValue(undefined),
});

describe("course seed contract", () => {
  test("covers every legacy course value used by learning filters", () => {
    expect(courseSeedValues).toEqual([
      "gk",
      "zk",
      "gre",
      "toefl",
      "ielts",
      "cet6",
      "cet4",
      "ky",
    ]);
    expect(courseSeeds.map((course) => course.value)).toEqual(courseSeedValues);
  });

  test("uses deterministic course asset paths", () => {
    expect(
      courseSeeds.map((course) => ({
        value: course.value,
        url: course.url,
        assetFileName: course.assetFileName,
      })),
    ).toEqual(
      courseSeedValues.map((value) => ({
        value,
        url: `/course/${value}.png`,
        assetFileName: `${value}.png`,
      })),
    );
  });

  test("updates existing courses and creates missing courses", async () => {
    const client = createCourseClient();
    const storage = createAssetStorage();

    const result = await seedCourses({
      client,
      storage,
      readAsset: async () => Buffer.from("png"),
    });

    expect(result).toEqual({
      created: 7,
      updated: 1,
      uploadedAssets: 8,
    });
    expect(storage.ensureBucket).toHaveBeenCalledOnce();
    expect(storage.putCourseAsset).toHaveBeenCalledTimes(8);
    expect(client.course.update).toHaveBeenCalledWith({
      where: { id: "course-gk" },
      data: toCourseSeedData(courseSeeds[0]),
    });
    expect(client.course.create).toHaveBeenCalledTimes(7);
  });
});
