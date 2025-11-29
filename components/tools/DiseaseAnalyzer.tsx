
import React, { useState, useRef } from 'react';
import { ArrowLeft, Stethoscope, AlertTriangle, ScanSearch, Upload, Loader2, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { analyzeMedicalCondition } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface DiseaseAnalyzerProps {
    onBack: () => void;
}

const DiseaseAnalyzer: React.FC<DiseaseAnalyzerProps> = ({ onBack }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<{ condition: string; solution: string; disclaimer: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        const base64Data = selectedImage.split(',')[1];
        const analysisResult = await analyzeMedicalCondition(base64Data);
        setResult(analysisResult);
        setIsLoading(false);
    };

    const handleReset = () => {
        setSelectedImage(null);
        setResult(null);
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-5xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-3 ring-1 ring-red-500/20">
                    <Stethoscope className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold">{t('tool_disease_title')}</h2>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{t('tool_disease_desc')}</p>
            </div>

            <div className="flex-1">
                {!selectedImage ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                        <div 
                            className="w-full max-w-xl aspect-video border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group bg-secondary/10"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 rounded-full bg-secondary group-hover:scale-110 transition-transform mb-4 shadow-lg">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-lg font-semibold text-foreground">{t('disease_upload')}</p>
                            <p className="text-sm text-muted-foreground mt-1">Click to select an image</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                            <Info className="h-4 w-4 text-primary" />
                            Photos are processed securely and not stored permanently.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Left Column: Image Preview & Actions */}
                        <div className="flex flex-col gap-6">
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-square sm:aspect-video lg:aspect-auto lg:h-[400px] flex items-center justify-center group">
                                <img src={selectedImage} alt="Symptom" className="max-w-full max-h-full object-contain" />
                                
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                        <p className="text-white font-semibold text-lg animate-pulse">{t('disease_analyzing')}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                {!result ? (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isLoading}
                                        className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-0.5"
                                    >
                                        <ScanSearch className="h-5 w-5" />
                                        {t('disease_analyze')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 py-4 px-6 rounded-xl font-bold text-foreground bg-secondary hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                        Analyze Another
                                    </button>
                                )}
                                {!result && !isLoading && (
                                    <button
                                        onClick={handleReset}
                                        className="py-4 px-4 rounded-xl font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                                        title="Remove Image"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Results */}
                        <div className="flex flex-col gap-4">
                            {result ? (
                                <div className="space-y-4 animate-fadeIn">
                                    {/* Condition Card */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-white/5 shadow-lg">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-red-500"/> {t('disease_condition')}
                                        </h4>
                                        <p className="text-2xl font-bold text-foreground">{result.condition}</p>
                                    </div>

                                    {/* Solution Card */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-white/5 shadow-lg flex-1">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Stethoscope className="h-5 w-5 text-emerald-500"/> {t('disease_solution')}
                                        </h4>
                                        <div className="prose prose-invert prose-lg max-w-none">
                                            <p className="whitespace-pre-wrap leading-relaxed text-gray-200">{result.solution}</p>
                                        </div>
                                    </div>

                                    {/* Disclaimer Card */}
                                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-4">
                                        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-amber-500 mb-1">{t('disease_disclaimer_title')}</h5>
                                            <p className="text-sm text-amber-200/70 leading-relaxed">{result.disclaimer}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-secondary/5 rounded-2xl border border-white/5 border-dashed">
                                    <div className="p-4 rounded-full bg-secondary/50 mb-4">
                                        <ScanSearch className="h-8 w-8 text-muted-foreground opacity-50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">Ready to Analyze</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Upload a clear photo of the visible symptom. Our AI will analyze it and provide preliminary insights.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseAnalyzer;
