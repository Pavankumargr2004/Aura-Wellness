import React, { useState, useRef } from 'react';
import { ArrowLeft, Image, Sparkles, Loader2, Upload, Download, RefreshCw } from 'lucide-react';
import { editImage } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImageEditorProps {
    onBack: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onBack }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResultImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!selectedImage || !prompt.trim()) return;
        setIsLoading(true);
        const base64Data = selectedImage.split(',')[1];
        const editedImageData = await editImage(base64Data, prompt);
        
        if (editedImageData) {
            setResultImage(`data:image/jpeg;base64,${editedImageData}`);
        } else {
            alert('Failed to edit image. Please try again.');
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setSelectedImage(null);
        setPrompt('');
        setResultImage(null);
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-4xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
                    <Image className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">{t('tool_image_editor_title')}</h2>
                <p className="text-muted-foreground">{t('tool_image_editor_desc')}</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
                {!selectedImage ? (
                    <div 
                        className="w-full max-w-lg aspect-video border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium">{t('image_editor_upload')}</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-muted-foreground">Original</span>
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/20 aspect-square flex items-center justify-center">
                                    <img src={selectedImage} alt="Original" className="max-w-full max-h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-muted-foreground">Result</span>
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/20 aspect-square flex items-center justify-center relative">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                            <p className="text-sm text-muted-foreground animate-pulse">{t('image_editor_generating')}</p>
                                        </div>
                                    ) : resultImage ? (
                                        <img src={resultImage} alt="Edited" className="max-w-full max-h-full object-contain animate-fadeIn" />
                                    ) : (
                                        <div className="text-muted-foreground text-sm p-4 text-center">
                                            Result will appear here
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t('image_editor_prompt_placeholder')}
                                className="flex-1 py-3 px-4 bg-secondary rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-border w-full"
                                disabled={isLoading}
                            />
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleEdit}
                                    disabled={!prompt.trim() || isLoading}
                                    className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                    {t('image_editor_generate')}
                                </button>
                                {resultImage && (
                                    <a
                                        href={resultImage}
                                        download="edited-image.jpg"
                                        className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center shadow-lg"
                                        title={t('image_editor_download')}
                                    >
                                        <Download className="h-5 w-5" />
                                    </a>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="py-3 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground transition-colors flex items-center justify-center"
                                    title={t('image_editor_reset')}
                                >
                                    <RefreshCw className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;