import { createApp, defineComponent, ref, h } from 'vue';
import { MaskflowPlayer, type MaskflowVueInstance } from 'maskflow/vue';
import type { MaskflowPlayer as MaskflowCorePlayer } from 'maskflow';
import 'maskflow/styles.css';
import './main.css';

const MASKFLOW_MULTI_QUALITY = [
  {
    src: 'https://storage.maskflow.online/api/public/video/1eapXswH1pP_w1gVNp7N_8wzZuTh3wxVr',
    quality: '1080p',
    label: '1080p HD',
    height: 1080,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1BX48blY-BxNk1fKp0pSSHQvpuCZO9x6l',
    quality: '720p',
    label: '720p',
    height: 720,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1ezg2DtHPDf0-TbhW3EGjOY0VA4-mT-bt',
    quality: '480p',
    label: '480p',
    height: 480,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/15il-NCbjt--HRn-q4cO7bdaw4sa0lkCW',
    quality: '360p',
    label: '360p',
    height: 360,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1P_QhQaYTfQLccMnmLG-hmLAwqyeo8TBP',
    quality: '240p',
    label: '240p',
    height: 240,
  },
  {
    src: 'https://storage.maskflow.online/api/public/video/1AIR59Nz1_-e5GwXY8KcNHxwsyymovpnv',
    quality: '144p',
    label: '144p',
    height: 144,
  },
];

const SOURCES = {
  multiQuality: MASKFLOW_MULTI_QUALITY,
  v1080p: 'https://storage.maskflow.online/api/public/video/1eapXswH1pP_w1gVNp7N_8wzZuTh3wxVr',
  v720p: 'https://storage.maskflow.online/api/public/video/1BX48blY-BxNk1fKp0pSSHQvpuCZO9x6l',
  v480p: 'https://storage.maskflow.online/api/public/video/1ezg2DtHPDf0-TbhW3EGjOY0VA4-mT-bt',
  v360p: 'https://storage.maskflow.online/api/public/video/15il-NCbjt--HRn-q4cO7bdaw4sa0lkCW',
  v240p: 'https://storage.maskflow.online/api/public/video/1P_QhQaYTfQLccMnmLG-hmLAwqyeo8TBP',
  v144p: 'https://storage.maskflow.online/api/public/video/1AIR59Nz1_-e5GwXY8KcNHxwsyymovpnv',
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
};

const DEMO_TRACKS = [
  {
    kind: 'subtitles' as const,
    label: 'English',
    srclang: 'en',
    src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0AWelcome%20to%20Maskflow%20Player!%0A%0A2%0A00:00:06.000%20-->%2000:00:15.000%0AGlassmorphic%20Video%20Player%20with%20Subtitles',
    default: true,
  },
];

const App = defineComponent({
  name: 'VuePlaygroundApp',
  setup() {
    const sourceKey = ref<keyof typeof SOURCES>('multiQuality');
    const videoSrc = ref<string | typeof MASKFLOW_MULTI_QUALITY>(MASKFLOW_MULTI_QUALITY);
    const theme = ref<'dark' | 'light' | 'auto'>('dark');
    const accent = ref('#8b5cf6');
    const aspectRatio = ref('16/9');
    const withSubtitles = ref(false);
    const playerRef = ref<MaskflowVueInstance | null>(null);

    return () =>
      h('div', { className: `demo-page theme-${theme.value}` }, [
        h('div', { className: 'demo-container' }, [
          h('header', { className: 'demo-header' }, [
            h(
              'div',
              { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
              [
                h('h1', { className: 'demo-title' }, '🔮 Maskflow Video Player (Vue 3)'),
                h(
                  'a',
                  { href: '/', className: 'demo-btn', style: { textDecoration: 'none' } },
                  'Switch to React Playground →',
                ),
              ],
            ),
            h(
              'p',
              { className: 'demo-desc' },
              'Futuristic glassmorphism video player for Vue 3 — Mobile-first, WCAG AA accessible.',
            ),
          ]),

          h('div', { className: 'demo-toolbar' }, [
            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Source:'),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'multiQuality' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'multiQuality';
                    videoSrc.value = SOURCES.multiQuality;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'Multi-Quality (144p - 1080p)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v1080p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v1080p';
                    videoSrc.value = SOURCES.v1080p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '1080p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v720p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v720p';
                    videoSrc.value = SOURCES.v720p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '720p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v480p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v480p';
                    videoSrc.value = SOURCES.v480p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '480p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v360p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v360p';
                    videoSrc.value = SOURCES.v360p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '360p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v240p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v240p';
                    videoSrc.value = SOURCES.v240p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '240p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'v144p' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'v144p';
                    videoSrc.value = SOURCES.v144p;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                '144p',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${sourceKey.value === 'hls' ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    sourceKey.value = 'hls';
                    videoSrc.value = SOURCES.hls;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'HLS Stream (.m3u8)',
              ),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Theme:'),
              h(
                'select',
                {
                  className: 'demo-select',
                  value: theme.value,
                  onChange: (e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    theme.value = target.value as 'dark' | 'light' | 'auto';
                    target.blur();
                  },
                },
                [
                  h('option', { value: 'dark' }, 'Dark (YouTube)'),
                  h('option', { value: 'light' }, 'Light'),
                  h('option', { value: 'auto' }, 'Auto (System)'),
                ],
              ),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Subtitles:'),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${withSubtitles.value ? 'active' : ''}`,
                  onClick: (e: MouseEvent) => {
                    withSubtitles.value = !withSubtitles.value;
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                withSubtitles.value ? 'CC Tracks (On)' : 'None (Hidden)',
              ),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Accent:'),
              h('input', {
                type: 'color',
                className: 'demo-color',
                value: accent.value,
                onInput: (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  accent.value = target.value;
                  target.blur();
                },
              }),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Aspect:'),
              h(
                'select',
                {
                  className: 'demo-select',
                  value: aspectRatio.value,
                  onChange: (e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    aspectRatio.value = target.value;
                    target.blur();
                  },
                },
                [
                  h('option', { value: '16/9' }, '16:9 (Default)'),
                  h('option', { value: '4/3' }, '4:3'),
                  h('option', { value: '1/1' }, '1:1'),
                  h('option', { value: '21/9' }, '21:9'),
                ],
              ),
            ]),
          ]),

          h(
            'div',
            {
              className: 'demo-player-wrapper',
              style: { aspectRatio: aspectRatio.value.replace('/', ' / ') },
            },
            [
              h(MaskflowPlayer, {
                ref: playerRef,
                src: videoSrc.value,
                title: `Maskflow Stream (Vue 3) — ${sourceKey.value.toUpperCase()}`,
                tracks: withSubtitles.value ? DEMO_TRACKS : undefined,
                theme: theme.value,
                accent: accent.value,
                aspectRatio: aspectRatio.value,
                keyboard: true,
                gestures: true,
                persist: true,
                onReady: (p: MaskflowCorePlayer) => {
                  p.events.on('themechange', (t: 'dark' | 'light' | 'auto') => {
                    theme.value = t;
                  });
                },
              }),
            ],
          ),

          h('div', { className: 'demo-api-panel' }, [
            h('h3', 'Imperative Ref Controls (Vue):'),
            h('div', { className: 'demo-api-buttons' }, [
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: (e: MouseEvent) => {
                    playerRef.value?.toggle();
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'player.toggle()',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: (e: MouseEvent) => {
                    playerRef.value?.seekBy(-10);
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'player.seekBy(-10)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: (e: MouseEvent) => {
                    playerRef.value?.seekBy(10);
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'player.seekBy(+10)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: (e: MouseEvent) => {
                    playerRef.value?.toggleMute();
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'player.toggleMute()',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: (e: MouseEvent) => {
                    playerRef.value?.toggleFullscreen();
                    (e.currentTarget as HTMLElement).blur();
                  },
                },
                'player.toggleFullscreen()',
              ),
            ]),
          ]),
        ]),
      ]);
  },
});

const appEl = document.getElementById('app') || document.getElementById('vue-app');
if (appEl) {
  createApp(App).mount(appEl);
}
