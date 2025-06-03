import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import About from "./pages/About";
import Monitor from "./pages/Monitor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/monitor" element={<Monitor />} />
      </Routes>
    </Router>
  );
}

export default App;
