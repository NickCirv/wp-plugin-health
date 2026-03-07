#!/usr/bin/env node
'use strict';

const https = require('https');
const { argv, stdout } = process;

const c = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', cyan:'\x1b[36m', white:'\x1b[37m', gray:'\x1b[90m' };
const isTTY = stdout.isTTY;
const col = (code, str) => isTTY ? `${code}${str}${c.reset}` : str;

function fetchPlugin(slug) {
  const url = `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${encodeURIComponent(slug)}`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data && data.error) reject(new Error(`Plugin "${slug}" not found on WP.org`));
          else if (!data || !data.slug) reject(new Error(`No data returned for "${slug}"`));
          else resolve(data);
        } catch { reject(new Error('Failed to parse WP.org API response')); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out after 15s')); });
    req.on('error', reject);
  });
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
}

function parseWPDate(s) {
  if (!s) return null;
  const normalized = s.replace(/(\d:\d{2})(am|pm)/i, '$1 $2').replace('GMT', '+0000');
  const d = new Date(normalized);
  return isNaN(d) ? new Date(s) : d;
}

function daysSince(s) {
  const d = parseWPDate(s);
  return (!d || isNaN(d)) ? Infinity : Math.floor((Date.now() - d.getTime()) / 86400000);
}

function humanDate(s) {
  const d = parseWPDate(s);
  if (!d || isNaN(d)) return s || 'Unknown';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 60) return '1 month ago';
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  if (days < 730) return '1 year ago';
  return `${Math.floor(days / 365)} years ago`;
}

function formatInstalls(n) {
  if (n >= 1000000) return `${Math.floor(n / 1000000)}M+`;
  if (n >= 100000)  return `${Math.floor(n / 100000) * 100}K+`;
  if (n >= 1000)    return `${Math.floor(n / 1000)}K+`;
  return n.toLocaleString();
}

function latestWP() { return 6.7; }

function scorePlugin(p) {
  const sig = [];
  const add = (key, icon, label, value, score, max, status, note = null) =>
    sig.push({ key, icon, label, value, score, max, status, note });

  const installs = p.active_installs || 0;
  add('installs','📊','Active installs', formatInstalls(installs),
    installs >= 100000 ? 10 : installs >= 10000 ? 7 : installs >= 1000 ? 4 : 2, 10,
    installs >= 100000 ? 'good' : installs >= 10000 ? 'ok' : 'warn');

  const rating = (p.rating || 0) / 20;
  add('rating','⭐','Rating', `${rating.toFixed(1)}/5`,
    rating >= 4.5 ? 8 : rating >= 4.0 ? 6 : rating >= 3.5 ? 4 : 2, 8,
    rating >= 4.5 ? 'good' : rating >= 4.0 ? 'ok' : 'bad');

  const rCount = p.num_ratings || 0;
  add('rating_count','🗳️','Rating count', rCount.toLocaleString(),
    rCount >= 500 ? 5 : rCount >= 100 ? 4 : rCount >= 20 ? 2 : 1, 5,
    rCount >= 100 ? 'good' : rCount >= 20 ? 'ok' : 'warn',
    rCount < 20 ? 'Too few to be reliable' : null);

  const daysOld = daysSince(p.last_updated);
  add('last_updated','🔄','Last updated', humanDate(p.last_updated),
    daysOld <= 180 ? 10 : daysOld <= 365 ? 7 : daysOld <= 730 ? 3 : 0, 10,
    daysOld <= 180 ? 'good' : daysOld <= 365 ? 'ok' : 'bad',
    daysOld > 730 ? 'Possibly abandoned' : daysOld > 365 ? 'Slow maintenance' : null);

  const tested = parseFloat(p.tested || '0');
  const wpDelta = latestWP() - tested;
  add('tested_up_to','🧪','Tested up to', p.tested ? `WP ${p.tested}` : 'Unknown',
    wpDelta <= 0.1 ? 8 : wpDelta <= 0.5 ? 5 : wpDelta <= 1.0 ? 2 : 0, 8,
    wpDelta <= 0.1 ? 'good' : wpDelta <= 0.5 ? 'ok' : 'bad',
    wpDelta > 1.0 ? `${wpDelta.toFixed(1)} versions behind` : null);

  const php = parseFloat(p.requires_php || '0');
  add('requires_php','🐘','Requires PHP', p.requires_php ? `PHP ${p.requires_php}` : 'Not specified',
    php >= 8.0 ? 5 : php >= 7.4 ? 4 : php >= 7.0 ? 3 : php > 0 ? 1 : 2, 5,
    php >= 8.0 ? 'good' : php >= 7.4 ? 'ok' : 'warn',
    php > 0 && php < 7.4 ? 'Outdated PHP requirement' : null);

  const threads = parseInt(p.support_threads || 0);
  const resolved = parseInt(p.support_threads_resolved || 0);
  const hasData = threads >= 5;
  const pct = threads > 0 ? Math.round((resolved / threads) * 100) : null;
  add('support_resolved','🎫','Support resolved',
    threads === 0 ? 'No threads' : !hasData ? `${pct}% (${threads} threads)` : `${pct}%`,
    threads === 0 ? 3 : !hasData ? 4 : pct >= 75 ? 8 : pct >= 50 ? 5 : 2, 8,
    threads === 0 ? 'ok' : !hasData ? 'ok' : pct >= 75 ? 'good' : pct >= 50 ? 'ok' : 'bad',
    hasData && pct < 50 ? 'Low support quality' : null);

  const tagCount = Object.keys(p.tags || {}).length;
  add('tags','🏷️','Tags', `${tagCount} tags`,
    tagCount >= 3 && tagCount <= 5 ? 3 : tagCount >= 1 ? 2 : 0, 3,
    tagCount >= 3 && tagCount <= 5 ? 'good' : tagCount >= 1 ? 'ok' : 'warn',
    tagCount === 0 ? 'No tags — poor discoverability' : tagCount > 5 ? 'Too many tags' : null);

  const hasDonate = !!(p.donate_link && p.donate_link.trim());
  add('donate_link','💰','Donate link', hasDonate ? 'Yes' : 'No',
    hasDonate ? 2 : 0, 2, hasDonate ? 'good' : 'warn',
    hasDonate ? null : 'No maintenance signal');

  const dl = p.downloaded || p.download_count || 0;
  const dlNA = !p.downloaded && !p.download_count;
  add('downloads','⬇️','Total downloads', dlNA ? 'N/A' : dl.toLocaleString(),
    dlNA ? 3 : dl >= 1000000 ? 5 : dl >= 100000 ? 4 : dl >= 10000 ? 3 : dl >= 1000 ? 2 : 1, 5,
    dlNA ? 'ok' : dl >= 1000000 ? 'good' : dl >= 100000 ? 'ok' : 'warn');

  const vCount = Object.keys(p.versions || {}).length;
  add('versions','📦','Releases', `${vCount} versions`,
    vCount >= 10 ? 5 : vCount >= 5 ? 4 : vCount >= 2 ? 2 : 1, 5,
    vCount >= 10 ? 'good' : vCount >= 5 ? 'ok' : 'warn',
    vCount < 2 ? 'Very early stage' : null);

  const hasFAQ = !!(p.sections && p.sections.faq);
  add('has_faq','❓','FAQ section', hasFAQ ? 'Yes' : 'No', hasFAQ ? 4 : 0, 4,
    hasFAQ ? 'good' : 'warn', hasFAQ ? null : 'Missing documentation');

  const shots = p.screenshots ? Object.keys(p.screenshots).length : 0;
  add('screenshots','📸','Screenshots', shots > 0 ? `${shots} screenshots` : 'None',
    shots >= 3 ? 4 : shots >= 1 ? 2 : 0, 4,
    shots >= 3 ? 'good' : shots >= 1 ? 'ok' : 'warn',
    shots === 0 ? 'No screenshots' : null);

  const contrib = Object.keys(p.contributors || {}).length;
  add('contributors','👥','Contributors', `${contrib}`,
    contrib >= 5 ? 5 : contrib >= 2 ? 4 : contrib === 1 ? 3 : 0, 5,
    contrib >= 5 ? 'good' : contrib >= 1 ? 'ok' : 'warn',
    contrib === 0 ? 'No contributors listed' : null);

  const compat = p.compatibility && Object.keys(p.compatibility).length > 0;
  add('compatibility','🔗','Compatibility data', compat ? `${Object.keys(p.compatibility).length} entries` : 'None',
    compat ? 3 : 1, 3, compat ? 'good' : 'ok');

  const total = sig.reduce((s, x) => s + x.score, 0);
  const max   = sig.reduce((s, x) => s + x.max, 0);
  return { signals: sig, score: Math.round((total / max) * 100) };
}

function progressBar(score, w = 20) {
  const f = Math.round((score / 100) * w);
  const barCol = score >= 75 ? c.green : score >= 50 ? c.yellow : c.red;
  return col(barCol, '█'.repeat(f)) + col(c.gray, '░'.repeat(w - f));
}

function statusIcon(s) {
  return s === 'good' ? col(c.green,'✅') : s === 'ok' ? col(c.yellow,'⚠️') : col(c.red,'❌');
}

function scoreColor(n) { return n >= 75 ? c.green : n >= 50 ? c.yellow : c.red; }

function diagnosis(score, signals) {
  const issues = signals.filter(s => s.status === 'bad').map(s => s.note).filter(Boolean);
  const warns  = signals.filter(s => s.status === 'warn').map(s => s.note).filter(Boolean);
  if (score >= 90) return 'Excellent plugin. Top-tier health across all signals.';
  if (score >= 75) { const h = warns[0] || issues[0]; return `Strong vitals.${h ? ` Could address: ${h.toLowerCase()}.` : ''}`; }
  if (score >= 50) { const p = [...issues, ...warns].slice(0,2).join('; '); return `Moderate health. Issues: ${p || 'maintenance gaps detected'}.`; }
  return `Poor health. Critical issues: ${issues.slice(0,2).join('; ') || 'multiple signals failing'}.`;
}

function printReport(p, { score, signals }) {
  const rule = col(c.gray, '━'.repeat(40));
  console.log();
  console.log(col(c.bold + c.white, 'WP PLUGIN HEALTH CHECK'));
  console.log(rule);
  console.log();
  console.log(`${col(c.bold,'Plugin:')}  ${stripHtml(p.name)}`);
  console.log(`${col(c.bold,'Author:')}  ${stripHtml(p.author)}`);
  console.log(`${col(c.bold,'Version:')} ${p.version || 'Unknown'}`);
  console.log(`${col(c.bold,'Slug:')}    ${p.slug}`);
  console.log();
  console.log(`${col(c.bold,'Health Score:')} ${progressBar(score)} ${col(c.bold + scoreColor(score), `${score}/100`)}`);
  console.log();
  console.log(col(c.bold + c.cyan, 'Vitals:'));
  for (const s of signals) {
    const label = `${s.icon} ${s.label}:`.padEnd(22);
    const value = s.value + (s.note ? col(c.gray, ` (${s.note})`) : '');
    console.log(`  ${col(c.gray, label)} ${value.padEnd(28)}  ${statusIcon(s.status)}`);
  }
  console.log();
  console.log(`${col(c.bold,'Diagnosis:')} ${col(c.cyan, `"${diagnosis(score, signals)}"`)}`);
  console.log();
}

function printCompare(left, right) {
  const { score: lScore, signals: lSig } = scorePlugin(left);
  const { score: rScore, signals: rSig } = scorePlugin(right);
  console.log();
  console.log(col(c.bold + c.white, 'WP PLUGIN COMPARISON'));
  console.log(col(c.gray, '━'.repeat(60)));
  console.log();
  const hdr = (p, s) => `${col(c.bold, stripHtml(p.name).slice(0, 28))} ${col(scoreColor(s), `[${s}/100]`)}`;
  console.log(`  ${hdr(left, lScore).padEnd(52)}  vs  ${hdr(right, rScore)}`);
  console.log();
  for (let i = 0; i < lSig.length; i++) {
    const l = lSig[i], r = rSig[i];
    const label = col(c.gray, `${l.icon} ${l.label}:`.padEnd(20));
    const arrow = l.score > r.score ? col(c.green,'◀') : l.score < r.score ? col(c.green,'▶') : col(c.gray,'·');
    console.log(`  ${label} ${String(l.value).padEnd(16)}  ${arrow}  ${r.value}`);
  }
  console.log();
  const winner = lScore > rScore ? left.name : rScore > lScore ? right.name : null;
  if (winner) console.log(col(c.bold + c.green, `  Winner: ${stripHtml(winner)}`));
  else        console.log(col(c.yellow, '  Tie — matched health scores.'));
  console.log();
}

function usage() {
  console.log(`
${col(c.bold,'wp-plugin-health')} — WordPress plugin health checker

${col(c.bold,'Usage:')}
  npx wp-plugin-health <slug>
  npx wp-plugin-health <slug> --json
  npx wp-plugin-health --compare <slug1> <slug2>

${col(c.bold,'Examples:')}
  npx wp-plugin-health akismet
  npx wp-plugin-health woocommerce --json
  npx wp-plugin-health --compare akismet wordfence

${col(c.bold,'Flags:')}
  --json         Machine-readable JSON output
  --compare      Compare two plugins side by side
  --help, -h     Show this help
`);
}

async function main() {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  const compareIdx = args.indexOf('--compare');
  if (compareIdx !== -1) {
    const [s1, s2] = [args[compareIdx + 1], args[compareIdx + 2]];
    if (!s1 || !s2) { console.error(col(c.red,'Error: --compare requires two slugs')); process.exit(1); }
    try {
      const [p1, p2] = await Promise.all([fetchPlugin(s1), fetchPlugin(s2)]);
      printCompare(p1, p2);
    } catch (e) { console.error(col(c.red, `Error: ${e.message}`)); process.exit(1); }
    return;
  }

  const slug = args.find(a => !a.startsWith('--'));
  if (!slug) { console.error(col(c.red,'Error: No plugin slug provided')); usage(); process.exit(1); }

  try {
    const plugin = await fetchPlugin(slug);
    const result = scorePlugin(plugin);
    if (args.includes('--json')) {
      console.log(JSON.stringify({
        slug: plugin.slug,
        name: stripHtml(plugin.name),
        author: stripHtml(plugin.author),
        version: plugin.version,
        score: result.score,
        signals: result.signals.map(s => ({ key:s.key, label:s.label, value:s.value, score:s.score, max:s.max, status:s.status, note:s.note||null })),
        diagnosis: diagnosis(result.score, result.signals),
      }, null, 2));
    } else {
      printReport(plugin, result);
    }
  } catch (e) { console.error(col(c.red, `Error: ${e.message}`)); process.exit(1); }
}

main();
