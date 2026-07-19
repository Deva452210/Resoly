import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AuthorityAnalytics = () => {
  const [civicIntelligence, setCivicIntelligence] = useState(null);
  const [generatingIntelligence, setGeneratingIntelligence] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const res = await api.get('/ai/civic-intelligence');
        if (res.data) {
          setCivicIntelligence(res.data);
        }
      } catch (error) {
        console.error('Error fetching civic intelligence:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, []);

  const handleGenerateIntelligence = async () => {
    setGeneratingIntelligence(true);
    try {
      const res = await api.post('/ai/civic-intelligence');
      setCivicIntelligence(res.data);
    } catch (error) {
      console.error('Error generating civic intelligence:', error);
      alert('Failed to generate civic intelligence. AI might be busy.');
    } finally {
      setGeneratingIntelligence(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-gray-700 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">System Analytics</h1>
        <Link to="/authority-dashboard" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors border border-gray-600">
          Return to Dashboard
        </Link>
      </div>

      <div className="mb-10 bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🧠</span> AI Civic Intelligence
            </h2>
            <p className="text-sm text-gray-400 mt-1">Holistic systemic analysis and root cause identification</p>
          </div>
          <button 
            onClick={handleGenerateIntelligence}
            disabled={generatingIntelligence}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 border border-gray-600"
          >
            {generatingIntelligence ? (
              <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Analyzing System...</>
            ) : (
              <>🔄 Refresh Intelligence</>
            )}
          </button>
        </div>

        {civicIntelligence ? (
          <div className="space-y-8">
            
            {civicIntelligence.criticalAlerts?.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
                <h3 className="text-red-400 font-bold uppercase text-sm mb-3 flex items-center gap-2">
                  <span>🚨</span> Critical Alerts
                </h3>
                <ul className="space-y-2">
                  {civicIntelligence.criticalAlerts.map((alert, idx) => (
                    <li key={idx} className="text-red-200 text-sm flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-orange-400 font-bold uppercase text-sm mb-3 flex items-center gap-2">
                  <span>🔍</span> Possible Root Causes
                </h3>
                <ul className="space-y-2">
                  {civicIntelligence.possibleRootCauses?.map((cause, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                  <span>🔗</span> Related Complaints
                </h3>
                <div className="space-y-4">
                  {civicIntelligence.relatedComplaints?.map((relation, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                      <p className="text-gray-300 text-sm font-medium mb-2">{relation.pattern}</p>
                      <div className="flex flex-wrap gap-2">
                        {relation.complaints?.map((comp, cIdx) => (
                          <Link 
                            key={cIdx} 
                            to={`/authority-complaint/${comp.id}`}
                            className="text-xs bg-gray-800 text-white border border-gray-700 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                          >
                            #{comp.title.substring(0, 15)}...
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                <span>💡</span> AI Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {civicIntelligence.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-sm mb-3">{rec.action}</p>
                    {rec.linkedComplaints?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                        {rec.linkedComplaints.map((comp, cIdx) => (
                          <Link 
                            key={cIdx} 
                            to={`/authority-complaint/${comp.id}`}
                            className="text-xs bg-gray-800 text-white border border-gray-700 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                          >
                            🔗 {comp.title.substring(0, 20)}...
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right text-xs text-gray-500 pt-2">
              Last generated: {new Date(civicIntelligence.generatedAt).toLocaleString()}
            </div>
            
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-4">No Civic Intelligence report has been generated yet.</p>
            <button 
              onClick={handleGenerateIntelligence}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Run First Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityAnalytics;
