import { MouseTelemetrySample } from '../types/project';

export interface RecordingOptions {
  includeWebcam?: boolean;
  includeMic?: boolean;
  includeSystemAudio?: boolean;
  hideSystemCursor?: boolean;
}

export interface RecordedMediaResult {
  blob: Blob;
  url: string;
  durationSeconds: number;
  width?: number;
  height?: number;
  mouseTelemetry?: MouseTelemetrySample[];
}

export class ScreenCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private telemetry: MouseTelemetrySample[] = [];
  private isCapturingTelemetry: boolean = false;
  private lastTelemetryTime: number = 0;
  private recordedWidth: number = 1920;
  private recordedHeight: number = 1080;

  private onPointerMove = (e: MouseEvent) => {
    if (!this.isCapturingTelemetry) return;
    const now = Date.now();
    if (now - this.lastTelemetryTime < 16) return; // ~60fps throttle
    this.lastTelemetryTime = now;

    this.telemetry.push({
      timestamp: Math.max(0, (now - this.startTime) / 1000),
      x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
      isClick: false,
    });
  };

  private onPointerDown = (e: MouseEvent) => {
    if (!this.isCapturingTelemetry) return;
    const now = Date.now();
    this.telemetry.push({
      timestamp: Math.max(0, (now - this.startTime) / 1000),
      x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
      isClick: true,
    });
  };

  public async startRecording(options: RecordingOptions = {}): Promise<MediaStream> {
    this.recordedChunks = [];
    this.telemetry = [];

    // 1. Capture Display Stream (Screen or Window)
    // Pass cursor: 'never' if hideSystemCursor is enabled (default) to eliminate double-cursor!
    const hideCursor = options.hideSystemCursor ?? true;
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: { ideal: 60, max: 60 },
        cursor: hideCursor ? 'never' : 'always',
      } as any,
      audio: options.includeSystemAudio ?? true,
    });

    const videoTrack = displayStream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      this.recordedWidth = settings.width || 1920;
      this.recordedHeight = settings.height || 1080;
    }

    const combinedTracks: MediaStreamTrack[] = [...displayStream.getVideoTracks()];

    // 2. Capture Microphone if requested
    if (options.includeMic) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        combinedTracks.push(...micStream.getAudioTracks());
      } catch (err) {
        console.warn('Microphone permission not granted or unavailable:', err);
      }
    }

    displayStream.getAudioTracks().forEach((track) => combinedTracks.push(track));

    this.stream = new MediaStream(combinedTracks);

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const selectedMime = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 12_000_000, // 12 Mbps
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.isCapturingTelemetry = true;
    window.addEventListener('mousemove', this.onPointerMove, { passive: true });
    window.addEventListener('mousedown', this.onPointerDown, { passive: true });

    this.mediaRecorder.start(1000); // chunk every 1s

    displayStream.getVideoTracks()[0].onended = () => {
      this.stopRecording();
    };

    return this.stream;
  }

  public async stopRecording(): Promise<RecordedMediaResult> {
    this.isCapturingTelemetry = false;
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('mousedown', this.onPointerDown);

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const durationSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve({
          blob,
          url,
          durationSeconds,
          width: this.recordedWidth,
          height: this.recordedHeight,
          mouseTelemetry: this.telemetry,
        });
      };

      this.mediaRecorder.stop();
    });
  }
}
