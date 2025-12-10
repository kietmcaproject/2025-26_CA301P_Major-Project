import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AskAI from './AskAI';

const LearningPathGenerator = ({ topicName, userId, onLearningPathGenerated }) => {
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    // This component will now have its own internal state for the generated content
    // to decide whether to show the form or the content + AskAI
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateBlog = async () => {
        if (!goal || !level) {
            toast.info('Please select both a goal and your level.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`http://localhost:8000/gemini/learningpath/${topicName}/${level}/${goal}`);
            console.log(response)
            onLearningPathGenerated(response.data.geminiData); // Notify parent
        } catch (error) {
            console.error('Error generating blog:', error);
            onLearningPathGenerated('Sorry, there was an error generating the content.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAgain = () => {
        // This will be handled by the parent's "Start Over" button now
        // which clears the content and causes this component to re-render in its initial state.
    };

    if (isLoading) {
        return (
            <div className="bg-slate-800/50 px-6 py-10 rounded-xl shadow-lg border border-slate-800 text-center">
                <p className="text-slate-300">Generating your personalized learning path...</p>
                <div className="mt-4 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col">

            <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Learning Path</h2>
            <select onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 mb-4 text-white">
                <option value="">Select a goal</option>
                <option value="ace technical interviews">Ace Technical Interviews</option>
                <option value="master the basics">Master the Basics</option>
            </select>
            <select onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 mb-4 text-white">
                <option value="">Select your level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
            </select>
            <button 
                onClick={handleGenerateBlog} 
                className="w-full cursor-pointer px-6 py-3 font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg"
            >
                Start Learning
            </button>
        </div>
    );
};

export default LearningPathGenerator;