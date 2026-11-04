import React, { useRef, useState, useCallback } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { VolumeHighIcon, VolumeMutedIcon } from '../icons';
import { clamp } from '../../core/utils/math';

export interface VolumeControlProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ player, state, className = '' }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isMuted = state.muted || state.volume === 0;
  const volumeLevel = isMuted ? 0 : state.volume;

  const calculateRatio = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    player.lockControls(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const ratio = calculateRatio(e.clientX);
    player.setVolume(ratio);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const ratio = calculateRatio(e.clientX);
      player.setVolume(ratio);
    }
  };

  const endDrag = (target: HTMLElement, pointerId: number) => {
    setIsDragging(false);
    player.lockControls(false);
    target.blur?.();
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      endDrag(e.currentTarget, e.pointerId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      endDrag(e.currentTarget, e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      player.setVolume(state.volume + 0.05);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      player.setVolume(state.volume - 0.05);
    }
  };

  const label = isMuted ? 'Unmute (m)' : 'Mute (m)';

  return (
    <div className={`mf-volume-container ${className}`.trim()}>
      <button
        type="button"
        className="mf-btn mf-btn-volume"
        title={label}
        aria-label={label}
        aria-pressed={isMuted}
        onClick={() => player.toggleMute()}
      >
        {isMuted ? <VolumeMutedIcon /> : <VolumeHighIcon />}
      </button>

      {/* Volume slider is desktop-only; hidden on mobile */}
      <div
        ref={sliderRef}
        className="mf-volume-slider mf-desktop-only"
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volumeLevel * 100)}
        aria-valuetext={`${Math.round(volumeLevel * 100)}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div className="mf-volume-rail">
          <div className="mf-volume-fill" style={{ width: `${volumeLevel * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
