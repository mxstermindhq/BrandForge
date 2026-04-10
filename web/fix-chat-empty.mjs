import fs from "fs";
const p = new URL("./src/components/messages/ChatDealRoomList.tsx", import.meta.url);
let s = fs.readFileSync(p, "utf8");
const repl = `<span className="material-symbols-outlined empty-state-icon" aria-hidden>
              forum
            </span>`;
s = s.replace(/<span className="text-\[32px\][\s\S]*?<\/span>/, repl);
fs.writeFileSync(p, s);
