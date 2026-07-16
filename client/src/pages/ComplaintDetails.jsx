const ComplaintDetails = () => {
  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Complaint Details</h1>
      <div className="bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Pothole on Main St</h2>
        <p className="text-gray-300 mb-4">A large pothole has appeared causing damage to vehicles.</p>
        <div className="text-sm text-gray-500">Status: <span className="text-yellow-500">Pending</span></div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
