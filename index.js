const { createVLESSServer } = require("@3kmfi6hp/nodejs-proxy");
// require("./vless.js");
require("./job.js");

const port = 10000;
const uuid = "e6752ef9-4518-473f-a278-07c098878c56";

createVLESSServer(port, uuid);
