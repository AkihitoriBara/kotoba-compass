import { createRoot } from 'react-dom/client';
import { CompanionPanel } from '../../components/companion-panel';
import { ThemeProvider } from '../../components/theme-provider';
import '../../assets/tailwind.css';

function App() {
  return (
    <ThemeProvider>
      <CompanionPanel />
    </ThemeProvider>
  );
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<App />);
}