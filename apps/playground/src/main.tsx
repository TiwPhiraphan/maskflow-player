import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MaskflowPlayer, type MaskflowPlayerInstance } from 'maskflow/react';
import 'maskflow/styles.css';
import './main.css';

const SOURCES = {
  user: 'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF',
  multiQuality: [
    {
      src: 'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF',
      quality: '1080p',
      label: '1080p HD',
      height: 1080,
    },
    {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      quality: '720p',
      label: '720p',
      height: 720,
    },
    {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      quality: '480p',
      label: '480p',
      height: 480,
    },
  ],
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  tears: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  blazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
};

function App() {
  const [sourceKey, setSourceKey] = useState<keyof typeof SOURCES>('user');
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [accent, setAccent] = useState<string>('#8b5cf6');
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const playerRef = useRef<MaskflowPlayerInstance | null>(null);

  return (
    <div className={`demo-page theme-${theme}`}>
      <div className="demo-container">
        <header className="demo-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="demo-title">🔮 Maskflow Video Player (React)</h1>
            <a href="/vue.html" className="demo-btn" style={{ textDecoration: 'none' }}>
              Switch to Vue 3 Playground →
            </a>
          </div>
          <p className="demo-desc">
            Futuristic glassmorphism video player for React & Vue — Mobile-first, WCAG AA
            accessible.
          </p>
        </header>

        {/* Controls Toolbar */}
        <div className="demo-toolbar">
          <div className="demo-group">
            <span className="demo-label">Source:</span>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'user' ? 'active' : ''}`}
              onClick={() => setSourceKey('user')}
            >
              User Video (MP4)
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'multiQuality' ? 'active' : ''}`}
              onClick={() => setSourceKey('multiQuality')}
            >
              Multi-Quality (1080p/720p/480p)
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'hls' ? 'active' : ''}`}
              onClick={() => setSourceKey('hls')}
            >
              Mux HLS Stream (.m3u8)
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'tears' ? 'active' : ''}`}
              onClick={() => setSourceKey('tears')}
            >
              Tears of Steel
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'blazes' ? 'active' : ''}`}
              onClick={() => setSourceKey('blazes')}
            >
              Bigger Blazes
            </button>
          </div>

          <div className="demo-group">
            <span className="demo-label">Theme:</span>
            <select
              className="demo-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'auto')}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="demo-group">
            <span className="demo-label">Accent:</span>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              style={{ verticalAlign: 'middle', cursor: 'pointer' }}
            />
          </div>

          <div className="demo-group">
            <span className="demo-label">Aspect Ratio:</span>
            <select
              className="demo-select"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
            >
              <option value="16/9">16:9 (Default)</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1</option>
              <option value="21/9">21:9</option>
            </select>
          </div>
        </div>

        {/* Video Player */}
        <div className="demo-player-wrapper">
          <MaskflowPlayer
            ref={playerRef}
            src={SOURCES[sourceKey]}
            theme={theme}
            accent={accent}
            aspectRatio={aspectRatio}
            keyboard
            gestures
            persist
            onReady={(p: MaskflowPlayerInstance) => {
              console.log('[maskflow] React Player Ready!', p);
            }}
          />
        </div>

        {/* Imperative API test panel */}
        <div className="demo-ref-panel">
          <h3 className="demo-ref-title">Imperative Ref Controls:</h3>
          <div className="demo-ref-btns">
            <button type="button" className="demo-btn" onClick={() => playerRef.current?.toggle()}>
              player.toggle()
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => playerRef.current?.seekBy(-10)}
            >
              player.seekBy(-10)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => playerRef.current?.seekBy(10)}
            >
              player.seekBy(+10)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => playerRef.current?.toggleMute()}
            >
              player.toggleMute()
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => playerRef.current?.toggleFullscreen()}
            >
              player.toggleFullscreen()
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
