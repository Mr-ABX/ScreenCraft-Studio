import { create } from 'zustand';
import {
  StudioProject,
  ActiveToolTab,
  AspectRatio,
  ZoomClip,
  VideoClip,
  FrameType,
  BackgroundType,
  CursorStyle,
  CursorMode,
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
  selectedVideoClipId: string | null;

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
  setSelectedVideoClipId: (id: string | null) => void;

  // History State & Actions
  undoStack: StudioProject[];
  redoStack: StudioProject[];
  canUndo: boolean;
  canRedo: boolean;
  pushHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Track Visibility Toggles
  toggleTrackVisibility: (track: 'zoom' | 'video' | 'captions' | 'audio') => void;

  // Timeline Video & Zoom Clip Editing Actions (Split, Trim, Duplicate, Resize)
  splitAtPlayhead: (splitTime?: number) => void;
  trimClipHead: (clipId?: string, newStartTime?: number) => void;
  trimClipTail: (clipId?: string, newEndTime?: number) => void;
  updateVideoClip: (id: string, updates: Partial<VideoClip>) => void;
  deleteVideoClip: (id: string) => void;
  duplicateClip: (id?: string) => void;
  adjustZoomScale: (delta: number) => void;

  // Smart Auto-Zoom
  suggestSmartAutoZooms: (options?: {
    zoomIntensity?: 'subtle' | 'standard' | 'dynamic';
    frequency?: 'sparse' | 'normal' | 'frequent';
  }) => void;

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
  setCursorMode: (mode: CursorMode) => void;
  setCursorShowOverlay: (enabled: boolean) => void;
  setCursorStyle: (style: CursorStyle) => void;
  setCursorScale: (scale: number) => void;
  setClickEffectEnabled: (enabled: boolean) => void;
  setClickEffectColor: (color: string) => void;
  setAutoHideStationary: (enabled: boolean, hideAfterSeconds?: number) => void;
  setMotionBlurEnabled: (enabled: boolean) => void;
  setMouseTelemetry: (samples: MouseTelemetrySample[]) => void;
  setManualCursorPosition: (x: number, y: number) => void;
  generateCursorTrajectoryFromZooms: () => void;

  // Zoom Clip Management
  updateActiveZoomFactor: (factor: number) => void;
  updateActiveZoomFocus: (x: number, y: number) => void;
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
    mode: 'styled',
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
  trackVisibility: {
    zoom: true,
    video: true,
    captions: true,
    audio: true,
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
    const width = tempVideo.videoWidth || 1920;
    const height = tempVideo.videoHeight || 1080;
    const aspectRatio = width / height;

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
        videoMetadata: {
          width,
          height,
          aspectRatio,
          duration,
        },
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
          mode: 'video', // Default to original video cursor for external imports (no static fake overlay)
          showOverlay: false,
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
    const width = tempVideo.videoWidth || 1920;
    const height = tempVideo.videoHeight || 1080;
    const aspectRatio = width / height;

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
        videoMetadata: {
          width,
          height,
          aspectRatio,
          duration,
        },
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
          mode: 'styled', // Default to styled vector cursor for in-app recordings
          showOverlay: true,
        },
      },
    }));
  },

  suggestSmartAutoZooms: (options) => {
    const { project } = get();
    if (project.durationSeconds <= 0) return;

    const smartZooms = generateSmartAutoZooms({
      durationSeconds: project.durationSeconds,
      zoomIntensity: options?.zoomIntensity || 'standard',
      frequency: options?.frequency || 'normal',
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
  selectedVideoClipId: null,

  // History State
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushHistorySnapshot: () => {
    const { project, undoStack } = get();
    const clone = JSON.parse(JSON.stringify(project));
    const nextStack = [...undoStack.slice(-30), clone];
    set({
      undoStack: nextStack,
      redoStack: [],
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const { undoStack, redoStack, project } = get();
    if (undoStack.length === 0) return;
    const prevProject = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const currentClone = JSON.parse(JSON.stringify(project));
    set({
      project: prevProject,
      undoStack: newUndo,
      redoStack: [...redoStack, currentClone],
      canUndo: newUndo.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { undoStack, redoStack, project } = get();
    if (redoStack.length === 0) return;
    const nextProject = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const currentClone = JSON.parse(JSON.stringify(project));
    set({
      project: nextProject,
      redoStack: newRedo,
      undoStack: [...undoStack, currentClone],
      canUndo: true,
      canRedo: newRedo.length > 0,
    });
  },

  toggleTrackVisibility: (track) => {
    get().pushHistorySnapshot();
    set((state) => {
      const curr = state.project.trackVisibility || {
        zoom: true,
        video: true,
        captions: true,
        audio: true,
      };
      const updated = { ...curr, [track]: !curr[track] };
      if (track === 'audio' && state.videoElement) {
        state.videoElement.muted = !updated.audio;
      }
      return {
        project: {
          ...state.project,
          trackVisibility: updated,
          ...(track === 'captions'
            ? { subtitles: { ...state.project.subtitles, enabled: updated.captions } }
            : {}),
          ...(track === 'zoom'
            ? { camera: { ...state.project.camera, autoZoomEnabled: updated.zoom } }
            : {}),
        },
      };
    });
  },

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
          const firstClip = project.videoClips[0];
          videoElement.currentTime = firstClip ? firstClip.sourceStart : 0;
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
    const { videoElement, project } = get();
    if (videoElement && project.videoClips.length > 0) {
      const activeClip =
        project.videoClips.find(
          (c) => boundedTime >= c.timelineStart && boundedTime < c.timelineStart + c.duration
        ) || project.videoClips[project.videoClips.length - 1];

      if (activeClip) {
        const sourceTarget =
          activeClip.sourceStart +
          (boundedTime - activeClip.timelineStart) * (activeClip.playbackRate || 1.0);
        videoElement.currentTime = Math.max(0, sourceTarget);
      } else {
        videoElement.currentTime = boundedTime;
      }
    } else if (videoElement) {
      videoElement.currentTime = boundedTime;
    }
    set({ currentTime: boundedTime });
  },

  advanceClock: (dt: number) => {
    const { isPlaying, currentTime, playbackRate, project, videoElement } = get();
    if (!isPlaying || project.durationSeconds <= 0) return;

    // 1. If real video element is playing, its hardware clock is the source of truth
    if (videoElement && project.videoClips.length > 0) {
      if (videoElement.paused && isPlaying) {
        videoElement.play().catch(() => {});
      }

      const vTime = videoElement.currentTime;
      const activeClip =
        project.videoClips.find(
          (c) =>
            vTime >= c.sourceStart - 0.05 &&
            vTime < c.sourceStart + c.duration * (c.playbackRate || 1.0)
        ) ||
        project.videoClips.find(
          (c) =>
            currentTime >= c.timelineStart &&
            currentTime <= c.timelineStart + c.duration
        ) ||
        project.videoClips[0];

      if (activeClip) {
        const rate = activeClip.playbackRate || 1.0;
        const clipOffset = (vTime - activeClip.sourceStart) / rate;
        const currentTimelineTime = activeClip.timelineStart + clipOffset;

        // Clip boundary transition
        if (
          clipOffset >= activeClip.duration - 0.03 ||
          vTime >= activeClip.sourceStart + activeClip.duration * rate - 0.03
        ) {
          const activeIdx = project.videoClips.findIndex((c) => c.id === activeClip.id);
          const nextClip = project.videoClips[activeIdx + 1];

          if (nextClip) {
            videoElement.currentTime = nextClip.sourceStart;
            set({ currentTime: nextClip.timelineStart });
          } else {
            videoElement.pause();
            set({ currentTime: project.durationSeconds, isPlaying: false });
          }
          return;
        }

        set({
          currentTime: Math.max(
            0,
            Math.min(project.durationSeconds, currentTimelineTime)
          ),
        });
        return;
      }
    }

    // 2. Synthetic Clock for demo project / audio-only
    const nextTime = currentTime + dt * playbackRate;
    if (nextTime >= project.durationSeconds) {
      set({ currentTime: project.durationSeconds, isPlaying: false });
      if (videoElement) videoElement.pause();
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
  setSelectedVideoClipId: (id) => set({ selectedVideoClipId: id }),

  // Timeline Video & Zoom Clip Editing Actions
  splitAtPlayhead: (splitTime) => {
    get().pushHistorySnapshot();
    const { currentTime, project, selectedVideoClipId, selectedZoomClipId } = get();
    const t = splitTime !== undefined ? splitTime : currentTime;
    let videoClipsChanged = false;
    let zoomClipsChanged = false;

    let newVideoClips = [...project.videoClips];
    let newZoomClips = [...project.zoomClips];

    // 1. Split Video Clip
    const targetVideoClip = selectedVideoClipId
      ? newVideoClips.find((c) => c.id === selectedVideoClipId)
      : newVideoClips.find(
          (c) => t > c.timelineStart + 0.05 && t < c.timelineStart + c.duration - 0.05
        );

    if (
      targetVideoClip &&
      t > targetVideoClip.timelineStart + 0.05 &&
      t < targetVideoClip.timelineStart + targetVideoClip.duration - 0.05
    ) {
      const leftDuration = t - targetVideoClip.timelineStart;
      const rightDuration = targetVideoClip.duration - leftDuration;
      const rate = targetVideoClip.playbackRate || 1.0;

      const clipA: VideoClip = {
        ...targetVideoClip,
        duration: leftDuration,
      };

      const clipB: VideoClip = {
        ...targetVideoClip,
        id: `video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timelineStart: t,
        sourceStart: targetVideoClip.sourceStart + leftDuration * rate,
        duration: rightDuration,
      };

      const idx = newVideoClips.findIndex((c) => c.id === targetVideoClip.id);
      if (idx !== -1) {
        newVideoClips.splice(idx, 1, clipA, clipB);
        videoClipsChanged = true;
      }
    }

    // 2. Split Zoom Clip
    const targetZoomClip = selectedZoomClipId
      ? newZoomClips.find((z) => z.id === selectedZoomClipId)
      : newZoomClips.find((z) => t > z.startTime + 0.1 && t < z.endTime - 0.1);

    if (
      targetZoomClip &&
      t > targetZoomClip.startTime + 0.1 &&
      t < targetZoomClip.endTime - 0.1
    ) {
      const zoomA: ZoomClip = {
        ...targetZoomClip,
        endTime: t,
      };

      const zoomB: ZoomClip = {
        ...targetZoomClip,
        id: `zoom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: t,
      };

      const zIdx = newZoomClips.findIndex((z) => z.id === targetZoomClip.id);
      if (zIdx !== -1) {
        newZoomClips.splice(zIdx, 1, zoomA, zoomB);
        zoomClipsChanged = true;
      }
    }

    if (videoClipsChanged || zoomClipsChanged) {
      set((state) => ({
        project: {
          ...state.project,
          videoClips: newVideoClips,
          zoomClips: newZoomClips,
        },
      }));
    }
  },

  trimClipHead: (clipId, newStartTime) => {
    get().pushHistorySnapshot();
    const { currentTime, project, selectedVideoClipId, selectedZoomClipId } = get();
    const t = newStartTime !== undefined ? newStartTime : currentTime;

    // Video Clip
    const targetVideoId = clipId || selectedVideoClipId;
    const videoClip =
      project.videoClips.find((c) => c.id === targetVideoId) ||
      project.videoClips.find((c) => t > c.timelineStart && t < c.timelineStart + c.duration);

    if (
      videoClip &&
      t > videoClip.timelineStart &&
      t < videoClip.timelineStart + videoClip.duration - 0.1
    ) {
      const delta = t - videoClip.timelineStart;
      const rate = videoClip.playbackRate || 1.0;
      const updatedClips = project.videoClips.map((c) =>
        c.id === videoClip.id
          ? {
              ...c,
              timelineStart: t,
              sourceStart: c.sourceStart + delta * rate,
              duration: c.duration - delta,
            }
          : c
      );
      set((state) => ({
        project: { ...state.project, videoClips: updatedClips },
      }));
      return;
    }

    // Zoom Clip
    const targetZoomId = clipId || selectedZoomClipId;
    const zoomClip =
      project.zoomClips.find((z) => z.id === targetZoomId) ||
      project.zoomClips.find((z) => t > z.startTime && t < z.endTime);

    if (zoomClip && t > zoomClip.startTime && t < zoomClip.endTime - 0.2) {
      const updatedZooms = project.zoomClips.map((z) =>
        z.id === zoomClip.id ? { ...z, startTime: t } : z
      );
      set((state) => ({
        project: { ...state.project, zoomClips: updatedZooms },
      }));
    }
  },

  trimClipTail: (clipId, newEndTime) => {
    get().pushHistorySnapshot();
    const { currentTime, project, selectedVideoClipId, selectedZoomClipId } = get();
    const t = newEndTime !== undefined ? newEndTime : currentTime;

    // Video Clip
    const targetVideoId = clipId || selectedVideoClipId;
    const videoClip =
      project.videoClips.find((c) => c.id === targetVideoId) ||
      project.videoClips.find((c) => t > c.timelineStart && t < c.timelineStart + c.duration);

    if (
      videoClip &&
      t > videoClip.timelineStart + 0.1 &&
      t < videoClip.timelineStart + videoClip.duration
    ) {
      const newDuration = t - videoClip.timelineStart;
      const updatedClips = project.videoClips.map((c) =>
        c.id === videoClip.id ? { ...c, duration: newDuration } : c
      );
      const maxEnd = Math.max(
        ...updatedClips.map((c) => c.timelineStart + c.duration),
        ...project.zoomClips.map((z) => z.endTime),
        0
      );
      set((state) => ({
        project: {
          ...state.project,
          videoClips: updatedClips,
          durationSeconds: maxEnd > 0 ? maxEnd : state.project.durationSeconds,
        },
      }));
      return;
    }

    // Zoom Clip
    const targetZoomId = clipId || selectedZoomClipId;
    const zoomClip =
      project.zoomClips.find((z) => z.id === targetZoomId) ||
      project.zoomClips.find((z) => t > z.startTime && t < z.endTime);

    if (zoomClip && t > zoomClip.startTime + 0.2) {
      const updatedZooms = project.zoomClips.map((z) =>
        z.id === zoomClip.id ? { ...z, endTime: t } : z
      );
      set((state) => ({
        project: { ...state.project, zoomClips: updatedZooms },
      }));
    }
  },

  updateVideoClip: (id, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        videoClips: state.project.videoClips.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  deleteVideoClip: (id) => {
    get().pushHistorySnapshot();
    set((state) => {
      const filtered = state.project.videoClips.filter((c) => c.id !== id);
      const maxEnd = Math.max(
        ...filtered.map((c) => c.timelineStart + c.duration),
        ...state.project.zoomClips.map((z) => z.endTime),
        0
      );
      return {
        project: {
          ...state.project,
          videoClips: filtered,
          durationSeconds:
            filtered.length > 0 ? maxEnd : state.project.durationSeconds,
        },
        selectedVideoClipId:
          state.selectedVideoClipId === id ? null : state.selectedVideoClipId,
      };
    });
  },

  duplicateClip: (id) => {
    get().pushHistorySnapshot();
    const { project, selectedVideoClipId, selectedZoomClipId } = get();
    // Video Clip
    const targetVidId = id || selectedVideoClipId;
    const vidClip = project.videoClips.find((c) => c.id === targetVidId);
    if (vidClip) {
      const dupVid: VideoClip = {
        ...vidClip,
        id: `video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timelineStart: vidClip.timelineStart + vidClip.duration,
      };
      const updated = [...project.videoClips, dupVid].sort(
        (a, b) => a.timelineStart - b.timelineStart
      );
      const maxEnd = Math.max(...updated.map((c) => c.timelineStart + c.duration));
      set((state) => ({
        project: {
          ...state.project,
          videoClips: updated,
          durationSeconds: Math.max(state.project.durationSeconds, maxEnd),
        },
        selectedVideoClipId: dupVid.id,
      }));
      return;
    }

    // Zoom Clip
    const targetZoomId = id || selectedZoomClipId;
    const zoomClip = project.zoomClips.find((z) => z.id === targetZoomId);
    if (zoomClip) {
      const dur = zoomClip.endTime - zoomClip.startTime;
      const dupZoom: ZoomClip = {
        ...zoomClip,
        id: `zoom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: zoomClip.endTime,
        endTime: Math.min(project.durationSeconds, zoomClip.endTime + dur),
      };
      set((state) => ({
        project: {
          ...state.project,
          zoomClips: [...state.project.zoomClips, dupZoom].sort(
            (a, b) => a.startTime - b.startTime
          ),
        },
        selectedZoomClipId: dupZoom.id,
      }));
    }
  },

  adjustZoomScale: (delta) => {
    const { project, selectedZoomClipId, currentTime, updateZoomClip } = get();
    const activeClip =
      project.zoomClips.find((z) => z.id === selectedZoomClipId) ||
      project.zoomClips.find(
        (z) => currentTime >= z.startTime && currentTime <= z.endTime
      );

    if (activeClip) {
      const newFactor =
        Math.round(
          Math.max(1.1, Math.min(4.0, activeClip.zoomFactor + delta)) * 10
        ) / 10;
      updateZoomClip(activeClip.id, { zoomFactor: newFactor });
    } else {
      const newFactor =
        Math.round(
          Math.max(1.1, Math.min(4.0, project.camera.defaultZoomFactor + delta)) *
            10
        ) / 10;
      set((state) => ({
        project: {
          ...state.project,
          camera: { ...state.project.camera, defaultZoomFactor: newFactor },
        },
      }));
    }
  },

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

  setCursorMode: (mode) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: {
          ...state.project.cursor,
          mode,
          showOverlay: mode === 'styled',
        },
      },
    })),

  setCursorShowOverlay: (showOverlay) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: {
          ...state.project.cursor,
          showOverlay,
          mode: showOverlay ? 'styled' : 'video',
        },
      },
    })),

  setMouseTelemetry: (samples) =>
    set((state) => ({
      project: {
        ...state.project,
        mouseTelemetry: samples,
      },
    })),

  setManualCursorPosition: (x, y) => {
    const { currentTime, project } = get();
    const currentSamples = project.mouseTelemetry ? [...project.mouseTelemetry] : [];
    const normalizedTime = Math.round(currentTime * 10) / 10;

    const existingIdx = currentSamples.findIndex(
      (s) => Math.abs(s.timestamp - normalizedTime) < 0.2
    );

    if (existingIdx !== -1) {
      currentSamples[existingIdx] = {
        ...currentSamples[existingIdx],
        x: Math.max(0.02, Math.min(0.98, x)),
        y: Math.max(0.02, Math.min(0.98, y)),
      };
    } else {
      currentSamples.push({
        timestamp: normalizedTime,
        x: Math.max(0.02, Math.min(0.98, x)),
        y: Math.max(0.02, Math.min(0.98, y)),
        isClick: false,
      });
      currentSamples.sort((a, b) => a.timestamp - b.timestamp);
    }

    set((state) => ({
      project: {
        ...state.project,
        mouseTelemetry: currentSamples,
        cursor: {
          ...state.project.cursor,
          mode: 'styled',
          showOverlay: true,
        },
      },
    }));
  },

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

  setClickEffectColor: (color) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: {
          ...state.project.cursor,
          clickEffect: { ...state.project.cursor.clickEffect, color },
        },
      },
    })),

  setAutoHideStationary: (autoHideStationary, hideAfterSeconds) =>
    set((state) => ({
      project: {
        ...state.project,
        cursor: {
          ...state.project.cursor,
          autoHideStationary,
          ...(hideAfterSeconds !== undefined ? { hideAfterSeconds } : {}),
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

  updateActiveZoomFactor: (factor) => {
    const { project, selectedZoomClipId, currentTime, updateZoomClip } = get();
    const activeClip =
      project.zoomClips.find((z) => z.id === selectedZoomClipId) ||
      project.zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime);

    if (activeClip) {
      updateZoomClip(activeClip.id, { zoomFactor: factor });
    }
  },

  updateActiveZoomFocus: (x, y) => {
    const { project, selectedZoomClipId, currentTime, updateZoomClip } = get();
    const activeClip =
      project.zoomClips.find((z) => z.id === selectedZoomClipId) ||
      project.zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime);

    if (activeClip) {
      updateZoomClip(activeClip.id, {
        focusTarget: {
          x: Math.max(0.05, Math.min(0.95, x)),
          y: Math.max(0.05, Math.min(0.95, y)),
        },
      });
    }
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
