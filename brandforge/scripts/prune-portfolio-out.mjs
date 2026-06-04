import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "out", "portfolio");

if (!fs.existsSync(dir)) {
  process.exit(0);
}

for (const name of fs.readdirSync(dir)) {
  if (/\.pdf$/i.test(name)) {
    fs.unlinkSync(path.join(dir, name));
    console.log(`prune-portfolio-out: removed ${name}`);
  }
}
