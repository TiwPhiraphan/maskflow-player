import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MaskflowPlayer } from '../react/MaskflowPlayer';
import type { MaskflowPlayer as MaskflowPlayerType } from '../core/types';

describe('MaskflowPlayer React Component', () => {
  beforeEach(() => {
    // Mock HTMLMediaElement methods in jsdom
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it('renders player container with 16:9 default aspect ratio and 3-row layout skeleton', () => {
    const { container } = render(
      <MaskflowPlayer src="https://example.com/video.mp4" title="Sample Video Title" />,
    );

    const playerEl = container.querySelector('.mf-player') as HTMLElement;
    expect(playerEl).toBeTruthy();
    expect(playerEl.style.aspectRatio).toBe('16 / 9');

    // Controls wrapper (CSS grid with 3 rows)
    const wrapper = container.querySelector('.mf-controls-wrapper');
    expect(wrapper).toBeTruthy();

    // Top row with title and settings
    const topBar = container.querySelector('.mf-top-bar');
    expect(topBar).toBeTruthy();
    expect(screen.getByText('Sample Video Title')).toBeTruthy();

    // Center row with seek zones and big play button
    const centerRow = container.querySelector('.mf-center-row');
    expect(centerRow).toBeTruthy();
    expect(container.querySelector('.mf-seek-zone-left')).toBeTruthy();
    expect(container.querySelector('.mf-seek-zone-right')).toBeTruthy();

    // Bottom row with media controls
    const bottomBar = container.querySelector('.mf-bottom-bar');
    expect(bottomBar).toBeTruthy();
  });

  it('renders buttons with dynamic titles and matching aria-labels', () => {
    render(<MaskflowPlayer src="https://example.com/video.mp4" />);

    // Play buttons (center big button + desktop bottom button) with Play (space)
    expect(screen.getAllByLabelText('Play (space)').length).toBe(2);
    expect(screen.getByRole('toolbar', { name: 'Media controls' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Seek progress' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeTruthy();
    expect(screen.getByLabelText('Settings (s)')).toBeTruthy();
    expect(screen.getByLabelText('Fullscreen (f)')).toBeTruthy();
  });

  it('toggles settings menu and changes speed', () => {
    render(<MaskflowPlayer src="https://example.com/video.mp4" />);

    const settingsBtn = screen.getByLabelText('Settings (s)');
    fireEvent.click(settingsBtn);

    // Speed option in settings menu
    const speedBtn = screen.getByText('Speed');
    expect(speedBtn).toBeTruthy();
    fireEvent.click(speedBtn);

    // Select 1.5x
    const speed15Btn = screen.getByText('1.5x');
    expect(speed15Btn).toBeTruthy();
    fireEvent.click(speed15Btn);

    // Menu should close
    expect(screen.queryByText('1.5x')).toBeFalsy();
  });

  it('forwards imperative player ref', () => {
    const ref = React.createRef<MaskflowPlayerType>();
    render(<MaskflowPlayer ref={ref} src="https://example.com/video.mp4" />);

    expect(ref.current).toBeTruthy();
    expect(typeof ref.current?.play).toBe('function');
    expect(typeof ref.current?.pause).toBe('function');
    expect(ref.current?.getState().aspectRatio).toBe('16/9');
  });
});
