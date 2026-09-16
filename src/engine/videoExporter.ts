import { StudioProject } from '../types/project';
import { SpringCameraEngine } from './springPhysics';

export interface ExportProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  fps: number;
}

export interface ExportOptions {
  resolution: '4k' | '1080p' | '720p';
  format: 'mp4' | 'prores' | 'gif';
  onProgress?: (progress: ExportProgress) => void;
}

export async function renderAndExportVideo(
  videoElement: HTMLVideoElement,
  project: StudioProject,
  options: ExportOptions
): Promise<Blob> {
  const { onProgress } = options;

  // Dimensions based on resolution & aspect ratio
  let targetWidth = 1920;
  let targetHeight = 1080;

  if (options.resolution === '4k') {
    targetWidth = 3840;
    targetHeight = 2160;
  } else if (options.resolution === '720p') {
    targetWidth = 1280;
    targetHeight = 720;
  }

  // Adjust for aspect ratio
  if (project.canvas.aspectRatio === '9:16') {
    const temp = targetWidth;
    targetWidth = targetHeight;
    targetHeight = temp;
  } else if (project.canvas.aspectRatio === '1:1') {
    targetWidth = targetHeight;
  } else if (project.canvas.aspectRatio === '4:5') {
    targetWidth = Math.round(targetHeight * 0.8);
  }

  // Offscreen Canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Spring camera instance
  const cameraEngine = new SpringCameraEngine(project.camera.springPhysics);
  cameraEngine.reset(1.0, 0.5, 0.5);

  const duration = project.durationSeconds || videoElement.duration || 10;
  const fps = 60;
  const totalFrames = Math.floor(duration * fps);
  const dt = 1 / fps;

  // Stream & MediaRecorder for reliable cross-browser export
  const stream = canvas.captureStream(fps);

  // If video element has an audio track, capture and route into stream
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaElementSource(videoElement);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  } catch (e) {
    // Audio context might already be routed
  }

  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMime,
    videoBitsPerSecond: options.resolution === '4k' ? 28_000_000 : 12_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  const originalTime = videoElement.currentTime;
  const originalMuted = videoElement.muted;
  videoElement.muted = true; // prevent blast during export

  const startTime = performance.now();

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const currentTime = frameIndex * dt;

    // Map master timeline time to active video clip source offset
    const activeVideoClip =
      project.videoClips.find(
        (c) =>
          currentTime >= c.timelineStart &&
          currentTime < c.timelineStart + c.duration
      ) || project.videoClips[project.videoClips.length - 1];

    const targetSourceTime = activeVideoClip
      ? activeVideoClip.sourceStart +
        (currentTime - activeVideoClip.timelineStart) *
          (activeVideoClip.playbackRate || 1.0)
      : currentTime;

    videoElement.currentTime = Math.max(0, targetSourceTime);

    // Wait for frame seek
    await new Promise<void>((res) => {
      const onSeeked = () => {
        videoElement.removeEventListener('seeked', onSeeked);
        res();
      };
      videoElement.addEventListener('seeked', onSeeked, { once: true });
      // Fallback in case seeked doesn't fire immediately
      setTimeout(res, 35);
    });

    // 1. Determine active zoom target
    const activeZoom = project.zoomClips.find(
      (z) => currentTime >= z.startTime && currentTime <= z.endTime
    );
    if (activeZoom) {
      cameraEngine.setTargets(
        activeZoom.zoomFactor,
        activeZoom.focusTarget.x,
        activeZoom.focusTarget.y
      );
    } else {
      cameraEngine.setTargets(1.0, 0.5, 0.5);
    }

    const { zoom, focusX, focusY } = cameraEngine.tick(dt);

    // 2. Clear canvas & Render Studio Mesh Background
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    drawStudioBackground(ctx, targetWidth, targetHeight, project.canvas.background.preset);

    // 3. Draw Window & Scaled Video with Proportional OpenScreen Constraint Math
    const isFrameless = project.canvas.frame.type === 'frameless';
    const headerHeight = isFrameless ? 0 : Math.round(targetHeight * 0.042);

    const scaleFactor = targetWidth / 1280;
    const paddingPx = project.canvas.paddingPx * scaleFactor;
    const cornerRadius = project.canvas.cornerRadiusPx * scaleFactor;

    const availW = Math.max(20, targetWidth - paddingPx * 2);
    const availH = Math.max(20, targetHeight - paddingPx * 2);

    const videoAspect =
      videoElement.videoWidth && videoElement.videoHeight
        ? videoElement.videoWidth / videoElement.videoHeight
        : project.videoMetadata?.aspectRatio || 16 / 9;

    const maxVidH = Math.max(10, availH - headerHeight);
    let vidW = availW;
    let vidH = vidW / videoAspect;

    if (vidH > maxVidH) {
      vidH = maxVidH;
      vidW = vidH * videoAspect;
    }

    const frameWidth = Math.round(vidW);
    const frameHeight = Math.round(vidH + headerHeight);
    const frameX = Math.round((targetWidth - frameWidth) / 2);
    const frameY = Math.round((targetHeight - frameHeight) / 2);

    // Contact Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = targetWidth * 0.035;
    ctx.shadowOffsetY = targetWidth * 0.015;

    // Draw Window Chrome Shell
    drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, cornerRadius);
    ctx.fillStyle = '#121216';
    ctx.fill();
    ctx.restore();

    // Border
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, cornerRadius);
    ctx.stroke();
    ctx.restore();

    // Safari / macOS Chrome Header
    if (!isFrameless) {
      drawChromeHeader(ctx, frameX, frameY, frameWidth, headerHeight, project.canvas.frame);
    }

    // 4. Draw Video Content inside window clip
    const videoContentY = frameY + headerHeight;
    const videoContentHeight = frameHeight - headerHeight;

    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, videoContentY, frameWidth, videoContentHeight);
    ctx.clip();

    // Apply Zoom & Camera Pan
    const scaledW = frameWidth * zoom;
    const scaledH = videoContentHeight * zoom;
    const offsetX = frameX + (frameWidth - scaledW) * focusX;
    const offsetY = videoContentY + (videoContentHeight - scaledH) * focusY;

    if (videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, offsetX, offsetY, scaledW, scaledH);
    } else {
      // Fallback placeholder
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(offsetX, offsetY, scaledW, scaledH);
    }

    // 5. Draw Vector Cursor & Click Ripple
    const shouldDrawCursor =
      project.cursor.mode === 'styled' ||
      (project.cursor.mode !== 'video' &&
        project.cursor.mode !== 'hidden' &&
        project.cursor.showOverlay);

    if (shouldDrawCursor) {
      let curX = focusX;
      let curY = focusY;

      let isClicking = false;
      if (project.mouseTelemetry && project.mouseTelemetry.length > 0) {
        const samples = project.mouseTelemetry;
        const idx = samples.findIndex((s) => s.timestamp >= currentTime);
        if (idx === -1) {
          const last = samples[samples.length - 1];
          curX = last.x;
          curY = last.y;
          isClicking = last.isClick;
        } else if (idx === 0) {
          curX = samples[0].x;
          curY = samples[0].y;
          isClicking = samples[0].isClick;
        } else {
          const prev = samples[idx - 1];
          const next = samples[idx];
          const span = next.timestamp - prev.timestamp;
          const progress = span > 0 ? (currentTime - prev.timestamp) / span : 0;
          curX = prev.x + (next.x - prev.x) * progress;
          curY = prev.y + (next.y - prev.y) * progress;
          isClicking = prev.isClick || next.isClick;
        }
      }

      const cursorScreenX = offsetX + curX * scaledW;
      const cursorScreenY = offsetY + curY * scaledH;
      drawVectorCursor(
        ctx,
        cursorScreenX,
        cursorScreenY,
        (project.cursor.scale || 1.4) * scaleFactor,
        project.cursor.style,
        isClicking,
        project.cursor.clickEffect?.color || '#6366f1'
      );
    }

    ctx.restore();

    // 6. Draw Kinetic Subtitle Card if active
    const activeSub = project.subtitleClips.find(
      (s) => currentTime >= s.start && currentTime <= s.end
    );
    if (project.subtitles.enabled && activeSub) {
      drawSubtitle(
        ctx,
        activeSub,
        currentTime,
        targetWidth,
        targetHeight,
        project.subtitles.activeWordColor
      );
    }

    // Report Progress
    if (onProgress) {
      const elapsedSec = (performance.now() - startTime) / 1000;
      const currentFps = Math.round((frameIndex + 1) / (elapsedSec || 1));
      onProgress({
        currentFrame: frameIndex + 1,
        totalFrames,
        percentage: Math.round(((frameIndex + 1) / totalFrames) * 100),
        fps: currentFps,
      });
    }
  }

  videoElement.currentTime = originalTime;
  videoElement.muted = originalMuted;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: selectedMime });
      resolve(finalBlob);
    };
    recorder.stop();
  });
}

function drawStudioBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  preset: string
) {
  const grad = ctx.createRadialGradient(
    w * 0.3,
    h * 0.2,
    0,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.85
  );

  if (preset === 'obsidian_studio') {
    grad.addColorStop(0, '#27272a');
    grad.addColorStop(0.5, '#121214');
    grad.addColorStop(1, '#050507');
  } else if (preset === 'cyber_sunset') {
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.5, '#701a75');
    grad.addColorStop(1, '#0f172a');
  } else if (preset === 'midnight_velvet') {
    grad.addColorStop(0, '#312e81');
    grad.addColorStop(0.6, '#1e1b4b');
    grad.addColorStop(1, '#09090b');
  } else if (preset === 'cosmic_nebula') {
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(0.45, '#6366f1');
    grad.addColorStop(1, '#0f172a');
  } else if (preset === 'emerald_isle') {
    grad.addColorStop(0, '#065f46');
    grad.addColorStop(0.4, '#0f766e');
    grad.addColorStop(1, '#042f2e');
  } else if (preset === 'sonoma_waves') {
    grad.addColorStop(0, '#fb923c');
    grad.addColorStop(0.35, '#c026d3');
    grad.addColorStop(0.7, '#4338ca');
    grad.addColorStop(1, '#050507');
  } else if (preset === 'sequoia_mist') {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.3, '#0284c7');
    grad.addColorStop(0.7, '#1e293b');
    grad.addColorStop(1, '#050507');
  } else {
    // Apple Aurora (default)
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.4, '#581c87');
    grad.addColorStop(0.8, '#0d9488');
    grad.addColorStop(1, '#050507');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawChromeHeader(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: StudioProject['canvas']['frame']
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(x, y, w, h);

  // Traffic lights
  if (frame.showTrafficLights) {
    const dotR = h * 0.16;
    const dotY = y + h * 0.5;
    const startX = x + h * 0.6;

    // Red
    ctx.beginPath();
    ctx.arc(startX, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5F56';
    ctx.fill();

    // Yellow
    ctx.beginPath();
    ctx.arc(startX + dotR * 2.6, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFBD2E';
    ctx.fill();

    // Green
    ctx.beginPath();
    ctx.arc(startX + dotR * 5.2, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#27C93F';
    ctx.fill();
  }

  // Safari URL Box
  if (frame.type === 'safari' && frame.url) {
    const pillW = Math.min(w * 0.45, 420);
    const pillH = h * 0.58;
    const pillX = x + (w - pillW) / 2;
    const pillY = y + (h - pillH) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH * 0.35);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = `500 ${Math.round(pillH * 0.48)}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frame.url, pillX + pillW / 2, pillY + pillH / 2);
  }
}

function drawVectorCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  style: StudioProject['cursor']['style'] = 'macos_arrow',
  isClicking: boolean = false,
  haloColor: string = '#6366f1'
) {
  ctx.save();
  ctx.translate(x, y);

  // Click shockwave ripple
  if (isClicking) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 18 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = 2 * scale;
    ctx.fillStyle = `${haloColor}33`;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.scale(scale, scale);

  if (style === 'macos_white') {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 20);
    ctx.lineTo(12, 12);
    ctx.lineTo(20, 9);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#111115';
    ctx.stroke();
  } else if (style === 'windows_arrow') {
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.lineTo(4, 20);
    ctx.lineTo(8.5, 15.5);
    ctx.lineTo(12.5, 23);
    ctx.lineTo(15.5, 21.5);
    ctx.lineTo(11.5, 14);
    ctx.lineTo(18, 14);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  } else if (style === 'precision_cross') {
    ctx.beginPath();
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    ctx.fillStyle = haloColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.moveTo(12, 2);
    ctx.lineTo(12, 8);
    ctx.moveTo(12, 16);
    ctx.lineTo(12, 22);
    ctx.moveTo(2, 12);
    ctx.lineTo(8, 12);
    ctx.moveTo(16, 12);
    ctx.lineTo(22, 12);
    ctx.stroke();
  } else if (style === 'glow_dot') {
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = haloColor;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  } else {
    // macOS Dark default
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 20);
    ctx.lineTo(12, 12);
    ctx.lineTo(20, 9);
    ctx.closePath();
    ctx.fillStyle = '#111115';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  ctx.restore();
}

function drawSubtitle(
  ctx: CanvasRenderingContext2D,
  clip: StudioProject['subtitleClips'][0],
  time: number,
  w: number,
  h: number,
  activeColor: string
) {
  const fontSize = Math.round(h * 0.026);
  ctx.font = `700 ${fontSize}px -apple-system, sans-serif`;

  const totalText = clip.text;
  const metrics = ctx.measureText(totalText);
  const cardW = metrics.width + 48;
  const cardH = fontSize * 2.2;
  const cardX = (w - cardW) / 2;
  const cardY = h * 0.88;

  // Background Card
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.fill();

  // Words
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let curX = cardX + 24;

  clip.words.forEach((item) => {
    const isWordActive = time >= item.start && time <= item.end;
    ctx.fillStyle = isWordActive ? activeColor : 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(item.word + ' ', curX, cardY + cardH / 2);
    curX += ctx.measureText(item.word + ' ').width;
  });
}
