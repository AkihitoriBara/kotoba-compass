import { createRoot } from 'react-dom/client';
import '../../assets/tailwind.css';

function App() {
  return <main className="p-4">Kotoba Compass</main>;
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<App />);
}
