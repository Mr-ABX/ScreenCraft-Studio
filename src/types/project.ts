export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type BackgroundType = 'mesh_gradient' | 'solid' | 'transparent' | 'custom_image';

export type FrameType = 'safari' | 'macos_clean' | 'arc' | 'frameless';

export type CursorStyle = 'macos_arrow' | 'windows_arrow' | 'pointer' | 'glow_dot';

export type ClickHaloStyle = 'expanding_halo' | 'pulsing_dot' | 'none';

export type ActiveToolTab = 'media' | 'zoom' | 'cursor' | 'frames' | 'subtitles' | 'audio' | 'settings';

export interface BackgroundConfig {
  type: BackgroundType;
  preset: string;
  colors: string[];
  animated: boolean;
  speed: number;
  customImageUrl?: string;
}

export interface ShadowConfig {
  type: 'none' | 'subtle' | 'pro_3d' | 'deep_glow';
  blurPx: number;
  offsetY: number;
  color: string;
}

export interface FrameConfig {
  type: FrameType;
  title: string;
  url: string;
  showTrafficLights: boolean;
  theme: 'dark' | 'light';
}

export interface CanvasConfig {
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  paddingPx: number;
  cornerRadiusPx: number;
  background: BackgroundConfig;
  shadow: ShadowConfig;
  frame: FrameConfig;
}

export interface SpringPhysicsConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface CameraConfig {
  autoZoomEnabled: boolean;
  defaultZoomFactor: number;
  springPhysics: SpringPhysicsConfig;
  perspective3D: {
    pitchDeg: number; // X-axis tilt (-30 to 30)
    yawDeg: number;   // Y-axis rotation (-30 to 30)
    rollDeg: number;  // Z-axis roll
  };
}

export interface CursorConfig {
  style: CursorStyle;
  scale: number; // 1.0 to 2.5
  smoothingEnabled: boolean;
  smoothingAlgorithm: 'catmull_rom' | 'bezier';
  motionBlurEnabled: boolean;
  clickEffect: {
    enabled: boolean;
    style: ClickHaloStyle;
    color: string;
    radiusPx: number;
  };
  autoHideStationary: boolean;
  hideAfterSeconds: number;
}

export interface ZoomClip {
  id: string;
  startTime: number;
  endTime: number;
  zoomFactor: number;
  focusTarget: { x: number; y: number }; // normalized [0, 1]
  springOverride?: SpringPhysicsConfig | null;
}

export interface VideoClip {
  id: string;
  sourceFile: string;
  timelineStart: number;
  sourceStart: number;
  duration: number;
  playbackRate: number;
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleClip {
  id: string;
  start: number;
  end: number;
  text: string;
  words: SubtitleWord[];
}

export interface AudioTrackConfig {
  gainDb: number;
  noiseGateEnabled: boolean;
  autoDuckingEnabled: boolean;
}

export interface SubtitlesConfig {
  enabled: boolean;
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number;
  style: 'karaoke_glow' | 'minimal_card' | 'bouncing_word';
  activeWordColor: string;
  inactiveWordColor: string;
  cardBackground: string;
  position: 'bottom_center' | 'top_center' | 'floating_cursor';
}

export interface StudioProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  durationSeconds: number;
  canvas: CanvasConfig;
  camera: CameraConfig;
  cursor: CursorConfig;
  subtitles: SubtitlesConfig;
  zoomClips: ZoomClip[];
  videoClips: VideoClip[];
  subtitleClips: SubtitleClip[];
  audioConfig: AudioTrackConfig;
}
