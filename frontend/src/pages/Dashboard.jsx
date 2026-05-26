import { Link } from 'react-router-dom';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

const modules = [
  {
    to: '/detection',
    title: 'Face Detection',
    description: 'Realtime detection, landmarks, lighting, FPS stats',
    icon: '◉',
  },
  {
    to: '/matching',
    title: 'Face Matching',
    description: 'Descriptor comparison, similarity scoring, thresholds',
    icon: '⇄',
  },
  {
    to: '/liveness',
    title: 'Liveness Detection',
    description: 'Blink, head turn, smile, nod — anti-static checks',
    icon: '◎',
  },
  {
    to: '/verification',
    title: 'Full Verification',
    description: 'Simulated onboarding: KYC upload → match → liveness',
    icon: '✓',
  },
  {
    to: '/diagnostics',
    title: 'Diagnostics Panel',
    description: 'FPS, latency, CPU estimate, session analytics',
    icon: '◈',
  },
];

export default function Dashboard() {
  const { loading, ready, error } = useFaceApiModels();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          Biometric QA Laboratory
        </h2>
        <p className="text-gray-400 max-w-2xl text-sm sm:text-base">
          Internal testing suite for evaluating face-api.js suitability for LGBTQIA+
          matrimony platform onboarding — selfie verification, liveness, and catfish
          prevention workflows.
        </p>
      </section>

      {!ready && loading && <LoadingSkeleton rows={2} />}

      {error && (
        <div className="glass-card border-accent-danger/30 p-4 text-sm text-accent-danger">
          {error}. See README for model download instructions.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="glass-card p-5 group hover:glow-border transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="text-2xl text-accent-glow mb-3 block group-hover:scale-110 transition-transform">
              {m.icon}
            </span>
            <h3 className="font-medium mb-1">{m.title}</h3>
            <p className="text-xs text-gray-500">{m.description}</p>
          </Link>
        ))}
      </div>

      <section className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Test coverage checklist</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-xs text-gray-500">
          {[
            'Face detection & landmarks',
            'Descriptor similarity matching',
            'Lightweight liveness validation',
            'Multi-face rejection',
            'Low-light / overexposure warnings',
            'Mobile browser performance',
            'Webcam stability & cleanup',
            'Profile photo validation simulation',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-accent-success">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
