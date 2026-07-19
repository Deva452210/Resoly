import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ReportIssue = () => {
  const navigate = useNavigate();
  // Input fields
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [video, setVideo] = useState(null);

  const [titleInput, setTitleInput] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Location fields
  const [locationMode, setLocationMode] = useState("current"); // 'current' or 'manual'
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");

  // State flags
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFinished, setAiFinished] = useState(false);

  // Output fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    priority: "",
    imageUrl: "",
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
      alert("Geolocation is not supported by your browser");
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
        console.error("Error getting location:", error);
        alert("Failed to get location");
        setLocationLoading(false);
      },
    );
  };

  const generateWithAI = async () => {
    if (!image) {
      alert("Please upload an image first");
      return;
    }

    setIsGenerating(true);
    setAiFinished(false);

    try {
      const form = new FormData();
      form.append("image", image);
      form.append("title", titleInput);
      form.append("additionalDetails", additionalDetails);
      form.append("locationMode", locationMode);

      if (locationMode === "current") {
        form.append("lat", lat);
        form.append("lng", lng);
      } else {
        form.append("area", area);
        form.append("city", city);
        form.append("landmark", landmark);
      }

      // Video is explicitly ignored during AI analysis, so we don't append it to the form.

      const res = await api.post("/ai/investigate", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Navigate to the investigation page with the returned data
      navigate("/ai-investigation", {
        state: {
          investigationData: res.data,
          formContext: {
            title: titleInput,
            description: additionalDetails,
            locationMode,
            locationStr:
              locationMode === "current"
                ? JSON.stringify({ latitude: lat, longitude: lng })
                : JSON.stringify({ area, city, landmark }),
          },
        },
      });
    } catch (error) {
      console.error("AI Generation Failed:", error);
      alert(
        "Failed to start investigation. Make sure your API keys are valid.",
      );
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
      submitForm.append("title", formData.title);
      submitForm.append("description", formData.description);
      submitForm.append("category", formData.category);
      submitForm.append("department", formData.department);
      submitForm.append("priority", formData.priority);
      submitForm.append("imageUrl", formData.imageUrl);

      const locationData = {};
      if (locationMode === "current") {
        locationData.latitude = lat;
        locationData.longitude = lng;
      } else {
        locationData.area = area;
        locationData.city = city;
        locationData.landmark = landmark;
      }
      submitForm.append("locationStr", JSON.stringify(locationData));

      if (video) {
        submitForm.append("video", video);
      }

      await api.post("/complaints", submitForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Complaint submitted successfully!");
      window.location.href = "/feed"; // Redirect using window.location to trigger a full re-render/navigate, or we can use useNavigate.
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Try again.");
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
              <h2 className="text-lg font-semibold mb-2 text-gray-200">
                1. Upload Photo{" "}
                <span className="text-red-400 text-sm">*Required</span>
              </h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white  file:text-black hover:file:bg-white cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-600">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">
                2. Upload Video{" "}
                <span className="text-gray-400 text-sm">(Optional)</span>
              </h2>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black cursor-pointer"
              />
              {video && (
                <p className="mt-2 text-sm text-gray-300 truncate">
                  Selected: {video.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Video is for supporting evidence only and will not be analyzed
                by AI.
              </p>
            </div>
          </div>

          {/* Text Details */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">
                3. Complaint Title{" "}
                <span className="text-gray-400 text-sm">(Optional)</span>
              </h2>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder='Example: "Pothole near Bus Stand"'
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">
                4. Additional Details{" "}
                <span className="text-gray-400 text-sm">(Optional)</span>
              </h2>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide any additional details that may help the authorities..."
                className="w-full min-h-[100px] bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">
              5. Location
            </h2>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setLocationMode("current")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${locationMode === "current" ? "bg-white text-black " : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Option A: Use Current Location
              </button>
              <button
                onClick={() => setLocationMode("manual")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${locationMode === "manual" ? "bg-white text-black text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Option B: Enter Manually
              </button>
            </div>

            {locationMode === "current" && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <button
                  onClick={detectLocation}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                  disabled={locationLoading}
                >
                  {locationLoading ? "Detecting..." : "Get Current Location"}
                </button>
                {lat && lng && (
                  <p className="mt-3 text-green-400 font-mono text-sm">
                    Lat: {lat} | Lng: {lng}
                  </p>
                )}
              </div>
            )}

            {locationMode === "manual" && (
              <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
                <input
                  type="text"
                  placeholder="Area / Street"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            )}
          </div>

          {/* Main Action Button */}
          {!aiFinished ? (
            <button
              onClick={generateWithAI}
              disabled={isGenerating || !image}
              className="w-full py-4 bg-white text-black hover:bg-gray-200  font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing with AI...
                </span>
              ) : (
                "✨ Analyze with AI"
              )}
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

        {/* RIGHT COLUMN: Info Block (Replaced the direct generation form) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-gray-700 flex flex-col justify-center text-center">
          <span className="text-6xl mb-4 block">🤖</span>
          <h2 className="text-2xl font-bold mb-4 text-white">
            Resoly AI Investigator
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Instead of just guessing the details, our AI will now analyze your
            photo and ask you a few quick questions to build a highly accurate,
            comprehensive report for the authorities.
          </p>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              How it works
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>1. We analyze your photo to detect the issue.</li>
              <li>2. We ask you 2-3 specific questions.</li>
              <li>3. We generate a professional civic complaint.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
