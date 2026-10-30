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
  const containerRef = useRef<HTMLDivElement>(null);
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

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    setCurrentView('main');
    player.lockControls(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  // Keyboard navigation & Escape key & outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
      }
    };

    const handleOutsideClick = (e: Event) => {
      const target = e.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        closeMenu(false);
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
    <div ref={containerRef} className="mf-settings-container">
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
              <span className="mf-menu-item-value">{state.playbackRate}x ›</span>
            </button>

            {hasQualities && (
              <button
                type="button"
                className="mf-menu-item"
                role="menuitem"
                onClick={() => setCurrentView('quality')}
              >
                <span>Quality</span>
                <span className="mf-menu-item-value">
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
              className="mf-menu-item mf-menu-item-back"
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
              className="mf-menu-item mf-menu-item-back"
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
