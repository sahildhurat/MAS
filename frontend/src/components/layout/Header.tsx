'use client';

import React, { useState, useEffect } from 'react';

export default function Header() {
  const [activeSection, setActiveSection] = useState('explore');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['explore', 'itinerary', 'budget', 'concierge'];
      
      // Find the current section in view
      let current = 'explore';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the element is within the top half of the screen
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLinkClasses = (section: string) => {
    const isActive = activeSection === section;
    const baseClasses = "font-label-md text-label-md transition-colors transform active:scale-95 duration-150 flex items-center gap-2";
    if (isActive) {
      return `${baseClasses} text-primary font-bold`;
    }
    return `${baseClasses} text-on-surface-variant hover:text-primary-container`;
  };

  return (
    <>
      {/* TopAppBar (Web) */}
      <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-margin-desktop py-4 backdrop-blur-md bg-surface/70">
        <div className="font-display-lg text-display-lg text-primary tracking-tighter">LuxeTravel AI</div>
        <nav className="flex gap-8">
          <a href="#explore" className={getLinkClasses('explore')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
            Explore
          </a>
          <a href="#itinerary" className={getLinkClasses('itinerary')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSection === 'itinerary' ? "'FILL' 1" : "" }}>event_note</span>
            Itinerary
          </a>
          <a href="#budget" className={getLinkClasses('budget')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSection === 'budget' ? "'FILL' 1" : "" }}>account_balance_wallet</span>
            Budget
          </a>
          <a href="#concierge" className={getLinkClasses('concierge')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSection === 'concierge' ? "'FILL' 1" : "" }}>smart_toy</span>
            Concierge
          </a>
        </nav>
        <div className="flex gap-4 text-primary">
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">settings</span></button>
        </div>
      </header>
      
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile py-4 backdrop-blur-md bg-surface/70">
        <div className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter">LuxeTravel AI</div>
        <div className="flex gap-4 text-primary">
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">settings</span></button>
        </div>
      </header>
    </>
  );
}
