# Governance

## Status

ARV is **Draft 1.0, proposed**. It stays "proposed" until at least one outside implementation passes the validator.

## Maintainer

ARV is maintained by **AgentCDN** with open contributions. The maintainer reviews proposals, merges changes, publishes the schemas at `https://agentreadyvideo.org/schema/`, and keeps this repo and the website in step.

The maintainer does not own the format. The spec text is under the Community Specification License 1.0 and may be forked under that license.

## When a feature becomes required

A feature becomes **required** only after two independent implementations pass the validator for it. Until then it is optional, even if the spec defines it. Two implementations are independent when different organizations build them from the spec text, without shared code for that feature.

## W3C Community Group

A W3C Community Group for Agent-Ready Video is **proposed** and not yet formed. When it forms, anyone with a free W3C account can join. Community Group reports are not W3C Recommendations. If the group forms, the maintainer will propose moving spec development there.

## How to propose a change

1. **Open an issue** with the Proposal template. Say what problem you have, what you propose, and what it breaks.
2. **Discuss** in the issue. Anyone may comment. The maintainer labels the issue `accepted`, `needs-work` or `declined`, with a reason.
3. **Open a pull request** for an accepted proposal. Change the spec text, schemas and examples together. `npm test` must pass.
4. **Merge.** The maintainer merges and adds a `CHANGELOG.md` entry.

Rules for changes:

- A change that breaks a valid 1.0 document needs a new major version. Within 1.x, changes are additive: new optional fields, new enum values that consumers may ignore, clearer text.
- Published schema URLs are immutable once 1.0 is final. Until then they may change, and every change is listed in the changelog.
- Every normative change comes with an example that validates.

## Name and badge

"Agent-Ready Video", "ARV" and the ARV badge are used for conformance claims. A site may claim a level only while a current validator report shows it. A conformance mark policy will be published with the validator.

## Contact

team@agentreadyvideo.org
