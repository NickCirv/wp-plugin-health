![wp-plugin-health — Nicholas Ashkar editorial artwork](assets/nicholas-ashkar/banner.png)

# wp-plugin-health

Summarize WordPress.org plugin metadata through a local quality-signal rubric.

Fetches public plugin information and scores recency, compatibility, support and other metadata signals. JSON and two-plugin comparison make findings inspectable.


<a id="install"></a>

## Quickstart

Package runtime requirement: Node.js `>=20`. Git is needed to obtain this pinned source checkout.

```bash
git clone https://github.com/NickCirv/wp-plugin-health.git
cd wp-plugin-health
git checkout 8dcb5eb7f7e165bb160179aac293ed1692ad3d5b
node index.js --help
```

This source-derived example has not been executed in this review. Help is local. A plugin-slug command then requests WordPress.org metadata.




<a id="the-15-health-signals"></a>

<a id="json-output"></a>

<a id="technical-details"></a>

## Usage

```bash
node index.js akismet --json
node index.js --compare akismet wordfence
```

These are example slugs, not recommendations. Review individual signals rather than relying on the aggregate score.

[Command reference](docs/REFERENCE.md) covers arguments, modes and output controls.


<a id="what-it-is-not"></a>

## Behavior and limits

This does not download or audit plugin code, test a WordPress installation or check vulnerabilities. The latest-WordPress helper is hard-coded to 6.7, so compatibility scoring is not a current release check. Support/usage metadata can be incomplete and a high score is not a security endorsement.

## Development

Declared package scripts:

| Script | Command |
| --- | --- |
| `start` | `node index.js` |
| `test` | `node index.js akismet && node index.js --json akismet &#124; node -e "const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.exit(d.score > 0 ? 0 : 1)" && echo 'Tests passed'` |

The declared test performs live WordPress.org requests for akismet and asserts a positive score. It was not run; it is network-dependent and does not establish the accuracy of the scoring rubric.

## Research

[Source review and claim ledger](docs/RESEARCH.md) records revision `8dcb5eb7f7e1`, inspected files and verification gaps.

## License and attribution

Protected license and attribution files remain unchanged: [LICENSE](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/LICENSE).

[Artwork credits](assets/nicholas-ashkar/CREDITS.md) · [Nicholas Ashkar — consulting](https://nicholashkar.com/#oxblood-contact)
