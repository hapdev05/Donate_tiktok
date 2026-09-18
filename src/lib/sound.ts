import { API_BASE_URL } from '@/lib/api';

/**
 * Web Audio API synthesizer để tạo âm thanh chime tinh tế, tươi vui
 */
export function playAlertChime(volume = 0.8) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
 * ĐỌC DUY NHẤT 100% GIỌNG NỮ TIẾNG VIỆT (CHỊ GOOGLE)
 * Xóa bỏ hoàn toàn giọng đọc nam và Web Speech API của hệ điều hành.
 */
let currentAudio: HTMLAudioElement | null = null;

export function speakVietnamese(text: string) {
  if (!text || typeof window === 'undefined') return;

  try {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Dừng âm thanh trước nếu đang đọc
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    // Luôn luôn dùng trực tiếp Giọng Nữ Chị Google (Audio Stream chuẩn tiếng Việt 100%)
    const ttsUrl = `${API_BASE_URL}/api/v1/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    currentAudio = audio;

    audio.play().catch((err) => {
      console.warn('Không thể tự động phát giọng đọc (có thể do trình duyệt yêu cầu click chuột trước):', err);
    });
  } catch (e) {
    console.error('Lỗi khi phát giọng đọc tiếng Việt:', e);
  }
}
