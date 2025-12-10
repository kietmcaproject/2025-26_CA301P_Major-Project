import Editorial from './pages/Editorial';
import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar';
import HomePage from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Explore from './pages/Explore'
import Problems from './pages/Problems'
import ProblemSolvePage from './pages/ProblemSolvePage'
import Topics from './components/Topics';
import TopicPage from './components/TopicPage';
import ProfilePage from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Submission from './pages/Submission';
import ChatBot from './components/Chatbot/chatbot';


// Placeholder components for pages to be created
const Playground = () => <div className="text-center text-white text-2xl pt-10">Playground</div>;
const Leaderboard = () => <div className="text-center text-white text-2xl pt-10">Leaderboard</div>;

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Navbar />
      <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/explore" element={<Explore />} /> */}
            <Route path="/problems" element={<Problems />} />
            <Route path="/problemsolve/:id" element={<ProblemSolvePage />} />
            {/* <Route path="/editorial/:id" element={<Editorial />} /> */}
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:topicName" element={<TopicPage />} />
            {/* <Route path="/playground" element={<Playground />} /> */}
            {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path='/submission' element={<Submission/>}/>
            <Route path='/chatbot' element={<ChatBot/>}/>
          </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
