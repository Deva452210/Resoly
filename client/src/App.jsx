import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import ComplaintDetails from './pages/ComplaintDetails';
import OfficerDashboard from './pages/OfficerDashboard';

function App() {
  return (
    <Router>
      <div className="bg-[#121212] min-h-screen text-gray-200 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
