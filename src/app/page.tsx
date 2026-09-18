import Link from 'next/link';
import { Heart, Tv, LayoutDashboard, QrCode, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-pink-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[250px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Giải pháp Donate Alert Cho TikTok LIVE Studio & OBS
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
          Hệ Thống Nhận Donate & <br />
          <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Bắn Alert Trực Tiếp Livestream
          </span>
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Tự động hóa 100% qua <strong>VietQR</strong> & <strong>AutoBank</strong>. Khán giả chỉ cần nhập Tên & Lời nhắn, tự do điền số tiền trong App Ngân Hàng. Alert nhảy lên màn hình sau 2 giây!
        </p>

        {/* 3 Main Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
          {/* Card 1: Trang Donate */}
          <Link
            href="/donate/anhphi"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-pink-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-pink-400 uppercase">Dành cho Khán giả</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">Trang Donate</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Chỉ nhập Tên &amp; Lời nhắn &rarr; Sinh mã VietQR mở để người xem tự chọn số tiền trong app ngân hàng.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
              Truy cập /donate/anhphi <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: Overlay Browser Source */}
          <Link
            href="/overlay/anhphi?token=anhphi_secret_token_123"
            target="_blank"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Browser Source</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">Alert Overlay</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Nền trong suốt 100%, nhúng vào TikTok LIVE Studio. Có chuông ting ting, giọng đọc TTS và hiệu ứng mượt mà.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Mở link Overlay <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Streamer Dashboard */}
          <Link
            href="/dashboard"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">Dành cho Streamer</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">Dashboard Quản Lý</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Lấy link Browser Source, bắn Alert thử nghiệm để test màn hình, xem lịch sử giao dịch ngân hàng theo thời gian thực.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              Vào Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>

        {/* Feature Highlights Footer */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 border-t border-slate-800/80 pt-8">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tiền vào thẳng tài khoản ngân hàng Streamer
          </span>
          <span className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-sky-400" /> VietQR Chuẩn Napas 24/7
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-400" /> Tốc độ phản hồi &lt; 3 giây
          </span>
        </div>
      </div>
    </main>
  );
}
