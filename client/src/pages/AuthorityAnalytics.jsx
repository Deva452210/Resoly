import { Link } from 'react-router-dom';

const AuthorityAnalytics = () => {
  return (
    <div className="container mx-auto p-4 py-8 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-gray-800 p-10 rounded-xl border border-gray-700 text-center max-w-2xl w-full shadow-2xl">
        <span className="text-6xl block mb-6">📊</span>
        <h1 className="text-3xl font-bold text-white mb-4">AI Executive Dashboard</h1>
        <p className="text-gray-400 text-lg mb-8">
          The comprehensive analytics and predictive modeling interface is currently under construction.
        </p>
        <div className="inline-block border border-purple-500/50 bg-purple-900/20 text-purple-400 px-4 py-2 rounded-full font-medium mb-8">
          Coming Soon
        </div>
        <div>
          <Link to="/authority-dashboard" className="text-blue-400 hover:text-blue-300 transition-colors underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorityAnalytics;
