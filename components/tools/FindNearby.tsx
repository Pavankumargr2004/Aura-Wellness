
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Search, Navigation, Building2, Stethoscope, Pill, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { findNearbyPlaces } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface FindNearbyProps {
    onBack: () => void;
}

interface LocationState {
    lat: number;
    lng: number;
}

const formatNearbyResults = (text: string) => {
    let listCounter = 0;
    return text.split('\n').map((line, index) => {
        // Detect if the line is a list item (starts with *, -, or numbers like 1.)
        const isListItem = /^[\*-]|\d+\./.test(line.trim());
        
        // Clean markdown bold and list markers
        const cleanedLine = line.replace(/\*\*/g, '').replace(/^[\*-]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        
        if (!cleanedLine) return null;

        if (isListItem) {
            listCounter++;
            return (
                <div key={index} className="mb-3 flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors border border-white/5 animate-fadeIn">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5 shadow-sm">
                        {listCounter}
                    </div>
                    <p className="leading-relaxed text-sm text-foreground">{cleanedLine}</p>
                </div>
            );
        }

        return (
            <p key={index} className="mb-3 text-muted-foreground text-sm px-1">
                {cleanedLine}
            </p>
        );
    });
};

const FindNearby: React.FC<FindNearbyProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ text: string; groundingMetadata: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<LocationState | undefined>(undefined);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'found' | 'error'>('idle');

    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        setLocationStatus('locating');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('found');
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('error');
            },
            { timeout: 10000 }
        );
    };

    const handleSearch = async (searchQuery: string = query) => {
        if (!searchQuery.trim()) return;
        
        setIsLoading(true);
        setResults(null);
        
        // Append location context if available
        let finalQuery = searchQuery;
        if (location) {
            finalQuery = `${searchQuery} within 5km`; 
        }

        const result = await findNearbyPlaces(finalQuery, location);
        setResults(result);
        setIsLoading(false);
    };

    const quickCategories = [
        { id: 'hospitals', icon: Building2, label: t('tool_nearby_hospitals'), query: 'hospitals nearby' },
        { id: 'pharmacies', icon: Pill, label: t('tool_nearby_pharmacies'), query: 'pharmacies nearby' },
        { id: 'clinics', icon: Stethoscope, label: t('tool_nearby_clinics'), query: 'medical clinics nearby' },
    ];

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-4xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
                    <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">{t('tool_nearby_title')}</h2>
                <p className="text-muted-foreground">{t('tool_nearby_desc')}</p>
                
                {/* Location Status Indicator */}
                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                    {locationStatus === 'locating' && <span className="text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Locating you...</span>}
                    {locationStatus === 'found' && <span className="text-emerald-400 flex items-center gap-1"><Navigation className="h-3 w-3"/> Location active (5km radius)</span>}
                    {locationStatus === 'error' && <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Location unavailable (Search will be general)</span>}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('tool_nearby_placeholder')}
                        className="w-full py-3 pl-12 pr-4 bg-secondary rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <button 
                        onClick={() => handleSearch()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        disabled={isLoading || !query.trim()}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowLeft className="h-4 w-4 rotate-180"/>}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {quickCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setQuery(cat.query);
                                handleSearch(cat.query);
                            }}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/30 transition-all gap-2"
                        >
                            <cat.icon className="h-6 w-6 text-primary" />
                            <span className="text-xs font-medium text-center">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 mt-6 overflow-y-auto min-h-[200px] rounded-xl bg-secondary/20 border border-white/5 p-4 custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                        <p>{t('tool_nearby_searching')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4">
                        <div className="max-w-none">
                            {formatNearbyResults(results.text)}
                        </div>
                        
                        {/* Render Grounding Chips if available */}
                        {results.groundingMetadata?.groundingChunks && results.groundingMetadata.groundingChunks.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/10 animate-fadeIn">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source Links</p>
                                {results.groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
                                    if (chunk.maps) {
                                        return (
                                            <a 
                                                key={index} 
                                                href={chunk.maps.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all border border-white/5 group"
                                            >
                                                <div className="p-2 bg-red-500/10 rounded-full text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate text-sm text-foreground">{chunk.maps.title}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        Open in Maps <ExternalLink className="h-3 w-3" />
                                                    </p>
                                                </div>
                                            </a>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center opacity-60">
                        <Navigation className="h-12 w-12 mb-2" />
                        <p>{t('tool_nearby_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindNearby;
