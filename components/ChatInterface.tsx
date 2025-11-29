
import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, type StressDataHook, type ChatHistoryHook, type ChatSettingsHook, ChatSettings, ConversationSummary } from '../types';
import { processUserPrompt, summarizeConversation, generateSpeech, transcribeAudio, findNearbyPlaces } from '../services/geminiService';
import { Send, Bot, User, RefreshCw, Sparkles, FileText, Loader2, Volume2, Mic, StopCircle, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
  stressDataHook: StressDataHook;
  chatHistoryHook: ChatHistoryHook;
  chatSettingsHook: ChatSettingsHook;
  isWidget?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ stressDataHook, chatHistoryHook, chatSettingsHook, isWidget = false }) => {
  const {
    addStressLog,
    addWellnessActivity,
    addSleepLog,
    addEventLog,
    stressLogs,
    wellnessActivities,
    sleepLogs,
    eventLogs
  } = stressDataHook;

  const { messages, addMessage, clearHistory } = chatHistoryHook;
  const { settings, setSettings } = chatSettingsHook;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null); // Message ID being played
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleRefresh = () => {
      if (window.confirm(t('chat_refresh_confirm'))) {
          clearHistory();
      }
  }
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value as ChatSettings[keyof ChatSettings] }));
  };

  const handleSummarize = async () => {
    if (isLoading || isSummarizing) return;
    setIsSummarizing(true);
    try {
        const summaryResult = await summarizeConversation(messages);
        const summaryMessage: ChatMessage = {
            id: new Date().toISOString() + '-summary',
            role: 'model',
            text: t('chat_summary_title'),
            timestamp: new Date().toISOString(),
            isSummary: true,
            summary: summaryResult,
        };
        addMessage(summaryMessage);
    } catch (error) {
        console.error("Failed to summarize conversation:", error);
        const errorMessage: ChatMessage = {
            id: new Date().toISOString() + 'model-error',
            role: 'model',
            text: t('chat_summary_error'),
            timestamp: new Date().toISOString(),
        };
        addMessage(errorMessage);
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: new Date().toISOString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const response = await processUserPrompt(
          currentInput,
          messages,
          settings,
          stressLogs,
          sleepLogs,
          eventLogs,
          wellnessActivities
        );
        
        if (response) {
          if (response.command === 'LOG_STRESS' && response.payload?.level) {
            addStressLog(response.payload.level);
          } else if (response.command === 'WELLNESS_ACTIVITY' && response.payload?.description) {
            addWellnessActivity(response.payload.description);
          } else if (response.command === 'LOG_SLEEP' && response.payload?.hours) {
            addSleepLog(response.payload.hours);
          } else if (response.command === 'LOG_EVENT' && response.payload?.description) {
            addEventLog(response.payload.description);
          } else if (response.command === 'FIND_PLACES' && response.payload?.query) {
             // Handle Maps Grounding Request
             let location = undefined;
             if (navigator.geolocation) {
                 try {
                     const position: any = await new Promise((resolve, reject) => 
                         navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                     );
                     location = { lat: position.coords.latitude, lng: position.coords.longitude };
                 } catch (e) {
                     console.log("Location access denied or timed out, proceeding without location.");
                 }
             }
             
             const placesResult = await findNearbyPlaces(response.payload.query, location);
             
             const modelMessage: ChatMessage = {
                id: new Date().toISOString() + 'model',
                role: 'model',
                text: placesResult.text,
                timestamp: new Date().toISOString(),
                groundingMetadata: placesResult.groundingMetadata
             };
             addMessage(modelMessage);
             setIsLoading(false);
             return; // Exit early as we've handled the response
          }
          
          const modelMessage: ChatMessage = {
            id: new Date().toISOString() + 'model',
            role: 'model',
            text: response.commentary || "I'm not sure how to respond to that.",
            timestamp: new Date().toISOString(),
            isAnalysis: response.command === 'ANALYZE_BURNOUT',
          };
          addMessage(modelMessage);
        }
    } catch (error) {
        console.error("Failed to process user prompt:", error);
        const errorMessage: ChatMessage = {
        id: new Date().toISOString() + 'model-error',
        role: 'model',
        text: t('chat_error_generic'),
        timestamp: new Date().toISOString(),
        };
        addMessage(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTTS = async (text: string, messageId: string) => {
      if (isPlayingAudio === messageId) {
          // Stop playing if already playing this message
          audioContextRef.current?.close();
          audioContextRef.current = null;
          setIsPlayingAudio(null);
          return;
      }

      // Stop any other current audio
      if (audioContextRef.current) {
          await audioContextRef.current.close();
      }

      setIsPlayingAudio(messageId);
      
      const audioBuffer = await generateSpeech(text);
      if (audioBuffer) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          audioContextRef.current = audioContext;
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.onended = () => {
              setIsPlayingAudio(null);
              audioContext.close();
              audioContextRef.current = null;
          };
          source.start();
      } else {
          setIsPlayingAudio(null);
      }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome/Firefox default
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                  const base64Audio = (reader.result as string).split(',')[1];
                  setIsLoading(true);
                  const transcription = await transcribeAudio(base64Audio, audioBlob.type);
                  setInput(transcription);
                  setIsLoading(false);
              };
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (error) {
          console.error("Error accessing microphone:", error);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const SettingSelect = ({ label, name, value, options }: { label: string; name: keyof ChatSettings; value: string; options: { value: string; label: string }[] }) => (
    <div className="flex items-center gap-2">
      <label htmlFor={name} className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleSettingChange}
        className="py-1 px-2 text-xs sm:text-sm bg-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-border"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${isWidget ? 'bg-transparent' : 'bg-card rounded-2xl shadow-lg'}`}>
      <header className={`flex ${isWidget ? 'flex-row p-5 pt-6 items-center border-b border-white/5 bg-transparent' : 'flex-col sm:flex-row p-4 items-center border-b border-border'} justify-between flex-shrink-0 gap-3 relative`}>
          <div className="flex items-center gap-3 relative z-10">
              <div className={`${isWidget ? 'p-1.5 bg-teal-500/20 rounded-lg text-teal-400' : 'p-2 bg-primary/20 rounded-lg text-primary'}`}>
                  <Bot size={isWidget ? 20 : 24} />
              </div>
              <div>
                  <h3 className={`${isWidget ? 'text-lg' : 'text-xl'} font-bold flex items-center gap-2 text-foreground tracking-tight`}>
                      {t('chat_header')}
                  </h3>
                  {isWidget && <p className="text-[10px] text-teal-400 font-medium tracking-wider uppercase">Online • 24/7 Support</p>}
              </div>
          </div>
          
          {!isWidget ? (
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                <SettingSelect
                label={t('chat_persona')}
                name="personality"
                value={settings.personality}
                options={[
                    { value: 'empathetic', label: t('chat_persona_empathetic') },
                    { value: 'professional', label: t('chat_persona_professional') },
                    { value: 'friendly', label: t('chat_persona_friendly') },
                    { value: 'stoic', label: t('chat_persona_stoic') }
                ]}
                />
                <SettingSelect
                label={t('chat_tone')}
                name="tone"
                value={settings.tone}
                options={[
                    { value: 'casual', label: t('chat_tone_casual') },
                    { value: 'formal', label: t('chat_tone_formal') }
                ]}
                />
                <SettingSelect
                label={t('chat_verbosity')}
                name="verbosity"
                value={settings.verbosity}
                options={[
                    { value: 'concise', label: t('chat_verbosity_concise') },
                    { value: 'balanced', label: t('chat_verbosity_balanced') },
                    { value: 'detailed', label: t('chat_verbosity_detailed') }
                ]}
                />
                <button
                    onClick={handleSummarize}
                    disabled={isLoading || isSummarizing || messages.length < 3}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('chat_summarize')}
                    title={t('chat_summarize')}
                    type="button"
                >
                    {isSummarizing ? <Loader2 className="h-5 w-5 animate-spin"/> : <FileText className="h-5 w-5" />}
                </button>
                <button
                    onClick={handleRefresh}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    aria-label={t('chat_refresh')}
                    title={t('chat_refresh')}
                    type="button"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>
          ) : (
             <div className="flex items-center gap-1 relative z-10">
                <button
                    onClick={handleSummarize}
                    disabled={isLoading || isSummarizing || messages.length < 3}
                    className="p-2 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors disabled:opacity-50"
                    title={t('chat_summarize')}
                    type="button"
                >
                    {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText className="h-4 w-4" />}
                </button>
                <button
                    onClick={handleRefresh}
                    className="p-2 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                    title={t('chat_refresh')}
                    type="button"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
             </div>
          )}
      </header>
      <div className={`flex-1 ${isWidget ? 'p-4 space-y-4' : 'p-6 space-y-6'} overflow-y-auto custom-scrollbar`}>
        {messages.map((msg) => {
          if (msg.isSummary && msg.summary) {
            return (
              <div key={msg.id} className="flex items-start justify-start gap-2 sm:gap-3 animate-fadeIn">
                <div className={`flex-shrink-0 ${isWidget ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-secondary flex items-center justify-center`}>
                  <FileText className={`${isWidget ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-primary`} />
                </div>
                <div className={`max-w-[85%] w-full ${isWidget ? 'p-3' : 'p-4'} rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-md border border-primary/50`}>
                    <h4 className={`font-bold ${isWidget ? 'text-sm' : 'text-lg'} text-foreground mb-2`}>{msg.summary.title}</h4>
                    
                    {msg.summary.keyTakeaways.length > 0 && (
                        <>
                            <h5 className="font-semibold text-muted-foreground mt-2 mb-1 text-xs">{t('chat_summary_takeaways')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {msg.summary.keyTakeaways.map((item, index) => <li key={`takeaway-${index}`}>{item}</li>)}
                            </ul>
                        </>
                    )}

                    {msg.summary.actionItems.length > 0 && (
                        <>
                            <h5 className="font-semibold text-muted-foreground mt-2 mb-1 text-xs">{t('chat_summary_actions')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {msg.summary.actionItems.map((item, index) => <li key={`action-${index}`}>{item}</li>)}
                            </ul>
                        </>
                    )}
                </div>
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex items-start justify-end gap-2 sm:gap-3 animate-fadeIn">
                <div className={`max-w-[85%] ${isWidget ? 'p-3 text-xs' : 'p-3 text-sm'} rounded-2xl bg-primary text-primary-foreground rounded-br-none shadow-md shadow-primary/20`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          }
          if (msg.role === 'model') {
            return (
              <div key={msg.id} className="flex items-start justify-start gap-2 sm:gap-3 animate-fadeIn">
                <div className={`flex-shrink-0 ${isWidget ? 'h-8 w-8' : 'h-8 w-8'} rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg`}>
                  <Bot className={`${isWidget ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                </div>
                <div className={`max-w-[85%] ${isWidget ? 'p-3 text-xs' : 'p-3 text-sm'} rounded-2xl ${isWidget ? 'bg-secondary/40 backdrop-blur-md border border-white/5' : 'bg-secondary'} text-secondary-foreground rounded-bl-none shadow-md group relative`}>
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  
                  {/* Grounding Metadata / Source Links */}
                  {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 gap-2">
                          {msg.groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
                              if (chunk.maps) {
                                  return (
                                      <a 
                                          key={index} 
                                          href={chunk.maps.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-all text-xs border border-white/5"
                                      >
                                          <div className="p-1.5 bg-red-500/10 rounded-full text-red-500 shrink-0">
                                              <MapPin className="h-3 w-3" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="font-semibold truncate">{chunk.maps.title}</p>
                                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                  View on Google Maps <ExternalLink className="h-2 w-2" />
                                              </p>
                                          </div>
                                      </a>
                                  );
                              }
                              return null;
                          })}
                      </div>
                  )}

                  <button 
                    onClick={() => handleTTS(msg.text, msg.id)}
                    className={`absolute -bottom-6 left-0 p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-all ${isPlayingAudio === msg.id ? 'text-primary bg-secondary opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    title="Read Aloud"
                  >
                      {isPlayingAudio === msg.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Volume2 className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}

        {isLoading && (
            <div className="flex items-end justify-start gap-2 sm:gap-3 animate-fadeIn">
                <div className={`flex-shrink-0 ${isWidget ? 'h-8 w-8' : 'h-8 w-8'} rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg`}>
                  <Bot className={`${isWidget ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                </div>
                <div className={`max-w-[85%] ${isWidget ? 'p-3' : 'p-3'} rounded-2xl ${isWidget ? 'bg-secondary/40' : 'bg-secondary'} text-secondary-foreground rounded-bl-none shadow-md`}>
                     <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`${isWidget ? 'p-4 pt-0' : 'p-6 pt-0'} mt-auto`}>
        <div className={`border-t border-white/5 ${isWidget ? 'mb-3' : 'mb-4'}`}></div>
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? "Listening..." : t('chat_placeholder')}
            className={`w-full ${isWidget ? 'py-3 pl-4 pr-10 text-xs bg-slate-900/50 hover:bg-slate-900/70 border-white/10' : 'py-3 pl-4 pr-12 text-sm bg-secondary'} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 border border-transparent ${isRecording ? 'animate-pulse bg-red-500/10' : ''} transition-all shadow-inner`}
            disabled={isLoading || isRecording}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`${isWidget ? 'p-2.5' : 'p-3'} rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : isWidget ? 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            title={isRecording ? "Stop Recording" : "Voice Input"}
            type="button"
          >
              {isRecording ? <StopCircle className={`${isWidget ? 'h-4 w-4' : 'h-5 w-5'}`} /> : <Mic className={`${isWidget ? 'h-4 w-4' : 'h-5 w-5'}`} />}
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`${isWidget ? 'p-2.5' : 'p-3'} rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            aria-label={t('chat_send_aria')}
            type="submit"
          >
            <Send className={`${isWidget ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
