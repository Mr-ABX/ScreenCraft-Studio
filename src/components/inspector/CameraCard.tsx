import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Compass, Sparkles, Wand2 } from 'lucide-react';

export function CameraCard() {
  const {
    project,
    setPerspective3D,
    setAutoZoomEnabled,
    setDefaultZoomFactor,
    setSpringPhysics,
    suggestSmartAutoZooms,
  } = useStudioStore();

  const { camera } = project;

  const springPresets = [
    { label: 'Smooth', stiffness: 180, damping: 24 },
    { label: 'Snappy', stiffness: 260, damping: 30 },
    { label: 'Cinematic', stiffness: 120, damping: 20 },
  ];

  return (
    <div className="space-y-5">
      {/* 3D Perspective Tilt Controls (Applied to Window Frame) */}
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

      {/* Auto-Zoom Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Zoom Engine</span>
          </label>

          {/* 1-Click Smart Auto-Zoom Button */}
          <button
            type="button"
            onClick={suggestSmartAutoZooms}
            title="Automatically generate intelligent zoom keyframes for the entire timeline"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3 text-indigo-300" />
            <span>Magic Auto-Zoom</span>
          </button>
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
