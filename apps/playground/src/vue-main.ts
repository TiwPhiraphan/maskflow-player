import { createApp, defineComponent, ref, h } from 'vue';
import { MaskflowPlayer, type MaskflowVueInstance } from 'maskflow/vue';
import 'maskflow/styles.css';
import './main.css';

const App = defineComponent({
  name: 'VuePlaygroundApp',
  setup() {
    const videoSrc = ref(
      'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF',
    );
    const theme = ref<'dark' | 'light' | 'auto'>('dark');
    const accent = ref('#8b5cf6');
    const aspectRatio = ref('16/9');
    const playerRef = ref<MaskflowVueInstance | null>(null);

    return () =>
      h('div', { className: `demo-page theme-${theme.value}` }, [
        h('div', { className: 'demo-container' }, [
          h('header', { className: 'demo-header' }, [
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
              h('h1', { className: 'demo-title' }, '🔮 Maskflow Video Player (Vue 3)'),
              h('a', { href: '/', className: 'demo-btn', style: { textDecoration: 'none' } }, 'Switch to React Playground →'),
            ]),
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
                  className: `demo-btn ${
                    videoSrc.value ===
                    'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF'
                      ? 'active'
                      : ''
                  }`,
                  onClick: () => {
                    videoSrc.value =
                      'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF';
                  },
                },
                'User Video (MP4)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `demo-btn ${
                    videoSrc.value === 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                      ? 'active'
                      : ''
                  }`,
                  onClick: () => {
                    videoSrc.value = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
                  },
                },
                'Mux HLS Stream (.m3u8)',
              ),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Theme:'),
              h(
                'select',
                {
                  value: theme.value,
                  className: 'demo-select',
                  onChange: (e: Event) => {
                    theme.value = (e.target as HTMLSelectElement).value as 'dark' | 'light' | 'auto';
                  },
                },
                [
                  h('option', { value: 'dark' }, 'Dark'),
                  h('option', { value: 'light' }, 'Light'),
                  h('option', { value: 'auto' }, 'Auto'),
                ],
              ),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Accent:'),
              h('input', {
                type: 'color',
                value: accent.value,
                className: 'demo-color-picker',
                onInput: (e: Event) => {
                  accent.value = (e.target as HTMLInputElement).value;
                },
              }),
            ]),

            h('div', { className: 'demo-group' }, [
              h('span', { className: 'demo-label' }, 'Aspect Ratio:'),
              h(
                'select',
                {
                  value: aspectRatio.value,
                  className: 'demo-select',
                  onChange: (e: Event) => {
                    aspectRatio.value = (e.target as HTMLSelectElement).value;
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
                theme: theme.value,
                accent: accent.value,
                aspectRatio: aspectRatio.value,
                keyboard: true,
                gestures: true,
                persist: true,
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
                  onClick: () => playerRef.value?.toggle(),
                },
                'player.toggle()',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: () => playerRef.value?.seekBy(-10),
                },
                'player.seekBy(-10)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: () => playerRef.value?.seekBy(10),
                },
                'player.seekBy(+10)',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: () => playerRef.value?.toggleMute(),
                },
                'player.toggleMute()',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'demo-btn',
                  onClick: () => playerRef.value?.toggleFullscreen(),
                },
                'player.toggleFullscreen()',
              ),
            ]),
          ]),
        ]),
      ]);
  },
});

createApp(App).mount('#app');
