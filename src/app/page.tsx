'use client';

import React, { useState, useEffect } from 'react';
import { fetchStreamer, createDonateSession, checkSessionStatus, StreamerProfile, DonateSessionData } from '@/lib/api';
import { Heart, Sparkles, Copy, Check, QrCode, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAlertChime } from '@/lib/sound';

export default function HomePage() {
  const slug = 'anhphi';

  const [streamer, setStreamer] = useState<StreamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states (Chỉ 2 trường!)
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');

  // Active Session
  const [session, setSession] = useState<DonateSessionData | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load Streamer Profile
  useEffect(() => {
    fetchStreamer(slug)
      .then((data) => {
        setStreamer(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải thông tin streamer');
        setLoading(false);
      });
  }, [slug]);

  // Polling session status while pending
  useEffect(() => {
    if (!session || isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await checkSessionStatus(session.sessionCode);
        if (res.status === 'SUCCESS') {
          setIsSuccess(true);
          setPaidAmount(res.actualAmount || 0);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          playAlertChime();
        }
      } catch {
        // ignore polling network errors
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [session, isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const newSession = await createDonateSession(slug, displayName.trim(), message.trim());
      setSession(newSession);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Đang tải trang donate...</p>
        </div>
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-md w-full">
          <p className="text-red-400 font-semibold mb-2">Không tìm thấy Streamer</p>
          <p className="text-gray-400 text-sm">{error || 'Vui lòng kiểm tra lại đường dẫn.'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative">
      <div className="max-w-md w-full">
        {/* Streamer Header Card */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl mb-5 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative inline-block mb-3">
            {streamer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={streamer.avatarUrl}
                alt={streamer.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-pink-500 p-0.5 shadow-lg mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto">
                {streamer.displayName[0]}
              </div>
            )}
            <span className="absolute bottom-0 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-xl font-bold text-white">{streamer.displayName}</h1>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xs text-gray-400 max-w-xs mx-auto line-clamp-2">{streamer.bio}</p>
        </div>

        {/* Dynamic Payment State: SUCCESS vs QR CODE vs INPUT FORM */}
        {isSuccess ? (
          /* Màn hình Chuyển khoản thành công */
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Ủng Hộ Thành Công!</h2>
            <p className="text-emerald-400 font-semibold text-lg mb-3">
              +{paidAmount ? `${paidAmount.toLocaleString('vi-VN')} VNĐ` : 'Đã nhận'}
            </p>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-5 text-left text-sm space-y-2">
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Người gửi:</span>
                <span className="font-semibold text-white">{session?.displayName}</span>
              </div>
              {session?.message && (
                <div className="flex justify-between text-gray-300 gap-2">
                  <span className="text-gray-400 shrink-0">Lời nhắn:</span>
                  <span className="italic text-right text-pink-300">“{session.message}”</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Thông báo đang được phát trực tiếp trên TikTok LIVE Studio!
            </p>
            <button
              onClick={() => {
                setSession(null);
                setIsSuccess(false);
                setDisplayName('');
                setMessage('');
              }}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
            >
              Ủng hộ thêm lượt khác
            </button>
          </div>
        ) : session ? (
          /* Màn hình Hiển thị VietQR mở */
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setSession(null)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sửa thông tin
            </button>

            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-2">
                <QrCode className="w-3.5 h-3.5" /> Quét mã để tự nhập số tiền
              </span>
              <h2 className="text-lg font-bold text-white">Quét VietQR Chuyển Khoản</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Mở app ngân hàng quét mã, <span className="text-pink-400 font-semibold">tự điền số tiền bạn muốn tặng</span>
              </p>
            </div>

            {/* QR Image Box */}
            <div className="bg-white p-3 rounded-2xl shadow-inner max-w-[260px] mx-auto mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.qrCodeUrl}
                alt="VietQR Chuyển khoản"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Banking Details with Copy buttons */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ngân hàng:</span>
                <span className="font-semibold text-white uppercase">{session.bankCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Số tài khoản:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(session.accountNumber, 'acc')}
                  className="flex items-center gap-1 font-mono font-bold text-white hover:text-pink-400 transition"
                >
                  {session.accountNumber}
                  {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tên chủ thẻ:</span>
                <span className="font-medium text-white">{session.accountName}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2 bg-pink-950/20 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl">
                <span className="text-gray-300 font-medium">Nội dung (Bắt buộc):</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(session.transferContent, 'content')}
                  className="flex items-center gap-1 font-mono font-bold text-pink-400 hover:text-pink-300 transition"
                >
                  {session.transferContent}
                  {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Waiting status indicator */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              Đang chờ xác nhận từ ngân hàng... (Tự động cập nhật)
            </div>
          </div>
        ) : (
          /* Màn hình Nhập Form: CHỈ 2 TRƯỜNG */
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-5 text-white">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <h2 className="text-lg font-bold">Gửi Lời Nhắn &amp; Ủng Hộ</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Input 1: Tên hiển thị */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tên hiển thị của bạn <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="VD: Anh Tuấn, Fan Cứng..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
              />
            </div>

            {/* Input 2: Lời nhắn */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Lời nhắn gửi idol <span className="text-gray-500 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Chúc idol live vui vẻ, leo rank thành công nhé! ❤️"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition resize-none"
              />
              <div className="text-right text-[10px] text-gray-500 mt-1">{message.length}/250</div>
            </div>

            {/* Hướng dẫn không cần nhập tiền */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 mb-5 leading-relaxed">
              💡 <strong>Không cần nhập số tiền:</strong> Bạn chỉ cần bấm Tiếp Tục, hệ thống sẽ tạo mã QR. Bạn tự do điền số tiền bất kỳ trong ứng dụng ngân hàng khi quét mã!
            </div>

            {/* Nút Tiếp Tục */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo mã QR...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  TIẾP TỤC
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-[11px] text-gray-500 mt-6">
          Hệ thống xác thực chuyển khoản tự động qua VietQR &amp; AutoBank
        </p>
      </div>
    </main>
  );
}
