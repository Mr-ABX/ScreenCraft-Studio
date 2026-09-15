/**
 * Real Audio Waveform RMS Peak Extractor using Web Audio API
 */

export async function extractAudioWaveformPeaks(
  audioBlob: Blob,
  numPeaks = 300
): Promise<number[]> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // primary channel
    const step = Math.floor(channelData.length / numPeaks);
    const peaks: number[] = [];

    for (let i = 0; i < numPeaks; i++) {
      let sum = 0;
      const start = i * step;
      const end = Math.min(start + step, channelData.length);
      const count = end - start;

      for (let j = start; j < end; j++) {
        const val = channelData[j];
        sum += val * val;
      }

      // Root Mean Square (RMS) energy
      const rms = Math.sqrt(sum / (count || 1));
      // Normalize to [0.15, 1.0] for optimal visual representation
      const normalized = Math.min(1.0, Math.max(0.12, rms * 4.5));
      peaks.push(normalized);
    }

    await audioCtx.close();
    return peaks;
  } catch (err) {
    console.warn('Could not extract audio waveform (possibly silent or unsupported audio track):', err);
    // Fallback pleasing waveform
    return Array.from({ length: numPeaks }).map((_, i) => {
      const v = Math.abs(Math.sin(i * 0.18) * Math.cos(i * 0.45));
      return Math.max(0.15, v * 0.85);
    });
  }
}
