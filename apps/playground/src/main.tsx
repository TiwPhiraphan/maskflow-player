import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MaskflowPlayer, type MaskflowPlayerInstance } from 'maskflow/react';
import 'maskflow/styles.css';
import './main.css';

const MASKFLOW_MULTI_QUALITY = [
  {
    src: 'https://storage.maskflow.online/api/public/video/1eapXswH1pP_w1gVNp7N_8wzZuTh3wxVr',
    quality: '1080p',
    label: '1080p HD',
    height: 1080,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1BX48blY-BxNk1fKp0pSSHQvpuCZO9x6l',
    quality: '720p',
    label: '720p',
    height: 720,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1ezg2DtHPDf0-TbhW3EGjOY0VA4-mT-bt',
    quality: '480p',
    label: '480p',
    height: 480,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/15il-NCbjt--HRn-q4cO7bdaw4sa0lkCW',
    quality: '360p',
    label: '360p',
    height: 360,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1P_QhQaYTfQLccMnmLG-hmLAwqyeo8TBP',
    quality: '240p',
    label: '240p',
    height: 240,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1AIR59Nz1_-e5GwXY8KcNHxwsyymovpnv',
    quality: '144p',
    label: '144p',
    height: 144,
  },
];

const SOURCES = {
  multiQuality: MASKFLOW_MULTI_QUALITY,
  v1080p: 'https://storage.maskflow.online/api/public/video/1eapXswH1pP_w1gVNp7N_8wzZuTh3wxVr',
  v720p: 'https://storage.maskflow.online/api/public/video/1BX48blY-BxNk1fKp0pSSHQvpuCZO9x6l',
  v480p: 'https://storage.maskflow.online/api/public/video/1ezg2DtHPDf0-TbhW3EGjOY0VA4-mT-bt',
  v360p: 'https://storage.maskflow.online/api/public/video/15il-NCbjt--HRn-q4cO7bdaw4sa0lkCW',
  v240p: 'https://storage.maskflow.online/api/public/video/1P_QhQaYTfQLccMnmLG-hmLAwqyeo8TBP',
  v144p: 'https://storage.maskflow.online/api/public/video/1AIR59Nz1_-e5GwXY8KcNHxwsyymovpnv',
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
};

const DEMO_TRACKS = [
  {
    kind: 'subtitles' as const,
    label: 'English',
    srclang: 'en',
    src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0AWelcome%20to%20Maskflow%20Player!%0A%0A2%0A00:00:06.000%20-->%2000:00:15.000%0AGlassmorphic%20Video%20Player%20with%20Subtitles',
    default: true,
  },
];

function App() {
  const [sourceKey, setSourceKey] = useState<keyof typeof SOURCES>('multiQuality');
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [accent, setAccent] = useState<string>('#8b5cf6');
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const [withSubtitles, setWithSubtitles] = useState<boolean>(false);
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
              className={`demo-btn ${sourceKey === 'multiQuality' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('multiQuality');
                e.currentTarget.blur();
              }}
            >
              Multi-Quality (144p - 1080p)
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v1080p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v1080p');
                e.currentTarget.blur();
              }}
            >
              1080p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v720p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v720p');
                e.currentTarget.blur();
              }}
            >
              720p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v480p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v480p');
                e.currentTarget.blur();
              }}
            >
              480p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v360p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v360p');
                e.currentTarget.blur();
              }}
            >
              360p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v240p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v240p');
                e.currentTarget.blur();
              }}
            >
              240p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'v144p' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('v144p');
                e.currentTarget.blur();
              }}
            >
              144p
            </button>
            <button
              type="button"
              className={`demo-btn ${sourceKey === 'hls' ? 'active' : ''}`}
              onClick={(e) => {
                setSourceKey('hls');
                e.currentTarget.blur();
              }}
            >
              HLS Stream (.m3u8)
            </button>
          </div>

          <div className="demo-group">
            <span className="demo-label">Theme:</span>
            <select
              className="demo-select"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value as 'dark' | 'light' | 'auto');
                e.target.blur();
              }}
            >
              <option value="dark">Dark (YouTube)</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div className="demo-group">
            <span className="demo-label">Subtitles:</span>
            <button
              type="button"
              className={`demo-btn ${withSubtitles ? 'active' : ''}`}
              onClick={(e) => {
                setWithSubtitles(!withSubtitles);
                e.currentTarget.blur();
              }}
            >
              {withSubtitles ? 'CC Tracks (On)' : 'None (Hidden)'}
            </button>
          </div>

          <div className="demo-group">
            <span className="demo-label">Accent:</span>
            <input
              type="color"
              className="demo-color"
              value={accent}
              onChange={(e) => {
                setAccent(e.target.value);
                e.target.blur();
              }}
            />
          </div>

          <div className="demo-group">
            <span className="demo-label">Aspect:</span>
            <select
              className="demo-select"
              value={aspectRatio}
              onChange={(e) => {
                setAspectRatio(e.target.value);
                e.target.blur();
              }}
            >
              <option value="16/9">16:9 (Default)</option>
              <option value="4/3">4:3</option>
              <option value="9/16">9:16 (Shorts/Reels)</option>
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
            title={`Maskflow Stream — ${sourceKey.toUpperCase()}`}
            tracks={withSubtitles ? DEMO_TRACKS : undefined}
            theme={theme}
            accent={accent}
            aspectRatio={aspectRatio}
            keyboard
            gestures
            persist
            onReady={(p: MaskflowPlayerInstance) => {
              console.log('[maskflow] React Player Ready!', p);
              p.events.on('themechange', (t) => {
                setTheme(t);
              });
            }}
          />
        </div>

        {/* Imperative API test panel */}
        <div className="demo-ref-panel">
          <h3 className="demo-ref-title">Imperative Ref Controls:</h3>
          <div className="demo-ref-btns">
            <button
              type="button"
              className="demo-btn"
              onClick={(e) => {
                playerRef.current?.toggle();
                e.currentTarget.blur();
              }}
            >
              player.toggle()
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={(e) => {
                playerRef.current?.seekBy(-10);
                e.currentTarget.blur();
              }}
            >
              player.seekBy(-10)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={(e) => {
                playerRef.current?.seekBy(10);
                e.currentTarget.blur();
              }}
            >
              player.seekBy(+10)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={(e) => {
                playerRef.current?.toggleMute();
                e.currentTarget.blur();
              }}
            >
              player.toggleMute()
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={(e) => {
                playerRef.current?.toggleFullscreen();
                e.currentTarget.blur();
              }}
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
