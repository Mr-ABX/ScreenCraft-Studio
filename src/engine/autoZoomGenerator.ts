import { ZoomClip, MouseTelemetrySample } from '../types/project';

/**
 * Smart Auto-Zoom Generation Engine
 * 1. Analyzes real recorded mouse telemetry clicks to place zooms on actual user actions.
 * 2. Or generates intelligent pacing across the timeline for uploaded video files.
 */

export interface AutoZoomOptions {
  durationSeconds: number;
  zoomIntensity?: 'subtle' | 'standard' | 'dynamic';
  frequency?: 'sparse' | 'normal' | 'frequent';
  telemetry?: MouseTelemetrySample[];
  defaultZoomFactor?: number;
}

export function generateAutoZoomsFromTelemetry(
  telemetry: MouseTelemetrySample[],
  durationSeconds: number,
  zoomFactor: number = 2.0
): ZoomClip[] {
  if (!telemetry || telemetry.length === 0 || durationSeconds < 3) return [];

  const clickSamples = telemetry.filter((t) => t.isClick && t.timestamp < durationSeconds - 1.0);
  if (clickSamples.length === 0) return [];

  const clips: ZoomClip[] = [];
  let lastEndTime = 0;

  for (let i = 0; i < clickSamples.length; i++) {
    const click = clickSamples[i];
    const startTime = Math.max(0.5, click.timestamp - 0.6);
    const endTime = Math.min(durationSeconds - 0.2, startTime + 4.2);

    // Prevent overlap with previous zoom block
    if (startTime < lastEndTime + 1.5) {
      continue;
    }

    clips.push({
      id: `zoom_telemetry_${Date.now()}_${i}`,
      startTime: Math.round(startTime * 10) / 10,
      endTime: Math.round(endTime * 10) / 10,
      zoomFactor,
      focusTarget: {
        x: Math.max(0.15, Math.min(0.85, click.x)),
        y: Math.max(0.15, Math.min(0.85, click.y)),
      },
    });

    lastEndTime = endTime;
  }

  return clips;
}

export function generateSmartAutoZooms(options: AutoZoomOptions): ZoomClip[] {
  const {
    durationSeconds,
    zoomIntensity = 'standard',
    frequency = 'normal',
    telemetry,
    defaultZoomFactor = 2.0,
  } = options;

  if (durationSeconds < 4) return [];

  // 1. If telemetry is present with clicks, use real click targets!
  if (telemetry && telemetry.length > 0) {
    const telemetryZooms = generateAutoZoomsFromTelemetry(
      telemetry,
      durationSeconds,
      defaultZoomFactor
    );
    if (telemetryZooms.length > 0) {
      return telemetryZooms;
    }
  }

  // 2. Otherwise generate paced focal points
  const zoomFactors = {
    subtle: [1.6, 1.8, 1.7],
    standard: [2.0, 2.3, 2.1, 2.5],
    dynamic: [2.2, 2.8, 2.4, 3.0],
  }[zoomIntensity];

  const focalPoints = [
    { x: 0.65, y: 0.38 }, // Main Hero / Center-Right
    { x: 0.28, y: 0.55 }, // Left Nav / Form Input
    { x: 0.72, y: 0.68 }, // Bottom-Right CTA Button
    { x: 0.50, y: 0.32 }, // Top Search / Header
    { x: 0.35, y: 0.45 }, // Code Block / Text Area
  ];

  const segmentDuration = frequency === 'frequent' ? 5.0 : frequency === 'sparse' ? 10.0 : 7.0;
  const gapBetweenZooms = frequency === 'frequent' ? 3.0 : frequency === 'sparse' ? 8.0 : 5.0;

  const clips: ZoomClip[] = [];
  let currentTime = Math.min(2.5, durationSeconds * 0.08);

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

