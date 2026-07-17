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

  const recognitionRef = React.useRef<any>(null);
  const retryCountRef = React.useRef(0);
  const MAX_RETRIES = 2;

  const startRecognition = React.useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = "Speech recognition is not supported in this browser. Please use Chrome or Edge.";
      if (onError) onError(msg);
      else alert(msg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      retryCountRef.current = 0;
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Auto-submit voice query after a short delay to feel natural
      setTimeout(() => {
        onSubmit(transcript);
        setQuery("");
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      
      if (event.error === 'aborted') {
        // User or system cancelled — not a real error
        return;
      }
      
      if (event.error === 'network' && retryCountRef.current < MAX_RETRIES) {
        // Chrome's SpeechRecognition can throw transient network errors — retry
        retryCountRef.current++;
        console.warn(`Retrying speech recognition (attempt ${retryCountRef.current}/${MAX_RETRIES})...`);
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              setIsListening(false);
              retryCountRef.current = 0;
            }
          }
        }, 500);
        return;
      }
      
      setIsListening(false);
      retryCountRef.current = 0;

      let errorMsg: string;
      switch (event.error) {
        case 'not-allowed':
          errorMsg = "Microphone access was denied. Please allow microphone permissions in your browser settings.";
          break;
        case 'network':
          errorMsg = "Could not reach speech recognition service. Please check your internet connection and try again.";
          break;
        case 'no-speech':
          errorMsg = "No speech was detected. Please try again and speak clearly.";
          break;
        case 'audio-capture':
          errorMsg = "No microphone was found. Please ensure a microphone is connected.";
          break;
        default:
          errorMsg = `Microphone error: ${event.error}. Please ensure microphone permissions are granted.`;
      }
      
      if (onError) {
        onError(errorMsg);
      }
    };

    recognition.onend = () => {
      // Only reset listening if we're not retrying
      if (retryCountRef.current === 0) {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition", e);
      setIsListening(false);
      retryCountRef.current = 0;
    }
  }, [onSubmit, onError]);

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      retryCountRef.current = 0;
      return;
    }
    
    setIsListening(true);
    retryCountRef.current = 0;
    startRecognition();
  };

  return (
    <>
      <div className="fixed bottom-[88px] md:bottom-md left-0 right-0 px-margin-mobile md:px-margin-desktop z-40 max-w-[800px] mx-auto pointer-events-none">
        <form onSubmit={handleSubmit} className="glass-floating rounded-xl p-2 flex items-center gap-2 pointer-events-auto shadow-2xl focus-within:border-primary transition-colors duration-300">
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
      </div>
      
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
