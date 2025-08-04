import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Auth />} /> 
      </Routes>
    </Router>
  );
}
