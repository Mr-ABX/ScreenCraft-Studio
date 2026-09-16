import { ZoomClip, MouseTelemetrySample } from '../types/project';

/**
 * OpenScreen & Screen Studio Smart Auto-Zoom Engine
 * 1. Clusters real recorded clicks and dwell interactions into smooth zoom segments.
 * 2. Or generates rhythmically paced focus keyframes for uploaded video files.
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
  zoomFactor: number = 2.0,
  zoomIntensity: 'subtle' | 'standard' | 'dynamic' = 'standard'
): ZoomClip[] {
  if (!telemetry || telemetry.length === 0 || durationSeconds < 2) return [];

  const clickSamples = telemetry.filter(
    (t) => t.isClick && t.timestamp < durationSeconds - 0.5
  );

  if (clickSamples.length === 0) return [];

  const factor =
    zoomIntensity === 'subtle'
      ? Math.min(1.6, zoomFactor)
      : zoomIntensity === 'dynamic'
      ? Math.max(2.4, zoomFactor)
      : zoomFactor;

  // 1. Cluster nearby clicks within 1.5 seconds into single zoom episodes
  const clusters: Array<{
    startTime: number;
    endTime: number;
    focalX: number;
    focalY: number;
    clicks: MouseTelemetrySample[];
  }> = [];

  let currentCluster: MouseTelemetrySample[] = [];

  for (let i = 0; i < clickSamples.length; i++) {
    const sample = clickSamples[i];
    if (currentCluster.length === 0) {
      currentCluster.push(sample);
    } else {
      const prev = currentCluster[currentCluster.length - 1];
      if (sample.timestamp - prev.timestamp <= 1.8) {
        currentCluster.push(sample);
      } else {
        // Finalize cluster
        const avgX =
          currentCluster.reduce((sum, c) => sum + c.x, 0) /
          currentCluster.length;
        const avgY =
          currentCluster.reduce((sum, c) => sum + c.y, 0) /
          currentCluster.length;
        clusters.push({
          startTime: currentCluster[0].timestamp,
          endTime: currentCluster[currentCluster.length - 1].timestamp,
          focalX: avgX,
          focalY: avgY,
          clicks: [...currentCluster],
        });
        currentCluster = [sample];
      }
    }
  }

  if (currentCluster.length > 0) {
    const avgX =
      currentCluster.reduce((sum, c) => sum + c.x, 0) / currentCluster.length;
    const avgY =
      currentCluster.reduce((sum, c) => sum + c.y, 0) / currentCluster.length;
    clusters.push({
      startTime: currentCluster[0].timestamp,
      endTime: currentCluster[currentCluster.length - 1].timestamp,
      focalX: avgX,
      focalY: avgY,
      clicks: [...currentCluster],
    });
  }

  // 2. Build non-overlapping Zoom Clips with natural pre-roll and dwell times
  const clips: ZoomClip[] = [];
  let lastEndTime = 0;

  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const preRoll = 0.4;
    const dwell = 2.4;

    const start = Math.max(0.2, c.startTime - preRoll);
    const end = Math.min(durationSeconds - 0.2, c.endTime + dwell);

    // Prevent collision with preceding clip
    if (start < lastEndTime + 0.8) {
      continue;
    }

    // Must have at least 1.8s minimum length
    if (end - start < 1.6) {
      continue;
    }

    clips.push({
      id: `zoom_telemetry_${Date.now()}_${i}`,
      startTime: Math.round(start * 10) / 10,
      endTime: Math.round(end * 10) / 10,
      zoomFactor: factor,
      focusTarget: {
        x: Math.max(0.12, Math.min(0.88, Math.round(c.focalX * 100) / 100)),
        y: Math.max(0.12, Math.min(0.88, Math.round(c.focalY * 100) / 100)),
      },
    });

    lastEndTime = end;
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

  if (durationSeconds < 3) return [];

  // 1. If telemetry is present with clicks, use action-clustering engine!
  if (telemetry && telemetry.length > 0) {
    const telemetryZooms = generateAutoZoomsFromTelemetry(
      telemetry,
      durationSeconds,
      defaultZoomFactor,
      zoomIntensity
    );
    if (telemetryZooms.length > 0) {
      return telemetryZooms;
    }
  }

  // 2. Otherwise generate paced focal zones for uploaded videos
  const zoomFactors = {
    subtle: [1.5, 1.6, 1.5, 1.7],
    standard: [1.9, 2.2, 2.0, 2.4],
    dynamic: [2.4, 2.8, 2.5, 3.0],
  }[zoomIntensity];

  const focalPoints = [
    { x: 0.65, y: 0.38 }, // Hero Visual / Center-Right
    { x: 0.28, y: 0.52 }, // Form / Left Navigation
    { x: 0.72, y: 0.68 }, // CTA Button / Action Area
    { x: 0.50, y: 0.32 }, // Header Bar / Search
    { x: 0.35, y: 0.45 }, // Code Block / Text Focus
  ];

  const segmentDuration =
    frequency === 'frequent' ? 4.5 : frequency === 'sparse' ? 9.0 : 6.0;
  const gapBetweenZooms =
    frequency === 'frequent' ? 2.5 : frequency === 'sparse' ? 6.5 : 4.0;

  const clips: ZoomClip[] = [];
  let currentTime = Math.min(2.0, durationSeconds * 0.08);

  let index = 0;
  while (currentTime + 2.5 < durationSeconds) {
    const clipLength = Math.min(
      segmentDuration,
      durationSeconds - currentTime - 0.8
    );
    if (clipLength < 2.0) break;

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

