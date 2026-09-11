import { create } from 'zustand';
import {
  StudioProject,
  ActiveToolTab,
  AspectRatio,
  ZoomClip,
  FrameType,
  BackgroundType,
  CursorStyle,
} from '../types/project';

interface StudioState {
  // Active Project State
  project: StudioProject;
  activeTab: ActiveToolTab;
  setActiveTab: (tab: ActiveToolTab) => void;

  // Playback State
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  viewportScale: number; // 0.5 to 2.0 (fit, 100%, etc.)
  selectedZoomClipId: string | null;

  // Modals
  isRecordModalOpen: boolean;
  isExportModalOpen: boolean;
  setRecordModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;

  // Playback Controls
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setViewportScale: (scale: number) => void;
  setSelectedZoomClipId: (id: string | null) => void;

  // Project Modifiers
  setProjectTitle: (title: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setCanvasPadding: (padding: number) => void;
  setCanvasCornerRadius: (radius: number) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundPreset: (preset: string, colors: string[]) => void;
  setFrameType: (frameType: FrameType) => void;
  setFrameUrl: (url: string) => void;
  setFrameTitle: (title: string) => void;
  
  // Camera & 3D Modifiers
  setPerspective3D: (pitch: number, yaw: number) => void;
  setAutoZoomEnabled: (enabled: boolean) => void;
  setDefaultZoomFactor: (factor: number) => void;
  setSpringPhysics: (stiffness: number, damping: number) => void;

  // Cursor Modifiers
  setCursorStyle: (style: CursorStyle) => void;
  setCursorScale: (scale: number) => void;
  setClickEffectEnabled: (enabled: boolean) => void;
  setMotionBlurEnabled: (enabled: boolean) => void;

  // Zoom Clip Management
  addZoomClip: (clip: Omit<ZoomClip, 'id'>) => void;
  updateZoomClip: (id: string, updates: Partial<ZoomClip>) => void;
  deleteZoomClip: (id: string) => void;

  // Audio Modifiers
  setNoiseGateEnabled: (enabled: boolean) => void;
  setAutoDuckingEnabled: (enabled: boolean) => void;
  setAudioGain: (gainDb: number) => void;

  // Subtitle Modifiers
  setSubtitlesEnabled: (enabled: boolean) => void;
  setSubtitleActiveColor: (color: string) => void;
}

const DEFAULT_PROJECT: StudioProject = {
  id: 'proj_default_01',
  title: 'SaaS Launch Demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  durationSeconds: 84.5,
  canvas: {
    aspectRatio: '16:9',
    width: 3840,
    height: 2160,
    paddingPx: 48,
    cornerRadiusPx: 24,
    background: {
      type: 'mesh_gradient',
      preset: 'apple_aurora',
      colors: ['#1e1b4b', '#581c87', '#0d9488', '#0f172a'],
      animated: true,
      speed: 0.5,
    },
    shadow: {
      type: 'pro_3d',
      blurPx: 48,
      offsetY: 24,
      color: 'rgba(0, 0, 0, 0.55)',
    },
    frame: {
      type: 'safari',
      title: 'ScreenCraft Pro — Next-Gen Motion Studio',
      url: 'https://screencraft.pro',
      showTrafficLights: true,
      theme: 'dark',
    },
  },
  camera: {
    autoZoomEnabled: true,
    defaultZoomFactor: 2.0,
    springPhysics: {
      stiffness: 180,
      damping: 24,
      mass: 1.0,
    },
    perspective3D: {
      pitchDeg: 12.0,
      yawDeg: -6.0,
      rollDeg: 0.0,
    },
  },
  cursor: {
    style: 'macos_arrow',
    scale: 1.4,
    smoothingEnabled: true,
    smoothingAlgorithm: 'catmull_rom',
    motionBlurEnabled: true,
    clickEffect: {
      enabled: true,
      style: 'expanding_halo',
      color: '#6366F1',
      radiusPx: 32,
    },
    autoHideStationary: true,
    hideAfterSeconds: 2.0,
  },
  subtitles: {
    enabled: true,
    fontFamily: 'SF Pro Display',
    fontSizePx: 38,
    fontWeight: 700,
    style: 'karaoke_glow',
    activeWordColor: '#6366F1',
    inactiveWordColor: 'rgba(255, 255, 255, 0.75)',
    cardBackground: 'rgba(0, 0, 0, 0.65)',
    position: 'bottom_center',
  },
  zoomClips: [
    {
      id: 'zoom_01',
      startTime: 4.0,
      endTime: 14.5,
      zoomFactor: 2.0,
      focusTarget: { x: 0.68, y: 0.38 },
    },
    {
      id: 'zoom_02',
      startTime: 22.0,
      endTime: 36.0,
      zoomFactor: 2.4,
      focusTarget: { x: 0.32, y: 0.58 },
    },
    {
      id: 'zoom_03',
      startTime: 48.0,
      endTime: 62.0,
      zoomFactor: 1.8,
      focusTarget: { x: 0.50, y: 0.50 },
    },
  ],
  videoClips: [
    {
      id: 'video_main',
      sourceFile: 'sample_recording.mp4',
      timelineStart: 0.0,
      sourceStart: 0.0,
      duration: 84.5,
      playbackRate: 1.0,
    },
  ],
  subtitleClips: [
    {
      id: 'sub_01',
      start: 1.0,
      end: 4.5,
      text: 'Welcome to ScreenCraft Pro.',
      words: [
        { word: 'Welcome', start: 1.0, end: 1.6 },
        { word: 'to', start: 1.7, end: 1.9 },
        { word: 'ScreenCraft', start: 2.0, end: 2.8 },
        { word: 'Pro.', start: 2.9, end: 3.5 },
      ],
    },
    {
      id: 'sub_02',
      start: 5.0,
      end: 9.5,
      text: 'Turn ordinary screen captures into cinematic videos in seconds.',
      words: [
        { word: 'Turn', start: 5.0, end: 5.4 },
        { word: 'ordinary', start: 5.5, end: 6.0 },
        { word: 'screen', start: 6.1, end: 6.5 },
        { word: 'captures', start: 6.6, end: 7.2 },
        { word: 'into', start: 7.3, end: 7.6 },
        { word: 'cinematic', start: 7.7, end: 8.4 },
        { word: 'videos.', start: 8.5, end: 9.2 },
      ],
    },
  ],
  audioConfig: {
    gainDb: 2.5,
    noiseGateEnabled: true,
    autoDuckingEnabled: true,
  },
};

export const useStudioStore = create<StudioState>((set) => ({
  project: DEFAULT_PROJECT,
  activeTab: 'canvas' as any,
  setActiveTab: (tab) => set({ activeTab: tab }),

  isPlaying: false,
  currentTime: 12.4,
  playbackRate: 1.0,
  viewportScale: 1.0,
  selectedZoomClipId: 'zoom_01',

  isRecordModalOpen: false,
  isExportModalOpen: false,
  setRecordModalOpen: (open) => set({ isRecordModalOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  seek: (time) => set({ currentTime: Math.max(0, Math.min(time, DEFAULT_PROJECT.durationSeconds)) }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setViewportScale: (scale) => set({ viewportScale: scale }),
  setSelectedZoomClipId: (id) => set({ selectedZoomClipId: id }),

  setProjectTitle: (title) =>
    set((state) => ({ project: { ...state.project, title } })),

  setAspectRatio: (aspectRatio) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: { ...state.project.canvas, aspectRatio },
      },
    })),

  setCanvasPadding: (paddingPx) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: { ...state.project.canvas, paddingPx },
      },
    })),

  setCanvasCornerRadius: (cornerRadiusPx) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: { ...state.project.canvas, cornerRadiusPx },
      },
    })),

  setBackgroundType: (type) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          background: { ...state.project.canvas.background, type },
        },
      },
    })),

  setBackgroundPreset: (preset, colors) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          background: {
            ...state.project.canvas.background,
            preset,
            colors,
          },
        },
      },
    })),

  setFrameType: (type) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          frame: { ...state.project.canvas.frame, type },
        },
      },
    })),

  setFrameUrl: (url) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          frame: { ...state.project.canvas.frame, url },
        },
      },
    })),

  setFrameTitle: (title) =>
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          frame: { ...state.project.canvas.frame, title },
        },
      },
    })),

  setPerspective3D: (pitchDeg, yawDeg) =>
    set((state) => ({
      project: {
        ...state.project,
        camera: {
          ...state.project.camera,
          perspective3D: {
            ...state.project.camera.perspective3D,
            pitchDeg,
            yawDeg,
          },
        },
      },
    })),

  setAutoZoomEnabled: (autoZoomEnabled) =>
    set((state) => ({
      project: {
        ...state.project,
        camera: { ...state.project.camera, autoZoomEnabled },
      },
    })),

  setDefaultZoomFactor: (defaultZoomFactor) =>
    set((state) => ({
      project: {
        ...state.project,
        camera: { ...state.project.camera, defaultZoomFactor },
      },
    })),

  setSpringPhysics: (stiffness, damping) =>
    set((state) => ({
      project: {
        ...state.project,
        camera: {
          ...state.project.camera,
          springPhysics: {
            ...state.project.camera.springPhysics,
            stiffness,
            damping,
          },
        },
      },
    })),

  setCursorStyle: (style) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: { ...state.project.cursor, style },
      },
    })),

  setCursorScale: (scale) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: { ...state.project.cursor, scale },
      },
    })),

  setClickEffectEnabled: (enabled) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: {
          ...state.project.cursor,
          clickEffect: { ...state.project.cursor.clickEffect, enabled },
        },
      },
    })),

  setMotionBlurEnabled: (motionBlurEnabled) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: { ...state.project.cursor, motionBlurEnabled },
      },
    })),

  addZoomClip: (clipData) =>
    set((state) => {
      const newClip: ZoomClip = {
        id: `zoom_${Date.now()}`,
        ...clipData,
      };
      return {
        project: {
          ...state.project,
          zoomClips: [...state.project.zoomClips, newClip].sort(
            (a, b) => a.startTime - b.startTime
          ),
        },
        selectedZoomClipId: newClip.id,
      };
    }),

  updateZoomClip: (id, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        zoomClips: state.project.zoomClips.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  deleteZoomClip: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        zoomClips: state.project.zoomClips.filter((c) => c.id !== id),
      },
      selectedZoomClipId:
        state.selectedZoomClipId === id ? null : state.selectedZoomClipId,
    })),

  setNoiseGateEnabled: (noiseGateEnabled) =>
    set((state) => ({
      project: {
        ...state.project,
        audioConfig: { ...state.project.audioConfig, noiseGateEnabled },
      },
    })),

  setAutoDuckingEnabled: (autoDuckingEnabled) =>
    set((state) => ({
      project: {
        ...state.project,
        audioConfig: { ...state.project.audioConfig, autoDuckingEnabled },
      },
    })),

  setAudioGain: (gainDb) =>
    set((state) => ({
      project: {
        ...state.project,
        audioConfig: { ...state.project.audioConfig, gainDb },
      },
    })),

  setSubtitlesEnabled: (enabled) =>
    set((state) => ({
      project: {
        ...state.project,
        subtitles: { ...state.project.subtitles, enabled },
      },
    })),

  setSubtitleActiveColor: (activeWordColor) =>
    set((state) => ({
      project: {
        ...state.project,
        subtitles: { ...state.project.subtitles, activeWordColor },
      },
    })),
}));
