/*
 * Generates public/explainer-loc.mp4 — a ~75s vertical narrated explainer
 * comparing a 13% credit union line of credit vs. cash advance apps.
 *
 * Run: node scripts/tts-kokoro-loc.mjs && node scripts/make-video-loc.mjs
 */
import text2wav from 'text2wav'
import ffmpegPath from 'ffmpeg-static'
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readdirSync, existsSync, readFileSync, statSync } from 'fs'
import { execFileSync } from 'child_process'
import { resolve } from 'path'

const WORK = '/tmp/vid'
mkdirSync(WORK, { recursive: true })

const SEGMENTS = [
  "What if you needed five hundred dollars before payday — every week? Here's what a credit union line of credit actually costs.",
  "Borrow five hundred dollars at thirteen percent eh pee ar. Federal credit unions are capped at eighteen percent by law. Genesee charges thirteen.",
  "You draw it Monday. It lands directly in your account — just like a transfer. You pay it back Friday when you get paid.",
  "Unlike a credit card, there's no plastic, no merchant, no point-of-sale. You move the money yourself, when you need it, straight to your checking account.",
  "Do that every week for a year — fifty-two draws of five hundred dollars. Total interest for the year: about sixty-five dollars. No fees. No tips. No membership.",
  "Compare that to a cash advance app: two hundred to four hundred dollars a year — for the same five hundred dollars, the same weekly cycle.",
  "A credit union line of credit is yours to use, yours to repay on payday, and costs next to nothing. It's your money. Keep it.",
  "Membership required. Subject to credit approval. Thirteen percent eh pee ar. Rates and terms subject to change. Federally insured by N C U A.",
]

const GAP = 0.7

// 1) narration — use pre-generated loc wavs, fall back to espeak
const timings = []
let t = 0.8
for (let i = 0; i < SEGMENTS.length; i++) {
  const path = `${WORK}/loc${i}.wav`
  if (!existsSync(path)) {
    const wav = await text2wav(SEGMENTS[i], { voice: 'en-US+f3', speed: 150, pitch: 55 })
    writeFileSync(path, Buffer.from(wav))
  }
  const buf = readFileSync(path)
  const rate = buf.readUInt32LE(24)
  const dur = (buf.length - 44) / (rate * 2)
  timings.push({ start: t, dur })
  t += dur + GAP
}
const TOTAL = Math.ceil(t + 1.5)
console.log('segment timings:', timings.map(x => `${x.start.toFixed(1)}+${x.dur.toFixed(1)}`).join(' '), '| total:', TOTAL)

// 2) narration track
const inputs = []
const filters = []
const mixIn = []
for (let i = 0; i < SEGMENTS.length; i++) {
  inputs.push('-i', `${WORK}/loc${i}.wav`)
  const ms = Math.round(timings[i].start * 1000)
  filters.push(`[${i}]adelay=${ms}|${ms}[a${i}]`)
  mixIn.push(`[a${i}]`)
}
filters.push(`${mixIn.join('')}amix=inputs=${SEGMENTS.length}:normalize=0,apad=whole_dur=${TOTAL}[out]`)
execFileSync(ffmpegPath, ['-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]', '-ar', '44100', `${WORK}/narration-loc.wav`])

// 3) animated scenes
const sceneStarts = timings.map(x => Math.max(0, x.start - 0.4))
const ICON = resolve('public/genesee-icon.png')

// Math
const ADVANCE = 500
const APR = 0.13
const DAYS = 5  // Mon–Fri
const interest1 = (ADVANCE * APR * DAYS / 365)
const advances = 52
const annualInterest = interest1 * advances
const appLow = 200
const appHigh = 400

function fmt(n) {
  return n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString()}`
}

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
  .pill { background:#fff; border-radius:18px; padding:16px 22px; font-size:20px; font-weight:700;
          color:#0f172a; margin:8px 0; box-shadow:0 8px 24px rgba(0,0,0,.18); opacity:0;
          transform:translateY(14px); transition:all .45s ease; }
  .pill.show { opacity:1; transform:none; }
  .greenbox { background:rgba(34,197,94,.12); border:2px solid rgba(34,197,94,.45); border-radius:22px;
              padding:28px 34px; margin-top:10px; }
  .green { color:#4ade80; font-size:64px; font-weight:900; }
  .redbox { background:rgba(239,68,68,.12); border:2px solid rgba(239,68,68,.45); border-radius:22px;
            padding:18px 24px; margin-top:8px; }
  .red { color:#f87171; font-size:48px; font-weight:900; }
  .vsrow { display:flex; gap:12px; margin-top:18px; width:100%; }
  .vsbox { flex:1; border-radius:16px; padding:14px 10px; text-align:center; }
  .disc { font-size:11px; color:#64748b; line-height:1.6; text-align:center; padding:28px 20px; }
</style></head><body>

<!-- Scene 0: intro -->
<div class="scene" id="s0" style="background:linear-gradient(160deg,#1e40af,#0f172a);color:#fff">
  <div class="em">💸</div>
  <div class="big" style="font-size:32px">Need $500<br>before payday<br>every week?</div>
  <div class="sub">Here's what it actually costs<br>at your credit union.</div>
</div>

<!-- Scene 1: 13% APR -->
<div class="scene" id="s1" style="background:#0f172a;color:#fff">
  <div class="sub" style="margin-bottom:12px">Credit union line of credit</div>
  <div class="greenbox">
    <div class="green">13%</div>
    <div style="color:#86efac;font-size:20px;font-weight:700">APR — Genesee's rate</div>
  </div>
  <div class="sub" style="font-size:14px;margin-top:16px">
    Federal law caps credit unions at 18%.<br>
    Genesee charges 13%.<br>
    Not a promo. Not a trick.
  </div>
</div>

<!-- Scene 2: draw & repay -->
<div class="scene" id="s2" style="background:#f8fafc;color:#0f172a">
  <div class="big" style="font-size:26px;margin-bottom:18px">Draw Monday.<br>Repay Friday.</div>
  <div class="pill" id="p0">💵 Draw $500 → checking</div>
  <div class="pill" id="p1">📅 Hold 5 days</div>
  <div class="pill" id="p2">💰 Interest: ${fmt(interest1)}</div>
</div>

<!-- Scene 3: direct transfer advantage -->
<div class="scene" id="s3" style="background:#1e293b;color:#fff">
  <div class="em" style="font-size:60px;margin-bottom:16px">🏦→💳</div>
  <div class="big" style="font-size:28px">Not a credit card.</div>
  <div class="sub">No plastic. No merchant terminal.<br>You transfer the money yourself<br>directly into your checking account —<br>whenever you need it.</div>
</div>

<!-- Scene 4: annual cost -->
<div class="scene" id="s4" style="background:#0f172a;color:#fff">
  <div class="sub" style="margin-bottom:6px">52 draws × $500 over a year</div>
  <div class="greenbox">
    <div class="green">${fmt(annualInterest)}</div>
    <div style="color:#86efac;font-size:18px;font-weight:700">total interest — all year</div>
  </div>
  <div class="sub">No fees. No tips. No membership.<br>$${Math.round(ADVANCE * advances).toLocaleString()} borrowed. That's it.</div>
</div>

<!-- Scene 5: vs app comparison -->
<div class="scene" id="s5" style="background:#0f172a;color:#fff">
  <div class="sub" style="margin-bottom:10px">Same $500. Same weekly cycle.</div>
  <div class="vsrow">
    <div class="vsbox" style="background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.4)">
      <div style="font-size:12px;font-weight:700;color:#fca5a5;margin-bottom:6px">Cash advance app</div>
      <div style="font-size:28px;font-weight:900;color:#f87171">$${appLow}–<br>$${appHigh}</div>
      <div style="font-size:10px;color:#fca5a5;margin-top:4px">fees, tips &amp; membership</div>
    </div>
    <div class="vsbox" style="background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.4)">
      <div style="font-size:12px;font-weight:700;color:#86efac;margin-bottom:6px">Credit union LOC</div>
      <div style="font-size:28px;font-weight:900;color:#4ade80">${fmt(annualInterest)}</div>
      <div style="font-size:10px;color:#86efac;margin-top:4px">interest only — nothing else</div>
    </div>
  </div>
</div>

<!-- Scene 6: CTA -->
<div class="scene" id="s6" style="background:linear-gradient(160deg,#16a34a,#14532d);color:#fff">
  <img src="file://${ICON}" width="120" height="120" style="margin-bottom:20px">
  <div class="big" style="font-size:28px">It's your money.<br>Keep it.</div>
  <div class="sub">Ask Genesee Co-op FCU about<br>a line of credit today.</div>
</div>

<!-- Scene 7: disclosures -->
<div class="scene" id="s7" style="background:#0f172a">
  <div class="disc">
    Membership eligibility required. Subject to credit approval.<br>
    13% APR (Annual Percentage Rate).<br>
    Federal credit union maximum rate: 18% APR.<br>
    Rates and terms subject to change without notice.<br>
    This is an educational demonstration.<br>
    No actual loan offer is made or implied.<br><br>
    <strong style="color:#475569">Genesee Co-op Federal Credit Union</strong><br>
    <span style="color:#334155">Federally insured by NCUA</span>
  </div>
</div>

<script>
  const starts = ${JSON.stringify(sceneStarts)};
  starts.forEach((s, i) => setTimeout(() => {
    document.querySelectorAll('.scene').forEach(el => el.classList.remove('on'));
    document.getElementById('s' + i).classList.add('on');
    if (i === 2) [0,1,2].forEach(j => setTimeout(() =>
      document.getElementById('p' + j).classList.add('show'), 500 + j * 1400));
  }, s * 1000));
</script></body></html>`
writeFileSync(`${WORK}/scenes-loc.html`, html)

// 4) record with Playwright
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: WORK, size: { width: 390, height: 844 } },
})
const page = await ctx.newPage()
await page.goto(`file://${WORK}/scenes-loc.html`)
await page.waitForTimeout(TOTAL * 1000)
await ctx.close()
await browser.close()
const webms = readdirSync(WORK).filter(f => f.endsWith('.webm'))
const webm = webms.sort((a, b) => statSync(`${WORK}/${b}`).mtimeMs - statSync(`${WORK}/${a}`).mtimeMs)[0]
console.log('recorded:', webm)

// 5) mux -> mp4
execFileSync(ffmpegPath, [
  '-y', '-i', `${WORK}/${webm}`, '-i', `${WORK}/narration-loc.wav`,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '25',
  '-c:a', 'aac', '-b:a', '96k', '-t', String(TOTAL), '-movflags', '+faststart',
  'public/explainer-loc.mp4',
])
console.log('wrote public/explainer-loc.mp4')
