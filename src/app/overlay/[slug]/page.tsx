'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { WS_BASE_URL } from '@/lib/api';
import { playAlertChime, speakVietnamese, unlockAudio } from '@/lib/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Gem, Heart, Volume2 } from 'lucide-react';

interface AlertItem {
  id: string;
  displayName: string;
  amount: number;
  formattedAmount: string;
  message: string | null;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  durationMs: number;
  isTest?: boolean;
}

export default function OverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = (params?.slug as string) || 'anhphi';
  const token = searchParams.get('token') || 'demo_token';

  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const [animState, setAnimState] = useState<'IN' | 'OUT' | 'IDLE'>('IDLE');
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);

  const queueRef = useRef<AlertItem[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Đảm bảo nền body luôn trong suốt 100% khi nhúng vào TikTok LIVE Studio
  useEffect(() => {
    document.documentElement.classList.add('overlay-mode');
    document.body.classList.add('overlay-mode');

    const handleUserInteraction = () => {
      unlockAudio();
      setAudioUnlocked(true);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.documentElement.classList.remove('overlay-mode');
      document.body.classList.remove('overlay-mode');
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Xử lý Hàng đợi FIFO Queue
  const processNextAlert = () => {
    if (isPlayingRef.current || queueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    const alert = queueRef.current.shift()!;
    setCurrentAlert(alert);
    setAnimState('IN');

    // 1. Kích hoạt âm thanh chuông ding ding
    playAlertChime(0.85);

    // 2. Kích hoạt pháo hoa nếu là mốc vàng hoặc kim cương
    if (alert.tier === 'GOLD' || alert.tier === 'DIAMOND') {
      confetti({
        particleCount: alert.tier === 'DIAMOND' ? 120 : 60,
        spread: 90,
        origin: { y: 0.3 },
      });
    }

    // 3. Đọc giọng Text-To-Speech tiếng Việt
    const speechText = `${alert.displayName} vừa ủng hộ ${alert.amount.toLocaleString('vi-VN')} đồng. ${alert.message || ''}`;
    setTimeout(() => {
      speakVietnamese(speechText);
    }, 400);

    // 4. Lên lịch biến mất
    const duration = alert.durationMs || 6000;
    setTimeout(() => {
      setAnimState('OUT');
      // Chờ animation out hoàn tất (600ms)
      setTimeout(() => {
        setCurrentAlert(null);
        setAnimState('IDLE');
        isPlayingRef.current = false;
        // Kiểm tra alert tiếp theo trong queue
        processNextAlert();
      }, 600);
    }, duration);
  };

  // Kết nối WebSocket Realtime
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connectWS = () => {
      const wsUrl = `${WS_BASE_URL}/ws/overlay/${slug}?token=${encodeURIComponent(token)}`;
      console.log('[Overlay WS] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[Overlay WS] Connected successfully to room:', slug);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'DONATION_ALERT') {
            console.log('[Overlay WS] Received Alert:', data);
            queueRef.current.push({
              id: data.id,
              displayName: data.displayName,
              amount: data.amount,
              formattedAmount: data.formattedAmount,
              message: data.message,
              tier: data.tier || 'SILVER',
              durationMs: data.durationMs || 6000,
              isTest: data.isTest,
            });
            processNextAlert();
          }
        } catch (e) {
          console.error('[Overlay WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.warn('[Overlay WS] Disconnected. Reconnecting in 3s...');
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error('[Overlay WS] Error:', err);
        ws.close();
      };
    };

    connectWS();

    // Heartbeat ping mỗi 20s
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 20000);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, token]);

  // Phân màu sắc viền theo Tier
  const tierMap: Record<string, string> = {
    BRONZE: 'from-amber-600/30 to-amber-900/40 border-amber-500/40 text-amber-300',
    SILVER: 'from-slate-800/80 to-indigo-950/80 border-indigo-500/50 text-indigo-300',
    GOLD: 'from-amber-500/20 via-yellow-500/30 to-amber-700/40 border-yellow-400/80 text-yellow-300',
    DIAMOND: 'from-pink-600/30 via-purple-600/40 to-cyan-500/30 border-pink-400 text-pink-300',
  };
  const tierColors = currentAlert ? (tierMap[currentAlert.tier] || tierMap.SILVER) : '';

  return (
    <>
      {/* Nút hỗ trợ mở khóa âm thanh khi test trực tiếp trên trình duyệt Chrome/Edge */}
      {!audioUnlocked && (
        <div className="fixed top-3 right-3 z-50 pointer-events-auto">
          <button
            onClick={() => {
              unlockAudio();
              playAlertChime(0.5);
              setAudioUnlocked(true);
            }}
            className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-pink-400 border border-pink-500/50 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Click để bật âm thanh trình duyệt</span>
          </button>
        </div>
      )}

      {currentAlert && (
        <div className="fixed inset-0 flex items-start justify-center pt-8 pointer-events-none z-50">
      <div
        className={`w-[480px] max-w-[90vw] rounded-3xl p-6 shadow-2xl backdrop-blur-xl border-2 transition-all bg-gradient-to-b ${tierColors} ${
          animState === 'IN' ? 'animate-alert-in glow-neon' : 'animate-alert-out'
        }`}
      >
        {/* Banner Top */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            {currentAlert.tier === 'DIAMOND' ? (
              <Gem className="w-5 h-5 text-pink-400 animate-bounce" />
            ) : currentAlert.tier === 'GOLD' ? (
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400" />
            )}
            <span className="text-xs uppercase font-extrabold tracking-widest text-white/90">
              {currentAlert.isTest ? '🧪 TEST ALERT' : '🎉 DONATE ALERT'}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 uppercase">
            {currentAlert.tier}
          </span>
        </div>

        {/* Tên & Số tiền */}
        <div className="text-center my-2">
          <h2 className="text-2xl font-black text-white tracking-wide drop-shadow-md truncate">
            {currentAlert.displayName}
          </h2>
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent mt-1 drop-shadow">
            {currentAlert.formattedAmount}
          </div>
        </div>

        {/* Lời nhắn */}
        {currentAlert.message && (
          <div className="mt-4 p-3.5 bg-black/40 rounded-2xl border border-white/10 text-center">
            <p className="text-sm font-medium text-white/95 italic leading-relaxed">
              “{currentAlert.message}”
            </p>
          </div>
        )}

          {/* Footer icon */}
          <div className="flex justify-center items-center gap-1.5 mt-3 text-[11px] text-white/60">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            <span>Cảm ơn bạn đã tiếp lửa cho kênh!</span>
          </div>
        </div>
      </div>
    )}
  </>
);
}
