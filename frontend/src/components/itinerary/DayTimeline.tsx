import React from 'react';
import ActivityCard, { ActivityCardProps } from './ActivityCard';

export interface DayTimelineProps {
  dayTitle: string;
  date: string;
  activities: ActivityCardProps[];
  dailyCostInr?: number;
  transportNotes?: string;
}

export default function DayTimeline({ dayTitle, date, activities, dailyCostInr, transportNotes }: DayTimelineProps) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-end mb-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-sm">
            {dayTitle}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{date}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {dailyCostInr !== undefined && dailyCostInr > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary-fixed/20 text-secondary-fixed border border-secondary-fixed/30">
              ₹{dailyCostInr.toLocaleString('en-IN')} / day
            </span>
          )}
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

        {/* Transport Notes Footer */}
        {transportNotes && (
          <div className="mt-2 pt-4 border-t border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">directions_bus</span>
            <div>
              <p className="font-label-sm text-primary uppercase tracking-wider mb-1">Getting Around</p>
              <p className="font-body-md text-on-surface-variant text-sm">{transportNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
