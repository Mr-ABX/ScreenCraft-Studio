import React, { useEffect } from 'react';
import { AppHeader } from './components/header/AppHeader';
import { LeftNav } from './components/sidebar/LeftNav';
import { CanvasViewport } from './components/viewport/CanvasViewport';
import { RightInspector } from './components/inspector/RightInspector';
import { MultiTrackTimeline } from './components/timeline/MultiTrackTimeline';
import { RecordModal } from './components/modals/RecordModal';
import { ExportModal } from './components/modals/ExportModal';
import { useStudioStore } from './store/useStudioStore';

export function App() {
  const { togglePlay, setExportModalOpen, setRecordModalOpen } = useStudioStore();

  // Global Keyboard Shortcuts (Screen Studio Standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space: Toggle Play/Pause
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        togglePlay();
      }

      // Cmd+E / Ctrl+E: Export Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      }

      // Cmd+R / Ctrl+R: Record Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRecordModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, setExportModalOpen, setRecordModalOpen]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050507] text-white overflow-hidden select-none font-sans">
      {/* 1. Top Navigation & Window Titlebar */}
      <AppHeader />

      {/* 2. Main Studio Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Tool Navigation */}
        <LeftNav />

        {/* Central 3D Canvas Studio Viewport */}
        <CanvasViewport />

        {/* Right Glass Inspector & Tuning Sidebar */}
        <RightInspector />
      </div>

      {/* 3. Multi-Track Non-Destructive Timeline */}
      <MultiTrackTimeline />

      {/* 4. Modals & Dialogs */}
      <RecordModal />
      <ExportModal />
    </div>
  );
}

export default App;
