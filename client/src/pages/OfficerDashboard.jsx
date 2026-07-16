import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const OfficerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Government Officer Dashboard</h1>
      
      <div className="bg-gray-800 p-6 rounded shadow max-w-4xl mb-8">
        <h2 className="text-2xl text-gray-200">Welcome, <span className="font-bold text-blue-400">{user?.name}</span></h2>
        <p className="text-gray-400 mt-2 text-lg">Role: Officer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
        <div className="bg-gray-800 p-6 rounded shadow border-t-4 border-blue-500">
          <h3 className="text-gray-400 text-lg font-semibold mb-2">Total Complaints</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded shadow border-t-4 border-red-500">
          <h3 className="text-gray-400 text-lg font-semibold mb-2">Reported</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>

        <div className="bg-gray-800 p-6 rounded shadow border-t-4 border-yellow-500">
          <h3 className="text-gray-400 text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>

        <div className="bg-gray-800 p-6 rounded shadow border-t-4 border-green-500">
          <h3 className="text-gray-400 text-lg font-semibold mb-2">Resolved</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
