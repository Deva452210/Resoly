import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Resolution state
  const [afterImage, setAfterImage] = useState(null);
  const [notes, setNotes] = useState('');

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

  useEffect(() => {
    fetchComplaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setStatus(complaint.status);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolutionSubmit = async () => {
    if (!afterImage || !notes) {
      alert('Please provide an after photo and resolution notes.');
      return;
    }
    
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('afterImage', afterImage);
      formData.append('notes', notes);

      await api.patch(`/officer/complaints/${id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Complaint resolved successfully!');
      fetchComplaint(); // Refresh data to show updated resolution
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Failed to resolve complaint.');
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{complaint.title}</h1>
            {complaint.status === 'Resolved' && (
              <span className="px-4 py-2 rounded-full bg-green-900/50 text-green-400 font-medium text-sm border border-green-800">
                Resolved
              </span>
            )}
          </div>

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

          {/* AI Investigation Section */}
          {complaint.aiInvestigation && (
            <div className="mb-8 bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
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

          <div className="mb-8">
            <span className="block text-gray-500 text-sm font-medium mb-2">Description</span>
            <p className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-gray-300">{complaint.description}</p>
          </div>

          {/* Officer Management Section */}
          {complaint.status !== 'Resolved' && (
            <div className="bg-gray-900 p-6 rounded-lg border border-purple-500 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-4">Manage Complaint Status</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
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
                {status !== 'Resolved' && (
                  <button 
                    onClick={handleStatusUpdate}
                    disabled={updating || status === complaint.status}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {updating ? 'Saving...' : 'Save Status'}
                  </button>
                )}
              </div>

              {/* Resolution Workflow */}
              {status === 'Resolved' && (
                <div className="border-t border-gray-700 pt-6 mt-2 space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-bold text-green-400 mb-2">Resolution Requirements</h3>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Upload After Photo *</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setAfterImage(e.target.files[0])}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-purple-300 hover:file:bg-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Resolution Notes *</label>
                    <textarea 
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail the actions taken to resolve this issue..."
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleResolutionSubmit}
                    disabled={updating}
                    className="w-full px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Processing...' : 'Complete Resolution'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Read-Only Resolution State */}
          {complaint.status === 'Resolved' && complaint.resolution && (
            <div className="bg-gray-900 p-6 rounded-lg border border-green-500 animate-fadeIn mt-8">
              <h2 className="text-xl font-bold text-green-400 mb-6">Resolution Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase text-center">Before</h4>
                  <img src={complaint.imageUrl} alt="Before" className="w-full h-48 object-cover rounded" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg border border-green-900/50">
                  <h4 className="text-xs font-semibold text-green-500 mb-2 uppercase text-center">After</h4>
                  <img src={complaint.resolution.afterImageUrl} alt="After" className="w-full h-48 object-cover rounded" />
                </div>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Resolution Notes</h3>
                <p className="text-gray-200">{complaint.resolution.notes}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap justify-between text-xs text-gray-500">
                  <span>Resolved By: {complaint.resolution.resolvedBy?.name || 'Officer'}</span>
                  <span>Resolved Date: {new Date(complaint.resolution.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetails;
