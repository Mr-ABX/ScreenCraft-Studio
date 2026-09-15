/**
 * Offscreen Video Filmstrip Thumbnail Generator
 * Generates lightweight keyframe snapshot thumbnails across the video timeline.
 */

const thumbnailCache = new Map<string, string[]>();

export interface FilmstripOptions {
  count?: number;
  width?: number;
  height?: number;
  quality?: number;
}

export async function generateVideoThumbnails(
  source: File | Blob | string,
  duration: number,
  options: FilmstripOptions = {}
): Promise<string[]> {
  const {
    count = 14,
    width = 160,
    height = 90,
    quality = 0.65,
  } = options;

  if (duration <= 0 || count <= 0) return [];

  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const cacheKey = `${url}_${count}_${Math.round(duration)}`;

  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  return new Promise<string[]>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });

    const thumbnails: string[] = [];
    const timestamps: number[] = [];

    const interval = duration / (count + 1);
    for (let i = 1; i <= count; i++) {
      timestamps.push(Math.min(duration - 0.05, i * interval));
    }

    let currentIndex = 0;

    const cleanup = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (typeof source !== 'string') {
        URL.revokeObjectURL(url);
      }
    };

    const captureNextFrame = () => {
      if (currentIndex >= timestamps.length) {
        thumbnailCache.set(cacheKey, thumbnails);
        cleanup();
        resolve(thumbnails);
        return;
      }

      const targetTime = timestamps[currentIndex];
      let seekTimeout: any = null;

      const onSeeked = () => {
        if (seekTimeout) clearTimeout(seekTimeout);
        video.removeEventListener('seeked', onSeeked);

        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            thumbnails.push(dataUrl);
          } catch (e) {
            console.warn('Thumbnail frame capture error:', e);
            thumbnails.push('');
          }
        } else {
          thumbnails.push('');
        }

        currentIndex++;
        captureNextFrame();
      };

      video.addEventListener('seeked', onSeeked, { once: true });

      // Fallback timeout in case seek stalls
      seekTimeout = setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        thumbnails.push('');
        currentIndex++;
        captureNextFrame();
      }, 600);

      video.currentTime = targetTime;
    };

    video.onloadeddata = () => {
      captureNextFrame();
    };

    video.onerror = () => {
      console.warn('Failed to load video for thumbnail generation');
      cleanup();
      resolve([]);
    };

    video.src = url;
  });
}
