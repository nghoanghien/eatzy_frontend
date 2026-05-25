'use client';

import { useMemo } from 'react';
import { motion } from '@repo/ui/motion';
import { RevenueReportItemDTO } from '@repo/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, DollarSign, Wallet, Percent, ArrowDown } from 'lucide-react';

interface RevenueReportProps {
  data: RevenueReportItemDTO[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatCompact = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-sm font-bold text-gray-500 mb-2">{new Date(label).toLocaleDateString('vi-VN')}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 font-medium">{entry.name}:</span>
            <span className="font-bold text-gray-900">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueReport({ data = [] }: RevenueReportProps) {
  const safeData = Array.isArray(data) ? data : [];

  const totals = useMemo(() => ({
    foodRevenue: safeData.reduce((acc, curr) => acc + curr.foodRevenue, 0),
    deliveryFee: safeData.reduce((acc, curr) => acc + curr.deliveryFee, 0),
    discountAmount: safeData.reduce((acc, curr) => acc + curr.discountAmount, 0),
    commissionAmount: safeData.reduce((acc, curr) => acc + curr.commissionAmount, 0),
    netRevenue: safeData.reduce((acc, curr) => acc + curr.netRevenue, 0),
    totalOrders: safeData.reduce((acc, curr) => acc + curr.totalOrders, 0),
  }), [safeData]);

  const formattedData = useMemo(() => safeData.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  })), [safeData]);

  if (!safeData.length) {
    return (
      <div className="p-8 text-center text-gray-400 font-medium bg-gray-50 rounded-[32px] border border-gray-100 border-dashed">
        Không có dữ liệu doanh thu trong khoảng thời gian này.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="
          relative overflow-hidden group flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:bg-white
          max-md:bg-gray-200/60 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border-none max-md:shadow-none
        ">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity max-md:hidden">
            <DollarSign className="w-16 h-16 text-lime-500" />
          </div>
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-500 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Tổng Doanh Thu
          </span>
          <div className="flex items-baseline md:items-end gap-2 mt-2 max-md:mt-0 flex-wrap">
            <div className="flex items-baseline gap-0.5">
              <span className="
                font-anton text-gray-900 block
                md:text-3xl
                max-md:text-2xl max-md:font-black max-md:text-[#1A1A1A] max-md:tracking-tighter
              ">
                {formatCurrency(totals.foodRevenue).replace(/[₫đVND]/g, '').trim()}
              </span>
              <span className="
                hidden max-md:inline text-xs font-bold text-[#1A1A1A]
              ">
                đ
              </span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1 flex items-center shrink-0">
              <ArrowUp className="w-3 h-3 mr-0.5" /> +12.5%
            </span>
          </div>
        </div>

        <div className="
          flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:bg-white
          max-md:bg-gray-200/60 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border-none max-md:shadow-none
        ">
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-500 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Platform Commission
          </span>
          <div className="flex items-baseline gap-0.5 mt-2 max-md:mt-0">
            <span className="
              text-gray-900 block font-anton
              md:text-2xl md:font-bold
              max-md:text-2xl max-md:font-black max-md:text-[#1A1A1A] max-md:tracking-tighter
            ">
              {formatCurrency(totals.commissionAmount).replace(/[₫đVND]/g, '').trim()}
            </span>
            <span className="
              hidden max-md:inline text-xs font-bold text-[#1A1A1A]
            ">
              đ
            </span>
          </div>
        </div>

        <div className="
          flex flex-col justify-between
          md:p-6 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:bg-white
          max-md:bg-gray-200/60 max-md:rounded-[32px] max-md:p-5 max-md:h-auto max-md:space-y-1.5 max-md:border-none max-md:shadow-none
        ">
          <span className="
            text-xs font-bold text-gray-400 uppercase tracking-wider block
            max-md:text-[10px] max-md:font-bold max-md:text-gray-500 max-md:uppercase max-md:tracking-widest max-md:mb-0.5
          ">
            Giảm Giá
          </span>
          <div className="flex items-baseline gap-0.5 mt-2 max-md:mt-0">
            <span className="
              text-gray-900 block font-anton
              md:text-2xl md:font-bold
              max-md:text-2xl max-md:font-black max-md:text-[#1A1A1A] max-md:tracking-tighter
            ">
              {formatCurrency(totals.discountAmount).replace(/[₫đVND]/g, '').trim()}
            </span>
            <span className="
              hidden max-md:inline text-xs font-bold text-[#1A1A1A]
            ">
              đ
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="
        bg-white shadow-sm h-[280px] sm:h-[400px]
        md:p-6 md:rounded-[32px] md:border md:border-gray-100
        max-md:rounded-[32px] max-md:p-5 max-md:shadow-[0_4px_25px_rgba(0,0,0,0.03)] max-md:border max-md:border-gray-100/50
      ">
        <h4 className="
          text-lg font-bold text-gray-900 mb-6
          max-md:text-[16px] max-md:font-bold max-md:text-gray-500 max-md:tracking-tight
        ">
          Xu Hướng Doanh Thu
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val: number) => `${formatCompact(val)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="netRevenue" name="Thực nhận" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            <Area type="monotone" dataKey="foodRevenue" name="Doanh thu món" stroke="#1A1A1A" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="
        bg-white shadow-sm overflow-hidden
        md:rounded-[32px] md:border md:border-gray-100
        max-md:rounded-[32px] max-md:shadow-[0_4px_25px_rgba(0,0,0,0.03)] max-md:border max-md:border-gray-100/50 max-md:p-5
      ">
        <div className="
          md:p-6 md:border-b md:border-gray-50
          max-md:pb-4 max-md:border-b max-md:border-gray-100 max-md:mb-4
        ">
          <h4 className="
            text-lg font-bold text-gray-900
            max-md:text-[16px] max-md:font-bold max-md:text-gray-500 max-md:tracking-tight
          ">
            Chi Tiết Theo Ngày
          </h4>
        </div>
        {/* Desktop Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-505 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-505 uppercase tracking-wider">Doanh Thu Món</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-505 uppercase tracking-wider">Hoa Hồng</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-505 uppercase tracking-wider">Giảm Giá</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Thực Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {safeData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.foodRevenue)}</td>
                  <td className="px-6 py-4 text-sm text-gray-450 text-right">{formatCurrency(item.commissionAmount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-455 text-right">{formatCurrency(item.discountAmount)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-lime-600 text-right">{formatCurrency(item.netRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card list view */}
        <div className="block md:hidden space-y-4">
          {safeData.map((item, i) => (
            <div key={i} className="bg-gray-200/60 rounded-[32px] p-5 space-y-2 border-none shadow-none text-left">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-400 font-medium tracking-tight">Ngày:</span>
                <span className="text-[#1A1A1A] font-bold tracking-tight">{new Date(item.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-400 font-medium tracking-tight">Doanh thu món:</span>
                <span className="text-[#1A1A1A] font-bold tracking-tight">{formatCurrency(item.foodRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-400 font-medium tracking-tight">Platform Commission:</span>
                <span className="text-[#1A1A1A]/60 font-bold tracking-tight">{formatCurrency(item.commissionAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-400 font-medium tracking-tight">Giảm giá:</span>
                <span className="text-red-500 font-bold tracking-tight">-{formatCurrency(item.discountAmount)}</span>
              </div>
              <div className="h-px bg-gray-300/30 my-1.5" />
              <div className="flex justify-between items-end pt-1">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter mb-0.5">Thực nhận</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-anton text-lime-600 tracking-tighter">
                      {formatCurrency(item.netRevenue).replace("đ", "").replace("₫", "").trim()}
                    </span>
                    <span className="text-xs font-bold text-lime-600">đ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
