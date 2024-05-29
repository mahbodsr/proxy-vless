const { CronJob } = require("cron");
const https = require("https");

const backendUrl = "https://proxy-vless.onrender.com";
new CronJob("*/10 * * * *", () => {
  https
    .get(backendUrl, (res) => {
      if (res.statusCode === 200) console.log("server restarted.");
      else
        console.error(
          `failed to restart server with status code: ${res.statusCode}`
        );
    })
    .on("error", (err) => console.error("error during restart:", err.message));
}).start();
