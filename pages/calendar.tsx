import React from 'react';
import Head from 'next/head';
import CalendarView from '../modules/habits/components/CalendarView';
import Link from 'next/link';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Calendar View - SmartShelf</title>
      </Head>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Calendar View</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        <CalendarView />
      </main>
    </div>
  );
} 