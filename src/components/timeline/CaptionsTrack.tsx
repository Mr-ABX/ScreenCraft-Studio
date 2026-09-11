import { useStudioStore } from '../../store/useStudioStore';
import { Captions } from 'lucide-react';

interface CaptionsTrackProps {
  pixelsPerSecond: number;
}

export function CaptionsTrack({ pixelsPerSecond }: CaptionsTrackProps) {
  const { project, currentTime } = useStudioStore();
  const { subtitleClips, subtitles } = project;

  if (!subtitles.enabled) {
    return null;
  }

  return (
    <div className="relative h-8 w-full rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center overflow-hidden select-none">
      {subtitleClips.map((clip) => {
        const left = clip.start * pixelsPerSecond;
        const width = (clip.end - clip.start) * pixelsPerSecond;
        const isActive = currentTime >= clip.start && currentTime <= clip.end;

        return (
          <div
            key={clip.id}
            style={{
              left: `${left}px`,
              width: `${Math.max(24, width)}px`,
            }}
            className={`absolute h-6 rounded-md flex items-center px-2 text-[10px] font-medium truncate transition-all ${
              isActive
                ? 'bg-amber-500/30 border border-amber-400/60 text-amber-200 shadow-sm'
                : 'bg-amber-500/15 border border-amber-500/25 text-amber-300/80'
            }`}
          >
            <Captions className="w-2.5 h-2.5 mr-1 flex-shrink-0 opacity-75" />
            <span className="truncate">{clip.text}</span>
          </div>
        );
      })}
    </div>
  );
}
