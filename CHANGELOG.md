# Changelog

All notable changes to the ARV specification, schemas and examples.

## Unreleased

- Public source repository created with the spec text, schemas, examples, conformance checklist and CI checks.

## 2026-10-05

Changes from what implementers learned while building ingestion and retrieval. All new fields and objects are optional.

- Fixed: a `moment_url` uses a start-only Media Fragment (`#t=12.4`). It MUST NOT carry an end, because players stop at a fragment end. This matches start-only playback. The examples changed from `#t=12.4,31` to `#t=12.4`. Check 2 now tests it.
- Fixed: section 3.2 and the Moment schema disagreed on evidence grade B. Both now say "passed an automated quality check that the producer documents publicly", until the evaluation method is published (section 2.1).
- Fixed: MCP tool aliases now have a defined place. A server declares them in the manifest at `tool_profiles.mcp_origin.aliases`. `search` and `fetch` cannot be aliased. Section 4.2 says how a validator resolves them (check 9).
- Clarified: the forbidden-field rule covers signed or scoped stream URLs in discovery responses, even when rights were checked before issue.
- Corrected the 2026-09-24 entry: it said AgentCDN served an ARV 1.0 manifest, catalog and MCP origin profile, which was not the case.
- Added Answer (3.8): answer `shape`, `coverage` and ordered `references` with `role`, `step_index` and a verbatim evidence `span`. PlaybackDescriptor `cue_points` follow the step order.
- Added SearchResult (3.9): what `search_moments` returns. Section 4.2 now names the result object of every origin profile tool.
- Added Product (3.10) and Action (3.11) as optional sub-objects on Moment and Asset (Action also on Answer). Product and action URLs are https and never media URLs.
- Added Error (3.12) and section 4.4: one error object with core codes, carried as the HTTP body or as an MCP tool result with `isError: true`. `entitlement_required` and `payment_required` carry the `challenge_url`, so the 402 or 403 rule works over MCP too.
- Added optional Moment `kind` (`chapter`, `shot`, `window`, `span`), `summary` and `visual_description`.
- Added optional Asset `speakers` and transcript evidence `speaker_id`. A name needs a `name_source`. A producer SHOULD NOT publish a name from face or voice recognition alone.
- Added a caching rule to RightsSummary: nothing derived from a summary is used after `expires_at`.
- The Moment `aliases` example no longer uses a vendor's legacy id prefix.
- Schemas: new `answer`, `search-result` and `error` schemas, with examples. `npm test` checks answer spans, step order, speaker ids and forbidden fields in discovery examples.

## 2026-09-25

- W3C announced the proposed Agent-Ready Video Community Group for support: https://www.w3.org/community/blog/2026/09/25/proposed-group-agent-ready-video-community-group/. The group launches once five people support it.

## 2026-09-24

- W3C Community Group proposal under staff review; AgentCDN will contribute the draft under the W3C CLA at launch; draft charter added.
- First origin live: AgentCDN publishes a discovery document at https://agentcdn.com/.well-known/arv, range-addressed moment ids and an MCP endpoint. Self-declared, not yet validated; the validator is not released. (Corrected 2026-10-05: this line first said AgentCDN served an ARV 1.0 manifest, an ARV catalog and the MCP origin profile. It did not. Its manifest, catalog and MCP tool names still used a pre-1.0 shape.)
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
