import sharp from "../../web/node_modules/sharp/lib/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "source", "logo-mark.png");
const wordmarkSrc = path.join(__dirname, "source", "logo-wordmark.png");
const out = path.join(__dirname, "..", "img");

async function run() {
  const mark = sharp(src);
  await Promise.all([
    mark.clone().resize(16, 16).png().toFile(path.join(out, "favicon-16x16.png")),
    mark.clone().resize(32, 32).png().toFile(path.join(out, "favicon-32x32.png")),
    mark.clone().resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png")),
    mark.clone().resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(out, "logo-mark-512.png")),
    mark.clone().resize(64, 64).png({ compressionLevel: 9 }).toFile(path.join(out, "logo-nav.png")),
  ]);
  await sharp(wordmarkSrc)
    .trim({ threshold: 10 })
    .resize({ height: 36 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, "logo-header.png"));
  await sharp(path.join(out, "favicon-32x32.png")).toFile(path.join(out, "..", "favicon.ico"));
  console.log("Brand assets generated in site/img/");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
