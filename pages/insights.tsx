import React from 'react';
import Layout from '../components/Layout';

export default function InsightsPage() {
  const sampleQuestions = [
    "How can I stay consistent with my morning routine?",
    "Give me a tip for better focus.",
    "What are my recent learning wins?",
    "How do I build better study habits?",
    "What's the best way to stay motivated?",
    "How can I improve my productivity?"
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Insights</h1>
        <p className="text-gray-600 mb-8">Your AI companion for learning and growth</p>
        
        {/* Ask AI */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">💬 Ask AI</h2>
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <textarea 
              className="w-full border-none resize-none focus:outline-none text-gray-400" 
              placeholder="Ask me anything about your learning journey..."
              rows={3}
              disabled
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQuestions.map((question, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm">
                <span className="font-medium">💭 </span>
                {question}
              </div>
            ))}
          </div>
        </section>
        
        {/* Log Notes */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">✍️ Log Notes</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <textarea 
              className="w-full border-none resize-none focus:outline-none text-gray-400" 
              placeholder="Start your thoughts... What did you learn today?"
              rows={4}
              disabled
            />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            📝 Quick note: This will help track your learning insights and progress
          </div>
        </section>
        
        {/* Motivation */}
        <section>
          <h2 className="text-lg font-semibold mb-4">💡 Motivation</h2>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-800 mb-2">
              &quot;Discipline &gt; Motivation&quot;
            </div>
            <div className="text-sm text-purple-600">
              Small consistent actions lead to big results
            </div>
          </div>
          <div className="mt-4 text-center text-gray-500 text-sm">
            ✨ More personalized motivation coming soon
          </div>
        </section>
      </div>
    </Layout>
  );
} 