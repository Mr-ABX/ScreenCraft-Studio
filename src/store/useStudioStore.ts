import { create } from 'zustand';
import {
  StudioProject,
  ActiveToolTab,
  AspectRatio,
  ZoomClip,
  FrameType,
  BackgroundType,
  CursorStyle,
  EffectsConfig,
} from '../types/project';
import { extractAudioWaveformPeaks } from '../engine/audioWaveform';
import { DEMO_PROJECT } from '../engine/demoProject';
import { generateSmartAutoZooms } from '../engine/autoZoomGenerator';

import { generateVideoThumbnails } from '../engine/videoThumbnails';
import { MouseTelemetrySample } from '../types/project';

interface StudioState {
  // Active Project State
  project: StudioProject;
  activeTab: ActiveToolTab;
  setActiveTab: (tab: ActiveToolTab) => void;

  // Media & Demo State
  isDemoMode: boolean;
  videoSourceBlob: Blob | null;
  videoSourceUrl: string | null;
  videoElement: HTMLVideoElement | null;
  audioPeaks: number[];
  videoThumbnails: string[];
  setVideoElement: (el: HTMLVideoElement | null) => void;
  setVideoSource: (file: File | Blob) => Promise<void>;
  setRecordedVideoSource: (file: Blob, telemetry?: MouseTelemetrySample[]) => Promise<void>;
  loadDemoProject: () => void;
  clearProject: () => void;

  // Playback State
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  viewportScale: number;
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
  advanceClock: (dt: number) => void;
  setPlaybackRate: (rate: number) => void;
  setViewportScale: (scale: number) => void;
  setSelectedZoomClipId: (id: string | null) => void;

  // Smart Auto-Zoom
  suggestSmartAutoZooms: () => void;

  // Project Modifiers
  setProjectTitle: (title: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setCanvasPadding: (padding: number) => void;
  setCanvasCornerRadius: (radius: number) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundPreset: (preset: string, colors: string[]) => void;
  setCustomBackgroundImage: (file: File | Blob) => void;
  setFrameType: (frameType: FrameType) => void;
  setFrameUrl: (url: string) => void;
  setFrameTitle: (title: string) => void;

  // Effects Modifiers
  setEffectsConfig: (updates: Partial<EffectsConfig>) => void;
  
  // Camera & 3D Modifiers
  setPerspective3D: (pitch: number, yaw: number) => void;
  setAutoZoomEnabled: (enabled: boolean) => void;
  setDefaultZoomFactor: (factor: number) => void;
  setSpringPhysics: (stiffness: number, damping: number) => void;
  setZoomClipFocus: (id: string, x: number, y: number) => void;

  // Cursor Modifiers
  setCursorShowOverlay: (enabled: boolean) => void;
  setCursorStyle: (style: CursorStyle) => void;
  setCursorScale: (scale: number) => void;
  setClickEffectEnabled: (enabled: boolean) => void;
  setMotionBlurEnabled: (enabled: boolean) => void;
  generateCursorTrajectoryFromZooms: () => void;

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

const EMPTY_PROJECT: StudioProject = {
  id: 'proj_empty',
  title: 'Untitled Project',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  durationSeconds: 0,
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
      title: 'ScreenCraft Pro',
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
    showOverlay: false,
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
  effects: {
    motionBlur: true,
    vignetteIntensity: 0.2,
    backgroundBlurPx: 0,
    cameraShake: false,
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
  zoomClips: [],
  videoClips: [],
  subtitleClips: [],
  audioConfig: {
    gainDb: 2.5,
    noiseGateEnabled: true,
    autoDuckingEnabled: true,
  },
};

export const useStudioStore = create<StudioState>((set, get) => ({
  project: EMPTY_PROJECT,
  activeTab: 'canvas' as any,
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDemoMode: false,
  videoSourceBlob: null,
  videoSourceUrl: null,
  videoElement: null,
  audioPeaks: [],
  videoThumbnails: [],
  setVideoElement: (el) => set({ videoElement: el }),

  loadDemoProject: () => {
    // Generate dummy audio peaks for demo
    const peaks = Array.from({ length: 180 }).map((_, i) => {
      const v = Math.abs(Math.sin(i * 0.18) * Math.cos(i * 0.45));
      return Math.max(0.15, v * 0.85);
    });

    set({
      project: DEMO_PROJECT,
      isDemoMode: true,
      videoSourceUrl: null,
      videoSourceBlob: null,
      videoThumbnails: [],
      audioPeaks: peaks,
      currentTime: 0,
      isPlaying: false,
      selectedZoomClipId: 'zoom_demo_01',
    });
  },

  clearProject: () => {
    set({
      project: EMPTY_PROJECT,
      isDemoMode: false,
      videoSourceUrl: null,
      videoSourceBlob: null,
      videoThumbnails: [],
      audioPeaks: [],
      currentTime: 0,
      isPlaying: false,
      selectedZoomClipId: null,
    });
  },

  setVideoSource: async (file: File | Blob) => {
    const url = URL.createObjectURL(file);
    const filename = (file as File).name || 'uploaded_video.mp4';

    // Temporary video to determine duration
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.preload = 'metadata';

    await new Promise<void>((resolve) => {
      tempVideo.onloadedmetadata = () => resolve();
      tempVideo.onerror = () => resolve();
    });

    const duration = tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration !== Infinity
      ? tempVideo.duration
      : 30.0;

    // Extract real audio waveform and timeline filmstrip thumbnails in parallel
    const [peaks, thumbnails] = await Promise.all([
      extractAudioWaveformPeaks(file, 200),
      generateVideoThumbnails(file, duration, { count: 16 }),
    ]);

    set((state) => ({
      isDemoMode: false,
      videoSourceBlob: file,
      videoSourceUrl: url,
      audioPeaks: peaks,
      videoThumbnails: thumbnails,
      currentTime: 0,
      isPlaying: false,
      project: {
        ...state.project,
        title: filename.replace(/\.[^/.]+$/, ''),
        durationSeconds: duration,
        videoClips: [
          {
            id: `video_${Date.now()}`,
            sourceFile: filename,
            timelineStart: 0,
            sourceStart: 0,
            duration: duration,
            playbackRate: 1.0,
          },
        ],
        zoomClips: [], // Keep empty by default for user control
        cursor: {
          ...state.project.cursor,
          showOverlay: false, // Default off for imported videos (baked cursor)
        },
      },
    }));
  },

  setRecordedVideoSource: async (file: Blob, telemetry?: MouseTelemetrySample[]) => {
    const url = URL.createObjectURL(file);
    const filename = 'screen_recording.webm';

    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.preload = 'metadata';

    await new Promise<void>((resolve) => {
      tempVideo.onloadedmetadata = () => resolve();
      tempVideo.onerror = () => resolve();
    });

    const duration = tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration !== Infinity
      ? tempVideo.duration
      : 30.0;

    const [peaks, thumbnails] = await Promise.all([
      extractAudioWaveformPeaks(file, 200),
      generateVideoThumbnails(file, duration, { count: 16 }),
    ]);

    set((state) => ({
      isDemoMode: false,
      videoSourceBlob: file,
      videoSourceUrl: url,
      audioPeaks: peaks,
      videoThumbnails: thumbnails,
      currentTime: 0,
      isPlaying: false,
      project: {
        ...state.project,
        title: filename.replace(/\.[^/.]+$/, ''),
        durationSeconds: duration,
        mouseTelemetry: telemetry,
        videoClips: [
          {
            id: `video_${Date.now()}`,
            sourceFile: filename,
            timelineStart: 0,
            sourceStart: 0,
            duration: duration,
            playbackRate: 1.0,
          },
        ],
        zoomClips: [],
        cursor: {
          ...state.project.cursor,
          showOverlay: true, // Enable vector cursor overlay since telemetry is captured
        },
      },
    }));
  },

  suggestSmartAutoZooms: () => {
    const { project } = get();
    if (project.durationSeconds <= 0) return;

    const smartZooms = generateSmartAutoZooms({
      durationSeconds: project.durationSeconds,
      zoomIntensity: 'standard',
      telemetry: project.mouseTelemetry,
      defaultZoomFactor: project.camera.defaultZoomFactor,
    });

    set((state) => ({
      project: {
        ...state.project,
        zoomClips: smartZooms,
      },
      selectedZoomClipId: smartZooms[0]?.id || null,
    }));
  },

  isPlaying: false,
  currentTime: 0,
  playbackRate: 1.0,
  viewportScale: 1.0,
  selectedZoomClipId: null,

  isRecordModalOpen: false,
  isExportModalOpen: false,
  setRecordModalOpen: (open) => set({ isRecordModalOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),

  togglePlay: () => {
    const { isPlaying, videoElement, currentTime, project } = get();
    const nextPlaying = !isPlaying;

    if (project.durationSeconds <= 0) return;

    if (videoElement) {
      if (nextPlaying) {
        if (currentTime >= project.durationSeconds - 0.1) {
          videoElement.currentTime = 0;
          set({ currentTime: 0 });
        }
        videoElement.play().catch(() => {});
      } else {
        videoElement.pause();
      }
    } else {
      if (nextPlaying && currentTime >= project.durationSeconds - 0.1) {
        set({ currentTime: 0 });
      }
    }

    set({ isPlaying: nextPlaying });
  },

  setIsPlaying: (playing) => {
    const { videoElement } = get();
    if (videoElement) {
      if (playing) videoElement.play().catch(() => {});
      else videoElement.pause();
    }
    set({ isPlaying: playing });
  },

  seek: (time) => {
    const boundedTime = Math.max(0, Math.min(time, get().project.durationSeconds));
    const { videoElement } = get();
    if (videoElement) {
      videoElement.currentTime = boundedTime;
    }
    set({ currentTime: boundedTime });
  },

  advanceClock: (dt: number) => {
    const { isPlaying, currentTime, playbackRate, project, videoElement } = get();
    if (!isPlaying || project.durationSeconds <= 0) return;

    // If native video element exists, it is the master clock. Do not advance synthetically.
    if (videoElement) {
      const vidTime = videoElement.currentTime;
      if (vidTime >= project.durationSeconds || videoElement.ended) {
        set({ currentTime: project.durationSeconds, isPlaying: false });
        videoElement.pause();
      } else {
        set({ currentTime: vidTime });
      }
      return;
    }

    // Fallback clock for demo showcase (no real video element)
    const nextTime = currentTime + dt * playbackRate;

    if (nextTime >= project.durationSeconds) {
      set({ currentTime: project.durationSeconds, isPlaying: false });
    } else {
      set({ currentTime: nextTime });
    }
  },

  setPlaybackRate: (rate) => {
    const { videoElement } = get();
    if (videoElement) videoElement.playbackRate = rate;
    set({ playbackRate: rate });
  },

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
            type: 'mesh_gradient',
            preset,
            colors,
            customImageUrl: undefined,
          },
        },
      },
    })),

  setCustomBackgroundImage: (file: File | Blob) => {
    const url = URL.createObjectURL(file);
    set((state) => ({
      project: {
        ...state.project,
        canvas: {
          ...state.project.canvas,
          background: {
            type: 'custom_image',
            preset: 'custom',
            colors: [],
            animated: false,
            speed: 0,
            customImageUrl: url,
          },
        },
      },
    }));
  },

  setEffectsConfig: (updates) =>
    set((state) => ({
      project: {
        ...state.project,
        effects: {
          ...state.project.effects,
          ...updates,
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

  setZoomClipFocus: (id, x, y) =>
    set((state) => ({
      project: {
        ...state.project,
        zoomClips: state.project.zoomClips.map((c) =>
          c.id === id ? { ...c, focusTarget: { x, y } } : c
        ),
      },
    })),

  setCursorShowOverlay: (showOverlay) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: { ...state.project.cursor, showOverlay },
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

  generateCursorTrajectoryFromZooms: () => {
    const { project } = get();
    const duration = project.durationSeconds > 0 ? project.durationSeconds : 30.0;
    const zooms = project.zoomClips;

    const samples: MouseTelemetrySample[] = [];
    const keypoints: { time: number; x: number; y: number; isClick: boolean }[] = [];

    keypoints.push({ time: 0, x: 0.5, y: 0.5, isClick: false });

    if (zooms.length > 0) {
      zooms.forEach((zoom) => {
        const leadIn = Math.max(0.2, zoom.startTime - 0.8);
        keypoints.push({ time: leadIn, x: zoom.focusTarget.x, y: zoom.focusTarget.y, isClick: false });
        keypoints.push({ time: zoom.startTime, x: zoom.focusTarget.x, y: zoom.focusTarget.y, isClick: true });
        keypoints.push({ time: zoom.endTime, x: Math.min(0.9, zoom.focusTarget.x + 0.04), y: Math.min(0.9, zoom.focusTarget.y + 0.03), isClick: false });
      });
    } else {
      keypoints.push({ time: duration * 0.2, x: 0.65, y: 0.38, isClick: true });
      keypoints.push({ time: duration * 0.5, x: 0.28, y: 0.55, isClick: true });
      keypoints.push({ time: duration * 0.8, x: 0.72, y: 0.68, isClick: true });
    }

    keypoints.push({ time: duration, x: 0.5, y: 0.5, isClick: false });
    keypoints.sort((a, b) => a.time - b.time);

    // Generate interpolated samples every 0.1s
    const step = 0.1;
    for (let t = 0; t <= duration; t += step) {
      const idx = keypoints.findIndex((k) => k.time >= t);
      if (idx <= 0) {
        const kp = keypoints[0];
        samples.push({ timestamp: t, x: kp.x, y: kp.y, isClick: t < 0.2 && kp.isClick });
      } else {
        const p0 = keypoints[idx - 1];
        const p1 = keypoints[idx];
        const progress = (t - p0.time) / (p1.time - p0.time || 1);
        // Smooth cubic ease
        const ease = progress * progress * (3 - 2 * progress);
        samples.push({
          timestamp: t,
          x: p0.x + (p1.x - p0.x) * ease,
          y: p0.y + (p1.y - p0.y) * ease,
          isClick: Math.abs(t - p1.time) < 0.15 && p1.isClick,
        });
      }
    }

    set((state) => ({
      project: {
        ...state.project,
        mouseTelemetry: samples,
        cursor: {
          ...state.project.cursor,
          showOverlay: true,
        },
      },
    }));
  },

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
