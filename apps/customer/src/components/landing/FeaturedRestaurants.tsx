"use client";
import SectionWrapper from "./SectionWrapper";

const cards = [
  {
    title: "Green Garden",
    desc: "Salad, healthy bowl, nước ép",
    accent: "from-emerald-400 to-lime-400",
  },
  {
    title: "Pizza Viva",
    desc: "Pizza nướng củi, pasta thủ công",
    accent: "from-orange-400 to-yellow-400",
  },
  {
    title: "Sushi Neo",
    desc: "Sushi cuộn, sashimi tươi",
    accent: "from-teal-400 to-cyan-400",
  },
];

export default function FeaturedRestaurants() {
  return (
    <SectionWrapper>
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Nhà hàng nổi bật</h2>
        <p className="text-gray-600">Được yêu thích bởi người dùng</p>
      </div>
      <div className="grid grid-cols-12 gap-6">
        {cards.map((c) => (
          <div key={c.title} className="col-span-12 md:col-span-4">
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl group">
              <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-70`}></div>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop')" }}></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-2xl font-bold">{c.title}</div>
                <div className="text-sm opacity-90">{c.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}