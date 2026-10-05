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
  const spans = [...(m.evidence ?? []), ...(m.products ?? []).flatMap((p) => p.evidence ?? [])];
  for (const e of spans) {
    if (e.start_ms < m.start_ms || e.end_ms > m.end_ms || e.start_ms > e.end_ms) problems.push(`evidence ${e.type} ${e.start_ms}-${e.end_ms} is outside the range`);
  }
  return problems;
}
function parseMomentUri(uri) {
  const match = /^arv:([^#\s]+)#t=(\d+),(\d+)$/.exec(uri);
  return match ? { asset_id: match[1], start_ms: Number(match[2]), end_ms: Number(match[3]) } : null;
}
function answerProblems(a) {
  const problems = [];
  for (const ref of a.references) {
    const range = parseMomentUri(ref.moment_uri);
    if (!range || !(range.start_ms < range.end_ms)) problems.push(`reference ${ref.moment_uri} has no valid range`);
    else if (ref.span && (ref.span.start_ms < range.start_ms || ref.span.end_ms > range.end_ms || ref.span.start_ms > ref.span.end_ms)) problems.push(`span ${ref.span.start_ms}-${ref.span.end_ms} is outside ${ref.moment_uri}`);
  }
  const steps = a.references.filter((r) => r.role === "step").map((r) => r.step_index);
  if (steps.some((n, i) => n !== i + 1)) problems.push("step_index values must run 1, 2, 3 in reference order");
  if (a.shape === "steps" && steps.length === 0) problems.push("a steps answer needs at least one step reference");
  return problems;
}
// Forbidden-field rule (section 4.2): discovery objects never carry these keys.
const FORBIDDEN = new Set(["playback_url", "stream_url", "playback_token"]);
function forbiddenKeys(value, path = "$") {
  if (Array.isArray(value)) return value.flatMap((v, i) => forbiddenKeys(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => [...(FORBIDDEN.has(k) ? [`${path}.${k}`] : []), ...forbiddenKeys(v, `${path}.${k}`)]);
  }
  return [];
}
const DISCOVERY = new Set(["asset", "moment", "catalog", "rights-summary", "answer", "search-result", "manifest"]);

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
  if (DISCOVERY.has(name)) extra.push(...forbiddenKeys(doc).map((k) => `forbidden field ${k} in a discovery object`));
  if (name === "moment") extra.push(...momentProblems(doc, EXAMPLE_ORIGIN));
  if (name === "catalog") {
    const durations = new Map(doc.assets.map((a) => [a.id, a.duration_ms]));
    const speakers = new Map(doc.assets.map((a) => [a.id, new Set((a.speakers ?? []).map((s) => s.id))]));
    for (const m of doc.moments) {
      if (!durations.has(m.asset_id)) extra.push(`moment ${m.id} references unknown asset ${m.asset_id}`);
      extra.push(...momentProblems(m, doc.origin, durations).map((p) => `moment ${m.id}: ${p}`));
      for (const e of m.evidence ?? []) {
        if (e.speaker_id && !speakers.get(m.asset_id)?.has(e.speaker_id)) extra.push(`moment ${m.id}: speaker_id ${e.speaker_id} is not in the asset's speakers`);
      }
    }
  }
  if (name === "answer") extra.push(...answerProblems(doc));
  if (name === "search-result") {
    for (const m of doc.moments) extra.push(...momentProblems(m, EXAMPLE_ORIGIN).map((p) => `moment ${m.id}: ${p}`));
    if (doc.answer) extra.push(...answerProblems(doc.answer).map((p) => `answer: ${p}`));
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
  ["moment_url with an end in its Media Fragment", "moment", (d) => { d.moment_url = "https://example.com/videos/carb#t=12.4,31"; }],
  ["speaker name without name_source", "asset", (d) => { delete d.speakers[0].name_source; }],
  ["action with http url", "asset", (d) => { d.actions[0].url = "http://example.com/book"; }],
  ["product without name", "moment", (d) => { delete d.products[0].name; }],
  ["step reference without step_index", "answer", (d) => { delete d.references[0].step_index; }],
  ["step_index on a supporting reference", "answer", (d) => { d.references[0].role = "supporting"; }],
  ["answer span without text", "answer", (d) => { delete d.references[0].span.text; }],
  ["alias for search", "manifest", (d) => { d.tool_profiles.mcp_origin.aliases.search = "find"; }],
  ["entitlement_required without challenge_url", "error", (d) => { delete d.challenge_url; }],
  ["rate_limited without retry_after_ms", "error", (d) => { d.code = "rate_limited"; delete d.challenge_url; }],
  ["error code without reverse-domain prefix", "error", (d) => { d.code = "quota_exceeded"; }],
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
{
  const doc = structuredClone(examples["answer.json"]);
  doc.references[1].span.end_ms = 60000;
  if (answerProblems(doc).length === 0) fail("negative case accepted: answer span outside its moment");
  else pass("negative case rejected: answer span outside its moment");
}
{
  const doc = structuredClone(examples["search-result.json"]);
  doc.moments[0].stream_url = "https://example.com/stream.m3u8";
  if (forbiddenKeys(doc).length === 0) fail("negative case accepted: stream_url in a search result");
  else pass("negative case rejected: stream_url in a search result");
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
