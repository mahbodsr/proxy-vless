import { CronJob } from "cron";
import * as https from "https";

const backendUrl = process.env.URL!;
new CronJob("*/10 * * * *", () => {
  https
    .get(backendUrl, (res) => {
      if (res.statusCode === 200) console.log(`${backendUrl} | server restarted.`);
      else
        console.error(
          `${backendUrl} | failed to restart server with status code: ${res.statusCode}`
        );
    })
    .on("error", (err) => console.error(`${backendUrl} | error during restart:`, err.message));
}).start();
