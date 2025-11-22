import { motion } from '@repo/ui/motion';
import type { Restaurant, Dish, MenuCategory } from '@repo/types';
import Image from 'next/image';

export default function MagazineLayout9({ restaurant, dishes, menuCategories }: { restaurant: Restaurant; dishes: Dish[]; menuCategories: MenuCategory[]; }) {
  const lead = dishes[0];
  const others = dishes.slice(1, 4);
  const catMap = Object.fromEntries((menuCategories || []).map((c) => [c.id, c.name]));
  
  return (
    <motion.section 
      className="relative mb-16 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height: '700px' }}
    >
      <div className="absolute inset-0" style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }}>
        <Image
          src={lead?.imageUrl || ''}
          alt={lead?.name || ''}
          fill
          className="object-cover"
        />
      </div>

      <div 
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '140px', backgroundColor: '#B4BE3F', clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)' }}
      />

      <div 
        className="absolute top-8 bottom-8 left-[140px] bg-white shadow-xl p-8"
        style={{ width: '42%', clipPath: 'polygon(0 0, 100% 0, 86% 100%, 0 100%)', borderRadius: '12px' }}
      >
        <h2 className="text-[22px] font-bold text-[#222] leading-tight">{restaurant.name}</h2>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-[#555]">
          {restaurant.address && <span>{restaurant.address}</span>}
          {typeof restaurant.rating === 'number' && (
            <span className="text-amber-600 font-semibold">{restaurant.rating.toFixed(1)}★</span>
          )}
        </div>
        {restaurant.description && (
          <p className="mt-3 text-[13px] text-[#4A4A4A] leading-relaxed">{restaurant.description}</p>
        )}
        <div className="mt-6 space-y-4">
          {others.map((d) => (
            <div key={d.id} className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#222]">{d.name}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed line-clamp-2">{d.description}</p>
                <div className="text-[12px] text-[#888] mt-1">{catMap[d.menuCategoryId]}</div>
              </div>
              <div className="text-amber-600 font-bold">{(d.price / 1000).toFixed(0)}K</div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}