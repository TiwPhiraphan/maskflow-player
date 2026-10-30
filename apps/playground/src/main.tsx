import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Maskflow Player Playground</h1>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
