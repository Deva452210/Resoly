import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import ComplaintDetails from './pages/ComplaintDetails';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerComplaintDetails from './pages/OfficerComplaintDetails';
import ReportIssue from './pages/ReportIssue';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityComplaintDetails from './pages/AuthorityComplaintDetails';
import AuthorityAnalytics from './pages/AuthorityAnalytics';
import AiInvestigation from './pages/AiInvestigation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-[#121212] min-h-screen text-gray-200 font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Citizen Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['citizen', 'officer']} />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/complaint/:id" element={<ComplaintDetails />} />
              <Route path="/report-issue" element={<ReportIssue />} />
              <Route path="/ai-investigation" element={<AiInvestigation />} />
            </Route>

            {/* Officer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
              <Route path="/officer-dashboard" element={<OfficerDashboard />} />
              <Route path="/officer-complaint/:id" element={<OfficerComplaintDetails />} />
            </Route>

            {/* Authority Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['authority']} />}>
              <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
              <Route path="/authority-complaint/:id" element={<AuthorityComplaintDetails />} />
              <Route path="/authority-analytics" element={<AuthorityAnalytics />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
