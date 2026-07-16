import { useState, useRef } from 'react';
import api from '../services/api';

const ReportIssue = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    department: '',
    priority: '',
    imageUrl: ''
  });

  const recognitionRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support the Web Speech API');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get location');
        setLocationLoading(false);
      }
    );
  };

  const generateWithAI = async () => {
    if (!image) {
      alert('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    try {
      const form = new FormData();
      form.append('image', image);
      form.append('transcript', transcript);
      form.append('location', location);

      const res = await api.post('/ai/generate', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(res.data);
    } catch (error) {
      console.error('AI Generation Failed:', error);
      alert('Failed to generate details. Make sure you added your Cloudinary API Secret.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-white">Report an Issue (AI Assistant)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">1. Upload Image</h2>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-full h-48 object-cover rounded" />}
          </div>

          <div className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">2. Record Voice Context (Optional)</h2>
            <button 
              onClick={toggleRecording} 
              className={`px-4 py-2 rounded text-white transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <textarea 
              className="mt-4 w-full bg-gray-700 text-white p-2 rounded min-h-[80px]" 
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Live transcript will appear here..."
            />
          </div>

          <div className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">3. Detect Location</h2>
            <button 
              onClick={detectLocation} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors disabled:opacity-50"
              disabled={locationLoading}
            >
              {locationLoading ? 'Detecting...' : 'Get Current Location'}
            </button>
            {location && <p className="mt-2 text-green-400 font-mono text-sm">Coordinates: {location}</p>}
          </div>

          <button 
            onClick={generateWithAI} 
            disabled={isGenerating || !image}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is Analyzing...
              </span>
            ) : 'Generate with AI'}
          </button>
        </div>

        {/* Right Column: Generated Form */}
        <div className="bg-gray-800 p-6 rounded shadow border-l-4 border-purple-500 flex flex-col h-full">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">AI Generated Details</h2>
          <form className="space-y-4 flex-grow flex flex-col">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex-grow">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full h-[120px] bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <input name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Priority</label>
                <input name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Department</label>
              <input name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            
            {/* The prompt specifically states: "Do NOT submit anything to MongoDB. Do NOT implement complaint saving." */}
            <button type="button" onClick={() => alert('Saving is disabled for this sprint!')} className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
              Submit Complaint (Disabled)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
