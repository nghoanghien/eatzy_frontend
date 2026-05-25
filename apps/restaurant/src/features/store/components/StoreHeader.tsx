import { motion } from "@repo/ui/motion";
import { ImageWithFallback, StatusBadge } from "@repo/ui";
import { MapPin, Star, Phone, Camera } from "@repo/ui/icons";

interface StoreHeaderProps {
  store: { imageUrl?: string; name: string; status: string; rating: number; reviewCount: number; address: string; phone: string;[key: string]: unknown };
  isMobile?: boolean;
}

export default function StoreHeader({ store, isMobile }: StoreHeaderProps) {
  if (isMobile) {
    return (
      <div className="px-4 pt-4 shrink-0">
        <div className="relative h-[200px] w-full group rounded-[36px] overflow-hidden shadow-sm">
          <div className="absolute inset-0">
            <ImageWithFallback
              src={store.imageUrl || ''}
              alt={store.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-start bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${store.status === 'OPEN' ? 'bg-lime-400 text-[#1A1A1A]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {store.status === 'OPEN' ? 'Đang mở cửa' : 'Đã đóng cửa'}
              </span>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span>{store.rating} ({store.reviewCount} đánh giá)</span>
              </div>
            </div>
            <h1 className="text-xl font-anton font-bold tracking-wide drop-shadow-md text-white truncate w-full">{store.name}</h1>
            <div className="flex flex-col gap-1 text-[11px] font-medium text-white/90 w-full">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-[var(--primary)] shrink-0" />
                <span className="truncate">{store.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[var(--primary)] shrink-0" />
                <span>{store.phone}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert("Mock feature: Change Cover Image")}
            className="absolute top-4 right-5 bg-white/20 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 hover:bg-white/30 transition-colors border border-white/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Thay đổi ảnh bìa</span>
          </motion.button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-[220px] sm:h-[300px] w-full shrink-0 group rounded-b-[40px] overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={store.imageUrl || ''}
          alt={store.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-4 sm:pb-24 flex flex-col sm:flex-row items-start sm:items-end justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-16 sm:pt-32 gap-4">
        <div className="text-white space-y-2 sm:space-y-3 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <StatusBadge status={store.status} />
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{store.rating} ({store.reviewCount} đánh giá)</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-5xl font-anton font-bold tracking-wide drop-shadow-md truncate">{store.name}</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium text-white/90">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span>{store.phone}</span>
            </div>
          </div>
        </div>

        {/* Change Cover Button - Absolute on mobile, static on desktop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert("Mock feature: Change Cover Image")}
          className="absolute top-4 right-4 sm:static bg-white/20 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs flex items-center gap-2 hover:bg-white/30 transition-colors border border-white/30"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Thay đổi ảnh bìa</span>
        </motion.button>
      </div>
    </div>
  );
}
