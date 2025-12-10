// In TopicPage.jsx

// 1. Remove the old LearningNavigator component and its related state/functions
//    (e.g., remove `learningPath`, `handleStartLearning`, `LearningNavigator`)

// 2. Import the new component
import React, { useState } from 'react'
import AskAI from './AskAI'
import LearningPathGenerator from './LearningPathGenerator';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// ... other imports

const LEARNING_PATH_CACHE_KEY = 'learningPathCache';

const TopicPage = () => {
  const { topicName } = useParams();
  const formattedTopicName = topicName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Assume you have access to the current user's ID
  const currentUserId = 'user-123-abc'; // Replace with actual user ID from auth context

  const [learningPathContent, setLearningPathContent] = useState(() => {
    const cache = JSON.parse(localStorage.getItem(LEARNING_PATH_CACHE_KEY) || '{}');
    const cachedItem = cache[topicName];
    if (cachedItem && cachedItem.expire && cachedItem.expire > Date.now()) {
      return cachedItem.content;
    }
    return '';
  });

  const handleLearningPathGenerated = (content) => {
    const cache = JSON.parse(localStorage.getItem(LEARNING_PATH_CACHE_KEY) || '{}');
    const now = Date.now();
    const expireTime = now + 60 * 60 * 1000; // 1 hour
    cache[topicName] = { content, expire: expireTime };
    localStorage.setItem(LEARNING_PATH_CACHE_KEY, JSON.stringify(cache));
    setLearningPathContent(content);
  };

  const handleClearLearningPath = () => {
    const cache = JSON.parse(localStorage.getItem(LEARNING_PATH_CACHE_KEY) || '{}');
    delete cache[topicName];
    localStorage.setItem(LEARNING_PATH_CACHE_KEY, JSON.stringify(cache));
    setLearningPathContent('');
  };

  // ... other existing state and functions for quiz, etc. ...

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {learningPathContent ? (
          <div className="space-y-8">
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-800">
              <AskAI userId={currentUserId} topic={formattedTopicName} />
              <h2 className="text-2xl font-bold text-slate-100 mb-4 mt-2">Your Personalized Learning Path</h2>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  children={learningPathContent}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          children={String(children).replace(/\n$/, "")}
                          style={vscDarkPlus}
                          language={match}
                          PreTag="div"
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-semibold mt-6 mb-3 border-b pb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="leading-relaxed my-4" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-8 my-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-8 my-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="my-2" {...props} />
                    ),
                  }}
                />
              </div>
              <button onClick={handleClearLearningPath} className="mt-6 px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg">Start Over</button>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-8">
              <div className="py-20 px-6 text-center bg-slate-800/50 rounded-xl shadow-lg border border-slate-800">
                <h3 className="text-2xl font-bold text-slate-100 mb-2">Start Your Journey</h3>
                <p className="text-slate-400">Use the panel on the right to generate a personalized learning path for {formattedTopicName}.</p>
              </div>
            </div>
            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              <LearningPathGenerator topicName={formattedTopicName} userId={currentUserId} onLearningPathGenerated={handleLearningPathGenerated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPage;