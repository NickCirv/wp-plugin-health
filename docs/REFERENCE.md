# Command reference

Use `node index.js` from the pinned source checkout described in the [README](../README.md). The entries below describe the inspected implementation.

| Command or argument | Behavior |
| --- | --- |
| `SLUG` | Fetch WordPress.org metadata for one plugin and calculate the bundled heuristic score. |
| `--compare SLUG_A SLUG_B` | Compare two plugins. |
| `--json` | Emit the structured plugin analysis. |
| `Version reference` | The compatibility calculation uses the source's hard-coded WordPress version, 6.7; it is not a live current-version lookup. |

For prerequisites, file writes, external services and known limitations, see [Behavior and limits](../README.md#behavior-and-limits).

Implementation: [index.js](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/index.js), [package.json](https://github.com/NickCirv/wp-plugin-health/blob/8dcb5eb7f7e165bb160179aac293ed1692ad3d5b/package.json); [review evidence](RESEARCH.md).
