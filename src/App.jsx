import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RouteFinder from './pages/RouteFinder';
import History from './pages/History';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RouteFinder />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
