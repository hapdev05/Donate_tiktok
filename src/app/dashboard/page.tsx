'use client';

import React, { useState, useEffect } from 'react';
import { fetchStreamer, fetchRecentSessions, triggerTestAlert, StreamerProfile } from '@/lib/api';
import { Copy, Check, ExternalLink, Play, Sparkles, Tv, CreditCard, History, Radio } from 'lucide-react';

interface SessionItem {
  id: string;
  code: string;
  displayName: string;
  message: string | null;
  amount: number | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export default function DashboardPage() {
  const slug = 'anhphi';
  const [streamer, setStreamer] = useState<StreamerProfile | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test Alert form
  const [testName, setTestName] = useState('Fan Cứng Số 1');
  const [testAmount, setTestAmount] = useState(150000);
  const [testMessage, setTestMessage] = useState('Chúc idol live vui vẻ, leo rank xuất sắc nhé! ❤️');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    fetchStreamer(slug).then(setStreamer).catch(console.error);
    fetchRecentSessions(slug).then(setSessions).catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchRecentSessions(slug).then(setSessions).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsTesting(true);
      setTestSuccessMessage(null);
      const res = await triggerTestAlert(slug, testName, Number(testAmount), testMessage);
      setTestSuccessMessage(res.message || 'Đã bắn alert thử nghiệm thành công!');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    } catch {
      setTestSuccessMessage('Lỗi khi gửi alert thử nghiệm');
    } finally {
      setIsTesting(false);
    }
  };

  const overlayUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay/${slug}?token=${streamer?.overlayToken || 'anhphi_secret_token_123'}`
    : `http://localhost:3000/overlay/${slug}?token=anhphi_secret_token_123`;

  const donateUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/donate/${slug}`
    : `http://localhost:3000/donate/${slug}`;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Streamer Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            {streamer?.displayName || 'Anh Phi Streamer'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={donateUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Mở Trang Donate
          </a>
          <a
            href={overlayUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-pink-600/20"
          >
            <Tv className="w-3.5 h-3.5" /> Xem Trang Overlay
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái (2 cột): Link TikTok Studio & Test Alert */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Link Browser Source cho TikTok Studio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-3 text-pink-400 font-bold text-sm">
              <Radio className="w-4 h-4 text-pink-500" />
              <span>Liên Kết Nhúng Vào TikTok LIVE Studio / OBS</span>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Dán URL này vào mục <strong>Browser Source (Nguồn trình duyệt)</strong> trong TikTok LIVE Studio. Nền sẽ hoàn toàn trong suốt và chỉ xuất hiện khi có donate.
            </p>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2.5">
              <input
                type="text"
                readOnly
                value={overlayUrl}
                className="bg-transparent text-xs font-mono text-gray-300 w-full px-2 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={() => copyText(overlayUrl, 'overlay')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                {copiedKey === 'overlay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'overlay' ? 'Đã Copy' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Card 2: Bắn Alert Thử Nghiệm */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bắn Alert Thử Nghiệm (Test Alert)</span>
              </div>
              <span className="text-[11px] text-gray-400">Kiểm tra âm thanh & vị trí màn hình</span>
            </div>

            {testSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> {testSuccessMessage}
              </div>
            )}

            <form onSubmit={handleTestAlert} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Người Gửi</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số Tiền (VNĐ)</label>
                  <input
                    type="number"
                    step={10000}
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Lời Nhắn</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={isTesting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isTesting ? 'Đang gửi...' : 'KÍCH HOẠT ALERT THỬ NGHIỆM'}
              </button>
            </form>
          </div>
        </div>

        {/* Cột Phải (1 cột): Thông tin Ngân hàng & QR */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-4">
              <CreditCard className="w-4 h-4" />
              <span>Tài Khoản Nhận Tiền</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-gray-500 block mb-0.5">Ngân Hàng:</span>
                <span className="font-bold text-white text-sm">{streamer?.bank.bankId}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-gray-500 block mb-0.5">Số Tài Khoản:</span>
                <span className="font-mono font-bold text-white text-sm">{streamer?.bank.accountNumber}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-gray-500 block mb-0.5">Chủ Tài Khoản:</span>
                <span className="font-bold text-white text-sm">{streamer?.bank.accountName}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 leading-relaxed">
              🔒 <strong>Tiền về trực tiếp:</strong> Người xem chuyển khoản thẳng vào tài khoản MB này của bạn. Hệ thống tự động nhận diện qua AutoBank/SePay.
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách các phiên gần đây */}
      <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <History className="w-4 h-4 text-pink-500" />
            <span>Lịch Sử Các Phiên Donate Gần Nhất</span>
          </div>
          <span className="text-xs text-gray-400">Tự động làm mới mỗi 5 giây</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-xs">Chưa có giao dịch nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-gray-400">
                  <th className="pb-3 font-semibold">Mã Phiên</th>
                  <th className="pb-3 font-semibold">Người Gửi</th>
                  <th className="pb-3 font-semibold">Số Tiền Nhận Thực Tế</th>
                  <th className="pb-3 font-semibold">Lời Nhắn</th>
                  <th className="pb-3 font-semibold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 font-mono font-bold text-pink-400">{s.code}</td>
                    <td className="py-3 font-semibold text-white">{s.displayName}</td>
                    <td className="py-3 font-bold text-emerald-400">
                      {s.amount ? `${s.amount.toLocaleString('vi-VN')} VNĐ` : 'Chưa nhận'}
                    </td>
                    <td className="py-3 text-gray-400 max-w-xs truncate italic">
                      {s.message || '—'}
                    </td>
                    <td className="py-3">
                      {s.status === 'SUCCESS' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          THÀNH CÔNG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          CHỜ CHUYỂN
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
