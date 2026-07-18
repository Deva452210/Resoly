import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executiveBrief, setExecutiveBrief] = useState(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, briefRes] = await Promise.all([
          api.get('/authority/complaints'),
          api.get('/ai/executive-summary')
        ]);
        setComplaints(complaintsRes.data);
        if (briefRes.data) {
          setExecutiveBrief(briefRes.data);
        }
      } catch (error) {
        console.error('Error fetching data for authority:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateBrief = async () => {
    setGeneratingBrief(true);
    try {
      const res = await api.post('/ai/executive-summary');
      setExecutiveBrief(res.data);
    } catch (error) {
      console.error('Error generating executive summary:', error);
      alert('Failed to generate summary. The AI might be busy, please try again.');
    } finally {
      setGeneratingBrief(false);
    }
  };



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

  // Officer Insights
  let bestOfficer = 'N/A';
  let reviewOfficer = 'N/A';
  let avgResolutionTime = 'N/A';
  let citizenSat = 'N/A';

  if (complaints.length > 0) {
    const officerResolutions = {};
    const officerEscalations = {};
    let totalTime = 0;
    let resolvedCount = 0;
    let totalSolvedVotes = 0;
    let totalNotSolvedVotes = 0;

    complaints.forEach(c => {
      if (c.status === 'Resolved' && c.resolution?.resolvedBy) {
        const name = c.resolution.resolvedBy.name;
        officerResolutions[name] = (officerResolutions[name] || 0) + 1;
        
        const created = new Date(c.createdAt);
        const resolved = new Date(c.resolution.resolvedAt);
        totalTime += (resolved - created) / (1000 * 60 * 60 * 24); // in days
        resolvedCount++;
      }
      
      if (c.status === 'Escalated' && c.resolution?.resolvedBy) {
        const name = c.resolution.resolvedBy.name;
        officerEscalations[name] = (officerEscalations[name] || 0) + 1;
      }

      if (c.verification) {
        totalSolvedVotes += c.verification.solvedVotes || 0;
        totalNotSolvedVotes += c.verification.notSolvedVotes || 0;
      }
    });

    if (Object.keys(officerResolutions).length > 0) {
      bestOfficer = Object.keys(officerResolutions).reduce((a, b) => officerResolutions[a] > officerResolutions[b] ? a : b);
    }
    if (Object.keys(officerEscalations).length > 0) {
      reviewOfficer = Object.keys(officerEscalations).reduce((a, b) => officerEscalations[a] > officerEscalations[b] ? a : b);
    }
    if (resolvedCount > 0) {
      avgResolutionTime = (totalTime / resolvedCount).toFixed(1) + ' days';
    }
    const totalVotes = totalSolvedVotes + totalNotSolvedVotes;
    if (totalVotes > 0) {
      citizenSat = Math.round((totalSolvedVotes / totalVotes) * 100) + '%';
    }
  }

  // Trend Cards Mock (Mapping our custom categories to semantic ones if needed)
  const roadCount = complaints.filter(c => c.category === 'road_damage' || c.category === 'Infrastructure').length;
  const garbageCount = complaints.filter(c => c.category === 'garbage' || c.category === 'Sanitation').length;
  const drainageCount = complaints.filter(c => c.category === 'drainage' || c.category === 'Utilities').length;

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">AI Executive Dashboard</h1>
        <Link to="/authority-analytics" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium transition-colors">
          View Analytics
        </Link>
      </div>

      {/* AI Executive Brief */}
      <div className="mb-10 bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
              <span className="text-3xl">✨</span> AI Executive Brief
            </h2>
            <p className="text-sm text-gray-400 mt-1">Generated by Gemini Advanced Analytics</p>
          </div>
          <button 
            onClick={handleGenerateBrief}
            disabled={generatingBrief}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/50"
          >
            {generatingBrief ? (
              <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Analyzing Data...</>
            ) : (
              <>🔄 Refresh AI Brief</>
            )}
          </button>
        </div>

        {executiveBrief ? (
          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{executiveBrief.greeting}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{executiveBrief.summary}</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-5 border border-purple-500/20">
              <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">Key Highlights</h4>
              <ul className="space-y-2">
                {executiveBrief.highlights?.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 rounded-xl p-5 border border-blue-500/20">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Strategic Recommendation</h4>
              <p className="text-blue-100 font-medium text-lg italic">"{executiveBrief.recommendation}"</p>
            </div>
            
            <div className="text-right text-xs text-gray-500 pt-2 border-t border-gray-700/50">
              Last generated: {new Date(executiveBrief.generatedAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 relative z-10">
            <p className="text-gray-400 mb-4">No AI brief has been generated for the current dataset.</p>
            <button 
              onClick={handleGenerateBrief}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Generate First Brief
            </button>
          </div>
        )}
      </div>

      {/* General Statistics */}
      <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

      {/* Officer Insights & Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Officer Insights</h2>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Top Performing Officer</span>
              <span className="text-green-400 font-bold">{bestOfficer}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Needs Immediate Review</span>
              <span className="text-red-400 font-bold">{reviewOfficer}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Avg Resolution Time</span>
              <span className="text-white font-bold">{avgResolutionTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Citizen Satisfaction Score</span>
              <span className="text-blue-400 font-bold text-xl">{citizenSat}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">AI Trend Cards</h2>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-xl">🛣️</div>
                <div>
                  <h4 className="text-white font-bold">Road Damage</h4>
                  <p className="text-sm text-gray-400">{roadCount} Active Issues</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded">+12%</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-xl">🗑️</div>
                <div>
                  <h4 className="text-white font-bold">Garbage Collection</h4>
                  <p className="text-sm text-gray-400">{garbageCount} Active Issues</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded">-5%</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-xl">💧</div>
                <div>
                  <h4 className="text-white font-bold">Drainage & Water</h4>
                  <p className="text-sm text-gray-400">{drainageCount} Active Issues</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded">+8%</span>
              </div>
            </div>
          </div>
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
