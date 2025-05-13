import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { isAuthenticated } from './auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
