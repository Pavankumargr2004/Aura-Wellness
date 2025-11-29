
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea } from 'recharts';
import { type StressDataHook, type RealtimeStressHook, type CognitiveTwinAnalysis, type EmotionForecast } from '../types';
import { getCognitiveTwinAnalysis, getEmotionForecast } from '../services/geminiService';
import { Smile, Loader2, AlertTriangle, Brain, UserCog, Clock, BarChart2, ShieldCheck, Zap } from 'lucide-react';
import StressLevelsChart from './dashboard/StressLevelsChart';
import SleepActivityChart from './dashboard/SleepActivityChart';
import TaskList from './dashboard/TaskList';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
    stressDataHook: StressDataHook;
    realtimeStressHook: RealtimeStressHook;
}

const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const status = value > 70 ? 'High' : value > 40 ? 'Moderate' : 'Low';
        const color = value > 70 ? 'text-red-400' : value > 40 ? 'text-amber-400' : 'text-emerald-400';
        return (
            <div className="glass-card p-3 rounded-xl shadow-lg border border-border backdrop-blur-xl">
                <p className="text-sm font-bold text-foreground">{`Time: ${label}`}</p>
                <p className={`text-sm font-semibold ${color}`}>{`Predicted Stress: ${value}`}</p>
                <p className="text-xs text-muted-foreground">{`Status: ${status}`}</p>
            </div>
        );
    }
    return null;
};


// Sub-component for Cognitive Twin Analysis
const CognitiveTwin: React.FC<{ stressDataHook: StressDataHook }> = ({ stressDataHook }) => {
    const { stressLogs, sleepLogs, eventLogs } = stressDataHook;
    const [analysis, setAnalysis] = useState<CognitiveTwinAnalysis | null>(null);
    const [forecast, setForecast] = useState<EmotionForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [analysisRes, forecastRes] = await Promise.all([
                getCognitiveTwinAnalysis(stressLogs, sleepLogs, eventLogs),
                getEmotionForecast({ stressLogs, sleepLogs, eventLogs }),
            ]);
            setAnalysis(analysisRes);
            setForecast(forecastRes);
            setIsLoading(false);
        };
        fetchData();
    }, [stressLogs, sleepLogs, eventLogs]);
    
    if (isLoading) {
        return (
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center min-h-[350px] xl:col-span-3 border border-primary/20 bg-primary/5">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    <Brain className="h-16 w-16 text-primary relative z-10 animate-float" />
                </div>
                <p className="mt-6 text-lg font-medium text-foreground tracking-wide">{t('dashboard_twin_loading')}</p>
                <p className="text-sm text-muted-foreground mt-2">Analyzing neuro-behavioral patterns...</p>
            </div>
        )
    }

    if (!analysis || !forecast) return null;
    
    return (
        <div className="xl:col-span-3 glass-card p-8 rounded-3xl relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-primary/20 ring-1 ring-primary/30">
                    <Brain className="h-6 w-6 text-primary"/> 
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{t('dashboard_twin_title')}</h3>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-500">SYSTEM ACTIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
                        <h4 className="font-bold text-primary flex items-center gap-2 mb-2"><UserCog size={18}/> {t('dashboard_twin_personality')}</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">{analysis.personalitySummary}</p>
                    </div>
                     {analysis.anomaly && (
                        <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-2xl backdrop-blur-sm">
                            <h4 className="font-bold text-amber-400 flex items-center gap-2 mb-1"><AlertTriangle size={18}/> {t('dashboard_twin_anomaly')}</h4>
                            <p className="text-sm text-amber-100/80">{analysis.anomaly}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
                            <h4 className="font-bold text-sm text-muted-foreground mb-3">{t('dashboard_twin_traits')}</h4>
                            <ul className="space-y-3">
                                {analysis.cognitiveTraits.slice(0,2).map(trait => (
                                <li key={trait.trait} className="flex items-start gap-2">
                                    <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0"/>
                                    <div>
                                        <h5 className="text-xs font-bold text-foreground">{trait.trait}</h5>
                                    </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
                            <h4 className="font-bold text-sm text-muted-foreground mb-3">{t('dashboard_twin_patterns')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.emotionalPatterns.map(p => (
                                    <span key={p.pattern} className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">{p.pattern}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3 bg-secondary/10 rounded-2xl p-4 border border-white/5">
                    <h4 className="font-bold text-muted-foreground mb-4 flex items-center gap-2"><Clock size={18}/> {t('dashboard_twin_forecast')}</h4>
                     <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                            <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomForecastTooltip />}/>
                            <ReferenceArea y1={70} y2={100} fill="var(--destructive)" fillOpacity={0.05} strokeDasharray="5 5"/>
                            <ReferenceArea y1={40} y2={70} fill="#F59E0B" fillOpacity={0.05} strokeDasharray="5 5"/>
                            <Area 
                                type="monotone" 
                                dataKey="stress" 
                                stroke="var(--primary)" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorStress)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ stressDataHook, realtimeStressHook }) => {
    const { emotionJournal, stressLogs, sleepLogs, stepLogs } = stressDataHook;
    const { t } = useLanguage();

    const emotionFrequency = emotionJournal.reduce((acc, entry) => {
        acc[entry.primaryEmotion] = (acc[entry.primaryEmotion] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const emotionChartData = Object.keys(emotionFrequency).map(emotion => ({
        name: emotion,
        value: emotionFrequency[emotion]
    }));
    
    const EMOTION_COLORS: Record<string, string> = {
        Joy: '#34D399',
        Sadness: '#3B82F6',
        Anger: '#EF4444',
        Fear: '#8B5CF6',
        Surprise: '#F59E0B',
        Disgust: '#10B981',
    };


    return (
        <div className="space-y-8 animate-fadeIn pb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-extrabold tracking-tight">
                    {t('dashboard_title')}
                </h2>
                <div className="text-sm text-muted-foreground flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Data
                </div>
            </div>
            
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Row 1: Cognitive Twin */}
                <CognitiveTwin stressDataHook={stressDataHook} />
                
                {/* Row 2: Stress Chart & Emotion Chart */}
                <div className="xl:col-span-2">
                     <StressLevelsChart stressLogs={stressLogs} />
                </div>

                <div className="xl:col-span-1 glass-card p-6 rounded-3xl flex flex-col min-h-[400px]">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Smile size={20}/></div>
                        {t('dashboard_emotion_title')}
                    </h3>
                    {emotionChartData.length > 0 ? (
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={emotionChartData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100}
                                        innerRadius={70}
                                        paddingAngle={5}
                                        cornerRadius={5}
                                        stroke="none"
                                        isAnimationActive={true}
                                        label={({ name, percent }) => `${(Number(percent) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {emotionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                {emotionChartData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md bg-secondary/50">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: EMOTION_COLORS[entry.name]}}></div>
                                        <span className="text-muted-foreground">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                             <div className="p-4 rounded-full bg-secondary/50 mb-4">
                                <BarChart2 className="w-8 h-8 opacity-50"/>
                             </div>
                            <p className="text-center font-medium">{t('dashboard_emotion_empty')}</p>
                        </div>
                    )}
                </div>

                 {/* Row 3: Sleep & Activity Chart & Tasks */}
                 <div className="xl:col-span-2">
                    <SleepActivityChart sleepLogs={sleepLogs} stepLogs={stepLogs} />
                 </div>
                 <div className="xl:col-span-1">
                    <TaskList />
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;
