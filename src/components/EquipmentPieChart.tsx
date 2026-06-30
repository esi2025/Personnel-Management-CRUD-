import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface EquipmentPieChartProps {
  casesCount: number;
  monitorsCount: number;
  printersCount: number;
  radiosCount?: number;
  cctvsCount?: number;
}

export default function EquipmentPieChart({
  casesCount,
  monitorsCount,
  printersCount,
  radiosCount = 0,
  cctvsCount = 0,
}: EquipmentPieChartProps) {
  const total = casesCount + monitorsCount + printersCount + radiosCount + cctvsCount;

  const data = [
    { name: 'کیس‌های اداری/کارگاهی', value: casesCount, color: '#84141A' }, // Omran Azarestan Burgundy
    { name: 'مانیتور و نماینده‌های تصویر', value: monitorsCount, color: '#3b82f6' }, // Modern Tech Blue
    { name: 'پرینتر و ملزومات چاپ', value: printersCount, color: '#10b981' }, // Clean Emerald green
    { name: 'دستگاه‌های بی‌سیم دستی', value: radiosCount, color: '#6366f1' }, // Indigo
    { name: 'دوربین‌های مداربسته', value: cctvsCount, color: '#ec4899' }, // Pink
  ].filter(item => item.value > 0);

  // Avoid crash/blank if no equipment exists
  if (total === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 text-center text-slate-400 text-xs font-sans">
        هیچ سخت‌افزاری جهت آمارگیری یافت نشد.
      </div>
    );
  }

  // Formatting helper for Persian numbers
  const toPersianNum = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  // Custom tool-tip to render in clean matching RTL layout
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-lg border border-slate-200/80 shadow-lg text-right text-xs font-sans">
          <p className="font-bold text-slate-800 mb-1" style={{ color: item.payload.color }}>
            {item.name}
          </p>
          <div className="flex gap-2 justify-end text-slate-600 font-medium leading-none mt-1">
            <span>درصد کل: {toPersianNum(pct)}٪</span>
            <span className="text-slate-300">|</span>
            <span>تعداد: {toPersianNum(item.value)} عدد</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="equipment-pie-chart-root" className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 font-sans no-print">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          📊 آمار تجهیزات کارگاه
        </h4>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
          مجموع: {toPersianNum(total)} عدد
        </span>
      </div>

      <div className="w-full h-[220px] flex items-center justify-center relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={75}
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

        {/* Dynamic center metric */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1.5">
          <span className="text-xl font-black text-slate-800 leading-none">
            {toPersianNum(total)}
          </span>
          <span className="text-[9px] text-slate-400 mt-1">کل سخت‌افزار</span>
        </div>
      </div>

      {/* Structured grid legends */}
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-800">
                <span>{toPersianNum(item.value)} عدد</span>
                <span className="text-slate-300">|</span>
                <span className="inline-block min-w-[32px] text-left text-blue-600">{toPersianNum(pct)}٪</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
