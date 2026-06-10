/*
 * Generates narration segments with the Kokoro neural TTS (offline).
 * Writes /tmp/vid/seg{i}.wav at 24kHz. Run before make-video.mjs.
 */
import sherpa from 'sherpa-onnx-node'

const SEGMENTS = [
  "Meet the cash advance app. It says: it's your pay — get it now.",
  'No interest! Just a small fee. And a tip. And a monthly membership.',
  'On a fifty dollar advance, those few dollars work out to triple digit APR — often higher than a payday loan.',
  "And it's built to keep you coming back. Streaks. Countdowns. Alerts. Repaying on payday leaves your check short — so you borrow again. That's the loop.",
  'Over a year, frequent users pay hundreds of dollars — just to get their own paycheck a few days early.',
  "There's a better way. A local credit union is owned by its members, not investors. Real people. Fair, regulated loans capped at twenty-eight percent. And savings that actually build.",
  'Skip the apps. Keep your pay. Join your local credit union.',
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

// speaker 0..10; af_sarah-ish warm female voices are in the low ids
for (let i = 0; i < SEGMENTS.length; i++) {
  const audio = tts.generate({ text: SEGMENTS[i], sid: 0, speed: 1.0 })
  sherpa.writeWave(`/tmp/vid/seg${i}.wav`, { samples: audio.samples, sampleRate: audio.sampleRate })
  console.log(`seg${i}: ${(audio.samples.length / audio.sampleRate).toFixed(1)}s @ ${audio.sampleRate}Hz`)
}
