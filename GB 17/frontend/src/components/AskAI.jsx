import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// The topic prop is important for context!
// Assume userId is passed down from a parent component or context
const AskAI = ({ userId, topic }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAskQuestion = async (e) => {
        e.preventDefault(); // Prevent form from reloading the page
        if (!question.trim()) return;

        setIsLoading(true);
        setAnswer('');

        try {
            // Call your backend endpoint
            const response = await axios.post('/api/gemini/generate', {
                userId: userId,
                contentType: 'question_answer',
                details: {
                    question: question,
                    context: topic // Sending context leads to better answers!
                }
            });

            setAnswer(response.data.content);

        } catch (error) {
            console.error("Error asking AI:", error);
            setAnswer("Sorry, I couldn't get an answer. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 py-8 px-6">
            <div className="flex items-center mb-4">
                <BrainCircuit className="w-8 h-8 text-cyan-400 mr-4" />
                <h2 className="text-2xl font-bold text-slate-100">Ask AI</h2>
            </div>
            <form onSubmit={handleAskQuestion}>
                <div className="relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={`Ask a question about ${topic}...`}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-cyan-400 disabled:text-slate-600"
                        disabled={isLoading}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Display loading state or the answer from the AI */}
            {isLoading && <p className="mt-4 text-slate-300">Generating answer...</p>}
            {answer && !isLoading && (
                <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            children={answer}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            children={String(children).replace(/\n$/, "")}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        />
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AskAI;
