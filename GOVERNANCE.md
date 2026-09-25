# Governance

## Status

ARV is **Draft 1.0, proposed**. It stays "proposed" until at least one outside implementation passes the validator.

## Maintainer

ARV is maintained by **AgentCDN** with open contributions. The maintainer reviews proposals, merges changes, publishes the schemas at `https://agentreadyvideo.org/schema/`, and keeps this repo and the website in step.

The maintainer does not own the format. At the launch of the W3C Community Group, AgentCDN contributes the spec text to the group under the W3C Community Contributor License Agreement (CLA). See [LICENSE-SPEC.md](LICENSE-SPEC.md).

## When a feature becomes required

A feature becomes **required** only after two independent implementations pass the validator for it. Until then it is optional, even if the spec defines it. Two implementations are independent when different organizations build them from the spec text, without shared code for that feature.

## W3C Community Group

A W3C Community Group for Agent-Ready Video is **announced for support** by W3C ([announcement](https://www.w3.org/community/blog/2026/09/25/proposed-group-agent-ready-video-community-group/)). It launches once five people support it, and anyone with a W3C account can support it from that page. It is not formed yet. When it forms, anyone with a free W3C account can join.

At launch:

- AgentCDN contributes the current draft to the group under the [W3C Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/process/cla/).
- The group governs the evolution of the specification and publishes it as a Community Group Report. Community Group Reports are not W3C Recommendations.
- AgentCDN remains one implementer and the initial editor, with no special rights over the text.
- Schemas, examples, the validator and code stay Apache-2.0. Docs stay CC-BY-4.0.

Until launch, contributions to the spec text are accepted under the same CLA terms. A draft charter for the group is in [charter/DRAFT-charter.md](charter/DRAFT-charter.md). It is not adopted. The group adopts a charter after launch.

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
