# ARV conformance checklist

This checklist restates the 18 checks in [spec section 5](../spec/1.0/05-conformance.md). The spec is the source of truth where the two differ.

**Validator: coming.** The ARV validator (a command-line tool and a hosted page) is not released yet. It will run every check below against a live origin or a local folder and print pass or fail for each. Until then, `npm test` in this repo validates the example objects against the JSON Schemas, and you can use this list to self-check.

A level counts only when every check at that level and every lower level passes. A badge needs a current validator report.

## L1 crawl-readable

For a publisher with files alone and no server code.

- [ ] 1. `/.well-known/arv` returns 200 JSON that validates against [`manifest.schema.json`](../schemas/1.0/manifest.schema.json).
- [ ] 2. Every catalog URL returns a valid catalog. Every moment has `start_ms < end_ms`, both inside `duration_ms`, and a recomputable `id`.
- [ ] 3. Every evidence span lies inside its moment range.
- [ ] 4. At least one sampled page carries JSON-LD `VideoObject` whose Clip `@id` values match catalog `moment_uri` values.
- [ ] 5. A sitemap is reachable from robots.txt, and listed video pages return 200.
- [ ] 6. `llms.txt` is present and links the manifest.
- [ ] 7. The RSL `license.xml` parses and uses only RSL 1.0 tokens. robots.txt `License:` or a `Link` header points to it.
- [ ] 8. No forbidden field (`playback_url`, `stream_url`, `playback_token`, or any media URL that plays without an origin check) appears in any L1 surface.

## L2 agent-callable (L1 plus)

For a publisher with an MCP endpoint.

- [ ] 9. The MCP endpoint lists the origin profile names (`search_moments`, `get_moment`, `get_rights`, `play_moment`, `record_usage`, `search`, `fetch`) or declared aliases. Each input and result validates.
- [ ] 10. `search_moments` returns moments that resolve through `get_moment` to the same range.
- [ ] 11. No forbidden field appears in any search, ask or list result, fuzzed over 20 queries.
- [ ] 12. `play_moment` returns a descriptor whose token expires within 15 minutes and fails after expiry.
- [ ] 13. If a WebMCP adapter is declared, a headless run registers exactly the page profile tools.
- [ ] 14. If NLWeb or A2A is declared, the endpoint responds and items carry `moment_uri`.

## L3 rights and ledger (L2 plus)

For a publisher that signs tokens and receipts.

- [ ] 15. `jwks_url` serves keys, and playback tokens and receipts verify against them.
- [ ] 16. Negative tests pass: a moment with `segment_display=false` yields no descriptor; a revoked policy stops a live token; an agent outside scope is refused; a quote over `quote_max_ms` is refused.
- [ ] 17. `record_usage` returns a signed receipt that references a resolvable moment.
- [ ] 18. RSL, the AIPREF header and the RightsSummary agree for sampled moments.

If your origin sets `required: true` on `entitlement` or `payment`, it must also answer a token request without them with HTTP 402 or 403 and the challenge URL ([section 3.3.1](../spec/1.0/03-core-objects.md#331-entitlement-and-payment)).
