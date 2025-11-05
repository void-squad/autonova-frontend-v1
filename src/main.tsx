import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import logoUrl from '@/assets/logo.png';

createRoot(document.getElementById('root')!).render(<App />);

const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
if (favicon) {
  favicon.href = logoUrl;
}
