import React from 'react';
import DayTimeline, { DayTimelineProps } from './DayTimeline';

export interface ItineraryCardProps {
  days: DayTimelineProps[];
}

export default function ItineraryCard({ days }: ItineraryCardProps) {
  if (!days || days.length === 0) return null;
  
  return (
    <div className="lg:col-span-8 flex flex-col gap-lg">
      {days.map((day, idx) => (
        <DayTimeline key={idx} {...day} />
      ))}
    </div>
  );
}
