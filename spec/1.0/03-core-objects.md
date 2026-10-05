# 3. Core objects

Each object has a JSON Schema (draft 2020-12) at `https://agentreadyvideo.org/schema/1.0/<name>.schema.json`. The source files are in [`schemas/1.0/`](../../schemas/1.0/).

Every top-level object carries `"arv": "1.0"`. Sub-objects (evidence spans, speakers, products and actions) do not. Objects MAY carry fields this spec does not define. Consumers MUST ignore fields they do not understand.

## 3.1 Asset

One video as published by an origin. Schema: [`asset.schema.json`](../../schemas/1.0/asset.schema.json).

- `id` MUST be unique within the publishing origin.
- `duration_ms` MUST be present. Every moment on the asset lies inside it.
- `content_hash` SHOULD be present, as `sha256:` plus lowercase hex.
- `c2pa` MAY point to Content Credentials for the asset.
- `speakers` MAY list the people who speak in the asset. Each has an `id` that is unique within the asset. A speaker carries a `name` only together with `name_source`: `spoken` (said in the video), `on_screen_text` (shown on screen) or `metadata` (in the publisher's own data). A producer SHOULD NOT publish a person's name from face or voice recognition alone.
- `products` and `actions` MAY be present for the whole asset, with the shapes in sections 3.10 and 3.11. Product evidence spans lie inside `duration_ms`.
- Vendor data MUST live under `extensions`, keyed by a reverse-domain name such as `com.example`. Core fields MUST NOT carry vendor-specific values.

Example: [`examples/1.0/asset.json`](../../examples/1.0/asset.json)

```json
{
  "arv": "1.0",
  "id": "vid_8f2c",
  "title": "Tuning a carburettor",
  "duration_ms": 1284000,
  "language": "en",
  "content_hash": "sha256:9b1e...",
  "creator": {
    "id": "cr_12",
    "name": "Example Garage",
    "url": "https://example.com"
  },
  "page_url": "https://example.com/videos/carb",
  "c2pa": {
    "credentials_url": "https://example.com/c2pa/vid_8f2c"
  },
  "speakers": [
    {
      "id": "spk_1",
      "name": "Sam",
      "name_source": "on_screen_text"
    }
  ],
  "actions": [
    {
      "label": "Book a tune-up",
      "action": "book",
      "kind": "service",
      "url": "https://example.com/book"
    }
  ],
  "extensions": {
    "com.mux": {
      "playback_id": "abc"
    }
  }
}
```

## 3.2 Moment

A time range on an asset. Its identity is the canonical range after snapping. Two producers that snap to the same range name the same moment. Schema: [`moment.schema.json`](../../schemas/1.0/moment.schema.json).

- `start_ms` and `end_ms` MUST satisfy `0 <= start_ms < end_ms <= duration_ms`.
- `moment_uri` MUST equal `arv:{asset_id}#t={start_ms},{end_ms}`.
- `id` MUST equal `mom_` followed by the first 26 characters of the lowercase RFC 4648 base32 encoding (no padding) of SHA-256 over the UTF-8 string `{origin}|{asset_id}|{start_ms}|{end_ms}`. `origin` is the ASCII serialization of the publishing origin, for example `https://example.com`. Anyone can recompute it.
- `moment_url` SHOULD be an https deep link that opens the video at `start_ms`, using a start-only Media Fragment in seconds (`#t=12.4`) or the player's own start parameter. It MUST NOT carry an end in a Media Fragment (`#t=12.4,31`), because a player stops at a fragment end. Playback is start only (sections 3.4 and 4.3).
- `snap` names the rule the origin used: `shot`, `sentence`, `word`, `silence` or `rights_cap`. Omit it when the producer does not know.
- `kind` MAY say what the origin published the range as: `chapter` (a titled section), `shot` (one continuous camera take), `window` (a short range used for visual description) or `span` (any other evidence-backed range). It never changes the moment's identity.
- `summary` MAY give a short plain summary of the range. `visual_description` MAY say in plain words what is on screen.
- `evidence` is a list of typed spans: `transcript`, `on_screen_text`, `shot_caption` or `visual`. Each span MUST lie fully inside the moment range. A `transcript` span MAY carry `speaker_id`, which MUST match a speaker on the asset (section 3.1).
- `evidence_grade`: **A** human-verified; **B** machine-produced and passed an automated quality check that the producer documents publicly; **C** machine-produced with at least one direct span inside the range; **D** metadata or inference only.
- `confidence` carries a `score` from 0 to 1 and a `band` (`low`, `medium` or `high`).
- `aliases` MAY list earlier ids for the same moment, so old references keep resolving.
- `products` and `actions` MAY be present, with the shapes in sections 3.10 and 3.11. Product evidence spans MUST lie inside the moment range.

`end_ms` stays on the moment. It governs rights, quote limits and receipts. Players do not enforce it (section 3.4).

Example: [`examples/1.0/moment.json`](../../examples/1.0/moment.json). Its `id` is computed with origin `https://example.com`.

```json
{
  "arv": "1.0",
  "id": "mom_rg2e4kdenkmkzilboihacumshn",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "moment_url": "https://example.com/videos/carb#t=12.4",
  "asset_id": "vid_8f2c",
  "start_ms": 12400,
  "end_ms": 31000,
  "snap": "sentence",
  "kind": "span",
  "title": "Setting the idle mixture screw",
  "evidence": [
    {
      "type": "transcript",
      "start_ms": 12900,
      "end_ms": 18200,
      "text": "Turn the mixture screw a quarter turn out",
      "confidence": 0.93,
      "speaker_id": "spk_1"
    },
    {
      "type": "shot_caption",
      "start_ms": 14000,
      "end_ms": 22000,
      "text": "Close-up of a screwdriver on the idle screw",
      "confidence": 0.81
    }
  ],
  "evidence_grade": "C",
  "confidence": {
    "score": 0.84,
    "band": "high"
  },
  "products": [
    {
      "name": "Flat-blade screwdriver",
      "kind": "physical_product",
      "relation": "shown",
      "url": "https://example.com/tools/flat-screwdriver",
      "evidence": [
        {
          "type": "shot_caption",
          "start_ms": 14000,
          "end_ms": 22000,
          "text": "Close-up of a screwdriver on the idle screw"
        }
      ]
    }
  ],
  "aliases": [
    "legacy_2b7c"
  ]
}
```

## 3.3 RightsSummary

The public rights for one moment. Terms use RSL 1.0 words where RSL has one, and the `arv:` extension namespace where it does not. Schema: [`rights-summary.schema.json`](../../schemas/1.0/rights-summary.schema.json).

- `rsl` tokens MUST be RSL 1.0 words.
- `aipref` MUST be derived from the same rights record as `rsl`. The two MUST NOT disagree.
- `video` holds the video terms: `segment_display`, `source_embed_display`, `full_video_display`, `clip` and `quote_max_ms`. An absent `source_embed_display` means false.
- `policy_version` MUST change whenever any term changes.
- `expires_at` says how long a consumer may rely on this summary.
- Finer terms (agent scope, territory, tiers) are an L3 concern and live behind tools, not in this public summary.
- A consumer that keeps anything derived from this summary (an answer, a citation, cached context) MUST NOT use it after `expires_at`. It SHOULD fetch the summary again when it sees a higher `policy_version`.

Example: [`examples/1.0/rights-summary.json`](../../examples/1.0/rights-summary.json)

```json
{
  "arv": "1.0",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "rsl": {
    "permits": [
      "search",
      "ai-input",
      "ai-index"
    ],
    "prohibits": [
      "ai-train"
    ],
    "payment": "attribution"
  },
  "aipref": "train-ai=n, ai-use=y, search=y",
  "video": {
    "segment_display": true,
    "source_embed_display": true,
    "full_video_display": false,
    "clip": false,
    "quote_max_ms": 15000
  },
  "attribution_required": true,
  "policy_version": 7,
  "expires_at": "2026-09-24T00:00:00Z",
  "license_url": "https://example.com/license.xml",
  "entitlement": {
    "required": false,
    "kind": "none"
  },
  "payment": {
    "required": false,
    "model": "free"
  }
}
```

### 3.3.1 Entitlement and payment

A RightsSummary MAY carry `entitlement` and `payment`, so discovery can say "this needs a linked account" or "this costs money" before playback is requested. The PlaybackDescriptor (3.4) carries the same two objects with the same shapes. Both are defined in 1.0. Implementing them is optional.

`entitlement`:

- `required` (boolean, required).
- `kind` (required): `none`, `account_link`, `subscription` or `purchase`.
- `link_url` (optional): https URL where the user links an account or buys.
- `provider` (optional): a string naming the entitlement provider.

`payment`:

- `required` (boolean, required).
- `model` (required): `free`, `per_use`, `per_view` or `subscription`.
- `amount` (optional): `currency` as an ISO 4217 code and `minor_units` as an integer, for example cents.
- `methods` (optional): strings naming accepted payment methods, for example `http-402`, `ap2` or `wallet`.
- `challenge_url` (optional): https URL of the payment or entitlement challenge.

Rules:

- All URLs in these objects MUST use https.
- A conforming L3 origin that sets `required: true` in either object MUST answer a playback token request that lacks the entitlement or payment with HTTP 402 or 403. The response MUST carry the `challenge_url` (for an entitlement without one, the `link_url`). The body is an Error (section 3.12) with code `entitlement_required` or `payment_required` and that URL in `challenge_url`. Over MCP, where a tool result has no HTTP status, the same Error is the tool result (section 4.4).
- An absent object means the origin makes no claim. It does not mean free.

A restricted moment that needs account linking: [`examples/1.0/rights-summary-account-link.json`](../../examples/1.0/rights-summary-account-link.json)

```json
{
  "arv": "1.0",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "rsl": {
    "permits": [
      "search",
      "ai-input",
      "ai-index"
    ],
    "prohibits": [
      "ai-train"
    ],
    "payment": "attribution"
  },
  "aipref": "train-ai=n, ai-use=y, search=y",
  "video": {
    "segment_display": true,
    "source_embed_display": false,
    "full_video_display": false,
    "clip": false,
    "quote_max_ms": 15000
  },
  "attribution_required": true,
  "policy_version": 7,
  "expires_at": "2026-09-24T00:00:00Z",
  "license_url": "https://example.com/license.xml",
  "entitlement": {
    "required": true,
    "kind": "account_link",
    "link_url": "https://example.com/account/link?moment=vid_8f2c",
    "provider": "example-garage-members"
  },
  "payment": {
    "required": false,
    "model": "free"
  }
}
```

## 3.4 PlaybackDescriptor

What a player needs to start a moment. It is player neutral and is returned only by a playback call, never by discovery. Schema: [`playback-descriptor.schema.json`](../../schemas/1.0/playback-descriptor.schema.json).

- `start_ms` MUST be present. The player starts there.
- `cue_points` MAY list more start times in milliseconds. After a `steps` answer (section 3.8), they SHOULD be the start of each later step on the same asset, in `step_index` order.
- `end_ms` MAY be present and is advisory only. Players MUST NOT stop at it by default. Playback continues past the moment so the viewer stays with the video. The moment's end still governs rights, quote limits and receipts.
- Each entry in `sources` names a `kind` (`hls`, `dash`, `mp4` or `embed`), a `provider`, and how to start it: a `token_ref` plus `start_ms`, or an `embed_url` plus the player's own `start_param`. Sources carry a start, never an end.
- `token_ref` is exchanged at the origin for a short-lived URL. A signed media URL MUST NOT appear in any cached or crawlable response.
- `token.expires_at` MUST be no more than 15 minutes after issue.
- `entitlement` and `payment` MAY be present, with the shapes and rules in 3.3.1.

Example: [`examples/1.0/playback-descriptor.json`](../../examples/1.0/playback-descriptor.json)

```json
{
  "arv": "1.0",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "start_ms": 12400,
  "end_ms": 31000,
  "cue_points": [
    31000
  ],
  "sources": [
    {
      "kind": "hls",
      "provider": "mux",
      "token_ref": "ptk_91",
      "start_ms": 12400
    },
    {
      "kind": "embed",
      "provider": "youtube",
      "embed_url": "https://www.youtube.com/embed/abc",
      "start_param": "start=12"
    }
  ],
  "poster": "https://example.com/poster/vid_8f2c.jpg",
  "captions": [
    {
      "lang": "en",
      "url": "https://example.com/cc/vid_8f2c.vtt"
    }
  ],
  "token": {
    "ref": "ptk_91",
    "jws_kid": "k-2026-09",
    "expires_at": "2026-09-23T12:10:00Z",
    "scope": "segment"
  },
  "entitlement": {
    "required": false,
    "kind": "none"
  },
  "payment": {
    "required": false,
    "model": "free"
  }
}
```

## 3.5 UsageReceipt

A signed record that an agent served a moment. Schema: [`usage-receipt.schema.json`](../../schemas/1.0/usage-receipt.schema.json).

- `moment_uri` and `moment_id` MUST resolve to a moment at the origin.
- `action` names what was done, using the terms in the RightsSummary, for example `segment_display`.
- `policy_version` MUST be the rights policy in force when the moment was served.
- `jws` MUST be a compact JWS over the receipt, verifiable with a key from the origin's `jwks_url`.
- `payment_ref` and `entitlement_ref` MAY point at what paid for or unlocked the use. Both are defined in 1.0 and optional to implement.

Example: [`examples/1.0/usage-receipt.json`](../../examples/1.0/usage-receipt.json)

```json
{
  "arv": "1.0",
  "receipt_id": "rcp_5x",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "moment_id": "mom_rg2e4kdenkmkzilboihacumshn",
  "action": "segment_display",
  "served_to": {
    "agent": "chatgpt",
    "surface": "chat"
  },
  "policy_version": 7,
  "served_at": "2026-09-23T12:00:04Z",
  "citation": "Example Garage, Tuning a carburettor, 0:12",
  "jws": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImstMjAyNi0wOSJ9...",
  "entitlement_ref": "ent_free_public"
}
```

## 3.6 Manifest

Served at `/.well-known/arv` as JSON. It is the entry point for every validator and agent. Schema: [`manifest.schema.json`](../../schemas/1.0/manifest.schema.json).

- `conformance_level` is the level the publisher claims: `L1`, `L2` or `L3`. A claim counts only with a current validator report.
- `catalogs` lists one or more catalog URLs.
- `tool_profiles` lists the declared inference surfaces: `mcp_origin`, `webmcp_page`, `nlweb` and `a2a`. Omit what you do not offer.
- `tool_profiles.mcp_origin.aliases` MAY map an origin profile tool name to the name the server serves it under, for example `{"search_moments": "find_moments"}`. Only `search_moments`, `get_moment`, `get_rights`, `play_moment` and `record_usage` can be aliased. Section 4.2 says how a validator reads the map.
- `jwks_url` is REQUIRED at L3.
- `schema` SHOULD point to the manifest schema for the version in use.
- `entitlement_url` MAY name where users link accounts or manage entitlements for the origin. `payment_terms_url` MAY name the origin's payment terms. Both MUST use https.

Example: [`examples/1.0/manifest.json`](../../examples/1.0/manifest.json)

```json
{
  "arv": "1.0",
  "conformance_level": "L2",
  "publisher": {
    "name": "Example Garage",
    "contact": "agents@example.com"
  },
  "license_url": "https://example.com/license.xml",
  "jwks_url": "https://example.com/.well-known/jwks.json",
  "catalogs": [
    "https://example.com/arv.json"
  ],
  "tool_profiles": {
    "mcp_origin": {
      "url": "https://example.com/mcp",
      "version": "1.0",
      "aliases": {
        "search_moments": "find_moments"
      }
    },
    "webmcp_page": {
      "adapter": "https://example.com/webmcp/v1/adapter.js",
      "version": "1.0"
    },
    "nlweb": {
      "ask": "https://example.com/ask"
    },
    "a2a": {
      "card": "https://example.com/.well-known/agent-card.json"
    }
  },
  "validator_report": "https://agentreadyvideo.org/validator/r/example.com/2026-09-23",
  "schema": "https://agentreadyvideo.org/schema/1.0/manifest.schema.json",
  "entitlement_url": "https://example.com/account/link",
  "payment_terms_url": "https://example.com/terms/payment"
}
```

## 3.7 Catalog

A list of assets and their published moments, usually at `/arv.json`. Schema: [`catalog.schema.json`](../../schemas/1.0/catalog.schema.json).

- `origin` is the publishing origin. It is the `origin` in every moment id preimage.
- Every asset MUST validate as an Asset. Every moment MUST validate as a Moment and reference an asset in the same catalog or in another catalog the manifest lists.

Example: [`examples/1.0/catalog.json`](../../examples/1.0/catalog.json)

## 3.8 Answer

How a set of moments answers one question. An origin MAY return it with search results, so an agent can show a step list or a short answer without guessing the layout. Schema: [`answer.schema.json`](../../schemas/1.0/answer.schema.json).

- `shape` (required): `single_moment` (one moment answers it), `multi_moment` (several moments each answer part of it), `steps` (ordered steps to follow) or `overview` (a broad summary across the source).
- `coverage` (required): `complete` (the references answer the whole question), `partial` (they answer part of it) or `best_available` (the closest the source has, not a direct answer).
- `references` (required) lists moments in the order a consumer shows them. Each names a `moment_uri`. Any range on a published asset is allowed (section 2.3).
- `role` MAY say what a reference does: `answer`, `supporting` or `step`. A `step` reference MUST carry `step_index`, starting at 1 and rising by 1 in reference order. Only `step` references carry `step_index`.
- `span` MAY carry the evidence that justifies a reference, as an evidence span with `text`. The text MUST be verbatim from the source, not composed prose. The span MUST lie fully inside the referenced range.
- `actions` MAY list links the publisher offers with this answer (section 3.11).
- An Answer is discovery data. The forbidden-field rule (section 4.2) applies.

Example: [`examples/1.0/answer.json`](../../examples/1.0/answer.json)

```json
{
  "arv": "1.0",
  "question": "How do I set the idle mixture on a carburettor?",
  "shape": "steps",
  "coverage": "complete",
  "references": [
    {
      "moment_uri": "arv:vid_8f2c#t=12400,31000",
      "role": "step",
      "step_index": 1,
      "span": {
        "type": "transcript",
        "start_ms": 12900,
        "end_ms": 18200,
        "text": "Turn the mixture screw a quarter turn out"
      }
    },
    {
      "moment_uri": "arv:vid_8f2c#t=31000,52000",
      "role": "step",
      "step_index": 2,
      "span": {
        "type": "transcript",
        "start_ms": 33500,
        "end_ms": 39000,
        "text": "Then turn it back in until the idle is smooth"
      }
    }
  ],
  "actions": [
    {
      "label": "Book a tune-up",
      "action": "book",
      "kind": "service",
      "url": "https://example.com/book"
    }
  ]
}
```

## 3.9 SearchResult

What `search_moments` returns. Schema: [`search-result.schema.json`](../../schemas/1.0/search-result.schema.json).

- `moments` (required) lists matching moments, best first. Each MUST validate as a Moment and resolve through `get_moment` to the same range.
- `answer` MAY carry an Answer (section 3.8) for the query.
- `next_cursor` is an opaque string for the next page. It is absent on the last page.
- A SearchResult is discovery data. The forbidden-field rule (section 4.2) applies to it and to everything inside it.

Example: [`examples/1.0/search-result.json`](../../examples/1.0/search-result.json)

## 3.10 Product

A product, service or work that a range shows or mentions. It is a sub-object of Moment and Asset, defined in [`moment.schema.json`](../../schemas/1.0/moment.schema.json) under `$defs/product`.

- `name` is required. `brand` is optional.
- `kind` MAY be `physical_product`, `software`, `online_service`, `service`, `game`, `book`, `film_or_show` or `music_or_podcast`. `service` is something a person books or receives from a provider (an appointment, a class). `online_service` is a website or platform a person uses.
- `relation` MAY be `shown` (on screen) or `mentioned` (named in speech or text only).
- `url` MAY link to the merchant or publisher page. It MUST use https and MUST NOT be a media URL.
- `evidence` MAY list evidence spans where the product appears.

ARV carries product links, not prices, stock or checkout (section 2.2). The Moment example in section 3.2 shows a product.

## 3.11 Action

A link the publisher offers the viewer, for example "Book a tune-up". It is a sub-object of Moment, Asset and Answer, defined in [`moment.schema.json`](../../schemas/1.0/moment.schema.json) under `$defs/action`.

- `label` (required) is the text a consumer shows.
- `action` (required): `buy`, `book`, `subscribe` or `learn`.
- `kind` MAY use the product kinds in section 3.10.
- `url` (required) MUST use https and MUST NOT be a media URL that plays without an origin check. It MAY be a redirect the origin controls.
- An action is an offer, not an access requirement. What a moment needs before playback stays in `entitlement` and `payment` (section 3.3.1).

The Asset example in section 3.1 shows an action.

## 3.12 Error

A typed error from any ARV tool or endpoint. Section 4.4 says how it travels over HTTP and MCP. Schema: [`error.schema.json`](../../schemas/1.0/error.schema.json).

- `code` (required) is one of the core codes below, or an origin-specific code under a reverse-domain prefix, for example `com.example/quota_exceeded`.
- `message` (required) is plain text for a person or an agent. Consumers MUST NOT parse it.
- `moment_uri` MAY name the moment the request was about.
- `retry_after_ms` says how long to wait before a retry. It is REQUIRED for `rate_limited`.
- `challenge_url` is REQUIRED for `entitlement_required` and `payment_required` and MUST use https.
- `docs_url` MAY link to more help.

| Code | Meaning | HTTP status |
|---|---|---|
| `invalid_request` | The input or the range is not valid | 400 |
| `not_found` | No such asset or moment | 404 |
| `rights_denied` | The rights do not allow this use | 403 |
| `entitlement_required` | The user needs a linked account, subscription or purchase | 402 or 403 |
| `payment_required` | The use needs a payment | 402 |
| `revoked` | The policy or token was revoked | 403 |
| `rate_limited` | Too many requests | 429 |
| `internal` | The origin failed | 500 |

Example: [`examples/1.0/error.json`](../../examples/1.0/error.json)

```json
{
  "arv": "1.0",
  "code": "entitlement_required",
  "message": "This moment needs a linked account.",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "challenge_url": "https://example.com/account/link?moment=vid_8f2c",
  "docs_url": "https://example.com/docs/errors#entitlement_required"
}
```
