'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from '@repo/ui/motion';
import { OrderReportItemDTO, ReportOrderStatus } from '@repo/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ChefHat,
  Package,
  ArrowUpRight,
  Search,
  CreditCard,
  Banknote,
  Hash,
  Globe,
  Users,
} from 'lucide-react';

interface OrdersReportProps {
  data: OrderReportItemDTO[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const COLORS = ['#84cc16', '#1A1A1A'];

const statusConfig: Record<ReportOrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle },
  PREPARING: { label: 'Đang nấu', color: 'text-purple-600', bg: 'bg-purple-50', icon: ChefHat },
  READY: { label: 'Sẵn sàng', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: Package },
  DELIVERING: { label: 'Đang giao', color: 'text-orange-600', bg: 'bg-orange-50', icon: Truck },
  DELIVERED: { label: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const OrderCard = ({ order }: { order: OrderReportItemDTO }) => {
  const config = statusConfig[order.status as ReportOrderStatus] || statusConfig['PENDING'];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        grid grid-cols-12 gap-4 items-center p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all group
        max-md:bg-gray-200/40 max-md:rounded-[24px] max-md:border-none max-md:p-4 max-md:gap-3
      `}
    >
      {/* Col 1: Order Info */}
      <div className="col-span-7 sm:col-span-4 flex items-center gap-4 max-md:gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg} max-md:w-10 max-md:h-10 max-md:rounded-xl`}>
          <Icon className={`w-5 h-5 ${config.color} max-md:w-4.5 max-md:h-4.5`} />
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-[#1A1A1A] truncate text-sm leading-tight tracking-tight" title={order.customerName}>
            {order.customerName}
          </h5>
          <div className="text-xs text-gray-400 font-medium tracking-tight mt-0.5 truncate">
            {new Date(order.orderTime).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Col 2: Order Code */}
      <div className="col-span-3 hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <Hash className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã đơn</span>
          <span className="text-xs font-mono font-bold text-gray-600">{order.orderCode}</span>
        </div>
      </div>

      {/* Col 3: Items */}
      <div className="col-span-3 hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Món</span>
          <span className="text-xs font-bold text-gray-700">{order.itemsCount} món</span>
        </div>
      </div>

      {/* Col 4: Amount & Status */}
      <div className="col-span-5 sm:col-span-5 md:col-span-2 flex flex-col items-end justify-center">
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm font-bold text-lime-600 tracking-tight">
            {formatCurrency(order.totalAmount).replace(/[₫đVND]/g, '').trim()}
          </span>
          <span className="text-[10px] font-bold text-lime-600">đ</span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg mt-1 ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>
    </motion.div>
  );
};

export default function OrdersReport({ data = [] }: OrdersReportProps) {
  const safeData = Array.isArray(data) ? data : [];
  const [statusFilter, setStatusFilter] = useState<ReportOrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    const total = safeData.length;
    const delivered = safeData.filter(o => o.status === 'DELIVERED').length;
    const cancelled = safeData.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = safeData.reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, delivered, cancelled, totalRevenue };
  }, [safeData]);

  // Source data for pie
  const sourceData = [
    { name: 'App', value: Math.floor(stats.total * 0.7) },
    { name: 'Walk-in', value: Math.floor(stats.total * 0.3) }
  ];

  // Hourly distribution
  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8);
    return hours.map(hour => {
      const count = safeData.filter(o => new Date(o.orderTime).getHours() === hour).length;
      return { hour: `${hour}:00`, count };
    });
  }, [safeData]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return safeData.filter(order => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesSearch = searchQuery === '' ||
        order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [safeData, statusFilter, searchQuery]);

  if (!safeData.length) {
    return (
      <div className="text-center py-10 text-gray-400">Không có đơn hàng trong khoảng thời gian này.</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`
          relative overflow-hidden text-white flex flex-col justify-between
          md:p-6 md:rounded-2xl md:bg-[#1A1A1A] md:shadow-lg md:h-[140px]
          max-md:bg-[#1A1A1A] max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:shadow-none
        `}>
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-400 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Tổng Đơn Hàng
          </span>
          <div className="flex flex-col justify-end max-md:space-y-1">
            <span className="
              font-anton text-lime-400 block
              md:text-4xl
              max-md:text-2xl max-md:font-black max-md:tracking-tighter
            ">
              {stats.total}
            </span>
            <p className="
              text-xs text-gray-400 mt-1 flex items-center gap-1
              max-md:mt-0 max-md:text-xs max-md:text-gray-400 max-md:font-medium max-md:tracking-tight
            ">
              <ArrowUpRight className="w-3 h-3 text-lime-500" /> +5 tuần này
            </p>
          </div>
        </div>

        <div className={`
          flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-gray-200 md:shadow-sm md:bg-white md:h-[140px]
          max-md:bg-gray-200/60 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border-none max-md:shadow-none
        `}>
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-500 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Hoàn Thành
          </span>
          <div className="flex flex-col justify-end max-md:space-y-1">
            <span className="
              font-anton text-blue-600 block
              md:text-4xl
              max-md:text-2xl max-md:font-black max-md:text-[#1A1A1A] max-md:tracking-tighter
            ">
              {stats.delivered}
            </span>
            <p className="
              text-xs text-gray-400 mt-1
              max-md:mt-0 max-md:text-xs max-md:text-gray-400 max-md:font-medium max-md:tracking-tight
            ">
              Đơn đã giao
            </p>
          </div>
        </div>

        <div className={`
          flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-gray-200 md:shadow-sm md:bg-white md:h-[140px]
          max-md:bg-gray-200/60 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border-none max-md:shadow-none
        `}>
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-500 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Đã Hủy
          </span>
          <div className="flex flex-col justify-end max-md:space-y-1">
            <span className="
              font-anton text-red-500 block
              md:text-4xl
              max-md:text-2xl max-md:font-black max-md:text-[#1A1A1A] max-md:tracking-tighter
            ">
              {stats.cancelled}
            </span>
            <p className="
              text-xs text-gray-400 mt-1
              max-md:mt-0 max-md:text-xs max-md:text-gray-400 max-md:font-medium max-md:tracking-tight
            ">
              {((stats.cancelled / stats.total) * 100).toFixed(1)}% tỷ lệ
            </p>
          </div>
        </div>

        <div className={`
          flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-lime-200 md:bg-lime-50 md:h-[140px]
          max-md:bg-lime-500/10 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border max-md:border-lime-500/20 max-md:shadow-none
        `}>
          <span className="
            text-xs font-bold text-lime-800 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-lime-700 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Doanh Thu
          </span>
          <div className="flex flex-col justify-end max-md:space-y-1">
            <div className="flex items-baseline gap-0.5">
              <span className="
                font-anton text-lime-700 block
                md:text-2xl
                max-md:text-2xl max-md:font-black max-md:text-lime-600 max-md:tracking-tighter
              ">
                {formatCurrency(stats.totalRevenue).replace(/[₫đVND]/g, '').trim()}
              </span>
              <span className="
                text-xs font-bold text-lime-700
                max-md:text-xs max-md:font-bold max-md:text-lime-600
              ">
                đ
              </span>
            </div>
            <p className="
              text-xs text-lime-655 mt-1 font-medium
              max-md:mt-0 max-md:text-xs max-md:text-lime-700/60 max-md:font-semibold max-md:tracking-tight
            ">
              Tổng thu
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Sources (Pie) */}
        <div className="
          bg-white shadow-sm h-[350px] flex flex-col
          md:p-6 md:rounded-[32px] md:border md:border-gray-200
          max-md:rounded-[32px] max-md:p-5 max-md:shadow-[0_4px_25px_rgba(0,0,0,0.03)] max-md:border max-md:border-gray-100/50
        ">
          <h4 className="
            text-lg font-bold text-gray-900 mb-2
            max-md:text-[16px] max-md:font-bold max-md:text-gray-500 max-md:tracking-tight
          ">
            Nguồn Đơn Hàng
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#84cc16]" />
              <span className="text-sm font-bold text-gray-655">App ({((sourceData[0].value / stats.total) * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1A1A1A]" />
              <span className="text-sm font-bold text-gray-655">Walk-in ({((sourceData[1].value / stats.total) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Hourly Distribution (Bar) */}
        <div className="
          bg-white shadow-sm h-[350px] flex flex-col
          md:p-6 md:rounded-[32px] md:border md:border-gray-200
          max-md:rounded-[32px] max-md:p-5 max-md:shadow-[0_4px_25px_rgba(0,0,0,0.03)] max-md:border max-md:border-gray-100/50
        ">
          <h4 className="
            text-lg font-bold text-gray-900 mb-2
            max-md:text-[16px] max-md:font-bold max-md:text-gray-500 max-md:tracking-tight
          ">
            Phân Bố Theo Giờ
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#1A1A1A" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Giờ cao điểm: 11:00 - 13:00</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="
        bg-white shadow-sm flex flex-col
        md:p-8 md:rounded-[32px] md:border md:border-gray-200
        max-md:rounded-[32px] max-md:p-5 max-md:shadow-[0_4px_25px_rgba(0,0,0,0.03)] max-md:border max-md:border-gray-100/50
      ">
        <div className="
          flex items-center justify-between mb-6
          max-md:flex-col max-md:items-start max-md:gap-4
        ">
          <div>
            <h4 className="
              text-xl font-bold text-gray-900 font-anton
              max-md:text-lg max-md:font-bold max-md:text-[#1A1A1A] max-md:tracking-tight
            ">
              Tất Cả Đơn Hàng
            </h4>
            <p className="
              text-sm text-gray-400 font-medium
              max-md:text-xs max-md:text-gray-400 max-md:font-medium max-md:tracking-tight max-md:mt-0.5
            ">
              Lịch sử đơn hàng chi tiết trong khoảng thời gian đã chọn.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-md:w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-100 w-[200px] max-md:w-full"
            />
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-100 mb-2 max-md:hidden">
          <div className="col-span-7 sm:col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Chi Tiết Khách</div>
          <div className="col-span-3 hidden md:block text-xs font-bold text-gray-400 uppercase tracking-wider">Mã Đơn</div>
          <div className="col-span-3 hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-wider">Số Món</div>
          <div className="col-span-5 sm:col-span-5 md:col-span-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng Thái & Tiền</div>
        </div>

        <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
