import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { type StressLog } from '../../types';

interface StressLevelsChartProps {
    stressLogs: StressLog[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useLanguage();
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 rounded-lg shadow-lg border border-border">
                <p className="text-sm font-bold text-foreground mb-1">{label}</p>
                <p className="text-sm font-semibold" style={{color: payload[0].stroke}}>
                    {t('tooltip_stress')}: {payload[0].value.toFixed(1)}
                </p>
            </div>
        );
    }
    return null;
};

const StressLevelsChart: React.FC<StressLevelsChartProps> = ({ stressLogs }) => {
    const { t } = useLanguage();

    const data = useMemo(() => {
        const grouped = stressLogs.reduce((acc, log) => {
            const dateObj = new Date(log.timestamp);
            const dateKey = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            
            if (!acc[dateKey]) {
                acc[dateKey] = { sum: 0, count: 0, timestamp: dateObj.getTime() };
            }
            acc[dateKey].sum += log.level;
            acc[dateKey].count += 1;
            return acc;
        }, {} as Record<string, { sum: number, count: number, timestamp: number }>);

        return Object.entries(grouped)
            .map(([date, values]: [string, { sum: number, count: number, timestamp: number }]) => ({
                name: date,
                level: values.sum / values.count,
                timestamp: values.timestamp
            }))
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-7); // Last 7 days
    }, [stressLogs]);

    return (
        <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-4">{t('dashboard_chart_stress')}</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 10]}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        <ReferenceArea y1={7} y2={10} fill="var(--destructive)" fillOpacity={0.05} label={{ value: t('label_high'), position: 'insideTopRight', fill: 'var(--destructive)', fontSize: 12, fontWeight: 'bold' }} />
                        <ReferenceArea y1={3} y2={7} fill="#F59E0B" fillOpacity={0.05} label={{ value: t('label_elevated'), position: 'insideTopRight', fill: '#F59E0B', fontSize: 12, fontWeight: 'bold' }}/>
                        <ReferenceArea y1={0} y2={3} fill="#10B981" fillOpacity={0.05} label={{ value: t('label_calm'), position: 'insideTopRight', fill: '#10B981', fontSize: 12, fontWeight: 'bold' }}/>

                        <Line 
                            type="monotone" 
                            dataKey="level" 
                            stroke="var(--primary)" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} 
                            activeDot={{ r: 6, strokeWidth: 0 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StressLevelsChart;