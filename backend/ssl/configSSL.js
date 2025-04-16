import fs from "fs";
const key = fs.readFileSync("./ssl/server.key");
const cert = fs.readFileSync("./ssl/server.cert");

export default {
  key,
  cert,
};
