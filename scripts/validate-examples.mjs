// Validates every example against its JSON Schema, checks moment
// invariants the schemas cannot express, and checks that the JSON
// examples in the spec text match the example files exactly.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemaDir = join(root, "schemas/1.0");
const exampleDir = join(root, "examples/1.0");
const specDir = join(root, "spec/1.0");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`FAIL ${msg}`);
};
const pass = (msg) => console.log(`ok   ${msg}`);

// 1. Load schemas.
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const schemas = {};
for (const file of readdirSync(schemaDir).filter((f) => f.endsWith(".schema.json")).sort()) {
  const schema = readJson(join(schemaDir, file));
  const name = file.replace(/\.schema\.json$/, "");
  const expectedId = `https://agentreadyvideo.org/schema/1.0/${file}`;
  if (schema.$id !== expectedId) fail(`${file}: $id is ${schema.$id}, expected ${expectedId}`);
  schemas[name] = schema;
  ajv.addSchema(schema);
}
const schemaNames = Object.keys(schemas).sort((a, b) => b.length - a.length);

// 2. Moment helpers.
const BASE32 = "abcdefghijklmnopqrstuvwxyz234567";
function base32(buf) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}
export function momentId(origin, assetId, startMs, endMs) {
  const digest = createHash("sha256").update(`${origin}|${assetId}|${startMs}|${endMs}`, "utf8").digest();
  return "mom_" + base32(digest).slice(0, 26);
}
function momentProblems(m, origin, durations) {
  const problems = [];
  if (!(m.start_ms < m.end_ms)) problems.push("start_ms must be less than end_ms");
  const duration = durations?.get(m.asset_id);
  if (duration !== undefined && m.end_ms > duration) problems.push("end_ms is past duration_ms");
  if (m.moment_uri !== `arv:${m.asset_id}#t=${m.start_ms},${m.end_ms}`) problems.push("moment_uri does not match asset_id and range");
  if (m.id !== momentId(origin, m.asset_id, m.start_ms, m.end_ms)) problems.push(`id does not recompute (expected ${momentId(origin, m.asset_id, m.start_ms, m.end_ms)})`);
  for (const e of m.evidence ?? []) {
    if (e.start_ms < m.start_ms || e.end_ms > m.end_ms || e.start_ms > e.end_ms) problems.push(`evidence ${e.type} ${e.start_ms}-${e.end_ms} is outside the range`);
  }
  return problems;
}

// 3. Validate examples.
const EXAMPLE_ORIGIN = "https://example.com";
const examples = {};
for (const file of readdirSync(exampleDir).filter((f) => f.endsWith(".json")).sort()) {
  const doc = readJson(join(exampleDir, file));
  examples[file] = doc;
  const base = file.replace(/\.json$/, "");
  const name = schemaNames.find((n) => base === n || base.startsWith(`${n}-`));
  if (!name) {
    fail(`${file}: no schema matches this file name`);
    continue;
  }
  const validate = ajv.getSchema(schemas[name].$id);
  if (!validate(doc)) {
    fail(`${file} against ${name}.schema.json: ${ajv.errorsText(validate.errors)}`);
    continue;
  }
  const extra = [];
  if (name === "moment") extra.push(...momentProblems(doc, EXAMPLE_ORIGIN));
  if (name === "catalog") {
    const durations = new Map(doc.assets.map((a) => [a.id, a.duration_ms]));
    for (const m of doc.moments) {
      if (!durations.has(m.asset_id)) extra.push(`moment ${m.id} references unknown asset ${m.asset_id}`);
      extra.push(...momentProblems(m, doc.origin, durations).map((p) => `moment ${m.id}: ${p}`));
    }
  }
  if (name === "usage-receipt" && examples["moment.json"] && doc.moment_id !== examples["moment.json"].id) {
    extra.push("moment_id does not match moment.json");
  }
  if (extra.length) extra.forEach((p) => fail(`${file}: ${p}`));
  else pass(`${file} valid against ${name}.schema.json`);
}
for (const name of Object.keys(schemas)) {
  if (!Object.keys(examples).some((f) => f === `${name}.json`)) fail(`schema ${name} has no example`);
}

// 4. Negative cases: the checks must reject broken documents.
const negatives = [
  ["moment without arv", "moment", (d) => { delete d.arv; }],
  ["moment with old URI scheme", "moment", (d) => { d.moment_uri = d.moment_uri.replace(/^arv:/, "video:"); }],
  ["payment with http challenge_url", "playback-descriptor", (d) => { d.payment = { required: true, model: "per_view", challenge_url: "http://example.com/pay" }; }],
  ["payment with lowercase currency", "rights-summary", (d) => { d.payment = { required: true, model: "per_use", amount: { currency: "usd", minor_units: 50 } }; }],
  ["descriptor without start_ms", "playback-descriptor", (d) => { delete d.start_ms; }],
];
for (const [label, name, mutate] of negatives) {
  const doc = structuredClone(examples[`${name}.json`]);
  mutate(doc);
  const validate = ajv.getSchema(schemas[name].$id);
  if (validate(doc)) fail(`negative case accepted: ${label}`);
  else pass(`negative case rejected: ${label}`);
}
{
  const doc = structuredClone(examples["moment.json"]);
  doc.end_ms += 1;
  doc.moment_uri = `arv:${doc.asset_id}#t=${doc.start_ms},${doc.end_ms}`;
  if (momentProblems(doc, EXAMPLE_ORIGIN).length === 0) fail("negative case accepted: moment id not recomputed after range change");
  else pass("negative case rejected: moment id not recomputed after range change");
}

// 5. Spec examples must equal the example files.
const linkBeforeBlock = /\(\.\.\/\.\.\/examples\/1\.0\/([a-z-]+\.json)\)[^\n]*\n\n```json\n([\s\S]*?)\n```/g;
let specBlocks = 0;
for (const file of readdirSync(specDir).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(join(specDir, file), "utf8");
  const blocks = (text.match(/```json\n/g) ?? []).length;
  let matched = 0;
  for (const [, exampleFile, body] of text.matchAll(linkBeforeBlock)) {
    matched++;
    specBlocks++;
    if (!examples[exampleFile]) fail(`${file}: links missing example ${exampleFile}`);
    else if (!isDeepStrictEqual(JSON.parse(body), examples[exampleFile])) fail(`${file}: JSON block differs from examples/1.0/${exampleFile}`);
  }
  if (matched !== blocks) fail(`${file}: ${blocks - matched} JSON block(s) without an example file link just above`);
}
pass(`${specBlocks} JSON blocks in spec/1.0 match their example files`);

if (failures > 0) {
  console.error(`validate-examples: ${failures} failure(s)`);
  process.exit(1);
}
console.log("validate-examples: all checks passed");
