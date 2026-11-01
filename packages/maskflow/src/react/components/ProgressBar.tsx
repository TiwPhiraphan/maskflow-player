import React, { useState, useRef, useCallback } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { formatTime } from '../../core/utils/time';
import { clamp } from '../../core/utils/math';

export interface ProgressBarProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ player, state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const duration = state.duration > 0 ? state.duration : 0;
  const currentTime = state.currentTime;
  const playedPercent = duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0;
  const bufferedPercent = clamp(state.buffered * 100, 0, 100);

  const calculateRatio = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
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
    player.seek(ratio * duration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = calculateRatio(e.clientX);
    setHoverPosition(ratio);

    if (isDragging) {
      player.seek(ratio * duration);
    }
  };

  const endDrag = (target: HTMLElement, pointerId: number) => {
    setIsDragging(false);
    player.lockControls(false);
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      // Ignore if pointer capture lost
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

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      player.seekBy(-5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      player.seekBy(5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      player.seek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      player.seek(duration);
    }
  };

  const hoverTime = hoverPosition !== null && duration > 0 ? hoverPosition * duration : 0;

  return (
    <div
      ref={containerRef}
      className={`mf-progress ${isDragging ? 'mf-dragging' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Seek progress"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={formatTime(currentTime)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      <div className="mf-progress-rail">
        <div className="mf-progress-buffered" style={{ width: `${bufferedPercent}%` }} />
        <div className="mf-progress-played" style={{ width: `${playedPercent}%` }} />
        <div className="mf-progress-thumb" style={{ left: `${playedPercent}%` }} />
      </div>

      {hoverPosition !== null && duration > 0 && (
        <div className="mf-tooltip" style={{ left: `${hoverPosition * 100}%` }}>
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};
