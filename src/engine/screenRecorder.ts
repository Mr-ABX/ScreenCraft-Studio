/**
 * Browser-Native Screen & Microphone Capture Engine
 */

export interface RecordingOptions {
  includeWebcam?: boolean;
  includeMic?: boolean;
  includeSystemAudio?: boolean;
}

export interface RecordedMediaResult {
  blob: Blob;
  url: string;
  durationSeconds: number;
}

export class ScreenCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  public async startRecording(options: RecordingOptions = {}): Promise<MediaStream> {
    this.recordedChunks = [];

    // 1. Capture Display Stream (Screen or Window)
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: { ideal: 60, max: 60 },
      },
      audio: options.includeSystemAudio ?? true,
    });

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

        // Mix or append mic audio track
        combinedTracks.push(...micStream.getAudioTracks());
      } catch (err) {
        console.warn('Microphone permission not granted or unavailable:', err);
      }
    }

    // Add display audio tracks if present
    displayStream.getAudioTracks().forEach((track) => combinedTracks.push(track));

    this.stream = new MediaStream(combinedTracks);

    // Pick best supported MIME type
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
    this.mediaRecorder.start(1000); // chunk every 1s

    // Auto-stop if user clicks browser "Stop Sharing" floating bar
    displayStream.getVideoTracks()[0].onended = () => {
      this.stopRecording();
    };

    return this.stream;
  }

  public async stopRecording(): Promise<RecordedMediaResult> {
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

        // Stop all track hardware resources
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve({
          blob,
          url,
          durationSeconds,
        });
      };

      this.mediaRecorder.stop();
    });
  }
}
