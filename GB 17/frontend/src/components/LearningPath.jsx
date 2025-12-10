import React, { useState } from 'react';
import axios from 'axios';

// Assume you get userId from your auth context or props
const LearningPath = ({ userId }) => {
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    const [learningPath, setLearningPath] = useState(null); // To store the generated path
    const [isLoading, setIsLoading] = useState(false);

    const handleStartLearning = async () => {
        if (!goal || !level) {
            alert('Please select a goal and your level.');
            return;
        }

        setIsLoading(true);
        setLearningPath(null); // Clear previous results

        try {
            // Call your backend endpoint
            const response = await axios.post('/api/gemini/generate', {
                userId: userId,
                contentType: 'learning_path',
                details: {
                    goal: goal,
                    level: level,
                    topic: 'Arrays' // You can pass the current page topic for context
                }
            });

            // Update state with the content from the API
            setLearningPath(response.data.content);

        } catch (error) {
            console.error("Error generating learning path:", error);
            // You can set an error message in state to show the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="learning-path-container">
            <h3>Your Learning Path</h3>
            
            {/* Your Goal Dropdown */}
            <select value={goal} onChange={(e) => setGoal(e.target.value)} disabled={isLoading}>
                <option value="">Select a goal</option>
                <option value="ace_interviews">Ace Technical Interviews</option>
                <option value="master_basics">Master the Basics</option>
            </select>

            {/* Your Level Dropdown */}
            <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={isLoading}>
                <option value="">Select your level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>

            {/* Start Learning Button */}
            <button onClick={handleStartLearning} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Start Learning'}
            </button>
            
            {/* Display the generated path */}
            {learningPath && (
                <div className="generated-path-display">
                   {/* You'll want to parse and render the path here. 
                       Using a markdown renderer is recommended. */}
                   <p>{learningPath}</p>
                </div>
            )}
        </div>
    );
};

export default LearningPath;