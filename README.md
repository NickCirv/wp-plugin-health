# wp-plugin-health

![Health Check](https://img.shields.io/badge/WP%20Plugin%20Health-CLI-green?style=for-the-badge&logo=wordpress)
![Zero Dependencies](https://img.shields.io/badge/zero-dependencies-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)

**Instant WordPress plugin health reports from the command line.**
Zero dependencies. 15 quality signals. 0–100 health score.

```
WP PLUGIN HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Plugin:  Akismet Anti-spam: Spam Protection
Author:  Automattic
Version: 5.3.4
Slug:    akismet

Health Score: ████████████████░░░░ 83/100

Vitals:
  ⭐ Rating:              4.4/5               ✅
  🗳️  Rating count:       956                 ✅
  📊 Active installs:    5M+                 ✅
  🔄 Last updated:       18 days ago         ✅
  🧪 Tested up to:       WP 6.7              ✅
  🐘 Requires PHP:       PHP 5.6             ⚠️  (Outdated PHP requirement)
  🎫 Support resolved:   91%                 ✅
  🏷️  Tags:               5 tags              ✅
  💰 Donate link:        No                  ⚠️
  ⬇️  Total downloads:    1,041,872,034       ✅
  📦 Releases:           43 versions         ✅
  ❓ FAQ section:        Yes                 ✅
  📸 Screenshots:        None                ❌
  👥 Contributors:       4                   ✅
  🔗 Compatibility data: None                ✅

Diagnosis: "Strong vitals. Could address: outdated php requirement."
```

---

## Usage

```bash
# One-time, no install needed
npx wp-plugin-health akismet

# Check any plugin by slug
npx wp-plugin-health woocommerce
npx wp-plugin-health wordfence

# Machine-readable JSON output
npx wp-plugin-health akismet --json

# Compare two plugins side by side
npx wp-plugin-health --compare akismet wordfence

# Help
npx wp-plugin-health --help
```

### Install globally (optional)

```bash
npm install -g wp-plugin-health
wp-plugin-health akismet
```

---

## Flags

| Flag | Description |
|------|-------------|
| `--json` | Output full report as JSON (machine-readable) |
| `--compare <slug1> <slug2>` | Compare two plugins side by side |
| `--help`, `-h` | Show usage |

---

## The 15 Health Signals

| # | Signal | Weight | What's checked |
|---|--------|--------|----------------|
| 1 | Active installs | 10 | >10K good, >100K great |
| 2 | Star rating | 8 | Out of 5 stars |
| 3 | Rating count | 5 | Volume makes rating reliable |
| 4 | Last updated | 10 | <6 months ideal, >2 years flagged |
| 5 | Tested up to | 8 | Should match latest WP version |
| 6 | Requires PHP | 5 | PHP 8.0+ preferred |
| 7 | Support resolved % | 8 | >75% = healthy author responsiveness |
| 8 | Number of tags | 3 | 3–5 optimal for discovery |
| 9 | Donate link | 2 | Signals maintenance commitment |
| 10 | Total downloads | 5 | Lifetime adoption |
| 11 | Release count | 5 | Activity and longevity |
| 12 | FAQ section | 4 | Documentation quality |
| 13 | Screenshots | 4 | UX investment |
| 14 | Contributors | 5 | Team vs solo maintainer |
| 15 | Compatibility data | 3 | Community compatibility signals |

---

## JSON Output

```bash
npx wp-plugin-health akismet --json
```

```json
{
  "slug": "akismet",
  "name": "Akismet Anti-spam",
  "author": "Automattic",
  "version": "5.3.4",
  "score": 83,
  "signals": [
    {
      "key": "installs",
      "label": "Active installs",
      "value": "5M+",
      "score": 10,
      "max": 10,
      "status": "good",
      "note": null
    }
  ],
  "diagnosis": "Strong vitals. Could address: outdated php requirement."
}
```

---

## Technical Details

- **Zero dependencies** — uses Node.js built-in `https` module
- **Node.js 14+** — no transpilation needed
- **15s timeout** with `AbortController`-style destruction
- **Graceful errors** for non-existent slugs
- Data sourced from the official [WP.org Plugin Info API](https://codex.wordpress.org/WordPress.org_API)

---

## Built by the team behind

[Cirv Box](https://wordpress.org/plugins/cirv-box/) · [Cirv Guard](https://wordpress.org/plugins/cirv-guard/) · [Cirv Pulse](https://wordpress.org/plugins/cirv-pulse/) — WordPress plugins live on WP.org.

**You might also like:** [github.com/NickCirv](https://github.com/NickCirv)

---

## License

MIT
