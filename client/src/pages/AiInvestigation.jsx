import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AiInvestigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [stateData, setStateData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  // Current input for text answers
  const [textInput, setTextInput] = useState('');

  // Generation state
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalComplaint, setFinalComplaint] = useState(null);

  useEffect(() => {
    if (!location.state?.investigationData || !location.state?.formContext) {
      navigate('/report-issue');
      return;
    }
    setStateData(location.state);
  }, [location, navigate]);

  if (!stateData) return null;

  const { investigationData, formContext } = stateData;
  const questions = investigationData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = async (answerValue) => {
    const newAnswers = [...answers, { question: currentQuestion.text, answer: answerValue }];
    setAnswers(newAnswers);
    setTextInput('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finalize complaint
      setIsFinalizing(true);
      try {
        const form = new FormData();
        form.append('imageUrl', investigationData.imageUrl);
        form.append('title', formContext.title);
        form.append('description', formContext.description);
        form.append('locationStr', formContext.locationStr);
        form.append('answers', JSON.stringify(newAnswers));

        const res = await api.post('/ai/finalize-complaint', form);
        setFinalComplaint(res.data);
      } catch (error) {
        console.error('Finalization failed:', error);
        alert('Failed to generate final complaint. Gemini API might be busy. Please try answering again.');
        // Revert the answer so the user can retry without duplicating
        setAnswers(answers);
      } finally {
        setIsFinalizing(false);
      }
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleAnswer(textInput);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitForm = new FormData();
      submitForm.append('title', finalComplaint.title);
      submitForm.append('description', finalComplaint.description);
      submitForm.append('category', finalComplaint.category);
      submitForm.append('department', finalComplaint.department);
      submitForm.append('priority', finalComplaint.priority);
      submitForm.append('severity', finalComplaint.severity || 'Medium');
      
      // Store AI Investigation details
      const aiInvestigation = {
        issueType: investigationData.issueType,
        confidence: investigationData.confidence,
        questionsAndAnswers: answers,
        estimatedImpact: finalComplaint.estimatedImpact,
        recommendedAction: finalComplaint.recommendedAction
      };
      submitForm.append('aiInvestigation', JSON.stringify(aiInvestigation));
      
      submitForm.append('imageUrl', investigationData.imageUrl);
      submitForm.append('locationStr', formContext.locationStr);

      await api.post('/complaints', submitForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Complaint submitted successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Try again.');
    }
  };

  const handleInputChange = (e) => {
    setFinalComplaint({ ...finalComplaint, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl min-h-[80vh] flex flex-col">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">Resoly AI Investigator</h1>

      {!finalComplaint ? (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700 flex-grow flex flex-col relative">
          
          {isFinalizing && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <span className="text-6xl mb-4 animate-bounce">🤖</span>
              <h2 className="text-xl font-bold text-white mb-2">Analyzing your responses...</h2>
              <p className="text-gray-300">Drafting the perfect professional complaint for the authorities.</p>
              <div className="mt-6 flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}

          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="text-2xl">🤖</span> AI Investigator
            </span>
            <span className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="p-6 flex-grow flex flex-col">
            {/* Chat History */}
            <div className="space-y-6 flex-grow mb-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                <div className="bg-gray-700 p-4 rounded-2xl rounded-tl-none text-gray-200">
                  <p>Hi! I'm the Resoly AI Investigator.</p>
                  <p className="mt-2 text-sm text-gray-300">I detected: <strong>{investigationData.issueType}</strong> ({investigationData.confidence} confidence)</p>
                  <p className="mt-2">I've analyzed your image and would like to ask a few questions to help the local authority resolve this issue faster.</p>
                </div>
              </div>

              {answers.map((ans, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                    <div className="bg-gray-700 p-4 rounded-2xl rounded-tl-none text-gray-200">
                      <p>{ans.question}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end">
                    <div className="bg-white text-black p-4 rounded-2xl rounded-tr-none text-white">
                      <p>{ans.answer}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">👤</div>
                  </div>
                </div>
              ))}

              {/* Current Question */}
              {!isFinalizing && currentQuestion && (
                <div className="flex gap-4 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                  <div className="bg-gray-700 p-4 rounded-2xl rounded-tl-none text-gray-200">
                    <p>{currentQuestion.text}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {!isFinalizing && currentQuestion && (
              <div className="pt-4 border-t border-gray-700">
                {currentQuestion.type === 'Yes/No' && (
                  <div className="flex gap-4">
                    <button onClick={() => handleAnswer('Yes')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors border border-gray-600">Yes</button>
                    <button onClick={() => handleAnswer('No')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors border border-gray-600">No</button>
                  </div>
                )}
                {(currentQuestion.type === 'Single Choice' || currentQuestion.type === 'Multiple Choice') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options?.map(opt => (
                      <button key={opt} onClick={() => handleAnswer(opt)} className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors border border-gray-600 text-left">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {currentQuestion.type === 'Short Text' && (
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      value={textInput} 
                      onChange={e => setTextInput(e.target.value)} 
                      placeholder="Type your answer here..."
                      className="flex-grow bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                      autoFocus
                    />
                    <button type="submit" className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold transition-colors">
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* COMPLAINT PREVIEW */
        <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-green-500 flex flex-col h-full animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">✅</span>
            <h2 className="text-2xl font-bold text-green-400">Complaint Preview Ready</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <img src={investigationData.imageUrl} alt="Issue" className="w-full h-auto rounded-lg shadow-md border border-gray-700" />
              <div className="mt-4 space-y-3">
                <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 border border-gray-700">
                  <span className="block text-gray-500 mb-1">Issue Type</span>
                  <span className="font-semibold text-white">{investigationData.issueType}</span>
                </div>
                <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 border border-gray-700">
                  <span className="block text-gray-500 mb-1">Confidence</span>
                  <span className="font-semibold text-white">{investigationData.confidence}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Title</label>
                <input name="title" value={finalComplaint.title} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={finalComplaint.description} onChange={handleInputChange} className="w-full min-h-[120px] bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-1">Department</label>
                  <input name="department" value={finalComplaint.department} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-1">Priority</label>
                  <input name="priority" value={finalComplaint.priority} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Estimated Impact</label>
                <input name="estimatedImpact" value={finalComplaint.estimatedImpact || ''} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-red-300 font-medium" />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Recommended Action</label>
                <textarea name="recommendedAction" value={finalComplaint.recommendedAction || ''} onChange={handleInputChange} className="w-full min-h-[80px] bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-300 font-medium" />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg flex justify-center items-center gap-2">
                  <span>🚀</span> Submit Final Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInvestigation;
