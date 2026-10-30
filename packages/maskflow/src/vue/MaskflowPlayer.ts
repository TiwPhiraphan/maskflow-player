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
} from '../core/types';
import { useMaskflow } from './useMaskflow';
import { formatTime } from '../core/utils/time';
import {
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
  CaptionsIcon,
  SettingsIcon,
  PipIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from './icons';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const MaskflowPlayer = defineComponent({
  name: 'MaskflowPlayer',
  props: {
    src: {
      type: [String, Array] as PropType<PlayerOptions['src']>,
      required: true,
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
      default: () => [
        'play',
        'progress',
        'time',
        'volume',
        'captions',
        'settings',
        'pip',
        'fullscreen',
      ],
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
      default: 2500,
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
    const currentMenuView = ref<'main' | 'speed' | 'quality'>('main');
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
      if (
        settingsContainerRef.value &&
        target &&
        !settingsContainerRef.value.contains(target)
      ) {
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

    // Double tap feedback
    const seekFlash = ref<{
      active: boolean;
      side: 'left' | 'right' | 'center';
      delta?: number | undefined;
    }>({
      active: false,
      side: 'center',
    });

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
        seekFlash.value = { active: true, side: data.side, delta: data.delta };
        setTimeout(() => {
          seekFlash.value = { ...seekFlash.value, active: false };
        }, 500);
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

    const blurTarget = (e: FocusEvent) => (e.currentTarget as HTMLElement | null)?.blur();

    return () => {
      const p = playerInstance.value;
      const s = state.value;

      const isVideoPlaying =
        s.status === 'playing' || (p?.video && !p.video.paused && !p.video.ended);

      const playerClasses = [
        'mf-player',
        isVideoPlaying ? 'mf-playing' : '',
        s.isFullscreen ? 'mf-fullscreen' : '',
        !s.controlsVisible ? 'mf-controls-hidden' : '',
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

      // Render Progress Bar
      const renderProgressBar = (): VNode | null => {
        if (!hasControl('progress') || !p) return null;
        const duration = s.duration > 0 ? s.duration : 0;
        const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (s.currentTime / duration) * 100)) : 0;
        const bufferedPercent = Math.min(100, Math.max(0, s.buffered * 100));

        return h(
          'div',
          {
            className: 'mf-progress',
            role: 'slider',
            tabIndex: 0,
            'aria-label': 'Seek progress',
            'aria-valuemin': 0,
            'aria-valuemax': Math.round(duration),
            'aria-valuenow': Math.round(s.currentTime),
            'aria-valuetext': `${formatTime(s.currentTime)} of ${formatTime(duration)}`,
            onClick: (e: MouseEvent) => {
              const target = e.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              p.seek(ratio * duration);
            },
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                p.seekBy(5);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                p.seekBy(-5);
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
                style: { width: `${progressPercent}%` },
              }),
              h('div', {
                className: 'mf-progress-thumb',
                style: { left: `${progressPercent}%` },
              }),
            ]),
          ],
        );
      };

      // Render Settings Menu
      const renderSettingsMenu = (): VNode | null => {
        if (!hasControl('settings') || !p) return null;
        const qualities = s.qualities;
        const hasQualities = qualities.length > 0;

        return h('div', { ref: settingsContainerRef, className: 'mf-settings-container' }, [
          h(
            'button',
            {
              type: 'button',
              className: 'mf-btn',
              'aria-label': 'Settings',
              'aria-haspopup': 'menu',
              'aria-expanded': isMenuOpen.value,
              onClick: toggleSettings,
              onFocus: blurTarget,
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

      // Control bar
      const renderControlBar = (): VNode | null => {
        if (!p) return null;

        return h('div', { className: 'mf-controls mf-glass', role: 'toolbar', 'aria-label': 'Media controls' }, [
          renderProgressBar(),
          h('div', { className: 'mf-controls-row' }, [
            // Left Group
            h('div', { className: 'mf-controls-left' }, [
              hasControl('play')
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'mf-btn',
                      'aria-label': s.status === 'playing' ? 'Pause' : 'Play',
                      onClick: () => p.toggle(),
                      onFocus: blurTarget,
                    },
                    [s.status === 'playing' ? PauseIcon() : PlayIcon()],
                  )
                : null,
              hasControl('volume')
                ? h('div', { className: 'mf-volume-container' }, [
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'mf-btn',
                        'aria-label': s.muted || s.volume === 0 ? 'Unmute' : 'Mute',
                        onClick: () => p.toggleMute(),
                        onFocus: blurTarget,
                      },
                      [s.muted || s.volume === 0 ? VolumeMutedIcon() : VolumeHighIcon()],
                    ),
                    h(
                      'div',
                      {
                        className: 'mf-volume-slider',
                        role: 'slider',
                        tabIndex: 0,
                        'aria-label': 'Volume',
                        'aria-valuemin': 0,
                        'aria-valuemax': 100,
                        'aria-valuenow': Math.round((s.muted ? 0 : s.volume) * 100),
                        'aria-valuetext': `${Math.round((s.muted ? 0 : s.volume) * 100)}%`,
                        onClick: (e: MouseEvent) => {
                          const target = e.currentTarget as HTMLElement;
                          const rect = target.getBoundingClientRect();
                          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          p.setVolume(ratio);
                        },
                      },
                      [
                        h('div', { className: 'mf-volume-rail' }, [
                          h('div', {
                            className: 'mf-volume-fill',
                            style: { width: `${(s.muted ? 0 : s.volume) * 100}%` },
                          }),
                        ]),
                      ],
                    ),
                  ])
                : null,
              hasControl('time')
                ? h(
                    'div',
                    {
                      className: 'mf-time',
                      'aria-label': `Current time ${formatTime(s.currentTime)} of ${formatTime(s.duration)}`,
                    },
                    [
                      h('span', { className: 'mf-time-current' }, formatTime(s.currentTime)),
                      h('span', { className: 'mf-time-separator' }, '/'),
                      h('span', { className: 'mf-time-duration' }, formatTime(s.duration)),
                    ],
                  )
                : null,
            ]),

            // Right Group
            h('div', { className: 'mf-controls-right' }, [
              hasControl('captions')
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: `mf-btn ${s.captionsEnabled ? 'mf-active' : ''}`,
                      'aria-label': 'Captions',
                      'aria-pressed': s.captionsEnabled,
                      onClick: () => p.toggleCaptions(),
                      onFocus: blurTarget,
                    },
                    [CaptionsIcon()],
                  )
                : null,
              renderSettingsMenu(),
              hasControl('pip')
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'mf-btn',
                      'aria-label': 'Picture in Picture',
                      onClick: () => p.togglePip(),
                      onFocus: blurTarget,
                    },
                    [PipIcon()],
                  )
                : null,
              hasControl('fullscreen')
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'mf-btn',
                      'aria-label': s.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
                      'aria-pressed': s.isFullscreen,
                      onClick: () => p.toggleFullscreen(),
                      onFocus: blurTarget,
                    },
                    [s.isFullscreen ? FullscreenExitIcon() : FullscreenEnterIcon()],
                  )
                : null,
            ]),
          ]),
        ]);
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

          // Seek flash overlay
          seekFlash.value.active
            ? h(
                'div',
                {
                  className: `mf-seek-flash mf-seek-${seekFlash.value.side} mf-active`,
                },
                [
                  h(
                    'div',
                    { className: 'mf-seek-flash-icon' },
                    seekFlash.value.side === 'left' ? '« 10s' : '10s »',
                  ),
                ],
              )
            : null,

          // Big play button
          p && !isVideoPlaying && s.status !== 'error'
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'mf-big-play',
                  'aria-label': s.status === 'ended' ? 'Replay' : 'Play video',
                  onClick: () => p.toggle(),
                  onFocus: blurTarget,
                },
                [PlayIcon()],
              )
            : null,

          // Spinner
          s.status === 'loading' ? h('div', { className: 'mf-spinner', 'aria-label': 'Loading' }) : null,

          // Error overlay
          s.status === 'error'
            ? h('div', { className: 'mf-error-overlay', role: 'alert', 'aria-live': 'assertive' }, [
                h('div', { className: 'mf-error-msg' }, s.error || 'A playback error occurred.'),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mf-btn mf-glass mf-error-retry',
                    onClick: () => {
                      if (typeof props.src === 'string' && p) {
                        p.video.src = props.src;
                      }
                      p?.play().catch(() => {});
                    },
                  },
                  'Retry',
                ),
              ])
            : null,

          renderControlBar(),
        ],
      );
    };
  },
});
