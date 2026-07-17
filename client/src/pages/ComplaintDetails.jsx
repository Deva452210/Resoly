import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data);
      } catch (error) {
        console.error('Error fetching complaint details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto p-4 text-center mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">Complaint not found</h2>
        <Link to="/feed" className="text-purple-400 hover:text-purple-300 underline">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/feed" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 w-max">
          <span>&larr;</span> Back to Feed
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Media Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-gray-700 bg-gray-900">
          <div className="p-4 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Photo Evidence</h3>
            <img src={complaint.imageUrl} alt="Complaint Evidence" className="w-full h-auto max-h-[300px] object-contain rounded bg-black" />
          </div>
          {complaint.videoUrl && (
            <div className="p-4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Video Evidence</h3>
              <video src={complaint.videoUrl} controls className="w-full h-auto max-h-[300px] rounded bg-black" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{complaint.title}</h1>
            <span className="px-4 py-2 rounded-full bg-gray-700 text-white font-medium text-sm border border-gray-600">
              Status: {complaint.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 rounded bg-blue-900/50 text-blue-300 border border-blue-800 text-sm font-medium">Category: {complaint.category}</span>
            <span className={`px-3 py-1 rounded border text-sm font-medium ${
              complaint.priority === 'High' ? 'bg-red-900/50 text-red-300 border-red-800' :
              complaint.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-800' :
              'bg-green-900/50 text-green-300 border-green-800'
            }`}>
              Priority: {complaint.priority}
            </span>
            <span className="px-3 py-1 rounded bg-purple-900/50 text-purple-300 border border-purple-800 text-sm font-medium">Department: {complaint.department}</span>
          </div>

          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-700/30 p-4 rounded-lg">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Location Details</h3>
                {complaint.location ? (
                  <ul className="space-y-1">
                    {complaint.location.area && <li><span className="text-gray-500">Area:</span> {complaint.location.area}</li>}
                    {complaint.location.city && <li><span className="text-gray-500">City:</span> {complaint.location.city}</li>}
                    {complaint.location.landmark && <li><span className="text-gray-500">Landmark:</span> {complaint.location.landmark}</li>}
                    {complaint.location.latitude && <li><span className="text-gray-500">Coordinates:</span> {complaint.location.latitude}, {complaint.location.longitude}</li>}
                  </ul>
                ) : (
                  <p>Location not provided</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Report Information</h3>
                <ul className="space-y-1">
                  <li><span className="text-gray-500">Reported By:</span> {complaint.createdBy?.name || 'Citizen'}</li>
                  <li><span className="text-gray-500">Date:</span> {new Date(complaint.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li><span className="text-gray-500">AI Assisted:</span> {complaint.aiGenerated ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
