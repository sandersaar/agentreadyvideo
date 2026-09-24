# 3. Core objects

Each object has a JSON Schema (draft 2020-12) at `https://agentreadyvideo.org/schema/1.0/<name>.schema.json`. The source files are in [`schemas/1.0/`](../../schemas/1.0/).

Every object carries `"arv": "1.0"`. Objects MAY carry fields this spec does not define. Consumers MUST ignore fields they do not understand.

## 3.1 Asset

One video as published by an origin. Schema: [`asset.schema.json`](../../schemas/1.0/asset.schema.json).

- `id` MUST be unique within the publishing origin.
- `duration_ms` MUST be present. Every moment on the asset lies inside it.
- `content_hash` SHOULD be present, as `sha256:` plus lowercase hex.
- `c2pa` MAY point to Content Credentials for the asset.
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
- `moment_url` SHOULD be an https deep link that opens the video at `start_ms`, using Media Fragments in seconds (`#t=12.4,31`) or the player's own start parameter.
- `snap` names the rule the origin used: `shot`, `sentence`, `word`, `silence` or `rights_cap`. Omit it when the producer does not know.
- `evidence` is a list of typed spans: `transcript`, `on_screen_text`, `shot_caption` or `visual`. Each span MUST lie fully inside the moment range.
- `evidence_grade`: **A** human-verified; **B** machine-produced and passed the ARV evaluation method; **C** machine-produced with at least one direct span inside the range; **D** metadata or inference only.
- `confidence` carries a `score` from 0 to 1 and a `band` (`low`, `medium` or `high`).
- `aliases` MAY list earlier ids for the same moment, so old references keep resolving.

`end_ms` stays on the moment. It governs rights, quote limits and receipts. Players do not enforce it (section 3.4).

Example: [`examples/1.0/moment.json`](../../examples/1.0/moment.json). Its `id` is computed with origin `https://example.com`.

```json
{
  "arv": "1.0",
  "id": "mom_rg2e4kdenkmkzilboihacumshn",
  "moment_uri": "arv:vid_8f2c#t=12400,31000",
  "moment_url": "https://example.com/videos/carb#t=12.4,31",
  "asset_id": "vid_8f2c",
  "start_ms": 12400,
  "end_ms": 31000,
  "snap": "sentence",
  "title": "Setting the idle mixture screw",
  "evidence": [
    {
      "type": "transcript",
      "start_ms": 12900,
      "end_ms": 18200,
      "text": "Turn the mixture screw a quarter turn out",
      "confidence": 0.93
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
  "aliases": [
    "amt_2b7c..."
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
- A conforming L3 origin that sets `required: true` in either object MUST answer a playback token request that lacks the entitlement or payment with HTTP 402 or 403. The response MUST carry the `challenge_url` (for an entitlement without one, the `link_url`).
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
- `cue_points` MAY list more start times in milliseconds, for example the steps of a multi-step answer.
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
    22000
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
      "version": "1.0"
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
