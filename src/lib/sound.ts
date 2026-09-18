/**
 * Web Audio API synthesizer để tạo âm thanh chime tinh tế, tươi vui
 * Hoàn toàn chạy bằng code, không sợ 404 lỗi file âm thanh!
 */
export function playAlertChime(volume = 0.8) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Chuỗi nốt vui nhộn (C5 -> E5 -> G5 -> C6) tạo cảm giác tiền về may mắn
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);

      // Volume envelope
      gain.gain.setValueAtTime(0.001, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + index * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.85);
    });
  } catch (e) {
    console.error('Không thể phát âm thanh Alert:', e);
  }
}

/**
 * Đọc lời nhắn Text-To-Speech tiếng Việt mượt mà
 */
export function speakVietnamese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Dừng câu cũ nếu có
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Tìm giọng tiếng Việt nếu có trong OS
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Lỗi TTS:', e);
  }
}
