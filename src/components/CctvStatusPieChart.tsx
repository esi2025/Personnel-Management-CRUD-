import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CctvStatusPieChartProps {
  workingCount: number;
  repairCount: number;
  retiredCount: number;
}

export default function CctvStatusPieChart({
  workingCount,
  repairCount,
  retiredCount,
}: CctvStatusPieChartProps) {
  const total = workingCount + repairCount + retiredCount;

  const data = [
    { name: 'فعال / سالم', value: workingCount, color: '#10b981' }, // Clean Emerald green
    { name: 'در انتظار تعمیر / خراب', value: repairCount, color: '#f59e0b' }, // Amber warning
    { name: 'غیرفعال / اسقاط شده', value: retiredCount, color: '#ef4444' }, // Red alert
  ];

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 text-center text-slate-400 text-xs font-sans">
        هیچ دوربین مداربسته‌ای جهت آمارگیری یافت نشد.
      </div>
    );
  }

  const toPersianNum = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-lg text-right text-xs font-sans">
          <p className="font-bold mb-1" style={{ color: item.payload.color }}>
            {item.name}
          </p>
          <div className="flex gap-2 justify-end text-slate-600 font-medium mt-1">
            <span>درصد کل: {toPersianNum(pct)}٪</span>
            <span className="text-slate-300">|</span>
            <span>تعداد: {toPersianNum(item.value)} دستگاه</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-250 p-4 font-sans no-print shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          📊 نمودار وضعیت فعالیت دوربین‌ها
        </h4>
        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
          مجموع: {toPersianNum(total)} دستگاه
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pie graphic */}
        <div className="relative w-full md:w-1/2 h-[160px] flex items-center justify-center select-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Dynamic center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-lg font-black text-slate-800 leading-none">
              {toPersianNum(total)}
            </span>
            <span className="text-[8px] text-slate-400 mt-1">کل دوربین‌ها</span>
          </div>
        </div>

        {/* Legend table */}
        <div className="w-full md:w-1/2 space-y-2.5">
          {data.map((item, idx) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-bold">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-black text-slate-800">
                  <span>{toPersianNum(item.value)} دستگاه</span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-block min-w-[30px] text-left text-blue-600 font-sans font-bold">{toPersianNum(pct)}٪</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
