# PROJECT FILE FORMAT & DATA SCHEMA SPECIFICATION
# ScreenCraft Pro: `.screencraft` Bundle & JSON Manifest Specification

**Document Version:** 2.0.0  
**File Extension:** `.screencraft` (Directory Bundle or Zipped Container)  
**Schema Standard:** JSON Schema Draft 2020-12

---

## 1. Bundle Directory Structure

Every ScreenCraft Pro project is saved as a self-contained `.screencraft` package directory:

```
MySaaSLaunchDemo.screencraft/
├── manifest.json              # Main project metadata & timeline composition
├── media/
│   ├── screen_raw.mp4         # Captured high-res raw screen recording (no baked cursor)
│   ├── webcam_raw.mp4         # Captured webcam video track (optional)
│   ├── mic_raw.wav            # Uncompressed 48kHz microphone audio track
│   └── system_audio.wav       # Uncompressed 48kHz system audio track
├── telemetry/
│   ├── mouse_events.jsonl     # High-frequency mouse coordinates & click telemetry stream
│   └── window_focus.jsonl     # Active application window bounding boxes & titles
├── subtitles/
│   └── whisper_captions.json  # Local AI generated word-by-word timestamped subtitles
└── cache/
    ├── waveforms.bin          # Pre-computed audio waveform RMS peaks
    └── thumbnails/            # Timeline thumbnail scrub frames
```

---

## 2. Complete `manifest.json` Data Schema

```json
{
  "$schema": "https://screencraft.pro/schemas/v2/project.json",
  "version": "2.0.0",
  "id": "proj_9f8c2e1a-4b3d-4e5f-8a1b-0c2d3e4f5a6b",
  "title": "SaaS Launch Demo",
  "createdAt": "2026-09-12T02:40:00.000Z",
  "updatedAt": "2026-09-12T02:45:00.000Z",
  "durationSeconds": 84.52,
  "canvas": {
    "aspectRatio": "16:9",
    "width": 3840,
    "height": 2160,
    "paddingPx": 48,
    "cornerRadiusPx": 28,
    "background": {
      "type": "mesh_gradient",
      "preset": "apple_aurora",
      "colors": ["#1e1b4b", "#581c87", "#0d9488", "#0f172a"],
      "animated": true,
      "speed": 0.5
    },
    "shadow": {
      "type": "pro_3d",
      "color": "rgba(0, 0, 0, 0.45)",
      "blurPx": 64,
      "offsetY": 32,
      "spread": 0
    },
    "frame": {
      "type": "safari",
      "title": "ScreenCraft — Instant Product Videos",
      "url": "https://screencraft.pro",
      "showTrafficLights": true,
      "theme": "dark"
    }
  },
  "camera": {
    "autoZoomEnabled": true,
    "defaultZoomFactor": 2.0,
    "springPhysics": {
      "stiffness": 180,
      "damping": 24,
      "mass": 1.0
    },
    "perspective3D": {
      "pitchDeg": 14.0,
      "yawDeg": -8.0,
      "rollDeg": 0.0
    }
  },
  "cursor": {
    "style": "macos_arrow",
    "scale": 1.4,
    "smoothingEnabled": true,
    "smoothingAlgorithm": "catmull_rom",
    "motionBlurEnabled": true,
    "clickEffect": {
      "enabled": true,
      "style": "expanding_halo",
      "color": "rgba(99, 102, 241, 0.75)",
      "radiusPx": 32
    },
    "autoHideStationary": true,
    "hideAfterSeconds": 2.0
  },
  "timeline": {
    "tracks": [
      {
        "id": "track_zoom",
        "type": "zoom",
        "name": "Camera & Zoom Keyframes",
        "clips": [
          {
            "id": "zoom_clip_01",
            "startTime": 4.20,
            "endTime": 12.80,
            "zoomFactor": 2.0,
            "focusTarget": { "x": 0.72, "y": 0.35 },
            "springOverride": null
          },
          {
            "id": "zoom_clip_02",
            "startTime": 18.50,
            "endTime": 29.10,
            "zoomFactor": 2.5,
            "focusTarget": { "x": 0.28, "y": 0.64 }
          }
        ]
      },
      {
        "id": "track_video",
        "type": "video",
        "name": "Main Screen Recording",
        "clips": [
          {
            "id": "video_clip_01",
            "sourceFile": "media/screen_raw.mp4",
            "timelineStart": 0.0,
            "sourceStart": 0.0,
            "duration": 84.52,
            "playbackRate": 1.0
          }
        ]
      },
      {
        "id": "track_webcam",
        "type": "webcam",
        "name": "Webcam Overlay",
        "clips": [
          {
            "id": "webcam_clip_01",
            "sourceFile": "media/webcam_raw.mp4",
            "timelineStart": 0.0,
            "duration": 84.52,
            "shape": "squircle",
            "position": "bottom_right",
            "sizePercent": 18.0,
            "marginPx": 32
          }
        ]
      },
      {
        "id": "track_audio",
        "type": "audio",
        "name": "Microphone Voice Track",
        "clips": [
          {
            "id": "audio_clip_01",
            "sourceFile": "media/mic_raw.wav",
            "timelineStart": 0.0,
            "duration": 84.52,
            "gainDb": 3.0,
            "noiseGateEnabled": true,
            "autoDuckingEnabled": true
          }
        ]
      }
    ]
  },
  "subtitles": {
    "enabled": true,
    "fontFamily": "SF Pro Display",
    "fontSizePx": 42,
    "fontWeight": 700,
    "style": "karaoke_glow",
    "activeWordColor": "#6366F1",
    "inactiveWordColor": "rgba(255, 255, 255, 0.75)",
    "cardBackground": "rgba(0, 0, 0, 0.65)",
    "position": "bottom_center"
  }
}
```
