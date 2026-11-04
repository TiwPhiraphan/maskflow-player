import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPlayer } from '../core/player';
import type { MaskflowPlayer as IMaskflowPlayer, PlayerOptions } from '../core/types';
import { useMaskflow } from './useMaskflow';
import { BigPlayButton } from './components/BigPlayButton';
import { ControlBar } from './components/ControlBar';
import { SettingsMenu } from './components/SettingsMenu';
import { ErrorOverlay } from './components/ErrorOverlay';
import { SeekBackwardIcon, SeekForwardIcon } from './icons';

export interface MaskflowPlayerProps extends PlayerOptions {
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export const MaskflowPlayer = forwardRef<IMaskflowPlayer, MaskflowPlayerProps>((props, ref) => {
  const {
    src,
    title,
    poster,
    tracks,
    autoPlay = false,
    muted = false,
    loop = false,
    controls = ['play', 'progress', 'time', 'volume', 'settings', 'pip', 'fullscreen'],
    theme = 'dark',
    accent,
    keyboard = true,
    gestures = true,
    persist = false,
    aspectRatio = '16/9',
    autoHideDelay = 3000,
    qualities,
    className = '',
    style = {},
    onReady,
    onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<IMaskflowPlayer | null>(null);

  // Double-tap visual feedback state (stacked: +10s, +20s, +30s...)
  const [seekFlash, setSeekFlash] = useState<{
    active: boolean;
    side: 'left' | 'right' | 'center';
    seconds: number;
  }>({ active: false, side: 'center', seconds: 10 });

  const seekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core Player Initialization (Strict Mode Safe)
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const playerInstance = createPlayer(videoEl, {
      src,
      title,
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
      if (data.side === 'center') {
        setSeekFlash((prev) => ({ ...prev, active: false }));
        return;
      }
      const absDelta = Math.abs(data.delta ?? 10);
      setSeekFlash({
        active: true,
        side: data.side,
        seconds: absDelta,
      });

      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      seekTimerRef.current = setTimeout(() => {
        setSeekFlash((prev) => ({ ...prev, active: false }));
      }, 1000);
    });

    return () => {
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      unsubDoubleTap();
      playerInstance.destroy();
      setPlayer(null);
    };
  }, [src]);

  // Reactive store subscription
  const state = useMaskflow(player);

  // Sync theme prop
  useEffect(() => {
    if (player && theme && theme !== state.theme) {
      player.setTheme(theme);
    }
  }, [player, theme, state.theme]);

  // Imperative ref forwarding
  useImperativeHandle(ref, () => player as IMaskflowPlayer, [player]);

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
  const isError = state.status === 'error';

  const containerClasses = [
    'mf-player',
    isVideoPlaying ? 'mf-playing' : '',
    state.isFullscreen ? 'mf-fullscreen' : '',
    !state.controlsVisible && !isError ? 'mf-controls-hidden' : '',
    isError ? 'mf-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isEnabled = (name: string) => controls.includes(name);

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      data-theme={state.theme || theme}
      style={mergedStyle}
    >
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
              {seekFlash.side === 'left' ? <SeekBackwardIcon /> : <SeekForwardIcon />}
            </div>
            <div className="mf-seek-flash-text">
              {seekFlash.side === 'left' ? `-${seekFlash.seconds}s` : `+${seekFlash.seconds}s`}
            </div>
          </div>
        </div>
      )}

      {player && (
        <div className="mf-controls-wrapper">
          {/* Top Row: Video title (flex-1) + Settings */}
          <div className="mf-top-bar">
            <div className="mf-title" title={title || state.title || ''}>
              {title || state.title || ''}
            </div>
            <div className="mf-top-actions">
              {isEnabled('settings') && <SettingsMenu player={player} state={state} />}
            </div>
          </div>

          {/* Center Row: Seek Zones (Left & Right, non-overlapping) + Center Big Button */}
          <div className="mf-center-row">
            <div className="mf-seek-zone mf-seek-zone-left" aria-hidden="true" />
            <div className="mf-center-action">
              <BigPlayButton player={player} state={state} />
            </div>
            <div className="mf-seek-zone mf-seek-zone-right" aria-hidden="true" />
          </div>

          {/* Bottom Row: 7 controls in flex row */}
          <ControlBar player={player} state={state} controls={controls} />

          {/* Error Screen (Solid black overlay, top row stays visible, bottom row hidden) */}
          <ErrorOverlay player={player} state={state} />
        </div>
      )}
    </div>
  );
});

MaskflowPlayer.displayName = 'MaskflowPlayer';
