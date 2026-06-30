import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Case, Monitor, Printer, Mouse, Keyboard, Radio, Cctv } from '../types';

interface EquipmentStatusBarChartProps {
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  radios?: Radio[];
  cctvs?: Cctv[];
}

export default function EquipmentStatusBarChart({
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  radios = [],
  cctvs = []
}: EquipmentStatusBarChartProps) {
  
  // Count states helper
  const getStatusCounts = (items: { status?: 'working' | 'repair' | 'retired' | string }[]) => {
    let working = 0;
    let repair = 0;
    let retired = 0;

    items.forEach(item => {
      const status = item.status || 'working';
      if (status === 'working') {
        working++;
      } else if (status === 'repair') {
        repair++;
      } else if (status === 'retired') {
        retired++;
      } else {
        working++; // Fallback for undefined
      }
    });

    return { working, repair, retired };
  };

  const caseStats = getStatusCounts(cases);
  const monitorStats = getStatusCounts(monitors);
  const printerStats = getStatusCounts(printers);
  const mouseStats = getStatusCounts(mice);
  const keyboardStats = getStatusCounts(keyboards);
  const radioStats = getStatusCounts(radios);
  const cctvStats = getStatusCounts(cctvs);

  const data = [
    { name: 'کیس‌ها', ...caseStats },
    { name: 'مانیتورها', ...monitorStats },
    { name: 'پرینترها', ...printerStats },
    { name: 'ماوس‌ها', ...mouseStats },
    { name: 'کیبوردها', ...keyboardStats },
    { name: 'بی‌سیم‌ها', ...radioStats },
    { name: 'دوربین‌ها', ...cctvStats },
  ];

  const totalAll = 
    cases.length + monitors.length + printers.length + mice.length + keyboards.length + radios.length + cctvs.length;

  if (totalAll === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/10 rounded-xl p-5 border border-slate-100 dark:border-slate-800/40 text-center text-slate-400 text-xs font-sans">
        هیچ تجهیزاتی برای آمارگیری پیدا نشد.
      </div>
    );
  }

  // Persian numbers helper
  const toPersianNum = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  // Custom polished RTL tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-right text-xs font-sans min-w-[180px]">
          <p className="font-extrabold text-slate-800 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            📊 وضعیت تفکیکی: {label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    {entry.name === 'working' ? 'سالم و فعال' : entry.name === 'repair' ? 'نیازمند تعمیر' : 'اسقاط شده'}
                  </span>
                </div>
                <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                  {toPersianNum(entry.value)} عدد
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="equipment-status-bar-chart-root" className="bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-slate-200/50 dark:border-slate-800/40 p-4 font-sans no-print">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>📊</span>
          <span>نمودار تفکیک وضعیت سلامت سخت‌افزارها</span>
        </h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-150 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
          تفکیک سه‌گانه
        </span>
      </div>

      <div className="w-full h-[240px] select-none flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -25, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.05)', radius: 8 }} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              formatter={(value) => {
                const label = value === 'working' ? 'سالم و فعال' : value === 'repair' ? 'نیازمند تعمیر' : 'اسقاط شده';
                return <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mr-2 ml-1">{label}</span>;
              }}
            />
            <Bar 
              dataKey="working" 
              name="working" 
              fill="#10b981" // Emerald
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="repair" 
              name="repair" 
              fill="#f59e0b" // Amber
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="retired" 
              name="retired" 
              fill="#ef4444" // Red
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick summary status stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10">
          <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">کل تجهیزات سالم</div>
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
            {toPersianNum(caseStats.working + monitorStats.working + printerStats.working + mouseStats.working + keyboardStats.working)}
          </div>
        </div>
        <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-500/10">
          <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400">کل نیاز به تعمیر</div>
          <div className="text-sm font-black text-amber-700 dark:text-amber-300 mt-0.5">
            {toPersianNum(caseStats.repair + monitorStats.repair + printerStats.repair + mouseStats.repair + keyboardStats.repair)}
          </div>
        </div>
        <div className="bg-red-500/5 dark:bg-red-500/10 p-2 rounded-lg border border-red-500/10">
          <div className="text-[9px] font-bold text-red-600 dark:text-red-400">کل اسقاط شده</div>
          <div className="text-sm font-black text-red-700 dark:text-red-300 mt-0.5">
            {toPersianNum(caseStats.retired + monitorStats.retired + printerStats.retired + mouseStats.retired + keyboardStats.retired)}
          </div>
        </div>
      </div>
    </div>
  );
}
