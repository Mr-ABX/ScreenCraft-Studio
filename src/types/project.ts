export type AspectRatio = 'auto' | '16:9' | '9:16' | '1:1' | '4:5';

export type BackgroundType = 'mesh_gradient' | 'solid' | 'transparent' | 'custom_image';

export type FrameType = 'safari' | 'macos_clean' | 'arc' | 'frameless';

export type CursorStyle =
  | 'macos_arrow'
  | 'macos_white'
  | 'windows_arrow'
  | 'pointer'
  | 'glow_dot'
  | 'precision_cross'
  | 'hello-kitty-watermelon'
  | 'among-us-sus-knife-and-red-animated'
  | 'solo-leveling-sung-jinwoo-dark-flames'
  | 'pokemon-neon-gengar'
  | 'naruto-akatsuki-cloud-arrow'
  | 'hollow-knight-and-game-arrow'
  | 'hollow-knight-nail-sword-and-mask'
  | 'old-roblox'
  | 'mickey-mouse-black-hand-inflated-glove'
  | 'black-pixel'
  | 'pinky-pixel'
  | 'pink-glossy-arrow-and-hand-3d'
  | 'sanrio-gudetama-and-arrow-kawaii'
  | 'sanrio-kuromi-skull-arrow'
  | 'christmas-miles-morales'
  | 'black-and-rainbow-stroke-gradient-animated'
  | 'spring-gradient'
  | 'default'
  | string;

export type CursorMode = 'video' | 'styled' | 'hidden';

export interface TrackVisibilityConfig {
  zoom: boolean;
  video: boolean;
  captions: boolean;
  audio: boolean;
}

export type ClickHaloStyle = 'expanding_halo' | 'pulsing_dot' | 'none';

export type ActiveToolTab = 'media' | 'canvas' | 'zoom' | 'cursor' | 'effects' | 'subtitles' | 'audio' | 'settings';

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
  mode: CursorMode; // 'video' (original video mouse), 'styled' (high-DPI vector overlay), 'hidden'
  showOverlay: boolean; // True to render vector cursor
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

export interface MouseTelemetrySample {
  timestamp: number; // in seconds from recording start
  x: number; // normalized [0, 1]
  y: number; // normalized [0, 1]
  isClick: boolean;
}

export interface EffectsConfig {
  motionBlur: boolean;
  vignetteIntensity: number; // 0.0 to 1.0
  backgroundBlurPx: number; // 0 to 40
  cameraShake: boolean;
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
  effects: EffectsConfig;
  subtitles: SubtitlesConfig;
  zoomClips: ZoomClip[];
  videoClips: VideoClip[];
  subtitleClips: SubtitleClip[];
  audioConfig: AudioTrackConfig;
  trackVisibility?: TrackVisibilityConfig;
  mouseTelemetry?: MouseTelemetrySample[];
  videoMetadata?: {
    width: number;
    height: number;
    aspectRatio: number;
    duration: number;
  };
}
