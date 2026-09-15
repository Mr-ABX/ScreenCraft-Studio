import { ZoomClip } from '../types/project';

/**
 * Smart Auto-Zoom Generation Engine
 * Analyzes video duration and generates intelligent, well-paced camera zooms
 * with varied focal points (Top-left toolbar, Center content, Bottom-right actions).
 */

export interface AutoZoomOptions {
  durationSeconds: number;
  zoomIntensity?: 'subtle' | 'standard' | 'dynamic';
  frequency?: 'sparse' | 'normal' | 'frequent';
}

export function generateSmartAutoZooms(options: AutoZoomOptions): ZoomClip[] {
  const { durationSeconds, zoomIntensity = 'standard', frequency = 'normal' } = options;

  if (durationSeconds < 4) return [];

  const zoomFactors = {
    subtle: [1.6, 1.8, 1.7],
    standard: [2.0, 2.3, 2.1, 2.5],
    dynamic: [2.2, 2.8, 2.4, 3.0],
  }[zoomIntensity];

  // Focal point presets: Nav (top-left), Form/Center, Action (bottom-right), Details (mid-left)
  const focalPoints = [
    { x: 0.65, y: 0.38 }, // Main Hero / Center-Right
    { x: 0.28, y: 0.55 }, // Left Nav / Form Input
    { x: 0.72, y: 0.68 }, // Bottom-Right CTA Button
    { x: 0.50, y: 0.32 }, // Top Search / Header
    { x: 0.35, y: 0.45 }, // Code Block / Text Area
  ];

  // Target zoom duration: 4s to 8s
  const segmentDuration = frequency === 'frequent' ? 5.0 : frequency === 'sparse' ? 10.0 : 7.0;
  const gapBetweenZooms = frequency === 'frequent' ? 3.0 : frequency === 'sparse' ? 8.0 : 5.0;

  const clips: ZoomClip[] = [];
  let currentTime = Math.min(2.5, durationSeconds * 0.08); // Start first zoom shortly after intro

  let index = 0;
  while (currentTime + 3.0 < durationSeconds) {
    const clipLength = Math.min(segmentDuration, durationSeconds - currentTime - 1.0);
    if (clipLength < 2.5) break;

    const zoomFactor = zoomFactors[index % zoomFactors.length];
    const focusTarget = focalPoints[index % focalPoints.length];

    clips.push({
      id: `zoom_smart_${Date.now()}_${index}`,
      startTime: Math.round(currentTime * 10) / 10,
      endTime: Math.round((currentTime + clipLength) * 10) / 10,
      zoomFactor,
      focusTarget,
    });

    currentTime += clipLength + gapBetweenZooms;
    index++;
  }

  return clips;
}
