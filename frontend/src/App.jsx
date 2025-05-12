import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SentimentDashboard from './pages/SentimentDashboard';
import Login from './pages/Login';
import Register from "./pages/Register";
import { isAuthenticated } from './auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={isAuthenticated() ? <SentimentDashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
