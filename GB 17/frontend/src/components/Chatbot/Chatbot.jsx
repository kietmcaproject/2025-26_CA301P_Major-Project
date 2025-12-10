import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = ({ problemId, problemData }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // ✅ new state for toggle
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { from: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:8000/gemini/chat", {
        message: userInput,
        problemId: problemId || null,
      });

      const aiReply = res.data.reply;
      setMessages([...newMessages, { from: "bot", text: aiReply }]);
    } catch (err) {
      console.error("ChatBot error:", err.response?.data || err.message);
      setMessages([
        ...newMessages,
        { from: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatText = (text) => {
    if (!text) return "";

    // Escape HTML first to avoid injection
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return (
      escaped
        // Headings (###, ####)
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-3 mb-1 text-gray-900">$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4 class="text-md font-semibold mt-2 mb-1 text-gray-800">$1</h4>')

        // Bold + italic + inline code
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/`([^`]+)`/gim, "<code class='bg-gray-200 text-gray-900 rounded px-1'>$1</code>")

        // Code blocks ``` ```
        .replace(/```([\s\S]*?)```/gim,
          `<pre class="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
          <code class="font-mono text-sm">$1</code>
        </pre>`)

        // Lists
        .replace(/^\s*[-*]\s+(.*$)/gim, "<li class='ml-4 list-disc'>$1</li>")
        .replace(/(\<\/li\>\s*)(?!\s*<li)/gim, "</ul>")
        .replace(/<li/gim, "<ul><li")

        // Horizontal rules or dividers
        .replace(/---/g, "<hr class='my-4 border-gray-300'/>")

        // Paragraphs and newlines
        .replace(/\n{2,}/g, "</p><p>")
        .replace(/\n/g, "<br/>")
        .replace(/^/, "<p>")
        .replace(/$/, "</p>")
    );
  };

  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>CodeClash AI Helper</h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>−</button>
          </div>

          <div className="chatbox">
            {messages.map((msg, idx) => (
              msg.from === "bot" ? (
                <div
                  key={idx}
                  className={`chat-message bot`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
              ) : (
                <div key={idx} className={`chat-message user`}>
                  {msg.text}
                </div>
              )
            ))}
            {isTyping && <div className="typing">AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CodeClash AI..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;