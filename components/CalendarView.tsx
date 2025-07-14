import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const dummyCompletions: Record<string, boolean> = {
  '2024-07-01': true,
  '2024-07-02': false,
  '2024-07-03': true,
  '2024-07-04': true,
  '2024-07-05': false,
};

function tileContent({ date, view }: { date: Date; view: string }) {
  if (view === 'month') {
    const key = date.toISOString().slice(0, 10);
    if (key in dummyCompletions) {
      return (
        <span className={`ml-1 text-xs font-bold ${dummyCompletions[key] ? 'text-green-500' : 'text-red-500'}`}>
          {dummyCompletions[key] ? '✔️' : '❌'}
        </span>
      );
    }
  }
  return null;
}

export default function CalendarView() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
      <Calendar
        tileContent={tileContent}
        className="w-full rounded-lg border border-gray-200"
      />
      <div className="mt-4 text-gray-500 text-sm">(Future: event dots, click-to-expand, etc.)</div>
    </div>
  );
} 