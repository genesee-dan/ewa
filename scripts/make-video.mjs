/*
 * Generates public/explainer.mp4 — a ~60s vertical narrated explainer.
 * Pipeline: text2wav (offline espeak TTS) -> timed HTML scenes recorded
 * with Playwright -> mux with ffmpeg-static.
 *
 * Run: node scripts/make-video.mjs
 */
import text2wav from 'text2wav'
import ffmpegPath from 'ffmpeg-static'
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'fs'
import { execFileSync } from 'child_process'
import { resolve } from 'path'

const WORK = '/tmp/vid'
mkdirSync(WORK, { recursive: true })

const SEGMENTS = [
  "Meet the cash advance app. It says: it's your pay — get it now.",
  'No interest! Just a small fee. And a tip. And a monthly membership.',
  'On a fifty dollar advance, those few dollars work out to triple digit A. P. R. — often higher than a payday loan.',
  "And it's built to keep you coming back. Streaks. Countdowns. Alerts. Repaying on payday leaves your check short — so you borrow again. That's the loop.",
  'Over a year, frequent users pay hundreds of dollars — just to get their own paycheck a few days early.',
  "There's a better way. A local credit union is owned by its members, not investors. Real people. Fair, regulated loans capped at twenty-eight percent. And savings that actually build.",
  'Skip the apps. Keep your pay. Join your local credit union.',
]

const GAP = 0.7 // seconds between segments

// 1) synthesize narration segments and compute timings
const timings = []
let t = 0.8
for (let i = 0; i < SEGMENTS.length; i++) {
  const wav = await text2wav(SEGMENTS[i], { voice: 'en-US+f3', speed: 150, pitch: 55 })
  writeFileSync(`${WORK}/seg${i}.wav`, Buffer.from(wav))
  const dur = (wav.length - 44) / (22050 * 2) // 22.05kHz 16-bit mono
  timings.push({ start: t, dur })
  t += dur + GAP
}
const TOTAL = Math.ceil(t + 1.5)
console.log('segment timings:', timings.map(x => `${x.start.toFixed(1)}+${x.dur.toFixed(1)}`).join(' '), '| total:', TOTAL)

// 2) build the narration track (delay each segment onto a silent bed)
const inputs = []
const filters = []
const mixIn = []
for (let i = 0; i < SEGMENTS.length; i++) {
  inputs.push('-i', `${WORK}/seg${i}.wav`)
  const ms = Math.round(timings[i].start * 1000)
  filters.push(`[${i}]adelay=${ms}|${ms}[a${i}]`)
  mixIn.push(`[a${i}]`)
}
filters.push(`${mixIn.join('')}amix=inputs=${SEGMENTS.length}:normalize=0,apad=whole_dur=${TOTAL}[out]`)
execFileSync(ffmpegPath, ['-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]', '-ar', '44100', `${WORK}/narration.wav`])

// 3) animated scenes page (scene i shown from timings[i].start - 0.4 until next)
const sceneStarts = timings.map(x => Math.max(0, x.start - 0.4))
const ICON = resolve('public/genesee-icon.png')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; box-sizing:border-box; font-family:-apple-system,'Segoe UI',Roboto,sans-serif; }
  body { width:390px; height:844px; overflow:hidden; background:#0f172a; }
  .scene { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
           justify-content:center; text-align:center; padding:36px; opacity:0;
           transition:opacity .5s ease; }
  .scene.on { opacity:1; }
  .big { font-size:42px; font-weight:800; line-height:1.2; }
  .em { font-size:84px; margin-bottom:24px; }
  .sub { font-size:17px; opacity:.85; margin-top:14px; line-height:1.45; }
  .pill { background:#fff; border-radius:18px; padding:16px 22px; font-size:22px; font-weight:700;
          color:#0f172a; margin:9px 0; box-shadow:0 8px 24px rgba(0,0,0,.18); opacity:0;
          transform:translateY(14px); transition:all .45s ease; }
  .pill.show { opacity:1; transform:none; }
  .redbox { background:rgba(239,68,68,.12); border:2px solid rgba(239,68,68,.45); border-radius:22px;
            padding:28px 34px; margin-top:10px; }
  .red { color:#f87171; font-size:64px; font-weight:900; }
  .loop { font-size:30px; line-height:2; font-weight:700; }
</style></head><body>

<div class="scene" id="s0" style="background:linear-gradient(160deg,#16a34a,#14532d);color:#fff">
  <div class="em">⚡</div>
  <div class="big">"It's your pay.<br>Get it now."</div>
  <div class="sub">Cash advance apps promise easy money<br>between paydays.</div>
</div>

<div class="scene" id="s1" style="background:#f8fafc;color:#0f172a">
  <div class="big" style="font-size:30px;margin-bottom:22px">"No interest!" …but:</div>
  <div class="pill" id="p0">💸 $3.99 instant fee</div>
  <div class="pill" id="p1">💚 + $2 "tip"</div>
  <div class="pill" id="p2">⭐ + $9.99/month membership</div>
</div>

<div class="scene" id="s2" style="background:#0f172a;color:#fff">
  <div class="sub" style="margin-bottom:8px">On a $50 advance, that's</div>
  <div class="redbox"><div class="red">300%+</div>
  <div style="color:#fca5a5;font-size:22px;font-weight:700">effective APR</div></div>
  <div class="sub">A credit card is ~24%.<br>A payday loan is ~400%.</div>
</div>

<div class="scene" id="s3" style="background:#1e293b;color:#fff">
  <div class="loop">💰 advance today<br>⬇️<br>📉 short paycheck<br>⬇️<br>💰 advance again</div>
  <div class="sub">🔥 streaks · ⏰ countdowns · 🔔 alerts<br>keep the loop spinning</div>
</div>

<div class="scene" id="s4" style="background:#0f172a;color:#fff">
  <div class="sub" style="margin-bottom:8px">Over a year, frequent users pay</div>
  <div class="redbox"><div class="red">$200–$400</div>
  <div style="color:#fca5a5;font-size:20px;font-weight:700">in fees, tips & memberships</div></div>
  <div class="sub">…to receive their own paycheck<br>a few days early.</div>
</div>

<div class="scene" id="s5" style="background:linear-gradient(160deg,#eef2ff,#dcfce7);color:#1e1b4b">
  <img src="file://${ICON}" width="150" height="150" style="margin-bottom:26px">
  <div class="big" style="font-size:32px">Your local credit union</div>
  <div class="sub" style="color:#334155">Member-owned, not investor-owned<br>
  Real people who know you<br>
  Fair loans — capped at 28% APR<br>
  Savings that actually build</div>
</div>

<div class="scene" id="s6" style="background:linear-gradient(160deg,#16a34a,#14532d);color:#fff">
  <div class="em">🤝</div>
  <div class="big">It's your money.<br>Keep it.</div>
  <div class="sub">Skip the apps. Join your local credit union.</div>
</div>

<script>
  const starts = ${JSON.stringify(sceneStarts)};
  starts.forEach((s, i) => setTimeout(() => {
    document.querySelectorAll('.scene').forEach(el => el.classList.remove('on'));
    document.getElementById('s' + i).classList.add('on');
    if (i === 1) [0,1,2].forEach(j => setTimeout(() =>
      document.getElementById('p' + j).classList.add('show'), 600 + j * 1500));
  }, s * 1000));
</script></body></html>`
writeFileSync(`${WORK}/scenes.html`, html)

// 4) record with Playwright
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: WORK, size: { width: 390, height: 844 } },
})
const page = await ctx.newPage()
await page.goto(`file://${WORK}/scenes.html`)
await page.waitForTimeout(TOTAL * 1000)
await ctx.close()
await browser.close()
const webm = readdirSync(WORK).find(f => f.endsWith('.webm'))
console.log('recorded:', webm)

// 5) mux video + narration -> mp4
execFileSync(ffmpegPath, [
  '-y', '-i', `${WORK}/${webm}`, '-i', `${WORK}/narration.wav`,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '25',
  '-c:a', 'aac', '-b:a', '96k', '-t', String(TOTAL), '-movflags', '+faststart',
  'public/explainer.mp4',
])
console.log('wrote public/explainer.mp4')
