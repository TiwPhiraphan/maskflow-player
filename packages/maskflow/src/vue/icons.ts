import { h, type VNode } from 'vue';

export const PlayIcon = (): VNode =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
    h('polygon', { points: '6,4 20,12 6,20' }),
  ]);

export const PauseIcon = (): VNode =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
    h('rect', { x: '6', y: '4', width: '4', height: '16', rx: '1' }),
    h('rect', { x: '14', y: '4', width: '4', height: '16', rx: '1' }),
  ]);

export const VolumeHighIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('polygon', {
        points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5',
        fill: 'currentColor',
        stroke: 'none',
      }),
      h('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' }),
    ],
  );

export const VolumeMutedIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('polygon', {
        points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5',
        fill: 'currentColor',
        stroke: 'none',
      }),
      h('line', { x1: '23', y1: '9', x2: '17', y2: '15' }),
      h('line', { x1: '17', y1: '9', x2: '23', y2: '15' }),
    ],
  );

export const CaptionsIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('rect', { x: '2', y: '4', width: '20', height: '16', rx: '3' }),
      h('path', { d: 'M7 15h3M14 15h3M7 11h10' }),
    ],
  );

export const SettingsIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('circle', { cx: '12', cy: '12', r: '3' }),
      h('path', {
        d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
      }),
    ],
  );

export const PipIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }),
      h('rect', { x: '13', y: '11', width: '7', height: '6', rx: '1', fill: 'currentColor', stroke: 'none' }),
    ],
  );

export const FullscreenEnterIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('path', {
        d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
      }),
    ],
  );

export const FullscreenExitIcon = (): VNode =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      h('path', {
        d: 'M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10V4m0 6H4m6 0L3 3m10 7h6m-6 0V4m0 6l7-7',
      }),
    ],
  );

