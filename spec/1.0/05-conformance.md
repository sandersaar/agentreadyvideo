# 5. Conformance levels and the badge

The validator is a command-line tool and a hosted page. It runs against a live origin or a local folder. Each check names the standard it comes from.

The validator is not released yet. Until it is, use the [conformance checklist](../../conformance/README.md) and the JSON Schemas.

## L1 crawl-readable

1. `/.well-known/arv` returns 200 JSON that validates against the manifest schema.
2. Every catalog URL returns a valid catalog. Every moment has `start_ms < end_ms`, both inside `duration_ms`, and a recomputable `id`.
3. Every evidence span lies inside its moment range.
4. At least one sampled page carries JSON-LD `VideoObject` whose Clip `@id` values match catalog `moment_uri` values.
5. A sitemap is reachable from robots.txt, and listed video pages return 200.
6. `llms.txt` is present and links the manifest.
7. The RSL `license.xml` parses and uses only RSL 1.0 tokens. robots.txt `License:` or a `Link` header points to it.
8. No forbidden field appears in any L1 surface.

## L2 agent-callable (L1 plus)

9. The MCP endpoint lists the origin profile names or declared aliases. Each input and result validates.
10. `search_moments` returns moments that resolve through `get_moment` to the same range.
11. No forbidden field appears in any search, ask or list result, fuzzed over 20 queries.
12. `play_moment` returns a descriptor whose token expires within 15 minutes and fails after expiry.
13. If a WebMCP adapter is declared, a headless run registers exactly the page profile tools.
14. If NLWeb or A2A is declared, the endpoint responds and items carry `moment_uri`.

## L3 rights and ledger (L2 plus)

15. `jwks_url` serves keys, and playback tokens and receipts verify against them.
16. Negative tests pass: a moment with `segment_display=false` yields no descriptor; a revoked policy stops a live token; an agent outside scope is refused; a quote over `quote_max_ms` is refused.
17. `record_usage` returns a signed receipt that references a resolvable moment.
18. RSL, the AIPREF header and the RightsSummary agree for sampled moments.

An L3 origin that sets `required: true` on `entitlement` or `payment` also follows the 402 or 403 rule in section 3.3.1.

## The badge

An SVG reading "ARV L1", "ARV L2" or "ARV L3" that links to a dated validator report.

- Reports expire after 90 days unless the validator is run again.
- A site may say it conforms at a level only while a current report shows it.
- Use of the name and badge follows a conformance mark policy, to be published with the validator. The spec text itself may be forked under its license.
