/*
 * Generates narration segments for the credit union line-of-credit comparison video.
 * Writes /tmp/vid/loc{i}.wav at 24kHz. Run before make-video-loc.mjs.
 */
import sherpa from 'sherpa-onnx-node'

const SEGMENTS = [
  "What if you needed fifty dollars before payday? Here's what a credit union line of credit actually costs.",
  "Borrow fifty dollars at thirteen percent APR. That's the federal credit union cap — set by law, not a marketing claim.",
  "You use it Monday. You pay it back the following weekend — six days later. The interest? Eleven cents.",
  "Do that every other week for a year — twenty-six times. Fifty dollars each time. You pay it back every payday weekend.",
  "Total interest for the year: about two dollars and seventy-five cents. That's it. No fees. No tips. No membership.",
  "Compare that to a cash advance app: two hundred to four hundred dollars a year — for the exact same fifty dollars, the exact same cycle.",
  "A credit union line of credit is yours to use, yours to repay, and costs next to nothing. It's your money. Keep it.",
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
