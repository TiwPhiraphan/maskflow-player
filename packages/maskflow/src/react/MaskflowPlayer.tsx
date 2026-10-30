import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPlayer } from '../core/player';
import type { MaskflowPlayer as IMaskflowPlayer, PlayerOptions } from '../core/types';
import { useMaskflow } from './useMaskflow';
import { BigPlayButton } from './components/BigPlayButton';
import { ControlBar } from './components/ControlBar';
import { Spinner } from './components/Spinner';
import { ErrorOverlay } from './components/ErrorOverlay';

export interface MaskflowPlayerProps extends PlayerOptions {
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export const MaskflowPlayer = forwardRef<IMaskflowPlayer, MaskflowPlayerProps>((props, ref) => {
  const {
    src,
    poster,
    tracks,
    autoPlay = false,
    muted = false,
    loop = false,
    controls,
    theme = 'dark',
    accent,
    keyboard = true,
    gestures = true,
    persist = false,
    aspectRatio = '16/9',
    autoHideDelay = 2500,
    className = '',
    style = {},
    onReady,
    onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<IMaskflowPlayer | null>(null);

  // Double-tap visual feedback state
  const [seekFlash, setSeekFlash] = useState<{
    active: boolean;
    side: 'left' | 'right' | 'center';
    delta?: number | undefined;
  }>({ active: false, side: 'center' });

  // Core Player Initialization (Strict Mode Safe)
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const playerInstance = createPlayer(videoEl, {
      src,
      poster,
      tracks,
      autoPlay,
      muted,
      loop,
      controls,
      theme,
      accent,
      keyboard,
      gestures,
      persist,
      aspectRatio,
      autoHideDelay,
      container: containerEl,
      onReady,
      onError,
    });

    setPlayer(playerInstance);

    // Listen for double-tap seek to trigger visual flash animation
    const unsubDoubleTap = playerInstance.events.on('doubletap', (data) => {
      setSeekFlash({ active: true, side: data.side, delta: data.delta });
      setTimeout(() => {
        setSeekFlash((prev) => ({ ...prev, active: false }));
      }, 500);
    });

    return () => {
      unsubDoubleTap();
      playerInstance.destroy();
      setPlayer(null);
    };
  }, [src]);

  // Imperative ref forwarding
  useImperativeHandle(ref, () => player as IMaskflowPlayer, [player]);

  // Reactive store subscription
  const state = useMaskflow(player);

  const mergedStyle: React.CSSProperties = {
    ...style,
    aspectRatio: state.aspectRatio ? state.aspectRatio.replace('/', ' / ') : '16 / 9',
    ...(accent
      ? ({
          '--mf-accent': accent,
          '--mf-accent-solid': accent,
          '--mf-accent-glow': `${accent}66`,
        } as React.CSSProperties)
      : {}),
  };

  const containerClasses = [
    'mf-player',
    state.status === 'playing' ? 'mf-playing' : '',
    state.isFullscreen ? 'mf-fullscreen' : '',
    !state.controlsVisible ? 'mf-controls-hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClasses} data-theme={theme} style={mergedStyle}>
      <video ref={videoRef} className="mf-video" playsInline />

      {/* Double-tap Seek Animation Overlays */}
      {seekFlash.active && (
        <div
          className={`mf-seek-flash mf-seek-${seekFlash.side} ${
            seekFlash.active ? 'mf-active' : ''
          }`}
        >
          <div className="mf-seek-flash-icon">
            {seekFlash.side === 'left' ? '« 10s' : seekFlash.side === 'right' ? '10s »' : ''}
          </div>
        </div>
      )}

      {player && (
        <>
          <BigPlayButton player={player} state={state} />
          <Spinner state={state} />
          <ErrorOverlay player={player} state={state} />
          <ControlBar player={player} state={state} controls={controls} />
        </>
      )}
    </div>
  );
});

MaskflowPlayer.displayName = 'MaskflowPlayer';
