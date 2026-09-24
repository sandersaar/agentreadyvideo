# Contributing to ARV

Thanks for helping. ARV gets better when publishers, platforms, player makers and agent builders tell us what breaks.

## Before you start

- Read the [spec](spec/1.0/README.md) and the [governance rules](GOVERNANCE.md).
- Search open issues first.
- For a question, use the **Question** issue template.
- For a change to the spec, schemas or examples, use the **Proposal** template and wait for the `accepted` label before you open a large pull request. Typo and link fixes can go straight to a pull request.

## Pull requests

- Keep one change per pull request.
- Change the spec text, the schema and the example together. The examples in `spec/1.0/03-core-objects.md` must match the files in `examples/1.0/` exactly.
- Run `npm install` and `npm test`. CI runs the same checks.
- Add a line to `CHANGELOG.md` under "Unreleased".

## Writing style

- Plain words. Write the way you would say it to another engineer.
- Short sentences, active voice, one rule per bullet.
- Use MUST, SHOULD and MAY only for normative rules, as in RFC 2119.
- No em dashes. Use periods, commas, colons or parentheses. `npm test` checks this.
- Use example.com in examples. Do not name real companies as users of ARV.

## Licensing of contributions

By contributing you agree that:

- Contributions to the spec text are made under the terms of the [W3C Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/process/cla/), including its patent commitments. AgentCDN contributes the spec text to the W3C Agent-Ready Video Community Group under the W3C CLA at launch. After launch, contribute through the group. See [LICENSE-SPEC.md](LICENSE-SPEC.md).
- Contributions to schemas, scripts and other code are made under [Apache-2.0](LICENSE).
- Contributions to other documentation are made under [CC-BY-4.0](LICENSE-DOCS.md).

See [LICENSES.md](LICENSES.md) for which file falls under which license.

## Conduct

Be direct, be kind, and stay on the technical point. The maintainer may lock threads or remove comments that are abusive or off topic.
