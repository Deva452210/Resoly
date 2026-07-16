const Feed = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Complaint Feed</h1>
      <div className="grid gap-4 max-w-2xl mx-auto">
        <div className="bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2">Pothole on Main St</h3>
          <p className="text-gray-400">Location: Main St & 4th Ave</p>
          <div className="mt-4 text-sm text-blue-400 cursor-pointer">View Details &rarr;</div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
