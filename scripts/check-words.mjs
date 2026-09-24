// Fails when any tracked text file uses a banned word or character.
// The banned terms are built from parts so this file does not match itself.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const skipDirs = new Set([".git", "node_modules"]);
const skipFiles = new Set(["package-lock.json"]);
const textExt = /\.(md|json|mjs|js|cff|yml|yaml|txt)$|^LICENSE$/;

const j = (...parts) => parts.join("");
const rules = [
  { name: "em dash", re: new RegExp(String.fromCharCode(0x2014)) },
  { name: "old protocol acronym", re: new RegExp(j("\\b", "AR", "VP"), "i") },
  { name: "old protocol name", re: new RegExp(j("Agent-Read", "(y|able) Video Pro", "tocol"), "i") },
  { name: "vendor name", re: new RegExp(j("Bit", "movin"), "i") },
  { name: "retired subject", re: new RegExp(j("Re", "Review"), "i") },
  { name: "retired subject", re: new RegExp(j("Red", "\\s*", "Bull"), "i") },
  { name: "retired subject", re: new RegExp(j("\\bC", "NET\\b"), "i") },
  { name: "retired subject", re: new RegExp(j("\\bNO", "AA\\b"), "i") },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (!skipFiles.has(entry) && textExt.test(entry)) out.push(path);
  }
  return out;
}

let failures = 0;
const files = walk(root);
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of rules) {
      if (rule.re.test(line)) {
        failures++;
        console.error(`${relative(root, file)}:${i + 1}: ${rule.name}`);
      }
    }
  });
}

if (failures > 0) {
  console.error(`check-words: ${failures} problem(s) found`);
  process.exit(1);
}
console.log(`check-words: ${files.length} files clean`);
