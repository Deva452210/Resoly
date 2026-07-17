import { useState } from 'react';
import api from '../services/api';

const ReportIssue = () => {
  // Input fields
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [video, setVideo] = useState(null);
  
  const [titleInput, setTitleInput] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Location fields
  const [locationMode, setLocationMode] = useState('current'); // 'current' or 'manual'
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');

  // State flags
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFinished, setAiFinished] = useState(false);
  
  // Output fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    department: '',
    priority: '',
    imageUrl: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
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
    setAiFinished(false);

    try {
      const form = new FormData();
      form.append('image', image);
      form.append('title', titleInput);
      form.append('additionalDetails', additionalDetails);
      form.append('locationMode', locationMode);
      
      if (locationMode === 'current') {
        form.append('lat', lat);
        form.append('lng', lng);
      } else {
        form.append('area', area);
        form.append('city', city);
        form.append('landmark', landmark);
      }
      
      // Video is explicitly ignored during AI analysis, so we don't append it to the form.

      const res = await api.post('/ai/generate', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(res.data);
      setAiFinished(true);
    } catch (error) {
      console.error('AI Generation Failed:', error);
      alert('Failed to generate details. Make sure your API keys are valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitForm = new FormData();
      submitForm.append('title', formData.title);
      submitForm.append('description', formData.description);
      submitForm.append('category', formData.category);
      submitForm.append('department', formData.department);
      submitForm.append('priority', formData.priority);
      submitForm.append('imageUrl', formData.imageUrl);
      
      const locationData = {};
      if (locationMode === 'current') {
        locationData.latitude = lat;
        locationData.longitude = lng;
      } else {
        locationData.area = area;
        locationData.city = city;
        locationData.landmark = landmark;
      }
      submitForm.append('locationStr', JSON.stringify(locationData));

      if (video) {
        submitForm.append('video', video);
      }

      await api.post('/complaints', submitForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Complaint submitted successfully!');
      window.location.href = '/feed'; // Redirect using window.location to trigger a full re-render/navigate, or we can use useNavigate.
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Report an Issue</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Input Details */}
        <div className="space-y-6">
          
          {/* Media Uploads */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">1. Upload Photo <span className="text-red-400 text-sm">*Required</span></h2>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" 
              />
              {imagePreview && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-600">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">2. Upload Video <span className="text-gray-400 text-sm">(Optional)</span></h2>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideoChange} 
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer" 
              />
              {video && <p className="mt-2 text-sm text-gray-300 truncate">Selected: {video.name}</p>}
              <p className="text-xs text-gray-500 mt-1">Video is for supporting evidence only and will not be analyzed by AI.</p>
            </div>
          </div>

          {/* Text Details */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">3. Complaint Title <span className="text-gray-400 text-sm">(Optional)</span></h2>
              <input 
                type="text" 
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder='Example: "Pothole near Bus Stand"' 
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">4. Additional Details <span className="text-gray-400 text-sm">(Optional)</span></h2>
              <textarea 
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide any additional details that may help the authorities..." 
                className="w-full min-h-[100px] bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">5. Location</h2>
            
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => setLocationMode('current')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${locationMode === 'current' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Option A: Use Current Location
              </button>
              <button 
                onClick={() => setLocationMode('manual')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${locationMode === 'manual' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Option B: Enter Manually
              </button>
            </div>

            {locationMode === 'current' && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <button 
                  onClick={detectLocation} 
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                  disabled={locationLoading}
                >
                  {locationLoading ? 'Detecting...' : 'Get Current Location'}
                </button>
                {(lat && lng) && <p className="mt-3 text-green-400 font-mono text-sm">Lat: {lat} | Lng: {lng}</p>}
              </div>
            )}

            {locationMode === 'manual' && (
              <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
                <input type="text" placeholder="Area / Street" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="text" placeholder="Landmark (optional)" value={landmark} onChange={e => setLandmark(e.target.value)} className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            )}
          </div>
          
          {/* Main Action Button */}
          {!aiFinished ? (
            <button 
              onClick={generateWithAI} 
              disabled={isGenerating || !image}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with AI...
                </span>
              ) : '✨ Analyze with AI'}
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg"
            >
              Submit Complaint
            </button>
          )}

        </div>

        {/* RIGHT COLUMN: AI Generated Fields */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-purple-500 flex flex-col h-full relative">
          
          {isGenerating && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-purple-300 font-medium">Extracting details...</p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 text-purple-400">AI Generated Details</h2>
          
          <form className="space-y-5 flex-grow flex flex-col" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="Auto-generated title" />
            </div>
            
            <div className="flex-grow flex flex-col">
              <label className="block text-gray-400 text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full flex-grow min-h-[150px] bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="Auto-generated description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Category</label>
                <input name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="e.g. Infrastructure" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Priority</label>
                <input name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="e.g. High" />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">Department</label>
              <input name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="e.g. Public Works" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
