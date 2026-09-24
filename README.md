# Agent-Ready Video (ARV)

**Status: Draft 1.0, proposed.** This draft may change before 1.0 is final.

Agent-Ready Video (ARV) is an open standard that makes video usable by AI agents. It binds standards you already use (schema.org, Media Fragments, video sitemaps, RSL, AIPREF, MCP, WebMCP, NLWeb and A2A) into one manifest, one validator and one badge.

ARV adds only the five things video needs and no other standard defines:

1. **Range-addressed moments.** A moment is `arv:{asset_id}#t={start_ms},{end_ms}`. An agent can name any range on any video and get the same rights, playback and receipt for it.
2. **Per-moment rights.** What an agent may show, embed or quote, for how long, and whether it needs a linked account or payment.
3. **Typed evidence.** Transcript, on-screen text, shot caption or visual spans that sit inside the range.
4. **Player-neutral playback.** A start time, optional cue points and sources for any player. Playback starts at the moment and keeps going.
5. **Signed usage receipts.** Proof of which moment was served, under which policy, with which credit.

Three conformance levels: **L1** crawl-readable, **L2** agent-callable, **L3** rights and ledger. A static site can reach L1 with files alone.

## What is in this repo

| Path | What it is |
|---|---|
| [`spec/1.0/`](spec/1.0/README.md) | The specification text, one file per section |
| [`schemas/1.0/`](schemas/1.0/) | JSON Schemas (draft 2020-12). Each `$id` is its public URL at `https://agentreadyvideo.org/schema/1.0/` |
| [`examples/1.0/`](examples/1.0/) | Example objects. CI validates every one against its schema |
| [`conformance/`](conformance/README.md) | The 18 checks and three levels as a checklist |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Who maintains ARV and how changes are made |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to propose a change |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed and when |

Run the checks locally with Node 20 or later:

```sh
npm install
npm test
```

## Links

- Website: <https://agentreadyvideo.org>
- Specification: <https://agentreadyvideo.org/spec>
- FAQ: <https://agentreadyvideo.org/faq>
- Contact: team@agentreadyvideo.org

## Implementations

No implementations are listed yet. ARV stays "proposed" until an outside implementation passes the validator. We list an implementer or supporter only with their written consent.

## How to cite

> Agent-Ready Video (ARV) Specification, Draft 1.0 (proposed). AgentCDN, 23 September 2026. https://agentreadyvideo.org/spec

Machine-readable citation: [`CITATION.cff`](CITATION.cff).

## How to contribute

Open an issue with the **Proposal** template for a change to the spec or schemas, or the **Question** template for anything else. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`GOVERNANCE.md`](GOVERNANCE.md) first.

## License

Spec text: Community Specification License 1.0. Schemas and code: Apache-2.0. Other docs: CC-BY-4.0. See [`LICENSES.md`](LICENSES.md).

ARV is maintained by AgentCDN.
