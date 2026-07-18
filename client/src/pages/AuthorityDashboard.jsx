import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/authority/complaints');
        setComplaints(res.data);
      } catch (error) {
        console.error('Error fetching complaints for authority:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Reported' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const escalated = complaints.filter(c => c.status === 'Escalated').length;

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Higher Authority Dashboard</h1>
        <Link to="/authority-analytics" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium transition-colors">
          View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Complaints</h3>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Pending</h3>
          <p className="text-3xl font-bold text-yellow-400">{pending}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Resolved</h3>
          <p className="text-3xl font-bold text-green-400">{resolved}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-red-900/50">
          <h3 className="text-red-400 text-sm font-medium mb-1">Escalated</h3>
          <p className="text-3xl font-bold text-red-500">{escalated}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-lg font-bold text-white">All System Complaints</h2>
        </div>
        
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No complaints found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Complaint Details</th>
                  <th className="px-6 py-4 font-semibold">Officer Assigned</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Citizen Verification</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {complaints.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1">{complaint.title}</div>
                      <div className="text-xs text-gray-500">{complaint.category} • {complaint.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.resolution?.resolvedBy ? (
                        <span>{complaint.resolution.resolvedBy.name}</span>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        complaint.priority === 'High' ? 'bg-red-900/30 text-red-400 border-red-800' :
                        complaint.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                        'bg-green-900/30 text-green-400 border-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.status === 'Escalated' ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-900 text-red-300 border border-red-500 animate-pulse">
                          Escalated
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          complaint.status === 'Resolved' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {complaint.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3 text-xs font-medium">
                        <span className="text-green-400">👍 {complaint.verification?.solvedVotes || 0}</span>
                        <span className="text-red-400">👎 {complaint.verification?.notSolvedVotes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/authority-complaint/${complaint._id}`} 
                        className="text-blue-400 hover:text-blue-300 font-medium underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
