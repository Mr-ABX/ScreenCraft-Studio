import { MouseTelemetrySample } from '../types/project';

export interface TrackerOptions {
  sampleRateFps?: number; // default 8-10 fps for balance of speed & accuracy
  motionThreshold?: number; // pixel difference threshold
  onProgress?: (progress: number) => void;
}

/**
 * Optical motion tracker that analyzes video frame deltas to detect moving cursor centroids
 * and synthesize smooth telemetry for uploaded/imported videos.
 */
export async function trackVideoCursor(
  fileOrBlob: Blob,
  durationSeconds: number,
  options: TrackerOptions = {}
): Promise<MouseTelemetrySample[]> {
  const {
    sampleRateFps = 8,
    motionThreshold = 28,
    onProgress,
  } = options;

  const url = URL.createObjectURL(fileOrBlob);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  // Wait for video metadata
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video for cursor tracking'));
  });

  const duration = Math.min(
    durationSeconds || video.duration || 30,
    video.duration || 30
  );

  // Use low-res offscreen canvas for fast pixel processing
  const canvas = document.createElement('canvas');
  const processWidth = 320;
  const processHeight = Math.round(320 * ((video.videoHeight || 1080) / (video.videoWidth || 1920))) || 180;
  canvas.width = processWidth;
  canvas.height = processHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('Canvas 2D context unavailable');
  }

  const interval = 1 / sampleRateFps;
  const totalSteps = Math.max(5, Math.floor(duration / interval));
  const rawSamples: MouseTelemetrySample[] = [];

  let prevImageData: ImageData | null = null;
  let lastKnownX = 0.5;
  let lastKnownY = 0.5;

  const seekTo = (time: number): Promise<void> => {
    return new Promise((resolve) => {
      const handleSeeked = () => {
        video.removeEventListener('seeked', handleSeeked);
        resolve();
      };
      video.addEventListener('seeked', handleSeeked);
      video.currentTime = Math.max(0, Math.min(duration, time));
    });
  };

  try {
    for (let i = 0; i <= totalSteps; i++) {
      const currentTime = Math.min(duration, i * interval);
      await seekTo(currentTime);

      ctx.drawImage(video, 0, 0, processWidth, processHeight);
      const currentImageData = ctx.getImageData(0, 0, processWidth, processHeight);

      if (prevImageData) {
        const curr = currentImageData.data;
        const prev = prevImageData.data;
        const totalPixels = processWidth * processHeight;

        let diffCount = 0;
        let sumX = 0;
        let sumY = 0;

        for (let p = 0; p < totalPixels; p++) {
          const idx = p * 4;
          const dr = Math.abs(curr[idx] - prev[idx]);
          const dg = Math.abs(curr[idx + 1] - prev[idx + 1]);
          const db = Math.abs(curr[idx + 2] - prev[idx + 2]);

          if (dr + dg + db > motionThreshold * 3) {
            const px = p % processWidth;
            const py = Math.floor(p / processWidth);
            sumX += px;
            sumY += py;
            diffCount++;
          }
        }

        // A cursor moving typically changes between 10 and 2500 pixels in this 320x180 resolution
        if (diffCount >= 8 && diffCount <= 2500) {
          const detectedX = Math.max(0.02, Math.min(0.98, (sumX / diffCount) / processWidth));
          const detectedY = Math.max(0.02, Math.min(0.98, (sumY / diffCount) / processHeight));

          // Smooth towards new detection
          lastKnownX = lastKnownX * 0.4 + detectedX * 0.6;
          lastKnownY = lastKnownY * 0.4 + detectedY * 0.6;

          // Potential click detection: sudden motion burst or small focal change
          const isClick = diffCount < 60 && Math.hypot(detectedX - lastKnownX, detectedY - lastKnownY) < 0.05;

          rawSamples.push({
            timestamp: Math.round(currentTime * 100) / 100,
            x: Math.round(lastKnownX * 1000) / 1000,
            y: Math.round(lastKnownY * 1000) / 1000,
            isClick,
          });
        } else {
          // No cursor movement detected; hold last position
          rawSamples.push({
            timestamp: Math.round(currentTime * 100) / 100,
            x: Math.round(lastKnownX * 1000) / 1000,
            y: Math.round(lastKnownY * 1000) / 1000,
            isClick: false,
          });
        }
      } else {
        // Initial sample
        rawSamples.push({
          timestamp: 0,
          x: 0.5,
          y: 0.5,
          isClick: false,
        });
      }

      prevImageData = currentImageData;

      if (onProgress && totalSteps > 0) {
        onProgress(Math.min(1, (i + 1) / totalSteps));
      }
    }
  } finally {
    URL.revokeObjectURL(url);
  }

  // Smooth raw samples with a 3-point moving average to eliminate sensor jitter
  const smoothed: MouseTelemetrySample[] = rawSamples.map((sample, idx, arr) => {
    if (idx === 0 || idx === arr.length - 1) return sample;
    const prev = arr[idx - 1];
    const next = arr[idx + 1];
    return {
      timestamp: sample.timestamp,
      x: Math.round(((prev.x + sample.x * 2 + next.x) / 4) * 1000) / 1000,
      y: Math.round(((prev.y + sample.y * 2 + next.y) / 4) * 1000) / 1000,
      isClick: sample.isClick,
    };
  });

  return smoothed;
}
