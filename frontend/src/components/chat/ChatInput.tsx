import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface ChatInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  onError?: (error: string) => void;
}

export default function ChatInput({ onSubmit, isLoading, onError }: ChatInputProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery(""); // Clear after sending
    }
  };

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const stopRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startWhisperRecording = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all mic tracks
        stream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 100) {
          setIsListening(false);
          return;
        }

        // Convert to base64 and send to Whisper backend
        setQuery("Transcribing...");
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(audioBlob);
          const base64Data = await base64Promise;

          const { transcribeAudio } = await import('../../lib/api');
          const result = await transcribeAudio(base64Data);
          const transcript = result.transcript?.trim();

          if (transcript) {
            setQuery(transcript);
            setTimeout(() => {
              onSubmit(transcript);
              setQuery("");
            }, 300);
          } else {
            setQuery("");
            if (onError) onError("No speech was detected. Please try again and speak clearly.");
          }
        } catch (err) {
          console.error("Whisper transcription failed", err);
          setQuery("");
          if (onError) onError("Voice transcription failed. Please try again or type your message.");
        } finally {
          setIsListening(false);
        }
      };

      mediaRecorder.onerror = () => {
        stream.getTracks().forEach(t => t.stop());
        setIsListening(false);
        if (onError) onError("Audio recording failed. Please check microphone permissions.");
      };

      mediaRecorder.start();
      
      // Auto-stop after 15 seconds to avoid excessively long recordings
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 15000);

    } catch (err: any) {
      setIsListening(false);
      if (err.name === 'NotAllowedError') {
        if (onError) onError("Microphone access was denied. Please allow microphone permissions in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        if (onError) onError("No microphone was found. Please ensure a microphone is connected.");
      } else {
        if (onError) onError("Could not access microphone. Please check your browser settings.");
      }
    }
  }, [onSubmit, onError]);

  const toggleListen = () => {
    if (isListening) {
      stopRecording();
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    startWhisperRecording();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="glass-floating rounded-xl p-2 flex items-center gap-2 shadow-2xl focus-within:border-primary transition-colors duration-300">
        <button 
          type="button" 
          onClick={toggleListen}
          className={`p-3 transition-colors ${isListening ? 'text-error animate-pulse' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined">mic</span>
        </button>
        
        <input 
          className="flex-grow bg-transparent border-none outline-none text-on-surface placeholder-on-surface-variant/50 focus:ring-0 font-body-md text-body-md" 
          placeholder={isListening ? "Listening..." : "Ask AI to plan your trip to anywhere..."}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading || isListening}
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="p-3 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="material-symbols-outlined">send</span>}
        </button>
      </form>
      
      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 backdrop-blur-xl bg-surface-container/80 rounded-t-xl shadow-xl">
        <a className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transform scale-90 duration-200" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="font-label-md text-label-md mt-1">Explore</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 rounded-full px-4 py-1 transition-colors" href="#">
          <span className="material-symbols-outlined">event_note</span>
          <span className="font-label-md text-label-md mt-1">Itinerary</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 rounded-full px-4 py-1 transition-colors" href="#">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-label-md text-label-md mt-1">Budget</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 rounded-full px-4 py-1 transition-colors" href="#">
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="font-label-md text-label-md mt-1">Concierge</span>
        </a>
      </nav>
    </>
  );
}
