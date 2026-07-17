import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Feed = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints');
        setComplaints(res.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Public Feed</h1>
        <Link to="/report-issue" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow">
          + Report Issue
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-gray-400">
          No complaints reported yet. Be the first to report an issue!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map(complaint => (
            <div key={complaint._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col hover:border-purple-500 transition-colors">
              <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-48 object-cover" />
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-white line-clamp-1">{complaint.title}</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-900/50 text-blue-300 border border-blue-800">{complaint.category}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded border ${
                    complaint.priority === 'High' ? 'bg-red-900/50 text-red-300 border-red-800' :
                    complaint.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-800' :
                    'bg-green-900/50 text-green-300 border-green-800'
                  }`}>
                    {complaint.priority}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600">
                    {complaint.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-400 mb-4 space-y-1">
                  <p className="flex items-center gap-1">
                    <span className="opacity-70">📍</span> 
                    {complaint.location?.area || complaint.location?.city || 'Location provided'}
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="opacity-70">🏢</span> {complaint.department}
                  </p>
                  <p className="flex items-center gap-1 text-xs mt-2">
                    <span className="opacity-70">👤</span> Reported by {complaint.createdBy?.name || 'Citizen'}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <Link to={`/complaint/${complaint._id}`} className="block text-center w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
