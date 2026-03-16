export interface Options {
  rate?: number // 0~1
  volume?: number // 0~1
  pitch?: number // 0~2
  lang?: string // en-US
}
let instance: SpeechSynthesisUtterance | null = null

function getInstance(options: Options = {}) {
  if (!instance) {
    instance = new SpeechSynthesisUtterance()
  }
  const { rate = 0.7, volume = 1, pitch = 1, lang = 'en-GB' } = options
  instance.rate = rate
  instance.volume = volume
  instance.pitch = pitch
  instance.lang = lang
  return instance
}

function useAudio(options: Options = {}) {
  const pronounce = getInstance(options)
  const playAudio = (word: string) => {
    pronounce.text = word
    window.speechSynthesis.speak(pronounce)
  }
  return { playAudio }
}

export default useAudio
