import React, { useState, useRef, useEffect } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { SettingsIcon } from '../icons';

export interface SettingsMenuProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

type MenuView = 'main' | 'speed' | 'quality';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ player, state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      player.lockControls(next);
      if (!next) {
        setCurrentView('main');
      }
      return next;
    });
  };

  const closeMenu = () => {
    setIsOpen(false);
    setCurrentView('main');
    player.lockControls(false);
    triggerRef.current?.focus();
  };

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const qualities = state.qualities;
  const hasQualities = qualities.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        className="mf-btn"
        aria-label="Settings"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <SettingsIcon />
      </button>

      <div
        ref={menuRef}
        className={`mf-menu mf-glass ${isOpen ? 'mf-menu-open' : ''}`}
        role="menu"
        aria-label="Player settings"
      >
        {currentView === 'main' && (
          <>
            <button
              type="button"
              className="mf-menu-item"
              role="menuitem"
              onClick={() => setCurrentView('speed')}
            >
              <span>Speed</span>
              <span style={{ opacity: 0.7 }}>{state.playbackRate}x ›</span>
            </button>

            {hasQualities && (
              <button
                type="button"
                className="mf-menu-item"
                role="menuitem"
                onClick={() => setCurrentView('quality')}
              >
                <span>Quality</span>
                <span style={{ opacity: 0.7 }}>
                  {state.quality === 'auto'
                    ? 'Auto'
                    : (qualities.find((q) => q.id === state.quality)?.label ?? state.quality)}
                  {' ›'}
                </span>
              </button>
            )}
          </>
        )}

        {currentView === 'speed' && (
          <>
            <button
              type="button"
              className="mf-menu-item"
              style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => setCurrentView('main')}
            >
              <span>‹ Back to settings</span>
            </button>
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                className="mf-menu-item"
                role="menuitemradio"
                aria-checked={state.playbackRate === speed}
                onClick={() => {
                  player.setRate(speed);
                  closeMenu();
                }}
              >
                <span>{speed === 1 ? '1x (Normal)' : `${speed}x`}</span>
                {state.playbackRate === speed && <span>✓</span>}
              </button>
            ))}
          </>
        )}

        {currentView === 'quality' && hasQualities && (
          <>
            <button
              type="button"
              className="mf-menu-item"
              style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => setCurrentView('main')}
            >
              <span>‹ Back to settings</span>
            </button>
            {qualities.map((q) => (
              <button
                key={String(q.id)}
                type="button"
                className="mf-menu-item"
                role="menuitemradio"
                aria-checked={state.quality === q.id}
                onClick={() => {
                  player.setQuality(q.id);
                  closeMenu();
                }}
              >
                <span>{q.label}</span>
                {state.quality === q.id && <span>✓</span>}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
