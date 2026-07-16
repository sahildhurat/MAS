import React from 'react';
import ActivityCard, { ActivityCardProps } from './ActivityCard';

export interface DayTimelineProps {
  dayTitle: string;
  date: string;
  activities: ActivityCardProps[];
}

export default function DayTimeline({ dayTitle, date, activities }: DayTimelineProps) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-end mb-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-sm">
            {dayTitle}
            <button className="glass-floating rounded-full p-2 text-primary hover:text-primary-container transition-colors shadow-lg group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">mic</span>
            </button>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{date}</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
            AI Optimized
          </span>
        </div>
      </div>
      
      <div className="glass-panel rounded-xl p-md sm:p-lg relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[39px] sm:left-[55px] top-lg bottom-lg w-[2px] bg-outline-variant"></div>
        
        {activities.map((activity, idx) => (
          <ActivityCard key={idx} {...activity} />
        ))}
      </div>
    </div>
  );
}
