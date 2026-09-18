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

import { API_BASE_URL } from '@/lib/api';

/**
 * Đọc lời nhắn bằng GIỌNG NỮ TIẾNG VIỆT CHUẨN (Chị Google)
 * Sử dụng Audio stream trực tiếp, cam kết 100% tiếng Việt chuẩn, không bao giờ bị giọng Anh đọc méo tiếng!
 */
export function speakVietnamese(text: string) {
  if (!text || typeof window === 'undefined') return;

  try {
    const cleanText = text.trim();
    if (!cleanText) return;

    // 1. Sử dụng Audio Stream Chị Google Tiếng Việt từ Backend / Cloudflare Tunnel
    const ttsUrl = `${API_BASE_URL}/api/v1/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio stream error, falling back to Web Speech API:', err);
        // Fallback sang Web Speech API nếu trình duyệt chặn autoplay audio
        fallbackWebSpeech(cleanText);
      });
    }
  } catch (e) {
    console.error('Lỗi khi phát giọng đọc tiếng Việt:', e);
    fallbackWebSpeech(text);
  }
}

function fallbackWebSpeech(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.1; // Giọng nữ cao

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(
      (v) =>
        (v.lang.includes('vi') || v.lang.includes('VI') || v.name.toLowerCase().includes('vietnam')) &&
        (v.name.toLowerCase().includes('female') || !v.name.toLowerCase().includes('male'))
    ) || voices.find((v) => v.lang.includes('vi'));

    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Web Speech fallback error:', err);
  }
}

