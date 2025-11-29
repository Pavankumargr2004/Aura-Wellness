
import React, { useState, useEffect } from 'react';
import { getIntervention } from '../services/geminiService';
import { Wind, BrainCircuit, HeartPulse, Loader2, ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import SoundPlayer from './sound/SoundPlayer';
import { sounds } from './sound/sounds';
import { useLanguage } from '../contexts/LanguageContext';

type InterventionType = 'breathing' | 'mindfulness';

const BreathingExercise: React.FC<{ content: string }> = ({ content }) => {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const { t } = useLanguage();

    // Enhanced parsing: remove markdown chars like * and #, then look for numbered lines
    const instructions = content.split('\n')
        .map(line => line.replace(/[*#]/g, '').trim())
        .filter(line => line !== '' && /^\d/.test(line));

    useEffect(() => {
        if(instructions.length === 0) return;
        if (step < instructions.length) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, 5000); 
            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [step, instructions.length]);

    if (instructions.length === 0 && content) {
         // Fallback if regex fails but content exists
         const cleanContent = content.replace(/[*#]/g, '').trim();
         if (!cleanContent) return <p className="text-gray-300">Loading...</p>;

         return (
            <div className="text-center flex flex-col items-center justify-center h-full">
                <div className="max-w-md p-6 glass-card rounded-xl border border-white/5 animate-fadeIn">
                    <p className="text-lg font-medium text-foreground text-center leading-relaxed">
                        {cleanContent}
                    </p>
                    <button onClick={() => setIsComplete(true)} className="mt-6 px-6 py-2 bg-primary rounded-full text-white font-semibold hover:bg-primary/90 transition-colors">
                        Complete
                    </button>
                </div>
            </div>
        );
    }

    if (instructions.length === 0) {
        return <p className="text-gray-300">{content}</p>;
    }

    return (
        <div className="text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="relative h-64 w-64 flex items-center justify-center mb-8">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-500/50 animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* Breathing Circle */}
                <div className={`absolute inset-4 bg-violet-500/20 rounded-full blur-xl transition-all duration-[5000ms] ease-in-out ${step % 2 === 0 ? 'scale-100 opacity-50' : 'scale-50 opacity-20'}`}></div>
                <div className={`absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full shadow-2xl transition-all duration-[5000ms] ease-in-out flex items-center justify-center ${step % 2 === 0 ? 'scale-100' : 'scale-50'}`}>
                     <Wind className={`text-white/50 w-1/2 h-1/2 transition-opacity duration-1000 ${step % 2 === 0 ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                
                {/* Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-2xl drop-shadow-md transition-opacity duration-500">
                        {step % 2 === 0 ? t('interventions_breathing_in') : t('interventions_breathing_out')}
                    </span>
                </div>
            </div>
            
            {isComplete ? (
                <div className="animate-fadeIn space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{t('interventions_breathing_complete')}</p>
                </div>
            ) : (
                <div className="max-w-md p-4 glass-card rounded-xl border border-white/5 animate-fadeIn">
                    <p className="text-xl font-medium text-foreground text-center leading-relaxed">
                        {instructions[step] || 'Starting...'}
                    </p>
                </div>
            )}
        </div>
    );
};


const Interventions: React.FC = () => {
    const [activeIntervention, setActiveIntervention] = useState<InterventionType | null>(null);
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const fetchContent = async (type: InterventionType) => {
        setIsLoading(true);
        setActiveIntervention(type);
        const result = await getIntervention(type);
        setContent(result);
        setIsLoading(false);
    };

    const formatMindfulnessContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            const cleanedLine = line.replace(/[*#]/g, '').trim();
            if (!cleanedLine) return null;
            return (
                <p key={index} className="mb-4 last:mb-0">
                    {cleanedLine}
                </p>
            );
        });
    };

    const InterventionCard = ({ type, title, description, icon: Icon, color, gradient }: { type: InterventionType, title: string, description: string, icon: React.ElementType, color: string, gradient: string }) => (
        <button onClick={() => fetchContent(type)} className={`group relative glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/5 hover:border-white/10`}>
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`}></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`rounded-2xl p-3 w-max ${color} shadow-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-6 w-6 text-white"/>
                </div>
                <div className="p-2 rounded-full bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <PlayCircle className="h-5 w-5" />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 relative z-10 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground flex-1 relative z-10 leading-relaxed text-sm">{description}</p>
            
            <div className="mt-4 flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                Begin Session <ArrowRight className="ml-2 h-4 w-4" />
            </div>
        </button>
    );
    
    if (activeIntervention) {
        return (
            <div className="glass-card h-full rounded-2xl p-4 sm:p-8 flex flex-col animate-fadeIn relative overflow-hidden">
                 {/* Background decoration for active view */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                 
                 <button onClick={() => setActiveIntervention(null)} className="self-start mb-6 text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center gap-2 group">
                    <div className="p-1 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                    </div>
                    {t('interventions_back')}
                </button>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4"/>
                        <p className="text-muted-foreground animate-pulse">Generating personalized session...</p>
                    </div>
                ) : (
                    <div className="flex-1">
                        {activeIntervention === 'breathing' ? (
                            <BreathingExercise content={content} />
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="text-center mb-8">
                                    <div className="inline-flex p-4 rounded-full bg-sky-500/10 text-sky-400 mb-4">
                                        <BrainCircuit className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground">{t('interventions_mindfulness_title')}</h2>
                                </div>
                                <div className="p-6 sm:p-8 bg-secondary/30 rounded-2xl border border-white/5 leading-loose text-lg text-gray-200 shadow-inner max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {formatMindfulnessContent(content)}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => setActiveIntervention(null)} className="px-6 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                                        Complete Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">{t('interventions_title')}</h2>
                <p className="text-muted-foreground max-w-2xl">{t('interventions_description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InterventionCard 
                    type="breathing" 
                    title={t('interventions_breathing_title')}
                    description={t('interventions_breathing_desc')}
                    icon={Wind}
                    color="bg-violet-600"
                    gradient="from-violet-600 to-indigo-600"
                />
                <InterventionCard 
                    type="mindfulness" 
                    title={t('interventions_mindfulness_title')}
                    description={t('interventions_mindfulness_desc')}
                    icon={BrainCircuit}
                    color="bg-sky-600"
                    gradient="from-sky-500 to-cyan-500"
                />
            </div>
            
             <div className="glass-card p-6 rounded-2xl mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 relative z-10">
                    <HeartPulse className="h-6 w-6 text-red-500"/>
                    {t('interventions_soundscapes_title')}
                </h3>
                <p className="text-muted-foreground mb-6 relative z-10">{t('interventions_soundscapes_desc')}</p>
                <div className="relative z-10">
                    <SoundPlayer sounds={sounds} />
                </div>
            </div>
        </div>
    );
};

export default Interventions;
