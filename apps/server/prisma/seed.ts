import { disconnectPrisma, prisma } from "../src/shared/prisma/index.js";
import {
  createCourseAssetStorage,
  readCourseAsset,
  seedCourses,
} from "./course-seed-service.js";

const main = async () => {
  const result = await seedCourses({
    client: prisma,
    storage: createCourseAssetStorage(),
    readAsset: readCourseAsset,
  });
  console.info("Course seed completed", result);
};

try {
  await main();
} finally {
  await disconnectPrisma();
}
