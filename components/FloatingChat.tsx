
import React, { useState } from 'react';
import { Stethoscope, ChevronDown, Sparkles } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { StressDataHook, ChatHistoryHook, ChatSettingsHook } from '../types';

interface FloatingChatProps {
    stressDataHook: StressDataHook;
    chatHistoryHook: ChatHistoryHook;
    chatSettingsHook: ChatSettingsHook;
}

const FloatingChat: React.FC<FloatingChatProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window - conditionally rendered with animation */}
            {isOpen && (
                <div className="w-[400px] h-[650px] max-w-[calc(100vw-2rem)] max-h-[85vh] shadow-2xl shadow-primary/10 rounded-[2rem] overflow-hidden animate-popIn origin-bottom-right border border-white/10 backdrop-blur-2xl bg-slate-950/90 flex flex-col relative ring-1 ring-white/5">
                    {/* Decorative Top Glow & Mesh */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-teal-500/20 via-blue-500/10 to-transparent pointer-events-none z-0 blur-xl opacity-70" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl pointer-events-none z-0" />
                    
                    {/* Main Content */}
                    <div className="relative z-10 h-full flex flex-col">
                        <ChatInterface {...props} isWidget={true} />
                    </div>
                </div>
            )}

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 z-50 ${
                    isOpen 
                    ? 'bg-slate-800 text-white rotate-90 border border-white/20' 
                    : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white border-2 border-white/20'
                }`}
                aria-label="Toggle Chat"
            >
                {/* Pulse Ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-teal-400 opacity-20 animate-ping"></span>
                )}

                {isOpen ? (
                    <ChevronDown className="h-8 w-8 transition-transform duration-300" />
                ) : (
                    <div className="relative flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 animate-wiggle drop-shadow-md" />
                        <Sparkles className="absolute -top-1 -right-2 h-4 w-4 text-yellow-300 animate-pulse" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default FloatingChat;