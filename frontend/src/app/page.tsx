'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/layout/Hero';
import ChatInput from '../components/chat/ChatInput';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import BudgetSummary, { BudgetCategory } from '../components/budget/BudgetSummary';
import { planTripStream } from '../lib/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [itineraryDays, setItineraryDays] = useState<any[]>([]);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState<string>("");
  const [currentDestination, setCurrentDestination] = useState<string>("");

  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const ws = React.useRef<WebSocket | null>(null);
  const latestQuery = React.useRef<string>("");

  // Auto-dismiss error toast after 8 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(timer);
  }, [error]);

  // Connect to the WebSocket on mount for global chatbot functionality
  function generateDashboard(query: string) {
    setIsLoading(true);
    setError(null);
    setStreamProgress("Starting AI planning...");
    
    planTripStream(query, (event, data) => {
      if (event === "agent_started") {
        setStreamProgress(`Agent started: ${data.agent.replace('_', ' ')}...`);
      } else if (event === "agent_completed") {
        setStreamProgress(`Agent completed: ${data.agent.replace('_', ' ')}...`);
      } else if (event === "error") {
        setError(data.error || "An error occurred.");
        setIsLoading(false);
      } else if (event === "complete") {
        const response = data.data;
        if (response && response.itinerary) {
          const days = response.itinerary.days?.map((day: any) => ({
            dayTitle: `Day ${day.day_number || day.day}: ${day.theme}`,
            date: new Date(day.date || Date.now()).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
            activities: day.activities?.map((act: any) => ({
              time: act.time,
              icon: 'explore',
              title: act.title,
              description: act.description,
              cost: act.estimated_cost_usd || 0,
              crowdLevel: act.crowd_level || act.crowd_level_estimate || 'Low',
              imageSrc: act.image_url || 'https://via.placeholder.com/150'
            })) || []
          })) || [];
          
          setItineraryDays(days);
          
          const backendTotal = response.itinerary.total_cost_usd || response.itinerary.total_estimated_cost_usd || 0;
          setBudgetTotal(backendTotal);
          
          const categories = [
            { name: "Dining", icon: "restaurant", allocated: backendTotal * 0.3, spent: backendTotal * 0.2 },
            { name: "Activities", icon: "attractions", allocated: backendTotal * 0.5, spent: backendTotal * 0.45 },
            { name: "Transport", icon: "directions_car", allocated: backendTotal * 0.2, spent: backendTotal * 0.1 },
          ];
          
          setBudgetCategories(categories);
          setHasData(true);
        }
        
        if (response && response.travel_request) {
          setCurrentDestination(response.travel_request.destination);
        }
      }
    }, (err) => {
      console.error(err);
      setError("An error occurred while planning your trip. The AI might have timed out.");
      setIsLoading(false);
    }, () => {
      setIsLoading(false);
    });
  };

  React.useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isMounted = true;
    const sessionId = Math.random().toString(36).substring(7);
    
    const connect = () => {
      if (!isMounted) return;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsUrl = apiUrl.replace(/^http/, 'ws') + `/ws/v1/voice/${sessionId}`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.response) {
          // Add AI response to chat history
          setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
          
          // Play the response audio via Browser native TTS
          const utterance = new SpeechSynthesisUtterance(data.response);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
          
          // If the AI determined this is a trip planning request, trigger the heavy background task
          if (data.trigger_planner) {
            generateDashboard(latestQuery.current);
          }
        } else if (data.error) {
          setError(data.error);
        }
      };

      ws.current.onclose = () => {
        if (isMounted) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.current.onerror = (event) => {
        console.error("WebSocket error", event);
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, []); // Run once on mount

  const handleUserInput = (query: string) => {
    if (!query.trim()) return;
    
    // 1. Add user message to UI
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    latestQuery.current = query;
    setError(null);
    
    // 2. Send via WebSocket to get instant AI reply + intent routing
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        question: query,
        itinerary: hasData ? itineraryDays : null,
        destination: currentDestination
      }));
    } else if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      setError("Chat server is connecting, please try again in a moment.");
    } else {
      setError("Chat server is not connected.");
    }
  };


  return (
    <>
      <Header />
      <main className="flex-grow pt-24 md:pt-32 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <Hero />
        
        {error && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-lg p-4 bg-error-container text-on-error-container rounded-xl border border-error shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <p className="font-body-md">{error}</p>
            <button onClick={() => setError(null)} className="flex-shrink-0 p-1 rounded-full hover:bg-error/20 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 opacity-70">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-headline-md text-primary animate-pulse">LuxeTravel AI is crafting your bespoke experience...</p>
            <p className="text-on-surface-variant mt-2 max-w-md text-center">{streamProgress || "We are optimizing routes, checking VIP reservations, and verifying exclusive access for you. This might take up to 2 minutes."}</p>
          </div>
        )}
        
        {hasData && !isLoading && (
          <>
            <ItineraryCard days={itineraryDays} />
            <BudgetSummary totalAllocated={budgetTotal} categories={budgetCategories} />
          </>
        )}
      </main>
      
      {/* Floating Chat Transcript */}
      {chatHistory.length > 0 && (
        <div className="fixed bottom-[160px] md:bottom-[100px] left-0 right-0 px-margin-mobile md:px-margin-desktop z-30 max-w-[800px] mx-auto pointer-events-none">
          <div className="bg-surface-container/90 backdrop-blur-md rounded-xl p-4 max-h-[300px] overflow-y-auto shadow-lg pointer-events-auto flex flex-col gap-3 scrollbar-hide">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-variant text-on-surface-variant rounded-bl-sm'}`}>
                  <p className="font-body-md">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChatInput onSubmit={handleUserInput} isLoading={isLoading} onError={setError} />
    </>
  );
}
