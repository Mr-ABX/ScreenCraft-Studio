import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { SegmentedControl } from '../common/SegmentedControl';
import {
  Compass,
  Sparkles,
  Wand2,
  Maximize2,
  Trash2,
  Crosshair,
  Sliders,
  Target,
} from 'lucide-react';

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
  const [zoomIntensity, setZoomIntensity] = useState<'subtle' | 'standard' | 'dynamic'>('standard');
  const [zoomFrequency, setZoomFrequency] = useState<'sparse' | 'normal' | 'frequent'>('normal');

  const activeClip =
    zoomClips.find((z) => z.id === selectedZoomClipId) ||
    zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime);

  const padRef = useRef<HTMLDivElement>(null);
  const [isDraggingPad, setIsDraggingPad] = useState(false);

  const springPresets = [
    { label: 'Smooth', stiffness: 180, damping: 24 },
    { label: 'Snappy', stiffness: 260, damping: 30 },
    { label: 'Cinematic', stiffness: 120, damping: 20 },
  ];

  const grid9Zones = [
    { label: 'Top-Left', x: 0.2, y: 0.25 },
    { label: 'Top', x: 0.5, y: 0.25 },
    { label: 'Top-Right', x: 0.8, y: 0.25 },
    { label: 'Left', x: 0.2, y: 0.5 },
    { label: 'Center', x: 0.5, y: 0.5 },
    { label: 'Right', x: 0.8, y: 0.5 },
    { label: 'Bot-Left', x: 0.2, y: 0.75 },
    { label: 'Bottom', x: 0.5, y: 0.75 },
    { label: 'Bot-Right', x: 0.8, y: 0.75 },
  ];

  const handlePadPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeClip || !padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.08, Math.min(0.92, (e.clientY - rect.top) / rect.height));
    updateZoomClip(activeClip.id, {
      focusTarget: {
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Active Zoom Focus & Area Selection (OpenScreen 3x3 Grid & 2D Pad) */}
      {activeClip && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-500/35 space-y-3.5 shadow-lg shadow-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Active Zoom Clip
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
                className="text-[10px] text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Magnification / Zoom Scale */}
          <NumberSlider
            label="Zoom Magnification"
            value={activeClip.zoomFactor}
            min={1.1}
            max={3.5}
            step={0.1}
            unit="x"
            defaultValue={2.0}
            onChange={(factor) =>
              updateZoomClip(activeClip.id, { zoomFactor: factor })
            }
          />

          {/* 2D Interactive Focus Touchpad & 3x3 Focus Zones */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Focal Point & Area</span>
              </label>
              <span className="text-[10px] font-mono text-indigo-300">
                ({Math.round(activeClip.focusTarget.x * 100)}%, {Math.round(activeClip.focusTarget.y * 100)}%)
              </span>
            </div>

            {/* 2D Mini Focus Touchpad */}
            <div
              ref={padRef}
              onPointerDown={(e) => {
                setIsDraggingPad(true);
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                handlePadPointer(e);
              }}
              onPointerMove={(e) => {
                if (isDraggingPad) handlePadPointer(e);
              }}
              onPointerUp={(e) => {
                setIsDraggingPad(false);
                try {
                  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                } catch {}
              }}
              className="relative w-full h-32 rounded-xl bg-[#0e0f14] border border-white/[0.12] overflow-hidden cursor-crosshair select-none shadow-inner group/pad"
            >
              {/* Subtle 3x3 Grid Guides */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Center crosshair dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20 pointer-events-none" />

              {/* Draggable Focal Target Reticle */}
              <div
                style={{
                  left: `${activeClip.focusTarget.x * 100}%`,
                  top: `${activeClip.focusTarget.y * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-indigo-400 bg-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.8)] flex items-center justify-center pointer-events-none transition-transform"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>

              <div className="absolute bottom-1.5 right-2 text-[9px] text-zinc-500 font-mono pointer-events-none">
                Drag focal point
              </div>
            </div>

            {/* 3x3 Quick Zone Grid Buttons */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              {grid9Zones.map((z) => {
                const isSelected =
                  Math.abs(activeClip.focusTarget.x - z.x) < 0.12 &&
                  Math.abs(activeClip.focusTarget.y - z.y) < 0.12;
                return (
                  <button
                    key={z.label}
                    type="button"
                    onClick={() =>
                      updateZoomClip(activeClip.id, {
                        focusTarget: { x: z.x, y: z.y },
                      })
                    }
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {z.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. 3D Perspective Tilt Controls */}
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

      {/* 3. OpenScreen Auto-Suggest Zoom Engine */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Suggest Zoom Engine</span>
          </label>

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
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border border-white/10 transition-colors cursor-pointer"
          >
            <span>+ Add at Playhead</span>
          </button>
        </div>

        {/* Suggestion Intensity & Frequency Presets */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-medium">Auto-Zoom Intensity</label>
            <SegmentedControl<'subtle' | 'standard' | 'dynamic'>
              size="sm"
              value={zoomIntensity}
              onChange={setZoomIntensity}
              options={[
                { value: 'subtle', label: 'Subtle (1.5x)' },
                { value: 'standard', label: 'Balanced (2.0x)' },
                { value: 'dynamic', label: 'Dynamic (2.6x)' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-medium">Frequency Pacing</label>
            <SegmentedControl<'sparse' | 'normal' | 'frequent'>
              size="sm"
              value={zoomFrequency}
              onChange={setZoomFrequency}
              options={[
                { value: 'sparse', label: 'Sparse' },
                { value: 'normal', label: 'Normal' },
                { value: 'frequent', label: 'Dense' },
              ]}
            />
          </div>

          {/* 1-Click Auto Detect Zooms Button */}
          <button
            type="button"
            onClick={() => suggestSmartAutoZooms({ zoomIntensity, frequency: zoomFrequency })}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border border-white/20 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>
              {project.mouseTelemetry?.length ? 'Auto-Detect Click Zooms' : 'Auto-Generate Smart Zooms'}
            </span>
          </button>
        </div>

        <ToggleSwitch
          label="Enable Dynamic Zooms"
          description="Glides camera with spring physics into focus areas"
          checked={camera.autoZoomEnabled}
          onChange={setAutoZoomEnabled}
        />

        {camera.autoZoomEnabled && (
          <div className="space-y-3 pt-1">
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
