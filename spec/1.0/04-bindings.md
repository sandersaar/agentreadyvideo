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

- **MCP origin profile.** Tool names: `search_moments`, `get_moment`, `get_rights`, `play_moment`, `record_usage`, plus `search` and `fetch` for clients that only speak those two. MCP Apps UI is optional and declared with `_meta.ui.resourceUri` and `ui.csp`.
  - Results: `search_moments` returns a SearchResult (section 3.9), `get_moment` a Moment, `get_rights` a RightsSummary, `play_moment` a PlaybackDescriptor and `record_usage` a UsageReceipt. A failed call returns an Error (sections 3.12 and 4.4).
  - Aliases: a server MAY serve a profile tool under another name. It MUST then declare the name in the manifest at `tool_profiles.mcp_origin.aliases`, as a map from the profile name to the served name (section 3.6). `search` and `fetch` cannot be aliased, because the clients that call them use those exact names. An aliased tool MUST accept the same input and return the same result as the profile tool.
  - A validator resolves each profile name first in the server's tool list, then through `aliases`. A name found in neither fails check 9. An alias that points at a tool the server does not list also fails check 9.
- **WebMCP page profile.** Three tools on `document.modelContext`: `search_this_catalog`, `get_moment_context` and `play_moment`, with `ask_this_video` optional. Results use a short-lived `moment_ref`. The page rechecks rights before it returns context or starts playback.
- **NLWeb.** `/ask` returns an `ItemList`. Items are `Clip` objects with `isPartOf` the `VideoObject`, and each carries `moment_uri`.
- **A2A.** Agent card at `/.well-known/agent-card.json`, with skills mapped one to one to the MCP origin profile.

`get_rights`, `play_moment` and `record_usage` accept any range on a published asset, not only published moments (section 2.3).

### Forbidden-field rule (normative)

Discovery responses (search, list, ask, JSON-LD, feeds, sitemaps, llms.txt) MUST NOT carry `playback_url`, `stream_url`, `playback_token`, or any manifest or media URL that plays without an origin check.

- The rule covers every object inside a discovery response: Moments, Answers, SearchResults, Products and Actions.
- It also covers signed or scoped stream URLs, even when the origin checked rights before it issued them. A discovery response carries none. The agent calls `play_moment` to get one.

Discovery finds moments. Only a playback call starts them. The validator fails L1 or L2 on any hit.

## 4.3 Playback

The descriptor is enough for a small adapter per player, under 100 lines, that maps `start_ms` and any `cue_points` to the player's own API. Examples: a plain `<video>` element with Media Fragments, hls.js, commercial web players, and iframe embeds such as YouTube (`start` parameter, `t=` on watch links).

- Adapters MUST start at `start_ms`.
- Adapters MUST NOT stop at the moment's end by default. An end parameter is optional and off unless the host asks for it.
- Adapters SHOULD report how the start was reached: `sought`, `cued` or `fallback`.
- A Media Fragments URL handed to a player (a `moment_url`, or a source URL an adapter builds) carries the start only, for example `#t=12.4`. An adapter MAY add an end (`#t=12.4,31`) only when the host asks for a bounded clip, because players stop at a fragment end.

## 4.4 Errors

Every ARV tool and endpoint reports a failure as an Error (section 3.12).

- **HTTP.** The Error is the response body. The status follows the table in section 3.12. A `rate_limited` response also carries a `Retry-After` header.
- **MCP.** A tool result has no HTTP status. The server returns a tool result with `isError: true` and the Error as `structuredContent`. It SHOULD also put the `message` in a text content block for clients that read only text.
- **WebMCP.** The page returns the same Error object as the tool result.
- Consumers MUST act on `code`, not on `message`. A consumer that does not know a code MUST NOT retry, unless `retry_after_ms` is present.
