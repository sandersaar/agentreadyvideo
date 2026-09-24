# Changelog

All notable changes to the ARV specification, schemas and examples.

## Unreleased

- Public source repository created with the spec text, schemas, examples, conformance checklist and CI checks.

## 2026-09-24

- First origin live: AgentCDN serves an ARV 1.0 manifest at https://agentcdn.com/.well-known/arv, an ARV catalog, RSL 1.0 license terms, the Content-Usage header, range-addressed moment ids and an MCP origin profile (server agentcdn-arv). Self-declared, not yet validated; the validator is not released.
- Added optional `entitlement` and `payment` objects to RightsSummary and PlaybackDescriptor, optional `payment_ref` and `entitlement_ref` to UsageReceipt, and optional `entitlement_url` and `payment_terms_url` to Manifest. Defined in 1.0, optional to implement. An L3 origin that sets `required: true` returns 402 or 403 with the challenge URL.
- Added the example `rights-summary-account-link.json` for a restricted moment that needs account linking.
- Launched the website at https://agentreadyvideo.org.
- Submitted a provisional URI scheme request for `arv:` to IANA.
- Proposed a W3C Community Group for Agent-Ready Video.
- Opened a schema.org issue for the Clip `@id` convention: https://github.com/schemaorg/schemaorg/issues/4923

## 2026-09-23

- Draft 1.0 proposed: Asset, Moment, RightsSummary, PlaybackDescriptor, UsageReceipt, Manifest and Catalog, with JSON Schemas at `https://agentreadyvideo.org/schema/1.0/`.
- Name: Agent-Ready Video (ARV). URI scheme `arv:`. Version field `"arv": "1.0"`.
- A moment is an address: an agent may name any range, the origin may snap or cap it and returns the range it applied.
- Playback is start only, with optional cue points. `end_ms` on a descriptor is advisory, and players do not stop at it.
- Three conformance levels (L1, L2, L3) with 18 checks.
