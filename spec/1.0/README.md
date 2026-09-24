# Agent-Ready Video (ARV) Specification, Draft 1.0

Status: **Draft 1.0, proposed.** Dated 2026-09-23. This draft may change before 1.0 is final.

Canonical web version: <https://agentreadyvideo.org/spec>. This folder is the source text.

## Sections

1. [Purpose and definition](01-purpose.md)
2. [Scope](02-scope.md)
3. [Core objects](03-core-objects.md): Asset, Moment, RightsSummary, PlaybackDescriptor, UsageReceipt, Manifest, Catalog
4. [Bindings](04-bindings.md): crawl time, inference time, playback
5. [Conformance levels and the badge](05-conformance.md)

Related: [JSON Schemas](../../schemas/1.0/), [examples](../../examples/1.0/), [conformance checklist](../../conformance/README.md).

## Conventions

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are to be read as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

- All times are integer milliseconds unless a field says otherwise.
- Every ARV object carries `"arv": "1.0"`.
- URLs in examples use `example.com`. Examples are not normative, except where a rule says so.
- Every example in this spec is a file in [`examples/1.0/`](../../examples/1.0/) and validates against its schema in CI.

## Key terms

Short definitions. Section 3 holds the normative rules.

- **Moment**: a time range on one video, named `arv:{asset_id}#t={start_ms},{end_ms}`. An agent may ask for any range. The origin may snap it to a clean edge and returns the range it applied. The snapped range is the identity.
- **Evidence**: typed spans inside a moment (transcript, on-screen text, shot caption or visual) that show why the moment answers a question. Every span lies fully inside the range.
- **Rights summary**: the public rights for one moment: whether an agent may show it, embed the source or quote it, for how long, and whether it needs a linked account or payment.
- **Playback descriptor**: what a player needs to start a moment: a start time, optional cue points and sources. Only a playback call returns it. It never appears in search or other discovery.
- **Usage receipt**: a signed record that an agent served a moment, under which rights policy, with the citation it showed.
- **Manifest**: the JSON file at `/.well-known/arv`. It names the conformance level, license, keys, tool profiles and catalogs. Validators and agents start here.
- **Catalog**: a JSON list of assets and their published moments, usually at `/arv.json`. The manifest points to it.
- **Conformance level**: how much of ARV an origin implements. L1 is crawl-readable, L2 is agent-callable, L3 adds rights and a ledger.
- **Origin**: the site that publishes the video and answers for its rights.

## How to cite

Agent-Ready Video (ARV) Specification, Draft 1.0 (proposed). AgentCDN, 23 September 2026. https://agentreadyvideo.org/spec
