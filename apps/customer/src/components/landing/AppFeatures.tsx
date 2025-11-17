"use client";
import SectionWrapper from "./SectionWrapper";

const features = [
  { title: "Khuyến mãi hấp dẫn", desc: "Mã giảm giá, freeship theo khu vực", color: "bg-emerald-50 border-emerald-200" },
  { title: "Thanh toán an toàn", desc: "Thẻ, ví điện tử, tiền mặt linh hoạt", color: "bg-lime-50 border-lime-200" },
  { title: "Theo dõi thời gian thực", desc: "Biết chính xác khi nào món tới", color: "bg-teal-50 border-teal-200" },
  { title: "Hỗ trợ 24/7", desc: "Đội ngũ sẵn sàng trợ giúp", color: "bg-orange-50 border-orange-200" },
];

export default function AppFeatures() {
  return (
    <SectionWrapper>
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Tính năng nổi bật</h2>
        <p className="text-gray-600">Trải nghiệm trọn vẹn với Eatzy</p>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {features.map((f) => (
          <div key={f.title} className="col-span-12 sm:col-span-6 md:col-span-3">
            <div className={`rounded-3xl p-6 border shadow-sm ${f.color}`}>
              <div className="text-lg font-semibold">{f.title}</div>
              <div className="text-sm text-gray-600">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}