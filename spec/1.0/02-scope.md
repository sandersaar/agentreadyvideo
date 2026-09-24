# 2. Scope

ARV defines formats and behavior at the edge of a video origin: what it publishes for crawlers, what its tools accept and return, what a player receives, and what a receipt proves.

The format is open. How well a publisher fills it is up to the publisher.

## 2.1 In scope

- The objects in [section 3](03-core-objects.md) and their JSON Schemas.
- How those objects appear in each bound standard ([section 4](04-bindings.md)).
- The conformance checks and the badge ([section 5](05-conformance.md)).
- Optional entitlement and payment fields, so an origin can say that a moment needs a linked account or a payment before playback.
- An evaluation method for moment quality: range overlap with a reviewed answer, evidence inside the range, honest grades, and playable at the stated start.

## 2.2 Out of scope

- How a producer finds moments, grades evidence or ranks results.
- Models, prompts and processing pipelines.
- Billing systems, entitlement systems and commercial terms between parties. ARV only carries the signals (section 3.3) and the references (section 3.5).

## 2.3 The moment is an address, not a pre-cut list

The agent on the user's side decides what the moment is. ARV lets it name any range on any asset and get the same rights, playback and receipt for it.

- A moment is `{asset_id, start_ms, end_ms}` with a recomputable id ([section 3.2](03-core-objects.md#32-moment)).
- Published moments (chapters, shots, evidence-backed ranges) are suggestions the origin offers. An agent MAY ignore them.
- `get_rights`, `play_moment` and `record_usage` MUST accept any range on a published asset.
- The origin MAY snap or cap the range, for example to a sentence edge or to a rights limit. It MUST return the range it actually applied, and that range is the moment's identity.

Chapters, shots and spans are all moments. The spec does not care how a range was found.
