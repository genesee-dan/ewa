/*
 * Generates narration segments for the credit union line-of-credit comparison video.
 * Writes /tmp/vid/loc{i}.wav at 24kHz. Run before make-video-loc.mjs.
 */
import sherpa from 'sherpa-onnx-node'

const SEGMENTS = [
  "What if you needed five hundred dollars before payday — every week? Here's what a credit union line of credit actually costs.",
  "Borrow five hundred dollars at thirteen percent ay pee ar. Federal credit unions are capped at eighteen percent by law. Genesee charges thirteen.",
  "You draw it Monday. It lands directly in your account — just like a transfer. You pay it back Friday when you get paid.",
  "Unlike a credit card, there's no plastic, no merchant, no point-of-sale. You move the money yourself, when you need it, straight to your checking account.",
  "Do that every week for a year — fifty-two draws of five hundred dollars. Total interest for the year: about sixty-five dollars. No fees. No tips. No membership.",
  "Compare that to a cash advance app: two hundred to four hundred dollars a year — for the same five hundred dollars, the same weekly cycle.",
  "A credit union line of credit is yours to use, yours to repay on payday, and costs next to nothing. It's your money. Keep it.",
  "Membership required. Subject to credit approval. Thirteen percent ay pee ar. Rates and terms subject to change. Federally insured by N C U A.",
]

const tts = new sherpa.OfflineTts({
  model: {
    kokoro: {
      model: '/tmp/vid/kokoro-en-v0_19/model.onnx',
      voices: '/tmp/vid/kokoro-en-v0_19/voices.bin',
      tokens: '/tmp/vid/kokoro-en-v0_19/tokens.txt',
      dataDir: '/tmp/vid/kokoro-en-v0_19/espeak-ng-data',
    },
    numThreads: 4,
  },
  maxNumSentences: 1,
})

for (let i = 0; i < SEGMENTS.length; i++) {
  const audio = tts.generate({ text: SEGMENTS[i], sid: 0, speed: 1.0 })
  sherpa.writeWave(`/tmp/vid/loc${i}.wav`, { samples: audio.samples, sampleRate: audio.sampleRate })
  console.log(`loc${i}: ${(audio.samples.length / audio.sampleRate).toFixed(1)}s @ ${audio.sampleRate}Hz`)
}
