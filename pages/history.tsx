import React from 'react';
import Head from 'next/head';
import HabitHistory from '../components/HabitHistory';
import Link from 'next/link';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>History - SmartShelf</title>
      </Head>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Habit History</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        <HabitHistory />
      </main>
    </div>
  );
} 