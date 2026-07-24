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
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [logisticsData, setLogisticsData] = useState<any>(null);
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
          setItineraryData(response.itinerary);
          setBudgetData(response.budget);
          setLogisticsData(response.logistics);
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
          utterance.lang = 'en-US';
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
        itinerary: hasData ? itineraryData : null,
        destination: currentDestination,
        chat_history: chatHistory // Send the existing history (before adding current query) so AI knows context
      }));
    } else if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      setError("Chat server is connecting, please try again in a moment.");
    } else {
      setError("Chat server is not connected.");
    }
  };

  // Transform itinerary data for display
  const itineraryDays = itineraryData?.days?.map((day: any) => ({
    dayTitle: `Day ${day.day_number || day.day}: ${day.theme}`,
    date: day.date ? new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : `Day ${day.day_number}`,
    dailyCostInr: day.daily_cost_inr || 0,
    transportNotes: day.transport_notes || '',
    activities: [
      ...(day.activities?.map((act: any) => ({
        time: act.time,
        icon: getCategoryIcon(act.category),
        title: act.title,
        description: act.description,
        cost: act.estimated_cost_inr || 0,
        crowdLevel: act.crowd_level || 'Low',
        duration: act.duration_minutes || 0,
        tips: act.tips || [],
        location: act.location || '',
        isMeal: false
      })) || []),
      ...(day.meals?.map((meal: any) => ({
        time: meal.time,
        icon: 'restaurant',
        title: meal.title,
        description: meal.description,
        cost: meal.estimated_cost_inr || 0,
        crowdLevel: meal.crowd_level || 'Low',
        duration: meal.duration_minutes || 0,
        tips: meal.tips || [],
        location: meal.location || '',
        isMeal: true
      })) || [])
    ].sort((a: any, b: any) => {
      // Sort by time string
      const timeA = a.time?.replace(/[^0-9:]/g, '') || '';
      const timeB = b.time?.replace(/[^0-9:]/g, '') || '';
      return timeA.localeCompare(timeB);
    })
  })) || [];

  // Transform budget data for display
  const budgetCategories: BudgetCategory[] = budgetData?.categories?.map((cat: any) => ({
    name: cat.category,
    icon: getBudgetIcon(cat.category),
    allocated: cat.allocated_inr || 0,
    estimated: cat.estimated_inr || 0,
    notes: cat.notes || ''
  })) || [];

  const budgetTotal = budgetData?.total_budget_inr || 0;
  const budgetEstimated = budgetData?.total_estimated_inr || 0;
  const budgetWarnings = budgetData?.warnings || [];
  const budgetSuggestions = budgetData?.suggestions || [];
  const withinBudget = budgetData?.within_budget ?? true;

  return (
    <>
      <Header />
      <main className="flex-grow pt-24 md:pt-32 px-margin-mobile md:px-margin-desktop md:pr-[400px] lg:pr-[440px] max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div id="explore" className="col-span-full">
          <Hero destination={currentDestination} hasData={hasData} itineraryTitle={itineraryData?.title} itinerarySummary={itineraryData?.summary} />
        </div>
        
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
            {/* Accommodation Card */}
            {itineraryData?.accommodation && (
              <div className="col-span-full glass-panel rounded-xl p-lg mb-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">hotel</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-on-surface">{itineraryData.accommodation.name}</h3>
                    <p className="font-body-md text-on-surface-variant">{itineraryData.accommodation.neighborhood}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="font-headline-md text-secondary-fixed">₹{itineraryData.accommodation.total_cost_inr?.toLocaleString('en-IN')}</span>
                    <p className="font-label-sm text-on-surface-variant">total stay</p>
                  </div>
                </div>
                {itineraryData.accommodation.notes && (
                  <p className="font-body-md text-on-surface-variant">{itineraryData.accommodation.notes}</p>
                )}
              </div>
            )}

            <div id="itinerary" className="col-span-full">
              <ItineraryCard days={itineraryDays} />
            </div>
            <div id="budget" className="col-span-full">
              <BudgetSummary
              totalAllocated={budgetTotal}
              totalEstimated={budgetEstimated}
              categories={budgetCategories}
              warnings={budgetWarnings}
              suggestions={budgetSuggestions}
              withinBudget={withinBudget}
              destination={currentDestination}
              onBudgetUpdate={(category, newAmount) => {
                handleUserInput(`I want to adjust my budget for ${category} to ₹${newAmount}. Please update the recommendations accordingly.`);
              }}
            />
            </div>

            {/* General Tips */}
            {itineraryData?.general_tips && itineraryData.general_tips.length > 0 && (
              <div className="lg:col-span-12 glass-panel rounded-xl p-lg mt-2">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  Travel Tips
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {itineraryData.general_tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-variant/20">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">lightbulb</span>
                      <p className="font-body-md text-on-surface-variant">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Right-side Chat Panel (desktop) / Bottom sheet (mobile) */}
      <aside id="concierge" className={`
        fixed z-30
        bottom-0 left-0 right-0
        md:top-24 md:bottom-0 md:left-auto md:right-0 md:w-[380px] lg:w-[420px]
        flex flex-col
        pointer-events-none
      `}>
        {/* Chat messages */}
        {chatHistory.length > 0 && (
          <div className="flex-1 overflow-hidden pointer-events-auto hidden md:flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide bg-surface-container/80 backdrop-blur-xl border-l border-outline-variant/30">
              <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/30 mb-1">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
                <h3 className="font-headline-md text-on-surface">AI Concierge</h3>
              </div>
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

        {/* Mobile-only floating chat bubbles */}
        {chatHistory.length > 0 && (
          <div className="md:hidden px-margin-mobile pb-2 pointer-events-none">
            <div className="bg-surface-container/90 backdrop-blur-md rounded-xl p-4 max-h-[200px] overflow-y-auto shadow-lg pointer-events-auto flex flex-col gap-3 scrollbar-hide">
              {chatHistory.slice(-3).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-variant text-on-surface-variant rounded-bl-sm'}`}>
                    <p className="font-body-md">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat input — pinned to bottom of the panel */}
        <div className="pointer-events-auto p-3 md:border-l md:border-t border-outline-variant/30 bg-surface-container/80 md:backdrop-blur-xl">
          <ChatInput onSubmit={handleUserInput} isLoading={isLoading} onError={setError} />
        </div>
      </aside>
    </>
  );
}

function getCategoryIcon(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('meal')) return 'restaurant';
  if (lower.includes('culture') || lower.includes('museum') || lower.includes('heritage') || lower.includes('temple')) return 'museum';
  if (lower.includes('shopping') || lower.includes('market')) return 'shopping_bag';
  if (lower.includes('nature') || lower.includes('park') || lower.includes('beach') || lower.includes('garden')) return 'park';
  if (lower.includes('nightlife') || lower.includes('bar') || lower.includes('club')) return 'nightlife';
  if (lower.includes('adventure') || lower.includes('sport')) return 'hiking';
  if (lower.includes('relaxation') || lower.includes('spa') || lower.includes('wellness')) return 'spa';
  if (lower.includes('transport') || lower.includes('travel')) return 'directions_car';
  if (lower.includes('sightseeing') || lower.includes('landmark')) return 'photo_camera';
  return 'explore';
}

function getBudgetIcon(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('food') || lower.includes('dining') || lower.includes('meal')) return 'restaurant';
  if (lower.includes('accommod') || lower.includes('hotel') || lower.includes('stay')) return 'hotel';
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('flight')) return 'directions_car';
  if (lower.includes('activit') || lower.includes('sightseeing') || lower.includes('entertain')) return 'attractions';
  if (lower.includes('buffer') || lower.includes('misc') || lower.includes('emergency')) return 'savings';
  if (lower.includes('shopping')) return 'shopping_bag';
  return 'payments';
}
