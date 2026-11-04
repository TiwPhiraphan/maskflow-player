import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  type PropType,
  type CSSProperties,
  type VNode,
} from 'vue';
import { createPlayer } from '../core/player';
import type {
  MaskflowPlayer as IMaskflowPlayer,
  PlayerOptions,
  DoubleTapEvent,
  QualityLevel,
} from '../core/types';
import { useMaskflow } from './useMaskflow';
import { formatTime } from '../core/utils/time';
import {
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
  SettingsIcon,
  PipIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  ReplayIcon,
  ErrorIcon,
  SeekBackwardIcon,
  SeekForwardIcon,
} from './icons';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export const MaskflowPlayer = defineComponent({
  name: 'MaskflowPlayer',
  props: {
    src: {
      type: [String, Array] as PropType<PlayerOptions['src']>,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      default: '',
    },
    poster: {
      type: String as PropType<string>,
      default: undefined,
    },
    tracks: {
      type: Array as PropType<PlayerOptions['tracks']>,
      default: () => [],
    },
    autoPlay: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    muted: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    loop: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    controls: {
      type: Array as PropType<string[]>,
      default: () => ['play', 'progress', 'time', 'volume', 'settings', 'pip', 'fullscreen'],
    },
    theme: {
      type: String as PropType<'dark' | 'light' | 'auto'>,
      default: 'dark',
    },
    accent: {
      type: String as PropType<string>,
      default: undefined,
    },
    keyboard: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    gestures: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    persist: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    aspectRatio: {
      type: String as PropType<string>,
      default: '16/9',
    },
    autoHideDelay: {
      type: Number as PropType<number>,
      default: 3000,
    },
    qualities: {
      type: Array as PropType<QualityLevel[]>,
      default: undefined,
    },
    class: {
      type: String as PropType<string>,
      default: '',
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
  },
  emits: ['ready', 'error'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const videoRef = ref<HTMLVideoElement | null>(null);
    const playerInstance = ref<IMaskflowPlayer | null>(null);

    // Settings menu state
    const isMenuOpen = ref(false);
    const currentMenuView = ref<'main' | 'speed' | 'quality' | 'shortcuts'>('main');
    const settingsContainerRef = ref<HTMLDivElement | null>(null);

    const closeSettings = () => {
      isMenuOpen.value = false;
      currentMenuView.value = 'main';
      playerInstance.value?.lockControls(false);
    };

    const toggleSettings = () => {
      isMenuOpen.value = !isMenuOpen.value;
      if (!isMenuOpen.value) {
        currentMenuView.value = 'main';
      }
      playerInstance.value?.lockControls(isMenuOpen.value);
    };

    // Outside click & Escape key to dismiss settings menu
    const handleOutsideClick = (e: Event) => {
      if (!isMenuOpen.value) return;
      const target = e.target as Node | null;
      if (settingsContainerRef.value && target && !settingsContainerRef.value.contains(target)) {
        closeSettings();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen.value && e.key === 'Escape') {
        e.preventDefault();
        closeSettings();
      }
    };

    watch(isMenuOpen, (open) => {
      if (open) {
        document.addEventListener('pointerdown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
      } else {
        document.removeEventListener('pointerdown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      }
    });

    // Double tap feedback state
    const seekFlash = ref<{
      active: boolean;
      side: 'left' | 'right' | 'center';
      seconds: number;
    }>({
      active: false,
      side: 'center',
      seconds: 10,
    });
    let seekTimer: ReturnType<typeof setTimeout> | null = null;

    const hoverPosition = ref<number | null>(null);
    const isProgressDragging = ref(false);
    const progressDragPercent = ref<number | null>(null);

    // Reactive store state
    const state = useMaskflow(playerInstance);

    // Initialize player
    const initPlayer = () => {
      const videoEl = videoRef.value;
      const containerEl = containerRef.value;
      if (!videoEl || !containerEl) return;

      if (playerInstance.value) {
        playerInstance.value.destroy();
      }

      const player = createPlayer(videoEl, {
        src: props.src,
        title: props.title,
        poster: props.poster,
        tracks: props.tracks,
        autoPlay: props.autoPlay,
        muted: props.muted,
        loop: props.loop,
        controls: props.controls,
        theme: props.theme,
        accent: props.accent,
        keyboard: props.keyboard,
        gestures: props.gestures,
        persist: props.persist,
        aspectRatio: props.aspectRatio,
        autoHideDelay: props.autoHideDelay,
        qualities: props.qualities,
        container: containerEl,
        onReady: (p) => {
          emit('ready', p);
        },
        onError: (err) => {
          emit('error', err);
        },
      });

      playerInstance.value = player;

      player.events.on('doubletap', (data: DoubleTapEvent) => {
        if (data.side === 'center') return;
        const absDelta = Math.abs(data.delta ?? 10);

        seekFlash.value = {
          active: true,
          side: data.side,
          seconds: absDelta,
        };

        if (seekTimer) clearTimeout(seekTimer);
        seekTimer = setTimeout(() => {
          seekFlash.value = { ...seekFlash.value, active: false };
        }, 1000);
      });

      player.events.on('togglesettings', () => {
        toggleSettings();
      });

      player.events.on('toggleshortcuts', () => {
        if (!isMenuOpen.value) {
          currentMenuView.value = 'shortcuts';
          isMenuOpen.value = true;
          player.lockControls(true);
        } else if (currentMenuView.value === 'shortcuts') {
          closeSettings();
        } else {
          currentMenuView.value = 'shortcuts';
        }
      });
    };

    onMounted(() => {
      initPlayer();
    });

    watch(
      () => props.src,
      () => {
        initPlayer();
      },
    );

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (playerInstance.value) {
        playerInstance.value.destroy();
        playerInstance.value = null;
      }
    });

    // Expose player methods
    expose({
      getPlayer: () => playerInstance.value,
      play: () => playerInstance.value?.play(),
      pause: () => playerInstance.value?.pause(),
      toggle: () => playerInstance.value?.toggle(),
      seek: (t: number) => playerInstance.value?.seek(t),
      seekBy: (dt: number) => playerInstance.value?.seekBy(dt),
      setVolume: (v: number) => playerInstance.value?.setVolume(v),
      toggleMute: () => playerInstance.value?.toggleMute(),
      setRate: (r: number) => playerInstance.value?.setRate(r),
      setQuality: (q: string | number) => playerInstance.value?.setQuality(q),
      toggleFullscreen: () => playerInstance.value?.toggleFullscreen(),
      togglePip: () => playerInstance.value?.togglePip(),
      toggleCaptions: () => playerInstance.value?.toggleCaptions(),
      destroy: () => playerInstance.value?.destroy(),
    });

    return () => {
      const p = playerInstance.value;
      const s = state.value;

      const isVideoPlaying =
        s.status === 'playing' || (p?.video && !p.video.paused && !p.video.ended);
      const isError = s.status === 'error';

      const playerClasses = [
        'mf-player',
        isVideoPlaying ? 'mf-playing' : '',
        s.isFullscreen ? 'mf-fullscreen' : '',
        !s.controlsVisible && !isError ? 'mf-controls-hidden' : '',
        isError ? 'mf-error' : '',
        props.class,
      ]
        .filter(Boolean)
        .join(' ');

      const formattedRatio = (s.aspectRatio || '16/9').replace('/', ' / ');
      const containerStyle: CSSProperties = {
        ...props.style,
        aspectRatio: s.isFullscreen ? 'auto' : formattedRatio,
        ...(props.accent
          ? ({
              '--mf-accent': props.accent,
              '--mf-accent-solid': props.accent,
              '--mf-accent-glow': `${props.accent}66`,
            } as CSSProperties)
          : {}),
      };

      const hasControl = (item: string) => !props.controls || props.controls.includes(item);

      // Render Progress Bar with pointer drag commit
      const renderProgressBar = (): VNode | null => {
        if (!hasControl('progress') || !p) return null;
        const duration = s.duration > 0 ? s.duration : 0;
        const activePercent =
          isProgressDragging.value && progressDragPercent.value !== null
            ? progressDragPercent.value
            : duration > 0
              ? Math.min(100, Math.max(0, (s.currentTime / duration) * 100))
              : 0;

        const bufferedPercent = Math.min(100, Math.max(0, s.buffered * 100));
        const hoverTime =
          hoverPosition.value !== null && duration > 0 ? hoverPosition.value * duration : 0;
        const displayTime =
          isProgressDragging.value && progressDragPercent.value !== null
            ? (progressDragPercent.value / 100) * duration
            : s.currentTime;

        const endDrag = (target: HTMLElement, pointerId: number, clientX?: number) => {
          if (!isProgressDragging.value) return;
          let finalRatio = progressDragPercent.value !== null ? progressDragPercent.value / 100 : 0;
          if (clientX !== undefined) {
            const rect = target.getBoundingClientRect();
            if (rect.width > 0) {
              finalRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            }
          }
          p.seek(finalRatio * duration);
          isProgressDragging.value = false;
          progressDragPercent.value = null;
          p.lockControls(false);
          try {
            target.releasePointerCapture(pointerId);
          } catch {
            // Ignore
          }
        };

        return h(
          'div',
          {
            className: `mf-progress ${isProgressDragging.value ? 'mf-dragging' : ''}`,
            role: 'slider',
            tabIndex: 0,
            'aria-label': 'Seek progress',
            'aria-valuemin': 0,
            'aria-valuemax': Math.round(duration),
            'aria-valuenow': Math.round(displayTime),
            'aria-valuetext': `${formatTime(displayTime)} of ${formatTime(duration)}`,
            onPointerdown: (e: PointerEvent) => {
              if (e.button !== 0) return;
              isProgressDragging.value = true;
              p.lockControls(true);
              const target = e.currentTarget as HTMLElement;
              try {
                target.setPointerCapture(e.pointerId);
              } catch {
                // Ignore
              }
              const rect = target.getBoundingClientRect();
              if (rect.width > 0) {
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                progressDragPercent.value = ratio * 100;
              }
            },
            onPointermove: (e: PointerEvent) => {
              const target = e.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              if (rect.width > 0) {
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                hoverPosition.value = ratio;
                if (isProgressDragging.value) {
                  progressDragPercent.value = ratio * 100;
                }
              }
            },
            onPointerup: (e: PointerEvent) => {
              endDrag(e.currentTarget as HTMLElement, e.pointerId, e.clientX);
            },
            onPointercancel: (e: PointerEvent) => {
              endDrag(e.currentTarget as HTMLElement, e.pointerId);
            },
            onPointerleave: () => {
              if (!isProgressDragging.value) {
                hoverPosition.value = null;
              }
            },
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                p.seekBy(10);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                p.seekBy(-10);
              }
            },
          },
          [
            h('div', { className: 'mf-progress-rail' }, [
              h('div', {
                className: 'mf-progress-buffered',
                style: { width: `${bufferedPercent}%` },
              }),
              h('div', {
                className: 'mf-progress-played',
                style: { width: `${activePercent}%` },
              }),
              h('div', {
                className: 'mf-progress-thumb',
                style: { left: `${activePercent}%` },
              }),
            ]),
            hoverPosition.value !== null && duration > 0
              ? h(
                  'div',
                  {
                    className: 'mf-tooltip',
                    style: { left: `${hoverPosition.value * 100}%` },
                  },
                  formatTime(hoverTime),
                )
              : null,
          ],
        );
      };

      // Render Settings Menu
      const renderSettingsMenu = (): VNode | null => {
        if (!hasControl('settings') || !p) return null;
        const qualities = s.qualities;
        const hasQualities = qualities.length > 0;
        const label = 'Settings (s)';

        return h('div', { ref: settingsContainerRef, className: 'mf-settings-container' }, [
          h(
            'button',
            {
              type: 'button',
              className: 'mf-btn mf-btn-settings',
              title: label,
              'aria-label': label,
              'aria-haspopup': 'menu',
              'aria-expanded': isMenuOpen.value,
              onClick: toggleSettings,
            },
            [SettingsIcon()],
          ),
          h(
            'div',
            {
              className: `mf-menu mf-glass ${isMenuOpen.value ? 'mf-menu-open' : ''}`,
              role: 'menu',
              'aria-label': 'Player settings',
            },
            [
              currentMenuView.value === 'main'
                ? [
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'mf-menu-item',
                        role: 'menuitem',
                        onClick: () => {
                          currentMenuView.value = 'speed';
                        },
                      },
                      [
                        h('span', 'Speed'),
                        h('span', { className: 'mf-menu-item-value' }, `${s.playbackRate}x ›`),
                      ],
                    ),
                    hasQualities
                      ? h(
                          'button',
                          {
                            type: 'button',
                            className: 'mf-menu-item',
                            role: 'menuitem',
                            onClick: () => {
                              currentMenuView.value = 'quality';
                            },
                          },
                          [
                            h('span', 'Quality'),
                            h(
                              'span',
                              { className: 'mf-menu-item-value' },
                              `${s.quality === 'auto' ? 'Auto' : s.quality} ›`,
                            ),
                          ],
                        )
                      : null,
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'mf-menu-item',
                        role: 'menuitem',
                        onClick: () => {
                          currentMenuView.value = 'shortcuts';
                        },
                      },
                      [
                        h('span', 'Shortcuts'),
                        h('span', { className: 'mf-menu-item-value' }, '? ›'),
                      ],
                    ),
                  ]
                : currentMenuView.value === 'shortcuts'
                  ? [
                      h('div', { className: 'mf-shortcuts-view' }, [
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'mf-menu-item mf-menu-item-back',
                            onClick: () => {
                              currentMenuView.value = 'main';
                            },
                          },
                          [h('span', '‹ Back to settings')],
                        ),
                        h('div', { className: 'mf-shortcuts-table' }, [
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 'Space')]),
                            h('span', 'Play / Pause'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [
                              h('kbd', '←'),
                              ' / ',
                              h('kbd', '→'),
                            ]),
                            h('span', 'Seek ±10s'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 's')]),
                            h('span', 'Toggle settings'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 'f')]),
                            h('span', 'Fullscreen'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 'm')]),
                            h('span', 'Mute'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [
                              h('kbd', '↑'),
                              ' / ',
                              h('kbd', '↓'),
                            ]),
                            h('span', 'Volume ±5%'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 'p')]),
                            h('span', 'Picture-in-Picture'),
                          ]),
                          h('div', { className: 'mf-shortcut-row' }, [
                            h('span', { className: 'mf-shortcut-keys' }, [h('kbd', 'Esc')]),
                            h('span', 'Close settings'),
                          ]),
                        ]),
                      ]),
                    ]
                  : currentMenuView.value === 'speed'
                    ? [
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'mf-menu-item mf-menu-item-back',
                            onClick: () => {
                              currentMenuView.value = 'main';
                            },
                          },
                          [h('span', '‹ Back to settings')],
                        ),
                        ...SPEEDS.map((sp) =>
                          h(
                            'button',
                            {
                              key: sp,
                              type: 'button',
                              className: 'mf-menu-item',
                              role: 'menuitemradio',
                              'aria-checked': s.playbackRate === sp,
                              onClick: () => {
                                p.setRate(sp);
                                closeSettings();
                              },
                            },
                            [
                              h('span', sp === 1 ? '1x (Normal)' : `${sp}x`),
                              s.playbackRate === sp ? h('span', '✓') : null,
                            ],
                          ),
                        ),
                      ]
                    : [
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'mf-menu-item mf-menu-item-back',
                            onClick: () => {
                              currentMenuView.value = 'main';
                            },
                          },
                          [h('span', '‹ Back to settings')],
                        ),
                        ...qualities.map((q) =>
                          h(
                            'button',
                            {
                              key: String(q.id),
                              type: 'button',
                              className: 'mf-menu-item',
                              role: 'menuitemradio',
                              'aria-checked': s.quality === q.id,
                              onClick: () => {
                                p.setQuality(q.id);
                                closeSettings();
                              },
                            },
                            [h('span', q.label), s.quality === q.id ? h('span', '✓') : null],
                          ),
                        ),
                      ],
            ],
          ),
        ]);
      };

      // Bottom Row: 7 items (Play, Volume, CurrentTime, Progress, Duration, PiP, Fullscreen)
      const renderBottomBar = (): VNode | null => {
        if (!p) return null;

        const isPaused = p.video ? p.video.paused : s.status !== 'playing';
        const isEnded = s.status === 'ended' || (p.video ? p.video.ended : false);
        const isPlaying = !isPaused && !isEnded;
        const isMuted = s.muted || s.volume === 0;

        const playLabel = isEnded ? 'Replay (space)' : isPlaying ? 'Pause (space)' : 'Play (space)';
        const volLabel = isMuted ? 'Unmute (m)' : 'Mute (m)';
        const fsLabel = s.isFullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)';
        const pipLabel = 'Picture-in-picture (p)';

        return h(
          'div',
          { className: 'mf-bottom-bar', role: 'toolbar', 'aria-label': 'Media controls' },
          [
            // 1. Play/pause button (desktop only)
            hasControl('play')
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'mf-btn mf-btn-play mf-desktop-only',
                    title: playLabel,
                    'aria-label': playLabel,
                    'aria-pressed': isPlaying,
                    onClick: () => p.toggle(),
                  },
                  [isEnded ? ReplayIcon() : isPlaying ? PauseIcon() : PlayIcon()],
                )
              : null,

            // 2. Volume control (grouped button + range input, range is desktop only)
            hasControl('volume')
              ? h('div', { className: 'mf-volume-container' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'mf-btn mf-btn-volume',
                      title: volLabel,
                      'aria-label': volLabel,
                      'aria-pressed': isMuted,
                      onClick: () => p.toggleMute(),
                    },
                    [isMuted ? VolumeMutedIcon() : VolumeHighIcon()],
                  ),
                  h(
                    'div',
                    {
                      className: 'mf-volume-slider mf-desktop-only',
                      role: 'slider',
                      tabIndex: 0,
                      'aria-label': 'Volume',
                      'aria-valuemin': 0,
                      'aria-valuemax': 100,
                      'aria-valuenow': Math.round((isMuted ? 0 : s.volume) * 100),
                      'aria-valuetext': `${Math.round((isMuted ? 0 : s.volume) * 100)}%`,
                      onClick: (e: MouseEvent) => {
                        const target = e.currentTarget as HTMLElement;
                        const rect = target.getBoundingClientRect();
                        const ratio = Math.max(
                          0,
                          Math.min(1, (e.clientX - rect.left) / rect.width),
                        );
                        p.setVolume(ratio);
                      },
                    },
                    [
                      h('div', { className: 'mf-volume-rail' }, [
                        h('div', {
                          className: 'mf-volume-fill',
                          style: { width: `${(isMuted ? 0 : s.volume) * 100}%` },
                        }),
                      ]),
                    ],
                  ),
                ])
              : null,

            // 3. Current time: mm:ss (no hours)
            hasControl('time')
              ? h(
                  'span',
                  {
                    className: 'mf-time mf-time-current',
                    'aria-label': `Current time ${formatTime(s.currentTime)}`,
                  },
                  formatTime(s.currentTime),
                )
              : null,

            // 4. Progress bar (flex-1)
            renderProgressBar(),

            // 5. Duration: mm:ss (no hours)
            hasControl('time')
              ? h(
                  'span',
                  {
                    className: 'mf-time mf-time-duration',
                    'aria-label': `Duration ${formatTime(s.duration)}`,
                  },
                  formatTime(s.duration),
                )
              : null,

            // 6. Picture-in-picture button (desktop only)
            hasControl('pip')
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'mf-btn mf-btn-pip mf-desktop-only',
                    title: pipLabel,
                    'aria-label': pipLabel,
                    'aria-pressed': s.isPip,
                    onClick: () => p.togglePip(),
                  },
                  [PipIcon()],
                )
              : null,

            // 7. Fullscreen button
            hasControl('fullscreen')
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'mf-btn mf-btn-fullscreen',
                    title: fsLabel,
                    'aria-label': fsLabel,
                    'aria-pressed': s.isFullscreen,
                    onClick: () => p.toggleFullscreen(),
                  },
                  [s.isFullscreen ? FullscreenExitIcon() : FullscreenEnterIcon()],
                )
              : null,
          ],
        );
      };

      // Center Big Play / Loading Button
      const renderCenterBigButton = (): VNode | null => {
        if (!p || s.status === 'error') return null;

        const isLoading = s.loading || s.status === 'buffering' || s.status === 'loading';
        if (isLoading) {
          return h(
            'div',
            {
              className: 'mf-big-play mf-big-play-loading',
              role: 'status',
              'aria-label': 'Loading media',
            },
            [h('div', { className: 'mf-spinner' })],
          );
        }

        const isPaused = p.video ? p.video.paused : s.status !== 'playing';
        const isEnded = s.status === 'ended' || (p.video ? p.video.ended : false);
        const isPlaying = !isPaused && !isEnded;
        const label = isEnded ? 'Replay (space)' : isPlaying ? 'Pause (space)' : 'Play (space)';

        return h(
          'button',
          {
            type: 'button',
            className: `mf-big-play ${isPlaying ? 'mf-playing' : ''}`,
            title: label,
            'aria-label': label,
            'aria-pressed': isPlaying,
            onClick: () => p.toggle(),
          },
          [isEnded ? ReplayIcon() : isPlaying ? PauseIcon() : PlayIcon()],
        );
      };

      return h(
        'div',
        {
          ref: containerRef,
          className: playerClasses,
          'data-theme': props.theme,
          style: containerStyle,
        },
        [
          h('video', { ref: videoRef, className: 'mf-video', playsinline: true }),

          // Seek flash overlay (Stacked)
          seekFlash.value.active && seekFlash.value.side !== 'center'
            ? h(
                'div',
                {
                  className: `mf-seek-flash mf-seek-${seekFlash.value.side} ${
                    seekFlash.value.active ? 'mf-active' : ''
                  }`,
                },
                [
                  h('div', { key: seekFlash.value.seconds, className: 'mf-seek-flash-content' }, [
                    h('div', { className: 'mf-seek-flash-arrows' }, [
                      seekFlash.value.side === 'left' ? SeekBackwardIcon() : SeekForwardIcon(),
                    ]),
                    h(
                      'div',
                      { className: 'mf-seek-flash-text' },
                      seekFlash.value.side === 'left'
                        ? `-${seekFlash.value.seconds}s`
                        : `+${seekFlash.value.seconds}s`,
                    ),
                  ]),
                ],
              )
            : null,

          // 3-Row Grid Controls Wrapper
          p
            ? h('div', { className: 'mf-controls-wrapper' }, [
                // Top Row: Title + Settings
                h('div', { className: 'mf-top-bar' }, [
                  h(
                    'div',
                    {
                      className: 'mf-title',
                      title: props.title || s.title || '',
                    },
                    props.title || s.title || '',
                  ),
                  h('div', { className: 'mf-top-actions' }, [renderSettingsMenu()]),
                ]),

                // Center Row: Left Seek Zone, Center Big Button, Right Seek Zone
                h('div', { className: 'mf-center-row' }, [
                  h('div', { className: 'mf-seek-zone mf-seek-zone-left', 'aria-hidden': 'true' }),
                  h('div', { className: 'mf-center-action' }, [renderCenterBigButton()]),
                  h('div', { className: 'mf-seek-zone mf-seek-zone-right', 'aria-hidden': 'true' }),
                ]),

                // Bottom Row: 7 controls in flex row
                renderBottomBar(),

                // Error Screen
                s.status === 'error'
                  ? h(
                      'div',
                      { className: 'mf-error-overlay', role: 'alert', 'aria-live': 'assertive' },
                      [
                        h('div', { className: 'mf-error-icon' }, [ErrorIcon()]),
                        h(
                          'div',
                          { className: 'mf-error-msg' },
                          s.error || 'A playback error occurred.',
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'mf-btn mf-glass mf-error-retry',
                            onClick: () => {
                              const wasPlaying = p.video && !p.video.paused;
                              p.video.load();
                              if (wasPlaying || s.status === 'playing') {
                                p.play().catch(() => {});
                              }
                            },
                          },
                          'Retry',
                        ),
                      ],
                    )
                  : null,
              ])
            : null,
        ],
      );
    };
  },
});
