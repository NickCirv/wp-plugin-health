# Source review — wp-plugin-health

## Revision and method

Inspected public commit: [`8dcb5eb7f7e165bb160179aac293ed1692ad3d5b`](https://github.com/NickCirv/wp-plugin-health/commit/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b). Source tree: `7977870b1e85421494183a7e666b1f887ee40c18`. Capture scope: all eligible text files; 5 of 5 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Official plugin API, signal weights and hard-coded latestWP value | [index.js](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/index.js) | Verified in inspected source; execution unverified |
| Network-dependent test command | [package.json](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/package.json) | Verified in inspected source; execution unverified |

## Findings and verification gaps

This does not download or audit plugin code, test a WordPress installation or check vulnerabilities. The latest-WordPress helper is hard-coded to 6.7, so compatibility scoring is not a current release check. Support/usage metadata can be incomplete and a high score is not a security endorsement.

The declared test performs live WordPress.org requests for akismet and asserts a positive score. It was not run; it is network-dependent and does not establish the accuracy of the scoring rubric.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/LICENSE) — Git blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/README.md) — Git blob `e0a537332641c816a71b61e6434ba166e531fa70`.
- [package.json](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/package.json) — Git blob `1bac0bea83fcb428f48a9c380b6fb60d3367448f`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/index.js) — Git blob `e7820fafe11946c1e3da197353fa62fd4696c224`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.

## Reference coverage

Added [command reference](REFERENCE.md) from the argument parser, command handlers and source-defined help at the pinned revision. README examples remain unexecuted.
