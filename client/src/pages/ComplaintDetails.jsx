import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');

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

  // Helper for Stepper logic
  const steps = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
  const currentStepIndex = steps.indexOf(complaint.status) !== -1 ? steps.indexOf(complaint.status) : 0;

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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{complaint.title}</h1>

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

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'progress' 
                ? 'text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('resolution')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'resolution' 
                ? 'text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Resolution
            </button>
            {complaint.escalation?.generated && (
              <button
                onClick={() => setActiveTab('escalation')}
                className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'escalation' 
                  ? 'text-red-400 border-b-2 border-red-500' 
                  : 'text-red-500/70 hover:text-red-400'
                }`}
              >
                <span className="text-lg">⚠️</span> Escalation Report
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="mb-8 min-h-[150px]">
            {activeTab === 'progress' ? (
              <div className="space-y-8 animate-fadeIn">
                {/* Stepper */}
                <div className="relative pt-2">
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-700 -z-10"></div>
                  <div className="flex justify-between relative z-10">
                    {steps.map((step, index) => {
                      let circleClasses = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors";
                      let textClasses = "text-xs font-medium mt-2 text-center absolute -bottom-6 w-24 -ml-8";
                      
                      if (index < currentStepIndex) {
                        // Completed
                        circleClasses += " bg-green-900 border-green-500 text-green-400";
                        textClasses += " text-green-400";
                      } else if (index === currentStepIndex) {
                        // Current
                        circleClasses += " bg-purple-900 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
                        textClasses += " text-purple-300";
                      } else {
                        // Upcoming
                        circleClasses += " bg-gray-800 border-gray-600 text-gray-500";
                        textClasses += " text-gray-500";
                      }

                      return (
                        <div key={step} className="flex flex-col items-center relative">
                          <div className={circleClasses}>
                            {index < currentStepIndex ? '✓' : index + 1}
                          </div>
                          <span className={textClasses}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-12 bg-gray-700/30 p-5 rounded-lg border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Timeline Activity</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-24 flex-shrink-0 text-sm text-gray-400 pt-1">
                        {new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="relative pb-4 pl-4 border-l border-gray-600 flex-grow">
                        <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[4.5px] top-1.5"></div>
                        <p className="text-white font-medium">Complaint {complaint.status}</p>
                        <p className="text-sm text-gray-400 mt-1">Status updated by the system.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'resolution' ? (
              <div className="animate-fadeIn">
                {complaint.status !== 'Resolved' ? (
                  <div className="bg-gray-700/30 p-8 rounded-lg border border-gray-700/50 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <span className="text-4xl mb-3 opacity-50">⏳</span>
                    <p className="text-gray-400 font-medium text-lg">This complaint has not been resolved yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Check back later or track progress in the Progress tab.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase text-center">Before</h4>
                        <img src={complaint.imageUrl} alt="Before" className="w-full h-48 object-cover rounded opacity-80" />
                      </div>
                      <div className="bg-gray-800 p-2 rounded-lg border border-green-900/50">
                        <h4 className="text-xs font-semibold text-green-500 mb-2 uppercase text-center">After</h4>
                        {complaint.resolution?.afterImageUrl ? (
                          <img src={complaint.resolution.afterImageUrl} alt="After" className="w-full h-48 object-cover rounded" />
                        ) : (
                          <div className="w-full h-48 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-sm">
                            No Photo Provided
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-5 rounded-lg border border-gray-700/50">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Resolution Notes</h3>
                      <p className="text-gray-300 text-sm">{complaint.resolution?.notes || 'No notes provided.'}</p>
                      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap justify-between text-xs text-gray-500">
                        <span>Resolved By: {complaint.resolution?.resolvedBy?.name || 'Officer'}</span>
                        <span>Resolved Date: {complaint.resolution?.resolvedAt ? new Date(complaint.resolution.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                      </div>
                    </div>

                    {/* AI Assessment Block */}
                    {complaint.aiAudit && (
                      <div className="bg-gray-900 p-5 rounded-lg border border-purple-500 mt-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                          <span className="text-xl">🤖</span> AI Assessment
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row gap-6 mb-4">
                          <div className="flex-1">
                            <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Status</span>
                            <span className={complaint.aiAudit.status === 'Adequate' ? 'text-green-400 font-bold text-lg' : 'text-yellow-400 font-bold text-lg'}>
                              {complaint.aiAudit.status}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Confidence Meter</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-grow bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${complaint.aiAudit.confidence === 'High' ? 'w-full bg-green-500' : complaint.aiAudit.confidence === 'Medium' ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'}`}></div>
                              </div>
                              <span className="text-xs text-gray-300 font-medium">{complaint.aiAudit.confidence}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                          <div>
                            <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Summary</span>
                            <p className="text-gray-300 text-sm leading-relaxed">{complaint.aiAudit.summary}</p>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Recommendation</span>
                            <p className="text-purple-300 text-sm leading-relaxed">{complaint.aiAudit.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Block */}
                    <div className="bg-gray-900 p-5 rounded-lg border border-purple-500 mt-6">
                      <h3 className="text-lg font-bold text-white mb-2 text-center">Was this issue actually resolved?</h3>
                      <div className="flex justify-center gap-4 mt-4">
                        <button 
                          onClick={async () => {
                            try {
                              const res = await api.post(`/complaints/${id}/verify`, { vote: 'solved' });
                              setComplaint(res.data);
                            } catch (e) {
                              alert(e.response?.data?.message || 'Failed to verify');
                            }
                          }}
                          className={`flex items-center gap-2 px-6 py-2 border rounded-full transition-colors font-medium ${
                            complaint.verification?.votes?.find(v => v.user === user._id)?.vote === 'solved'
                            ? 'bg-green-600 text-white border-green-500'
                            : 'bg-green-900/50 hover:bg-green-800 text-green-400 border-green-700'
                          }`}
                        >
                          👍 Solved ({complaint.verification?.solvedVotes || 0})
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await api.post(`/complaints/${id}/verify`, { vote: 'not_solved' });
                              setComplaint(res.data);
                            } catch (e) {
                              alert(e.response?.data?.message || 'Failed to verify');
                            }
                          }}
                          className={`flex items-center gap-2 px-6 py-2 border rounded-full transition-colors font-medium ${
                            complaint.verification?.votes?.find(v => v.user === user._id)?.vote === 'not_solved'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-red-900/50 hover:bg-red-800 text-red-400 border-red-700'
                          }`}
                        >
                          👎 Not Solved ({complaint.verification?.notSolvedVotes || 0})
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="animate-fadeIn bg-red-900/20 p-6 rounded-lg border border-red-900/50">
                <div className="flex items-center gap-3 mb-4 border-b border-red-900/30 pb-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h3 className="text-xl font-bold text-red-400">AI Escalation Report</h3>
                    <p className="text-sm text-red-300/70">Generated at {new Date(complaint.escalation?.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-gray-300 space-y-4 leading-relaxed whitespace-pre-wrap">
                  {complaint.escalation?.report}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 text-gray-300 border-t border-gray-700 pt-6">
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
