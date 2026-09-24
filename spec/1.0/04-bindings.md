# 4. Bindings

How ARV objects appear inside the standards it binds. Section 1.2 lists them all.

## 4.1 Crawl time

- **schema.org.** JSON-LD `VideoObject` with `hasPart` `Clip` items. Clip `@id` MUST equal `moment_uri`. Clip `url` MUST equal `moment_url`. A Clip MUST NOT be emitted for a moment whose rights do not allow `segment_display`. `SeekToAction` SHOULD be emitted only when the rights allow public playback of the full video.
- **Sitemaps and MRSS.** Video sitemap and MRSS entries per asset, with `<link rel="arv">` to the manifest.
- **llms.txt.** Sections in this order: what this is, manifest, tools, license, example questions.
- **IndexNow.** Publishers SHOULD push when a moment or its rights change, not only when a page changes.
- **RSL.** A `License:` line in robots.txt, and `Link: <license.xml>; rel="license"; type="application/rsl+xml"` on pages and on the catalog. Tokens MUST be RSL 1.0 words.
- **AIPREF.** A `Content-Usage` header from the same rights record as RSL. The AIPREF vocabulary is still an IETF draft. ARV cites it as informative, and the validator pins the tokens it accepts.

## 4.2 Inference time

- **MCP origin profile.** Tool names: `search_moments`, `get_moment`, `get_rights`, `play_moment`, `record_usage`, plus `search` and `fetch` for clients that only speak those two. A server MAY declare other names as aliases. MCP Apps UI is optional and declared with `_meta.ui.resourceUri` and `ui.csp`.
- **WebMCP page profile.** Three tools on `document.modelContext`: `search_this_catalog`, `get_moment_context` and `play_moment`, with `ask_this_video` optional. Results use a short-lived `moment_ref`. The page rechecks rights before it returns context or starts playback.
- **NLWeb.** `/ask` returns an `ItemList`. Items are `Clip` objects with `isPartOf` the `VideoObject`, and each carries `moment_uri`.
- **A2A.** Agent card at `/.well-known/agent-card.json`, with skills mapped one to one to the MCP origin profile.

`get_rights`, `play_moment` and `record_usage` accept any range on a published asset, not only published moments (section 2.3).

### Forbidden-field rule (normative)

Discovery responses (search, list, ask, JSON-LD, feeds, sitemaps, llms.txt) MUST NOT carry `playback_url`, `stream_url`, `playback_token`, or any manifest or media URL that plays without an origin check.

Discovery finds moments. Only a playback call starts them. The validator fails L1 or L2 on any hit.

## 4.3 Playback

The descriptor is enough for a small adapter per player, under 100 lines, that maps `start_ms` and any `cue_points` to the player's own API. Examples: a plain `<video>` element with Media Fragments, hls.js, commercial web players, and iframe embeds such as YouTube (`start` parameter, `t=` on watch links).

- Adapters MUST start at `start_ms`.
- Adapters MUST NOT stop at the moment's end by default. An end parameter is optional and off unless the host asks for it.
- Adapters SHOULD report how the start was reached: `sought`, `cued` or `fallback`.
