import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MaskflowPlayer, type MaskflowPlayerInstance } from 'maskflow/react';
import 'maskflow/styles.css';

const SOURCES = {
  user: 'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF',
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
};

function App() {
  const [sourceKey, setSourceKey] = useState<'user' | 'hls'>('user');
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [accent, setAccent] = useState<string>('#8b5cf6');
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const playerRef = useRef<MaskflowPlayerInstance | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme === 'light' ? '#f8fafc' : '#090b10',
        color: theme === 'light' ? '#0f172a' : '#f8fafc',
        padding: '32px 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>
            🔮 Maskflow Video Player
          </h1>
          <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem' }}>
            Futuristic glassmorphism video player for React & Vue — Mobile-first, WCAG AA
            accessible.
          </p>
        </header>

        {/* Controls Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
            alignItems: 'center',
            background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
            padding: '12px 16px',
            borderRadius: 12,
          }}
        >
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>Source:</span>
            <button
              type="button"
              onClick={() => setSourceKey('user')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: sourceKey === 'user' ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                marginRight: 6,
              }}
            >
              User Video (MP4)
            </button>
            <button
              type="button"
              onClick={() => setSourceKey('hls')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: sourceKey === 'hls' ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Mux HLS Stream (.m3u8)
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'auto')}
              style={{ padding: '6px 10px', borderRadius: 6 }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>Accent:</span>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              style={{ verticalAlign: 'middle', cursor: 'pointer' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>
              Aspect Ratio:
            </span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6 }}
            >
              <option value="16/9">16:9 (Default)</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1</option>
              <option value="21/9">21:9</option>
            </select>
          </div>
        </div>

        {/* Video Player */}
        <div style={{ maxWidth: '100%', borderRadius: 16, overflow: 'hidden' }}>
          <MaskflowPlayer
            ref={playerRef}
            src={SOURCES[sourceKey]}
            theme={theme}
            accent={accent}
            aspectRatio={aspectRatio}
            keyboard
            gestures
            persist
            onReady={(p) => {
              console.log('[maskflow] React Player Ready!', p);
            }}
          />
        </div>

        {/* Imperative API test panel */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Imperative Ref Controls:</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => playerRef.current?.toggle()}
              style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
            >
              player.toggle()
            </button>
            <button
              type="button"
              onClick={() => playerRef.current?.seekBy(-10)}
              style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
            >
              player.seekBy(-10)
            </button>
            <button
              type="button"
              onClick={() => playerRef.current?.seekBy(10)}
              style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
            >
              player.seekBy(+10)
            </button>
            <button
              type="button"
              onClick={() => playerRef.current?.toggleMute()}
              style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
            >
              player.toggleMute()
            </button>
            <button
              type="button"
              onClick={() => playerRef.current?.toggleFullscreen()}
              style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
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
