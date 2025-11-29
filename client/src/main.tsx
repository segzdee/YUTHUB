import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Sentry integration ready - install @sentry/react to enable
// import { initSentry } from '@/lib/sentry';
// import { SentryErrorBoundary } from '@/components/common/SentryErrorBoundary';
// initSentry();

createRoot(document.getElementById('root')!).render(<App />);
