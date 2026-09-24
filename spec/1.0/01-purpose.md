# 1. Purpose and definition

**Agent-Ready Video (ARV) is a profile that binds existing web and agent standards into one way to make video usable by AI.**

A publisher that follows ARV is found by crawlers, called by agents and played by any player, with the same moment, rights and credit at each step.

ARV reuses schema.org, video sitemaps, Media Fragments, RSL, AIPREF, MCP, WebMCP, NLWeb and A2A as they are. It adds only what video needs and no other standard defines:

1. Range-addressed moments.
2. Per-moment rights.
3. Typed evidence.
4. Signed, player-neutral playback.
5. Signed usage receipts.

## 1.1 One manifest, one validator, one badge

No single standard covers video end to end. Without ARV, a publisher reads nine specs and still has no way to say "these 40 seconds may be shown, quoted up to 15 seconds, with credit, and here is proof they were used". ARV packages the answer as three things:

- **One manifest.** `/.well-known/arv` names the conformance level, the license, the keys, the tool profiles and the catalogs. Every other surface is reachable from it.
- **One validator.** `arv validate https://example.com` runs every check in [section 5](05-conformance.md) and prints pass or fail per standard.
- **One badge.** "ARV L1", "ARV L2" or "ARV L3", earned only by a green validator run, with a dated report URL.

## 1.2 What ARV adds to each standard

| Standard | What it covers | What ARV adds | When it applies |
|---|---|---|---|
| schema.org `VideoObject`, `Clip`, `SeekToAction` | Video and chapter metadata for search engines | Clip `@id` equals the moment URI; a Clip appears only when the rights allow segment display | Crawl time |
| W3C Media Fragments (`#t=start,end`) | Addressing a time range in a media URL | The snapped range is the identity, with millisecond precision in the URI | Crawl, inference, playback |
| Video sitemaps, MRSS | Listing videos for crawlers and feeds | Per-moment entries and a link to the manifest | Crawl time |
| llms.txt | A plain guide for language models | Fixed section order that points at the manifest and tools | Crawl time |
| IndexNow | Push notice of changed URLs | Push when a moment or its rights change, not only when a page changes | Crawl time |
| RSL 1.0 | Machine-readable license and payment terms | Per-moment video terms (clip, segment display, source embed, quote limits) | Crawl time, inference time |
| IETF AIPREF (`Content-Usage`) | Train, AI-use and search preferences | Header derived from the same rights record as RSL, so they never disagree | Crawl time |
| MCP and MCP Apps | Agent tool calls and in-chat UI | Origin tool profile with fixed names and shapes; forbidden-field rule | Inference time |
| WebMCP (`document.modelContext`) | Tools a page exposes to an in-browser agent | Page profile: three tools plus an optional ask tool | Inference time |
| NLWeb | `/ask` returning schema.org items | Items are Clips with moment URIs | Inference time |
| A2A agent card | Agent-to-agent discovery | Card skills map to the MCP origin profile | Inference time |
| JSON Schema, JWS, JWKS | Shape validation, signatures, key sets | Versioned `$id` URLs; signed playback tokens and receipts | All |
| HLS, DASH, MP4, iframe players | Delivery and players | Player-neutral descriptor with a start for each source | Playback |

## 1.3 Name

The full name is **Agent-Ready Video**. The short form is **ARV**. Use the full name first on every page, because the short form alone is ambiguous in search. The URI scheme is `arv:` and the version field is `"arv"`.
