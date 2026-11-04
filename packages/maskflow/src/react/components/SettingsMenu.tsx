import React, { useState, useRef, useEffect } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { SettingsIcon } from '../icons';

export interface SettingsMenuProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

type MenuView = 'main' | 'speed' | 'quality' | 'theme' | 'shortcuts';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ player, state, className = '' }) => {
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

  // Listen for 's' shortcut to toggle settings
  useEffect(() => {
    return player.events.on('togglesettings', () => {
      setIsOpen((prev) => {
        const next = !prev;
        player.lockControls(next);
        if (!next) {
          setCurrentView('main');
        }
        return next;
      });
    });
  }, [player]);

  // Listen for '?' shortcut to toggle shortcuts menu
  useEffect(() => {
    return player.events.on('toggleshortcuts', () => {
      setIsOpen((prev) => {
        if (!prev) {
          setCurrentView('shortcuts');
          player.lockControls(true);
          return true;
        } else if (currentView === 'shortcuts') {
          player.lockControls(false);
          return false;
        } else {
          setCurrentView('shortcuts');
          return true;
        }
      });
    });
  }, [player, currentView]);

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
      if (containerRef.current && target && !containerRef.current.contains(target)) {
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
  const label = 'Settings (s)';

  return (
    <div ref={containerRef} className={`mf-settings-container ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        className="mf-btn mf-btn-settings"
        title={label}
        aria-label={label}
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

            <button
              type="button"
              className="mf-menu-item"
              role="menuitem"
              onClick={() => setCurrentView('theme')}
            >
              <span>Appearance</span>
              <span className="mf-menu-item-value">
                {state.theme === 'light' ? 'Light' : state.theme === 'dark' ? 'Dark' : 'Auto'} ›
              </span>
            </button>

            <button
              type="button"
              className="mf-menu-item"
              role="menuitem"
              onClick={() => setCurrentView('shortcuts')}
            >
              <span>Shortcuts</span>
              <span className="mf-menu-item-value">? ›</span>
            </button>
          </>
        )}

        {currentView === 'shortcuts' && (
          <div className="mf-shortcuts-view">
            <button
              type="button"
              className="mf-menu-item mf-menu-item-back"
              onClick={() => setCurrentView('main')}
            >
              <span>‹ Back to settings</span>
            </button>
            <div className="mf-shortcuts-table">
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>Space</kbd>
                </span>
                <span>Play / Pause</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>←</kbd> / <kbd>→</kbd>
                </span>
                <span>Seek ±10s</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>s</kbd>
                </span>
                <span>Toggle settings</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>f</kbd>
                </span>
                <span>Fullscreen</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>m</kbd>
                </span>
                <span>Mute</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>↑</kbd> / <kbd>↓</kbd>
                </span>
                <span>Volume ±5%</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>p</kbd>
                </span>
                <span>Picture-in-Picture</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>Esc</kbd>
                </span>
                <span>Close settings</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>Home</kbd> / <kbd>End</kbd>
                </span>
                <span>Start / End</span>
              </div>
              <div className="mf-shortcut-row">
                <span className="mf-shortcut-keys">
                  <kbd>0–9</kbd>
                </span>
                <span>Jump 0%–90%</span>
              </div>
            </div>
          </div>
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

        {currentView === 'theme' && (
          <>
            <button
              type="button"
              className="mf-menu-item mf-menu-item-back"
              onClick={() => setCurrentView('main')}
            >
              <span>‹ Back to settings</span>
            </button>
            {(
              [
                { id: 'dark', label: 'Dark theme' },
                { id: 'light', label: 'Light theme' },
                { id: 'auto', label: 'Device theme' },
              ] as const
            ).map(({ id, label: themeLabel }) => (
              <button
                key={id}
                type="button"
                className="mf-menu-item"
                role="menuitemradio"
                aria-checked={state.theme === id}
                onClick={() => {
                  player.setTheme(id);
                  closeMenu();
                }}
              >
                <span>{themeLabel}</span>
                {state.theme === id && <span>✓</span>}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
