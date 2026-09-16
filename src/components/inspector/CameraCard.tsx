import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Compass, Sparkles, Wand2 } from 'lucide-react';

export function CameraCard() {
  const {
    project,
    currentTime,
    selectedZoomClipId,
    updateZoomClip,
    deleteZoomClip,
    setPerspective3D,
    setAutoZoomEnabled,
    setDefaultZoomFactor,
    setSpringPhysics,
    suggestSmartAutoZooms,
    addZoomClip,
  } = useStudioStore();

  const { camera, zoomClips } = project;

  const activeClip =
    zoomClips.find((z) => z.id === selectedZoomClipId) ||
    zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime);

  const springPresets = [
    { label: 'Smooth', stiffness: 180, damping: 24 },
    { label: 'Snappy', stiffness: 260, damping: 30 },
    { label: 'Cinematic', stiffness: 120, damping: 20 },
  ];

  const focalPresets = [
    { label: 'Top-L', x: 0.25, y: 0.25 },
    { label: 'Center', x: 0.5, y: 0.5 },
    { label: 'Top-R', x: 0.75, y: 0.25 },
    { label: 'Bot-L', x: 0.25, y: 0.75 },
    { label: 'Bot-R', x: 0.75, y: 0.75 },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Active Zoom Block Region & Magnification Control */}
      {activeClip && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3.5 shadow-lg shadow-indigo-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Active Zoom Region
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30">
                {activeClip.startTime.toFixed(1)}s – {activeClip.endTime.toFixed(1)}s
              </span>

              <button
                type="button"
                onClick={() => deleteZoomClip(activeClip.id)}
                title="Remove this zoom block"
                className="text-[10px] text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Magnification / Zoom Factor Slider (Zoom Out to 1.0x or In to 3.5x) */}
          <NumberSlider
            label="Block Zoom Scale (In / Out)"
            value={activeClip.zoomFactor}
            min={1.0}
            max={3.5}
            step={0.1}
            unit="x"
            defaultValue={2.0}
            onChange={(factor) =>
              updateZoomClip(activeClip.id, { zoomFactor: factor })
            }
          />

          {/* Focus X Position Slider */}
          <NumberSlider
            label="Focus Center X"
            value={Math.round(activeClip.focusTarget.x * 100)}
            min={5}
            max={95}
            step={1}
            unit="%"
            defaultValue={50}
            onChange={(val) =>
              updateZoomClip(activeClip.id, {
                focusTarget: { ...activeClip.focusTarget, x: val / 100 },
              })
            }
          />

          {/* Focus Y Position Slider */}
          <NumberSlider
            label="Focus Center Y"
            value={Math.round(activeClip.focusTarget.y * 100)}
            min={5}
            max={95}
            step={1}
            unit="%"
            defaultValue={50}
            onChange={(val) =>
              updateZoomClip(activeClip.id, {
                focusTarget: { ...activeClip.focusTarget, y: val / 100 },
              })
            }
          />

          {/* Quick Focal Presets */}
          <div className="space-y-1.5 pt-0.5">
            <label className="text-[10px] text-zinc-400 font-medium flex items-center justify-between">
              <span>Quick Focal Target</span>
              <span className="text-zinc-500 text-[9px]">or drag reticle on canvas</span>
            </label>
            <div className="grid grid-cols-5 gap-1">
              {focalPresets.map((p) => {
                const isSelected =
                  Math.abs(activeClip.focusTarget.x - p.x) < 0.08 &&
                  Math.abs(activeClip.focusTarget.y - p.y) < 0.08;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      updateZoomClip(activeClip.id, {
                        focusTarget: { x: p.x, y: p.y },
                      })
                    }
                    className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. 3D Perspective Tilt Controls (Applied to Window Frame) */}
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span>3D Window Tilt</span>
        </label>

        <NumberSlider
          label="Pitch (Vertical Tilt)"
          value={camera.perspective3D.pitchDeg}
          min={-25}
          max={25}
          step={1}
          unit="°"
          defaultValue={12}
          onChange={(pitch) =>
            setPerspective3D(pitch, camera.perspective3D.yawDeg)
          }
        />

        <NumberSlider
          label="Yaw (Horizontal Rotation)"
          value={camera.perspective3D.yawDeg}
          min={-25}
          max={25}
          step={1}
          unit="°"
          defaultValue={-6}
          onChange={(yaw) =>
            setPerspective3D(camera.perspective3D.pitchDeg, yaw)
          }
        />
      </div>

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* 3. Auto-Zoom Engine & Add Zoom */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Zoom Engine</span>
          </label>

          <div className="flex items-center gap-1.5">
            {/* Add Zoom at Playhead */}
            <button
              type="button"
              onClick={() => {
                if (project.durationSeconds <= 0) return;
                addZoomClip({
                  startTime: Math.round(currentTime * 10) / 10,
                  endTime: Math.min(
                    project.durationSeconds,
                    Math.round((currentTime + 4.0) * 10) / 10
                  ),
                  zoomFactor: project.camera.defaultZoomFactor,
                  focusTarget: { x: 0.5, y: 0.5 },
                });
              }}
              title="Add custom zoom block at current playhead position"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border border-white/10 transition-colors cursor-pointer"
            >
              <span>+ Add at Playhead</span>
            </button>

            {/* 1-Click Smart Auto-Zoom Button */}
            <button
              type="button"
              onClick={suggestSmartAutoZooms}
              title={
                project.mouseTelemetry && project.mouseTelemetry.length > 0
                  ? 'Generate zoom keyframes centered on real recorded clicks'
                  : 'Automatically generate intelligent zoom keyframes across the timeline'
              }
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3 h-3 text-indigo-300" />
              <span>
                {project.mouseTelemetry?.length ? 'Click Auto-Zoom' : 'Magic Zoom'}
              </span>
            </button>
          </div>
        </div>

        <ToggleSwitch
          label="Enable Dynamic Zooms"
          description="Glides camera with spring physics into focus areas"
          checked={camera.autoZoomEnabled}
          onChange={setAutoZoomEnabled}
        />

        {camera.autoZoomEnabled && (
          <div className="space-y-3 pt-2">
            <NumberSlider
              label="Default Zoom Scale"
              value={camera.defaultZoomFactor}
              min={1.2}
              max={3.0}
              step={0.1}
              unit="x"
              defaultValue={2.0}
              onChange={setDefaultZoomFactor}
            />

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">
                Camera Physics Spring Profile
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {springPresets.map((preset) => {
                  const isSelected =
                    camera.springPhysics.stiffness === preset.stiffness;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setSpringPhysics(preset.stiffness, preset.damping)
                      }
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
