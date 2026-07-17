import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ Reported: 0, Assigned: 0, InProgress: 0, Resolved: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/officer/complaints');
        setComplaints(res.data);
        
        // Calculate stats
        const counts = { Reported: 0, Assigned: 0, InProgress: 0, Resolved: 0 };
        res.data.forEach(c => {
          if (c.status === 'Reported') counts.Reported++;
          else if (c.status === 'Assigned') counts.Assigned++;
          else if (c.status === 'In Progress') counts.InProgress++;
          else if (c.status === 'Resolved') counts.Resolved++;
        });
        setStats(counts);

      } catch (error) {
        console.error('Error fetching officer complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Officer Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-blue-400 mb-2">{stats.Reported}</span>
          <span className="text-gray-400 font-medium">Reported</span>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-orange-400 mb-2">{stats.Assigned}</span>
          <span className="text-gray-400 font-medium">Assigned</span>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-yellow-400 mb-2">{stats.InProgress}</span>
          <span className="text-gray-400 font-medium">In Progress</span>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-green-400 mb-2">{stats.Resolved}</span>
          <span className="text-gray-400 font-medium">Resolved</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-200">All Complaints</h2>

      {complaints.length === 0 ? (
        <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 text-gray-400">
          No complaints found in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {complaints.map(complaint => (
            <div key={complaint._id} className="bg-gray-800 rounded-xl overflow-hidden shadow border border-gray-700 flex flex-col">
              <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-40 object-cover" />
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{complaint.title}</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4 flex-grow">
                  <div>
                    <span className="block text-gray-500 text-xs">Priority</span>
                    <span className={`font-semibold ${
                      complaint.priority === 'High' ? 'text-red-400' :
                      complaint.priority === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{complaint.priority}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Status</span>
                    <span className="font-semibold text-white">{complaint.status}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Department</span>
                    <span className="line-clamp-1" title={complaint.department}>{complaint.department}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Location</span>
                    <span className="line-clamp-1">{complaint.location?.area || complaint.location?.city || 'Not provided'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 text-xs">Reporter</span>
                    <span className="line-clamp-1">{complaint.createdBy?.name || 'Citizen'}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <Link to={`/officer-complaint/${complaint._id}`} className="block text-center w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded transition-colors text-sm font-bold shadow">
                    Manage Complaint
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

export default OfficerDashboard;
