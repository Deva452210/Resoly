import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/officer/complaints/${id}`);
        setComplaint(res.data);
        setStatus(res.data.status);
      } catch (error) {
        console.error('Error fetching officer complaint details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const res = await api.patch(`/officer/complaints/${id}/status`, { status });
      setComplaint(res.data);
      alert('Complaint status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
      // Revert select back to current state if failed
      setStatus(complaint.status);
    } finally {
      setUpdating(false);
    }
  };

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
        <Link to="/officer-dashboard" className="text-purple-400 hover:text-purple-300 underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/officer-dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 w-max">
          <span>&larr;</span> Back to Dashboard
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{complaint.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Category</span>
                <span className="px-3 py-1 rounded bg-blue-900/50 text-blue-300 border border-blue-800 text-sm font-medium">{complaint.category}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Priority</span>
                <span className={`px-3 py-1 rounded border text-sm font-medium ${
                  complaint.priority === 'High' ? 'bg-red-900/50 text-red-300 border-red-800' :
                  complaint.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-800' :
                  'bg-green-900/50 text-green-300 border-green-800'
                }`}>
                  {complaint.priority}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Department</span>
                <span className="px-3 py-1 rounded bg-purple-900/50 text-purple-300 border border-purple-800 text-sm font-medium">{complaint.department}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Location</span>
                <p className="text-white text-sm">
                  {complaint.location?.area || complaint.location?.city ? (
                    <>
                      {complaint.location.area && <span className="block">{complaint.location.area}</span>}
                      {complaint.location.city && <span className="block">{complaint.location.city}</span>}
                      {complaint.location.landmark && <span className="block text-gray-400">Landmark: {complaint.location.landmark}</span>}
                    </>
                  ) : complaint.location?.latitude ? (
                    <span>Lat: {complaint.location.latitude}, Lng: {complaint.location.longitude}</span>
                  ) : 'Not provided'}
                </p>
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Reporter</span>
                <p className="text-white text-sm">{complaint.createdBy?.name || 'Citizen'} ({complaint.createdBy?.email})</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <span className="block text-gray-500 text-sm font-medium mb-2">Description</span>
            <p className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-gray-300">{complaint.description}</p>
          </div>

          {/* Officer Management Section */}
          <div className="bg-gray-900 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-white mb-4">Manage Complaint Status</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-gray-400 text-sm font-medium mb-2">Current Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 appearance-none"
                >
                  <option value="Reported">Reported</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <button 
                onClick={handleStatusUpdate}
                disabled={updating || status === complaint.status}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {updating ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetails;
