import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const AuthorityComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/authority/complaints/${id}`);
        setComplaint(res.data);
      } catch (error) {
        console.error('Error fetching authority complaint details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto p-4 text-center mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">Complaint not found</h2>
        <Link to="/authority-dashboard" className="text-blue-400 hover:text-blue-300 underline">Back to Dashboard</Link>
      </div>
    );
  }

  const steps = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
  let currentStepIndex = steps.indexOf(complaint.status) !== -1 ? steps.indexOf(complaint.status) : 0;
  if (complaint.status === 'Escalated') currentStepIndex = 3; // Escalated implies it was resolved

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/authority-dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 w-max">
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{complaint.title}</h1>
            {complaint.status === 'Escalated' && (
              <span className="px-4 py-2 rounded-full bg-red-900 text-red-300 font-bold text-sm border border-red-500 animate-pulse">
                ESCALATED
              </span>
            )}
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

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'progress' 
                ? 'text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('resolution')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'resolution' 
                ? 'text-blue-400 border-b-2 border-blue-500' 
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
            <button
              onClick={() => setActiveTab('ai_audit')}
              className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'ai_audit' 
                ? 'text-purple-400 border-b-2 border-purple-500' 
                : 'text-purple-500/70 hover:text-purple-400'
              }`}
            >
              <span className="text-lg">🤖</span> AI Audit
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-8 min-h-[150px]">
            {activeTab === 'progress' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Stepper */}
                <div className="relative pt-2">
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-700 -z-10"></div>
                  <div className="flex justify-between relative z-10">
                    {steps.map((step, index) => {
                      let circleClasses = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors";
                      let textClasses = "text-xs font-medium mt-2 text-center absolute -bottom-6 w-24 -ml-8";
                      
                      if (index < currentStepIndex) {
                        circleClasses += " bg-green-900 border-green-500 text-green-400";
                        textClasses += " text-green-400";
                      } else if (index === currentStepIndex) {
                        circleClasses += " bg-blue-900 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
                        textClasses += " text-blue-300";
                      } else {
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
              </div>
            )}

            {activeTab === 'resolution' && (
              <div className="animate-fadeIn">
                {complaint.status !== 'Resolved' && complaint.status !== 'Escalated' ? (
                  <div className="bg-gray-700/30 p-8 rounded-lg border border-gray-700/50 text-center">
                    <p className="text-gray-400 font-medium">This complaint has not been resolved yet.</p>
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
                  </div>
                )}
              </div>
            )}

            {activeTab === 'escalation' && (
              <div className="animate-fadeIn bg-red-900/20 p-6 rounded-lg border border-red-900/50">
                <div className="flex items-center gap-3 mb-4 border-b border-red-900/30 pb-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h3 className="text-xl font-bold text-red-400">AI Escalation Report</h3>
                    <p className="text-sm text-red-300/70">Generated at {new Date(complaint.escalation?.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6 bg-red-900/30 p-3 rounded border border-red-900/50">
                  <span className="text-red-400 font-medium">Citizen Verification Split</span>
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-green-500">👍 {complaint.verification?.solvedVotes || 0}</span>
                    <span className="text-red-500">👎 {complaint.verification?.notSolvedVotes || 0}</span>
                  </div>
                </div>

                <div className="text-gray-300 space-y-4 leading-relaxed whitespace-pre-wrap">
                  {complaint.escalation?.report}
                </div>
              </div>
            )}

            {activeTab === 'ai_audit' && (
              <div className="animate-fadeIn">
                {!complaint.aiAudit ? (
                  <div className="bg-gray-700/30 p-8 rounded-lg border border-gray-700/50 text-center">
                    <p className="text-gray-400 font-medium">No AI Audit was generated for this complaint.</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 p-6 rounded-lg border border-purple-500">
                    <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                      <span>🤖</span> Resolution Audit Report
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Status</span>
                        <span className={complaint.aiAudit.status === 'Adequate' ? 'text-green-400 font-bold text-lg' : 'text-yellow-400 font-bold text-lg'}>
                          {complaint.aiAudit.status}
                        </span>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Confidence</span>
                        <span className="text-gray-200 font-bold text-lg">{complaint.aiAudit.confidence}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <span className="block text-gray-500 text-xs font-semibold uppercase mb-2">Summary</span>
                        <p className="text-gray-300 text-sm leading-relaxed">{complaint.aiAudit.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/10 p-4 rounded-lg border border-green-900/30">
                          <span className="block text-green-500/70 text-xs font-semibold uppercase mb-2">Improvements</span>
                          <p className="text-green-400 text-sm">{complaint.aiAudit.improvements}</p>
                        </div>
                        <div className="bg-red-900/10 p-4 rounded-lg border border-red-900/30">
                          <span className="block text-red-500/70 text-xs font-semibold uppercase mb-2">Remaining Issues</span>
                          <p className="text-red-400 text-sm">{complaint.aiAudit.remainingIssues}</p>
                        </div>
                      </div>

                      <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/30">
                        <span className="block text-purple-400/70 text-xs font-semibold uppercase mb-2">Recommendation</span>
                        <p className="text-purple-300 font-medium">{complaint.aiAudit.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 text-gray-300 border-t border-gray-700 pt-6">
            {/* AI Investigation Section */}
            {complaint.aiInvestigation && (
              <div className="mb-6 bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <span className="text-xl">🤖</span> AI Investigation Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <span className="block text-purple-300/70 text-xs font-semibold uppercase mb-1">Detected Issue Type</span>
                    <span className="text-white font-medium">{complaint.aiInvestigation.issueType}</span>
                    <span className="ml-2 text-xs text-gray-400 border border-gray-600 rounded px-2 py-0.5">Confidence: {complaint.aiInvestigation.confidence}</span>
                  </div>
                  {complaint.aiInvestigation.estimatedImpact && (
                    <div>
                      <span className="block text-purple-300/70 text-xs font-semibold uppercase mb-1">Estimated Impact</span>
                      <span className="text-red-300 font-medium">{complaint.aiInvestigation.estimatedImpact}</span>
                    </div>
                  )}
                </div>

                {complaint.aiInvestigation.questionsAndAnswers?.length > 0 && (
                  <div className="mb-6">
                    <span className="block text-purple-300/70 text-xs font-semibold uppercase mb-2">Citizen Q&A</span>
                    <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      {complaint.aiInvestigation.questionsAndAnswers.map((qa, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="block text-gray-400">Q: {qa.question}</span>
                          <span className="block text-white font-medium ml-4 mt-1 border-l-2 border-purple-500 pl-3">A: {qa.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {complaint.aiInvestigation.recommendedAction && (
                  <div>
                    <span className="block text-purple-300/70 text-xs font-semibold uppercase mb-1">Recommended Action</span>
                    <p className="text-purple-200 bg-purple-900/20 p-3 rounded text-sm italic border border-purple-500/20">
                      {complaint.aiInvestigation.recommendedAction}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Original Description</h3>
              <p className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityComplaintDetails;
