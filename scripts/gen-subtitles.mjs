/*
 * Generates WebVTT caption tracks for the explainer videos, in every language
 * we have a translation for. Output: public/subtitles/<video>.<lang>.vtt
 *
 *   node scripts/gen-subtitles.mjs
 *
 * Timing: mirrors make-video.mjs / make-video-loc.mjs — narration starts at
 * 0.8s, each segment is followed by a 0.7s gap. If the rendered narration wavs
 * exist in /tmp/vid (i.e. you're in the video-build environment) we read their
 * exact durations so the captions line up perfectly; otherwise we estimate from
 * word count (~2.7 words/sec) which is close enough for review.
 *
 * To add a language: add its segment array under the matching video key below.
 * To add a video: add a new entry with its wav prefix and segment arrays.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs'

const WORK = '/tmp/vid'
const GAP = 0.7
const START = 0.8
const WPS = 2.7 // neural TTS words/sec estimate for the fallback

const VIDEOS = {
  explainer: {
    wavPrefix: 'seg',
    langs: {
      en: [
        "Meet the cash advance app. It says: it's your pay — get it now.",
        'No interest! Just a small fee. And a tip. And a monthly membership.',
        "The app says it's not a loan. But you borrow money, pay a cost to get it, and repay it on a fixed date. That's a loan.",
        'On a fifty dollar advance, those few dollars work out to a triple-digit annual percentage rate — often higher than a payday loan.',
        "And it's built to keep you coming back. Streaks. Countdowns. Alerts. Repaying on payday leaves your check short — so you borrow again. That's the loop.",
        'Over a year, frequent users pay hundreds of dollars — just to get their own paycheck a few days early.',
        'Can you afford to give a tech company that money?',
      ],
      es: [
        'Te presentamos la app de adelanto de sueldo. Dice: es tu sueldo, cóbralo ahora.',
        '¡Sin intereses! Solo una pequeña comisión. Y una propina. Y una membresía mensual.',
        'La app dice que no es un préstamo. Pero pides dinero prestado, pagas un costo por recibirlo y lo devuelves en una fecha fija. Eso es un préstamo.',
        'En un adelanto de cincuenta dólares, esos pocos dólares equivalen a un APR de tres cifras — a menudo más alto que un préstamo de día de pago.',
        'Y está diseñada para que vuelvas. Rachas. Cuentas regresivas. Alertas. Devolver el día de pago deja tu cheque corto — así que pides otro adelanto. Ese es el ciclo.',
        'En un año, los usuarios frecuentes pagan cientos de dólares — solo por recibir su propio cheque unos días antes.',
        '¿Puedes darte el lujo de darle ese dinero a una empresa de tecnología?',
      ],
    },
  },
  'explainer-loc': {
    wavPrefix: 'loc',
    langs: {
      en: [
        "What if you needed five hundred dollars before payday — every week? Here's what a credit union line of credit actually costs.",
        'Borrow five hundred dollars at thirteen percent APR. Federal credit unions are capped at eighteen percent by law. Genesee charges thirteen.',
        'You draw it Monday. It lands directly in your account — just like a transfer. You pay it back Friday when you get paid.',
        "Unlike a credit card, there's no plastic, no merchant, no point-of-sale. You move the money yourself, when you need it, straight to your checking account.",
        'Do that every week for a year — fifty-two draws of five hundred dollars. Total interest for the year: about sixty-five dollars. No fees. No tips. No membership.',
        'Compare that to a cash advance app: two hundred to four hundred dollars a year — for the same five hundred dollars, the same weekly cycle.',
        'A credit union line of credit is yours to use, yours to repay on payday, and costs next to nothing. It\'s your money. Keep it.',
        'Membership required. Subject to credit approval. Thirteen percent APR. Rates and terms subject to change. Federally insured by NCUA.',
      ],
      es: [
        '¿Y si necesitaras quinientos dólares antes del día de pago — cada semana? Esto es lo que realmente cuesta una línea de crédito de una cooperativa.',
        'Pide quinientos dólares al trece por ciento de APR. Por ley, las cooperativas de crédito federales tienen un tope del dieciocho por ciento. Genesee cobra trece.',
        'Lo retiras el lunes. Llega directo a tu cuenta — igual que una transferencia. Lo devuelves el viernes cuando cobras.',
        'A diferencia de una tarjeta de crédito, no hay plástico, ni comercio, ni punto de venta. Tú mismo mueves el dinero, cuando lo necesitas, directo a tu cuenta corriente.',
        'Hazlo cada semana durante un año — cincuenta y dos retiros de quinientos dólares. Interés total del año: unos sesenta y cinco dólares. Sin comisiones. Sin propinas. Sin membresía.',
        'Compáralo con una app de adelanto de sueldo: doscientos a cuatrocientos dólares al año — por los mismos quinientos dólares, el mismo ciclo semanal.',
        'Una línea de crédito de una cooperativa es tuya para usar, tuya para devolver el día de pago, y no cuesta casi nada. Es tu dinero. Consérvalo.',
        'Membresía requerida. Sujeto a aprobación de crédito. Trece por ciento de APR. Tasas y términos sujetos a cambio. Asegurado federalmente por la NCUA.',
      ],
    },
  },
}

function wavDur(path) {
  if (!existsSync(path)) return null
  const buf = readFileSync(path)
  const rate = buf.readUInt32LE(24)
  return (buf.length - 44) / (rate * 2) // 16-bit mono
}

function ts(sec) {
  const s = Math.max(0, sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const secs = (s % 60).toFixed(3).padStart(6, '0')
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${secs}`
}

// Timing is driven by the English narration (the audio the video actually
// plays), so translated captions align to the same cue boundaries.
function timings(video) {
  const en = video.langs.en
  let t = START
  const out = []
  for (let i = 0; i < en.length; i++) {
    const wav = wavDur(`${WORK}/${video.wavPrefix}${i}.wav`)
    const dur = wav != null ? wav : en[i].split(/\s+/).length / WPS
    out.push({ start: t, dur })
    t += dur + GAP
  }
  return out
}

function toVtt(segments, times) {
  let out = 'WEBVTT\n\n'
  for (let i = 0; i < segments.length; i++) {
    const start = Math.max(0, times[i].start - 0.3)
    const end = i + 1 < times.length ? times[i + 1].start - 0.3 : times[i].start + times[i].dur + 0.5
    out += `${i + 1}\n${ts(start)} --> ${ts(end)}\n${segments[i]}\n\n`
  }
  return out
}

mkdirSync('public/subtitles', { recursive: true })
let usingWavs = false
for (const [name, video] of Object.entries(VIDEOS)) {
  const times = timings(video)
  if (existsSync(`${WORK}/${video.wavPrefix}0.wav`)) usingWavs = true
  for (const [lang, segs] of Object.entries(video.langs)) {
    const path = `public/subtitles/${name}.${lang}.vtt`
    writeFileSync(path, toVtt(segs, times))
    console.log(`wrote ${path} (${segs.length} cues)`)
  }
}
console.log(usingWavs ? 'timings: exact (from rendered wavs)' : 'timings: estimated (~2.7 wps; regenerate in the video env for exact)')
