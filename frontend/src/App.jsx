import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FaceDetectionTest from './pages/FaceDetectionTest.jsx';
import FaceMatchingTest from './pages/FaceMatchingTest.jsx';
import LivenessTest from './pages/LivenessTest.jsx';
import VerificationSimulation from './pages/VerificationSimulation.jsx';
import DiagnosticsPanel from './pages/DiagnosticsPanel.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="detection" element={<FaceDetectionTest />} />
          <Route path="matching" element={<FaceMatchingTest />} />
          <Route path="liveness" element={<LivenessTest />} />
          <Route path="verification" element={<VerificationSimulation />} />
          <Route path="diagnostics" element={<DiagnosticsPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
