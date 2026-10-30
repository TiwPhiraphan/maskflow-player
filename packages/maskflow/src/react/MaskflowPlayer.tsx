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
    qualities,
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
    seconds: number;
  }>({ active: false, side: 'center', seconds: 10 });

  const seekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const lastSeekSideRef = useRef<'left' | 'right' | 'center'>('center');

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
      qualities,
      container: containerEl,
      onReady,
      onError,
    });

    setPlayer(playerInstance);

    // Listen for seek / double-tap to trigger stacked visual flash animation
    const unsubDoubleTap = playerInstance.events.on('doubletap', (data) => {
      if (data.side === 'center') return;
      const absDelta = Math.abs(data.delta ?? 10);
      if (lastSeekSideRef.current === data.side && accumulatedSecondsRef.current > 0) {
        accumulatedSecondsRef.current += absDelta;
      } else {
        accumulatedSecondsRef.current = absDelta;
        lastSeekSideRef.current = data.side;
      }

      setSeekFlash({
        active: true,
        side: data.side,
        seconds: accumulatedSecondsRef.current,
      });

      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      seekTimerRef.current = setTimeout(() => {
        setSeekFlash((prev) => ({ ...prev, active: false }));
        accumulatedSecondsRef.current = 0;
      }, 750);
    });

    return () => {
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
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
    aspectRatio: state.isFullscreen
      ? 'auto'
      : state.aspectRatio
        ? state.aspectRatio.replace('/', ' / ')
        : '16 / 9',
    ...(accent
      ? ({
          '--mf-accent': accent,
          '--mf-accent-solid': accent,
          '--mf-accent-glow': `${accent}66`,
        } as React.CSSProperties)
      : {}),
  };

  const isVideoPlaying =
    state.status === 'playing' || (player?.video && !player.video.paused && !player.video.ended);

  const containerClasses = [
    'mf-player',
    isVideoPlaying ? 'mf-playing' : '',
    state.isFullscreen ? 'mf-fullscreen' : '',
    !state.controlsVisible ? 'mf-controls-hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClasses} data-theme={theme} style={mergedStyle}>
      <video ref={videoRef} className="mf-video" playsInline />

      {/* Double-tap / Seek Animation Overlays (Stacked) */}
      {seekFlash.active && seekFlash.side !== 'center' && (
        <div
          className={`mf-seek-flash mf-seek-${seekFlash.side} ${
            seekFlash.active ? 'mf-active' : ''
          }`}
        >
          <div key={seekFlash.seconds} className="mf-seek-flash-content">
            <div className="mf-seek-flash-arrows">
              {seekFlash.side === 'left' ? (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M12 6v12l-6-6 6-6zm6 0v12l-6-6 6-6z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M6 6v12l6-6-6-6zm6 0v12l6-6-6-6z" />
                </svg>
              )}
            </div>
            <div className="mf-seek-flash-text">{seekFlash.seconds} seconds</div>
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
