import "dotenv/config";
import {
  createStagingSmokeReport,
  parseStagingSmokeEnv,
} from "./staging-smoke.js";

const main = async () => {
  const config = parseStagingSmokeEnv(process.env);
  const report = await createStagingSmokeReport(config);
  console.info(JSON.stringify(report, null, 2));

  if (report.status === "failed") {
    process.exitCode = 1;
  }
};

await main();
