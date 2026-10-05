// Rewrites each JSON block in spec/1.0 from the example file linked just
// above it, so the spec text and examples/1.0 never drift apart.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const specDir = join(root, "spec/1.0");
const linkBeforeBlock = /(\(\.\.\/\.\.\/examples\/1\.0\/([a-z-]+\.json)\)[^\n]*\n\n```json\n)([\s\S]*?)(\n```)/g;
for (const file of readdirSync(specDir).filter((f) => f.endsWith(".md"))) {
  const path = join(specDir, file);
  const text = readFileSync(path, "utf8");
  const next = text.replace(linkBeforeBlock, (_, head, example, _body, tail) =>
    head + readFileSync(join(root, "examples/1.0", example), "utf8").trimEnd() + tail);
  if (next !== text) {
    writeFileSync(path, next);
    console.log(`synced ${file}`);
  }
}
