# [DRAFT] Agent-Ready Video Community Group Charter

**DRAFT, not yet adopted; the group adopts a charter after launch.**

This draft follows the W3C [Community Group charter template](https://github.com/w3c/cg-charter). It is a starting point for the group to discuss. To give feedback, open an issue in <https://github.com/sandersaar/agentreadyvideo>.

- **This Charter:** <https://github.com/sandersaar/agentreadyvideo/blob/main/charter/DRAFT-charter.md>
- **Previous Charter:** none
- **Start Date:** set when the group adopts the charter
- **Last Modified:** 2026-09-24

## Goals

The Agent-Ready Video Community Group makes video usable by AI agents in a way that is fair to the people who make it.

A worked scenario: a viewer asks an AI assistant how to set the idle mixture on a carburettor; the assistant finds the 40 seconds of a mechanic's video that answer it, plays that moment inline with the creator's credit, and the creator receives a signed record of the use under terms they set.

To make that scenario work across any site, player and agent, the group aims to:

- Give every range of a video a stable address that an agent can name, cite and play.
- Let the owner state rights per moment: what an agent may show, embed or quote, for how long, and on what terms.
- Carry evidence (transcript, on-screen text, captions) that ties an answer to the exact range it came from.
- Describe playback in a player-neutral way, so the moment starts where it should in any player.
- Produce signed usage receipts, so creators and publishers can audit each use.
- Reuse existing web and agent standards wherever they already solve part of the problem.

## Scope of Work

The group develops the Agent-Ready Video (ARV) specification and its supporting material. In scope:

- The ARV data model: Asset, Moment, RightsSummary, PlaybackDescriptor, UsageReceipt, Manifest and Catalog.
- The `arv:` moment address, based on Media Fragments time ranges.
- Per-moment rights and terms signals, including entitlement and payment hooks, and how they map to RSL and IETF AIPREF signals.
- Typed evidence spans and how they bind to a range.
- Player-neutral playback descriptors with start times and cue points.
- Signed usage receipts and their verification.
- Discovery: the `/.well-known/arv` manifest, catalogs, schema.org markup and video sitemaps.
- Agent interfaces: MCP origin profiles and WebMCP page profiles for search, rights, playback and usage.
- Conformance levels, conformance checks and the validator that tests them.
- A method and benchmark to evaluate how well agents find, cite and play video moments.

Key use cases: answering how-to questions with the exact moment of a video; citing and quoting news and education video; licensed playback of creator and brand video inside assistants; auditing and paying for each use.

### Out of Scope

- Video codecs, containers, streaming protocols and DRM.
- Player implementations and user interface design.
- Payment processing, pricing and settlement between parties. ARV only carries references to terms and payments.
- Legal interpretation of copyright, licensing or fair use in any jurisdiction.
- Search ranking, recommendation algorithms and model training methods.
- Redefining schema.org, Media Fragments, RSL, AIPREF, MCP or WebMCP. The group profiles and binds these; it does not replace them.

## Deliverables

### Specifications

- **Agent-Ready Video (ARV) 1.0.** The specification for range-addressed moments, per-moment rights, typed evidence, player-neutral playback, signed usage receipts, discovery and agent interfaces, with three conformance levels (L1 crawl-readable, L2 agent-callable, L3 rights and ledger). Starting point: the draft AgentCDN contributes at launch under the W3C CLA. The group publishes it as a Community Group Report.
- **ARV JSON Schemas.** Normative JSON Schemas (draft 2020-12) for each ARV object, published at stable URLs under `https://agentreadyvideo.org/schema/`.

### Non-Normative Reports

The group may produce other Community Group Reports within the scope of this charter that are not Specifications, such as use cases, requirements, or white papers. Planned:

- **Evaluation method and benchmark.** A repeatable way to measure how well agents find, cite, play and credit video moments, with a public benchmark set.
- **Implementation guides** for static sites, video platforms and agent builders.

### Test Suites and Other Software

The group will produce:

- **Conformance suite and validator.** Checks for each conformance level, with example documents that pass and fail.
- **Reference producer.** Open code that turns a video library into ARV manifests, catalogs and moment records.

Schemas, examples, the validator and other code are licensed under Apache-2.0. See the repository [LICENSE](../LICENSE) and [LICENSES.md](../LICENSES.md) files for contribution licensing.

## Dependencies or Liaisons

- **schema.org community:** VideoObject, Clip and related types; the Clip `@id` convention for video moments.
- **IETF AIPREF:** vocabulary and attachment of AI usage preferences.
- **RSL (Really Simple Licensing):** machine-readable license terms for content use by AI systems.
- **MCP and WebMCP communities:** tool profiles for agents that search, check rights, play and record usage.
- **Podcasting 2.0:** chapters, transcripts and value tags, for alignment on time-coded media metadata.
- **W3C Media and Entertainment Interest Group** and the Media Fragments work, for time range addressing.

## Community and Business Group Process

The group operates under the [Community and Business Group Process](https://www.w3.org/community/about/process). Terms in this Charter that conflict with those of the Community and Business Group Process are void.

As with other Community Groups, W3C seeks organizational licensing commitments under the [W3C Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/process/cla/). When people request to participate without representing their organization's legal interests, W3C will in general approve those requests, with the following understanding: W3C will seek and expect an organizational commitment under the CLA starting with the individual's first request to make a contribution to a group Deliverable. The section on [Contribution Mechanics](#contribution-mechanics) describes how W3C expects to monitor these contribution requests.

The [W3C Code of Conduct](https://www.w3.org/policies/code-of-conduct/) and [W3C Antitrust and competition policy](https://www.w3.org/policies/antitrust-2024/) apply to participation in this group.

## Work Limited to Charter Scope

The group will not publish specifications on topics other than those listed under [Specifications](#specifications). See below for [how to modify the charter](#amendments-to-this-charter).

## Contribution Mechanics

Substantive contributions to specifications can only be made by Community Group Participants who have agreed to the [W3C Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/process/cla/).

AgentCDN contributes the current ARV draft to the group at launch under the W3C CLA. AgentCDN remains one implementer and the initial editor, with no special rights over the text.

Reports other than Specifications published by this group should use the [W3C Software and Document License](https://www.w3.org/copyright/software-license-2023/) where possible.

Community Group participants agree to make all contributions in the GitHub repository the group is using for the particular document, through pull requests, issues, or comments on existing issues.

All GitHub repositories attached to the Community Group must contain a copy of the [CONTRIBUTING](https://github.com/w3c/licenses/blob/main/CG-CONTRIBUTING.md) and [LICENSE](https://github.com/w3c/licenses/blob/main/CG-LICENSE.md) files.

## Transparency

The group will conduct all technical work in public. Technical work will occur in its GitHub repositories (and not privately on mailing lists).

Meetings may be restricted to Community Group participants, but a public summary or minutes must be posted to the group's public mailing list or as an issue on GitHub.

## Decision Process

This group will seek to make decisions by consensus. The Chair assesses consensus. Where consensus is not clear, the Chair issues a Call for Consensus (CfC) on GitHub or the group's public mailing list. A CfC stays open for at least 7 days, so participants in every time zone can respond. After discussion and due consideration of different opinions, each decision is recorded in public as the resolution of a GitHub issue.

**Required features.** A feature becomes required only after two independent implementations pass the validator. Until then it is optional, even if the specification defines it. Two implementations are independent when different organizations build them from the specification text, without shared code for that feature.

If substantial disagreement remains (for example, the group is divided) and the group needs to decide an issue in order to continue to make progress, the Chair will choose an alternative that had substantial support, with a vote of participants if necessary. Individuals who disagree with the choice are strongly encouraged to take ownership of their objection by taking ownership of an alternative fork. This is explicitly allowed (and preferred to blocking progress) to let implementation experience inform which specification the group ultimately chooses to move ahead with.

Any decisions reached at any meeting are tentative and should be recorded in a GitHub issue. Any group participant may object to a decision reached at an online or in-person meeting within 7 days of publication of the decision, provided that they include clear technical reasons for their objection. The Chair will facilitate discussion to try to resolve the objection according to this decision process.

It is the Chair's responsibility to ensure that the decision process is fair, respects the consensus of the CG, and does not unreasonably favor or discriminate against any group participant or their employer.

## Chair Selection

The initial Chair is Sander Saar.

Participants choose their Chair(s) and can replace them at any time. However, if 5 participants (no two from the same organization) call for an election, the group must use the following process, consulting the Community Development Lead on election operations (for example, voting infrastructure and using [RFC 3797](https://datatracker.ietf.org/doc/html/rfc3797)):

- Participants announce their candidacies. Participants have 14 days to announce their candidacies, but this period ends as soon as all participants have announced their intentions. If there is only one candidate, that person becomes the Chair. If there are two or more candidates, there is a vote. Otherwise, nothing changes.
- Participants vote. Participants have 21 days to vote for a single candidate, but this period ends as soon as all participants have voted. The individual who receives the most votes, no two from the same organization, is elected chair. In case of a tie, RFC 3797 is used to break the tie. An elected Chair may appoint co-Chairs.

Participants dissatisfied with the outcome of an election may ask the Community Development Lead to intervene. The Community Development Lead, after evaluating the election, may take any action including no action.

## Amendments to this Charter

The group can decide to work on a proposed amended charter, editing the text using the [Decision Process](#decision-process) described above. The decision on whether to adopt the amended charter is made by conducting a 30-day vote on the proposed new charter. The new charter, if approved, takes effect on either the proposed date in the charter itself, or 7 days after the result of the election is announced, whichever is later. A new charter must receive 2/3 of the votes cast in the approval vote to pass. The group may make simple corrections to the charter such as deliverable dates by the simpler group decision process rather than this charter amendment process. The group will use the amendment process for any substantive changes to the goals, scope, deliverables, decision process or rules for amending the charter.
