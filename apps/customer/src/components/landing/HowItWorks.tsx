"use client";
import SectionWrapper from "./SectionWrapper";

const steps = [
  { title: "Chọn nhà hàng", desc: "Tìm kiếm theo vị trí, món yêu thích", icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2"/></svg>
  ) },
  { title: "Chọn món", desc: "Tùy chọn topping, ghi chú riêng", icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 8h10"/><path d="M7 12h8"/></svg>
  ) },
  { title: "Đặt đơn", desc: "Thanh toán an toàn, nhận ưu đãi", icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M2 11h20"/></svg>
  ) },
  { title: "Theo dõi giao", desc: "Xem lộ trình giao hàng thời gian thực", icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 16h13l3-5h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  ) },
];

export default function HowItWorks() {
  return (
    <SectionWrapper>
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Cách hoạt động</h2>
        <p className="text-gray-600">Đơn giản trong 4 bước</p>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {steps.map((s) => (
          <div key={s.title} className="col-span-12 sm:col-span-6 md:col-span-3">
            <div className="group rounded-3xl p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl text-[var(--primary)]">{s.icon}</div>
              <div className="mt-3 text-lg font-semibold">{s.title}</div>
              <div className="text-sm text-gray-600">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}