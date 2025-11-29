
import React, { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, Smile, Book, Trash2, Calendar } from 'lucide-react';
import { StressDataHook } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmotionWheelProps {
  onBack: () => void;
  stressDataHook: StressDataHook;
}

type EmotionStep = 'primary' | 'secondary' | 'intensity' | 'notes' | 'complete';
type ViewMode = 'log' | 'history';

const EmotionWheel: React.FC<EmotionWheelProps> = ({ onBack, stressDataHook }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('log');
    const [step, setStep] = useState<EmotionStep>('primary');
    const [primaryEmotion, setPrimaryEmotion] = useState('');
    const [secondaryEmotion, setSecondaryEmotion] = useState('');
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const { t } = useLanguage();
    
    const { addEmotionJournalEntry, emotionJournal, deleteEmotionJournalEntry } = stressDataHook;

    const emotionData: { [key: string]: { key: string, emoji: string; color: string; bg: string; border: string; secondary: string[] } } = useMemo(() => ({
        [t('emotion_joy')]: { key: 'joy', emoji: '😄', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', secondary: [t('emotion_joy_secondary_1'), t('emotion_joy_secondary_2'), t('emotion_joy_secondary_3'), t('emotion_joy_secondary_4'), t('emotion_joy_secondary_5')] },
        [t('emotion_sadness')]: { key: 'sadness', emoji: '😢', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', secondary: [t('emotion_sadness_secondary_1'), t('emotion_sadness_secondary_2'), t('emotion_sadness_secondary_3'), t('emotion_sadness_secondary_4'), t('emotion_sadness_secondary_5')] },
        [t('emotion_anger')]: { key: 'anger', emoji: '😠', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', secondary: [t('emotion_anger_secondary_1'), t('emotion_anger_secondary_2'), t('emotion_anger_secondary_3'), t('emotion_anger_secondary_4'), t('emotion_anger_secondary_5')] },
        [t('emotion_fear')]: { key: 'fear', emoji: '😨', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', secondary: [t('emotion_fear_secondary_1'), t('emotion_fear_secondary_2'), t('emotion_fear_secondary_3'), t('emotion_fear_secondary_4'), t('emotion_fear_secondary_5')] },
        [t('emotion_surprise')]: { key: 'surprise', emoji: '😲', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', secondary: [t('emotion_surprise_secondary_1'), t('emotion_surprise_secondary_2'), t('emotion_surprise_secondary_3'), t('emotion_surprise_secondary_4')] },
        [t('emotion_disgust')]: { key: 'disgust', emoji: '🤢', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', secondary: [t('emotion_disgust_secondary_1'), t('emotion_disgust_secondary_2'), t('emotion_disgust_secondary_3'), t('emotion_disgust_secondary_4')] }
    }), [t]);

    // Reverse lookup for English keys to localized names for display in History
    const keyToLocalizedName = useMemo(() => {
        const map: Record<string, string> = {};
        Object.entries(emotionData).forEach(([localizedName, data]) => {
            map[data.key] = localizedName;
        });
        return map;
    }, [emotionData]);

    const handlePrimarySelect = (emotion: string) => {
        setPrimaryEmotion(emotion);
        setStep('secondary');
    };

    const handleSecondarySelect = (emotion: string) => {
        setSecondaryEmotion(emotion);
        setStep('intensity');
    };

    const handleLogEmotion = () => {
        // Use the original English key for storing data if possible, or the name itself
        const primaryKey = emotionData[primaryEmotion]?.key || primaryEmotion;
        addEmotionJournalEntry({ primaryEmotion: primaryKey, secondaryEmotion, intensity, notes });
        setStep('complete');
    };

    const reset = () => {
        setStep('primary');
        setPrimaryEmotion('');
        setSecondaryEmotion('');
        setIntensity(5);
        setNotes('');
        setViewMode('log');
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            deleteEmotionJournalEntry(id);
        }
    }

    const renderLogView = () => {
        switch (step) {
            case 'primary':
                return (
                    <div className="animate-fadeIn">
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step1_q')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.keys(emotionData).map(emotion => (
                                <button key={emotion} onClick={() => handlePrimarySelect(emotion)} className="p-4 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                                    <span className={`text-3xl ${emotionData[emotion].color}`}>{emotionData[emotion].emoji}</span>
                                    <p className="font-semibold mt-2">{emotion}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'secondary':
                const secondaryEmotions = emotionData[primaryEmotion]?.secondary || [];
                return (
                     <div className="animate-fadeIn">
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step2_q')}</h3>
                         <div className="flex flex-wrap justify-center gap-3">
                            {secondaryEmotions.map(emotion => (
                                <button key={emotion} onClick={() => handleSecondarySelect(emotion)} className="py-2 px-4 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium">
                                    {emotion}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'intensity':
                 return (
                     <div className="animate-fadeIn">
                        <h3 className="text-xl font-bold text-center mb-2">{t('tool_emotion_step3_q')}</h3>
                        <p className="text-center text-muted-foreground mb-6">({secondaryEmotion})</p>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{t('tool_emotion_step3_low')}</span>
                            <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                            <span className="text-sm text-muted-foreground">{t('tool_emotion_step3_high')}</span>
                        </div>
                        <p className="text-center text-4xl font-bold mt-4 text-primary">{intensity}</p>
                        <button onClick={() => setStep('notes')} className="mt-8 w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                            {t('tool_emotion_continue')}
                        </button>
                    </div>
                );
            case 'notes':
                return (
                    <div className="animate-fadeIn">
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step4_q')}</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('tool_emotion_step4_placeholder')}
                            className="w-full p-3 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-border h-28"
                        />
                         <button onClick={handleLogEmotion} className="mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                            {t('tool_emotion_log_button')}
                        </button>
                    </div>
                );
            case 'complete':
                 return (
                    <div className="text-center animate-fadeIn">
                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">{t('tool_emotion_complete_title')}</h3>
                        <p className="text-muted-foreground mb-6">{t('tool_emotion_complete_desc')}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setViewMode('history')} className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                                View History
                            </button>
                            <button onClick={reset} className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                                {t('tool_emotion_log_another')}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    const renderHistoryView = () => {
        const sortedHistory = [...emotionJournal].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (sortedHistory.length === 0) {
            return (
                <div className="text-center py-12 text-muted-foreground animate-fadeIn">
                    <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No journal entries yet.</p>
                    <button onClick={reset} className="mt-4 text-primary font-semibold hover:underline">Start your first log</button>
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-fadeIn overflow-y-auto max-h-[500px] pr-2">
                {sortedHistory.map((entry) => {
                    // Try to find localized name, fallback to raw key if not found
                    const localizedName = keyToLocalizedName[entry.primaryEmotion] || entry.primaryEmotion;
                    const config = emotionData[localizedName] || { emoji: '😐', color: 'text-gray-400', bg: 'bg-secondary', border: 'border-border' };
                    const date = new Date(entry.timestamp);

                    return (
                        <div key={entry.id} className={`p-4 rounded-xl border ${config.border} ${config.bg} relative group transition-all`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{config.emoji}</span>
                                    <div>
                                        <h4 className={`font-bold ${config.color} capitalize`}>{localizedName}</h4>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/20 text-white/90 inline-block mt-1">
                                            {entry.secondaryEmotion}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                        <Calendar className="h-3 w-3" />
                                        {date.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-muted-foreground">Intensity:</span>
                                    <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-current opacity-80 rounded-full" 
                                            style={{ width: `${(entry.intensity / 10) * 100}%`, color: 'currentColor' }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold">{entry.intensity}/10</span>
                                </div>
                                {entry.notes && (
                                    <div className="mt-2 p-2 rounded bg-black/10 text-sm italic text-foreground/90">
                                        "{entry.notes}"
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleDelete(entry.id)}
                                className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Delete entry"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={step === 'primary' ? onBack : reset} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> {step === 'primary' ? t('tool_back_to_tools') : t('tool_emotion_start_over')}
                </button>
                <div className="flex bg-secondary rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('log')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'log' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Check-in
                    </button>
                    <button 
                        onClick={() => setViewMode('history')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'history' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Journal
                    </button>
                </div>
            </div>

             <div className="text-center mb-2">
                <Smile className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('tool_emotion_main_title')}</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center mt-4">
                {viewMode === 'log' ? renderLogView() : renderHistoryView()}
            </div>
        </div>
    );
};

export default EmotionWheel;
