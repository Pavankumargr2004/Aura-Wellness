import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { type SleepLog, type StepLog } from '../../types';

interface SleepActivityChartProps {
    sleepLogs: SleepLog[];
    stepLogs: StepLog[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useLanguage();
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 rounded-lg shadow-lg border border-border">
                <p className="text-sm font-bold text-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}: {entry.value.toLocaleString()} {entry.name === t('label_sleep') ? 'hrs' : ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SleepActivityChart: React.FC<SleepActivityChartProps> = ({ sleepLogs, stepLogs }) => {
    const { t } = useLanguage();

    const data = useMemo(() => {
        const dataMap: Record<string, { date: string, timestamp: number, sleep: number, steps: number }> = {};

        // Process Sleep
        sleepLogs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateKey = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            if (!dataMap[dateKey]) {
                dataMap[dateKey] = { date: dateKey, timestamp: dateObj.getTime(), sleep: 0, steps: 0 };
            }
            dataMap[dateKey].sleep = log.hours; // Assuming one sleep log per day for simplicity
        });

        // Process Steps
        stepLogs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateKey = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            if (!dataMap[dateKey]) {
                dataMap[dateKey] = { date: dateKey, timestamp: dateObj.getTime(), sleep: 0, steps: 0 };
            }
            dataMap[dateKey].steps += log.steps;
        });

        return Object.values(dataMap)
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-7); // Last 7 days
    }, [sleepLogs, stepLogs]);

    return (
        <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-4">{t('dashboard_chart_sleep_activity')}</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10}
                        />
                        <YAxis 
                            yAxisId="left"
                            orientation="left"
                            stroke="var(--primary)"
                            tick={{ fill: 'var(--primary)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 12]}
                            label={{ value: 'Hrs', angle: -90, position: 'insideLeft', fill: 'var(--primary)', fontSize: 10 }}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            stroke="#10B981"
                            tick={{ fill: '#10B981', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        
                        <Bar 
                            yAxisId="right" 
                            dataKey="steps" 
                            name={t('label_steps')} 
                            fill="#10B981" 
                            barSize={20} 
                            radius={[4, 4, 0, 0]} 
                            fillOpacity={0.6}
                        />
                        <Line 
                            yAxisId="left" 
                            type="monotone" 
                            dataKey="sleep" 
                            name={t('label_sleep')} 
                            stroke="var(--primary)" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SleepActivityChart;