import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What is the status of unresolved complaints?",
  "Who is the top performing officer this week?",
  "Are there any critical alerts I should worry about?",
  "What is the citizen satisfaction score?",
  "List the most pressing escalated complaints",
  "Summarize the recent road damage issues"
];

const CommandCenter = () => {
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Welcome to the Resoly AI Command Center. I have full access to our systemic complaint data, officer analytics, and civic intelligence reports. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async (text) => {
    const question = text || input;
    if (!question.trim()) return;

    // Add user message
    const newHistory = [...history, { role: 'user', content: question }];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/ask', { question });
      setHistory([...newHistory, { role: 'assistant', content: res.data.answer }]);
    } catch (error) {
      console.error('Error asking AI:', error);
      setHistory([...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error while analyzing the system data. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto p-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>🧠</span> AI Command Center
        </h1>
        <Link to="/authority-dashboard" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors border border-gray-600">
          Back to Dashboard
        </Link>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 z-0 pointer-events-none"></div>

        {/* Chat History Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 relative">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-lg rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 border border-gray-700 shadow-md rounded-bl-none prose prose-invert max-w-none'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 text-gray-400 px-5 py-3 rounded-2xl rounded-bl-none shadow-md flex items-center gap-3">
                <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                Analyzing System Data...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Pane */}
        <div className="bg-gray-800/80 p-4 border-t border-gray-700 backdrop-blur-md z-10 relative shrink-0">
          <div className="mb-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-gray-600">
            <div className="flex gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="bg-gray-700 hover:bg-purple-900/50 text-gray-300 text-sm px-4 py-2 rounded-full border border-gray-600 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about complaints, officers, or system alerts..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none h-[60px]"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 h-[60px] flex items-center justify-center min-w-[100px]"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
