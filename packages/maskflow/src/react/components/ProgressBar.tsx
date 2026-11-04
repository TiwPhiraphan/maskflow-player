import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { formatTime } from '../../core/utils/time';
import { clamp } from '../../core/utils/math';

export interface ProgressBarProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ player, state, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null);

  const duration = state.duration > 0 ? state.duration : 0;
  const currentTime = state.currentTime;

  useEffect(() => {
    const unsub = player.events.on('seeked', () => {
      setPendingSeekTime(null);
    });
    return unsub;
  }, [player]);

  // If currentTime has caught up to pendingSeekTime, clear pending
  useEffect(() => {
    if (pendingSeekTime !== null && Math.abs(currentTime - pendingSeekTime) < 0.25) {
      setPendingSeekTime(null);
    }
  }, [currentTime, pendingSeekTime]);

  // While dragging or waiting for seek confirmation, hold position to prevent snapback
  const activePercent =
    isDragging && dragPercent !== null
      ? dragPercent
      : pendingSeekTime !== null && duration > 0
        ? clamp((pendingSeekTime / duration) * 100, 0, 100)
        : duration > 0
          ? clamp((currentTime / duration) * 100, 0, 100)
          : 0;

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
    setDragPercent(ratio * 100);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = calculateRatio(e.clientX);
    setHoverPosition(ratio);

    if (isDragging) {
      setDragPercent(ratio * 100);
    }
  };

  const commitSeekAndEndDrag = (target: HTMLElement, pointerId: number, clientX?: number) => {
    if (!isDragging) return;

    let finalRatio = dragPercent !== null ? dragPercent / 100 : 0;
    if (clientX !== undefined) {
      finalRatio = calculateRatio(clientX);
    }

    const targetTime = finalRatio * duration;
    setPendingSeekTime(targetTime);
    player.seek(targetTime);
    setIsDragging(false);
    setDragPercent(null);
    player.lockControls(false);
    target.blur?.();

    try {
      target.releasePointerCapture(pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    commitSeekAndEndDrag(e.currentTarget, e.pointerId, e.clientX);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    commitSeekAndEndDrag(e.currentTarget, e.pointerId);
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      player.seekBy(-10);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      player.seekBy(10);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPendingSeekTime(0);
      player.seek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPendingSeekTime(duration);
      player.seek(duration);
    }
  };

  const hoverTime = hoverPosition !== null && duration > 0 ? hoverPosition * duration : 0;
  const displayTime =
    isDragging && dragPercent !== null
      ? (dragPercent / 100) * duration
      : pendingSeekTime !== null
        ? pendingSeekTime
        : currentTime;

  return (
    <div
      ref={containerRef}
      className={`mf-progress ${isDragging ? 'mf-dragging' : ''} ${className}`.trim()}
      role="slider"
      tabIndex={0}
      aria-label="Seek progress"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(displayTime)}
      aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      <div className="mf-progress-rail">
        <div className="mf-progress-buffered" style={{ width: `${bufferedPercent}%` }} />
        <div className="mf-progress-played" style={{ width: `${activePercent}%` }} />
        <div className="mf-progress-thumb" style={{ left: `${activePercent}%` }} />
      </div>

      {hoverPosition !== null && duration > 0 && (
        <div className="mf-tooltip" style={{ left: `${hoverPosition * 100}%` }}>
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};
