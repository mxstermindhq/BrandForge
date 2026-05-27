import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", "js", "config.js");
const token = String(process.env.CF_WEB_ANALYTICS_TOKEN || "").trim();

let src = fs.readFileSync(configPath, "utf8");
if (token) {
  src = src.replace(/cfBeaconToken:"[^"]*"/, `cfBeaconToken:"${token}"`);
  fs.writeFileSync(configPath, src);
  console.log("Cloudflare Web Analytics token injected.");
} else {
  console.warn("CF_WEB_ANALYTICS_TOKEN not set — analytics beacon disabled until token is added.");
}
