
import { useState, useRef, useEffect, useCallback } from 'react';

type Status = 'idle' | 'permission_denied' | 'analyzing' | 'complete';

const ANALYSIS_DURATION = 4000; // 4 seconds for analysis

export const useRealtimeStress = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [stressLevel, setStressLevel] = useState(0);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const analysisTimeoutRef = useRef<number | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    const cleanup = useCallback(() => {
        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
            analysisTimeoutRef.current = null;
        }
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
            audioContextRef.current = null;
        }
    }, []);

    const startMonitoring = useCallback(async () => {
        cleanup();
        setStressLevel(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            
            source.connect(analyser);

            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            
            setStatus('analyzing');
            
            const stressReadings: number[] = [];

            const analysisLoop = () => {
                if (analyserRef.current && dataArrayRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                    
                    // Calculate average volume
                    const averageVolume = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
                    
                    // Increased sensitivity formula:
                    // Using a divisor of 45 (instead of 120) maps normal speech volume (~20-30) 
                    // to the 45-65 range (Moderate Stress), and loud speech to High Stress.
                    let calculatedStress = (averageVolume / 45) * 100;

                    // Baseline adjustment: If there is clear audio activity (speech),
                    // ensure we don't drop below a 'focus' threshold of 35.
                    if (averageVolume > 8) {
                        calculatedStress = Math.max(calculatedStress, 35);
                    }

                    // Clamp to 0-100
                    calculatedStress = Math.max(0, Math.min(100, calculatedStress));

                    stressReadings.push(calculatedStress);

                    // Smooth transition
                    setStressLevel(prev => prev * 0.85 + calculatedStress * 0.15);
                    animationFrameIdRef.current = requestAnimationFrame(analysisLoop);
                }
            };
            
            animationFrameIdRef.current = requestAnimationFrame(analysisLoop);

            analysisTimeoutRef.current = window.setTimeout(() => {
                cleanup();
                
                if (stressReadings.length > 0) {
                    // Calculate final result based on the average of readings
                    const avgStress = stressReadings.reduce((sum, val) => sum + val, 0) / stressReadings.length;
                    setStressLevel(avgStress);
                } else {
                    setStressLevel(0);
                }

                setStatus('complete');
            }, ANALYSIS_DURATION);

        } catch (error) {
            console.error("Microphone access denied:", error);
            setStatus('permission_denied');
            cleanup();
        }
    }, [cleanup]);

    const resetMonitoring = useCallback(() => {
        cleanup();
        setStatus('idle');
        setStressLevel(0);
    }, [cleanup]);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        status,
        stressLevel,
        startMonitoring,
        stopMonitoring: resetMonitoring,
    };
};
