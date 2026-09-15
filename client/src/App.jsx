import React, { useState } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { WebRTCProvider } from './context/WebRTCContext';
import { LandingPage } from './components/LandingPage';
import { SpaceRail } from './components/layout/SpaceRail';
import { ChannelSidebar } from './components/layout/ChannelSidebar';
import { ChannelHeader } from './components/layout/ChannelHeader';
import { MemberSidebar } from './components/layout/MemberSidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { VoiceStage } from './components/call/VoiceStage';
import { WatchTogether } from './components/media/WatchTogether';
import { CodeSandbox } from './components/code/CodeSandbox';
import { DuoTodoList } from './components/todo/DuoTodoList';
import { BurnCountdown } from './components/common/BurnCountdown';
import { TelemetryModal } from './components/common/TelemetryModal';
import { QRModal } from './components/common/QRModal';
import { SettingsModal } from './components/common/SettingsModal';
import { CallRequestModal } from './components/call/CallRequestModal';
import { ScreenShareView } from './components/call/ScreenShareView';

const MainSanctuary = () => {
  const { room, activeChannelId, channels } = useSocket();
  const [isMemberListOpen, setIsMemberListOpen] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreenViewerOpen, setIsScreenViewerOpen] = useState(false);

  if (!room) {
    return <LandingPage />;
  }

  const currentChannel = channels.find(c => c.id === activeChannelId) || {
    id: 'general',
    type: 'text'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-discord-rail text-discord-normal font-sans antialiased">
      {/* 1. Leftmost Guild/Space Rail (72px) */}
      <SpaceRail 
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
      />

      {/* 2. Channel Navigation Sidebar (240px) */}
      <ChannelSidebar 
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Main Center Stage (Flexible Full Viewport) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-discord-main min-w-0">
        {/* Top Channel Header Bar */}
        <ChannelHeader 
          isMemberListOpen={isMemberListOpen}
          onToggleMemberList={() => setIsMemberListOpen(!isMemberListOpen)}
          onOpenQR={() => setIsQRModalOpen(true)}
          onOpenTelemetry={() => setIsTelemetryOpen(true)}
        />

        {/* Dynamic Channel Viewport */}
        <main className="flex-1 overflow-hidden relative">
          {currentChannel.type === 'voice' ? (
            /* Dedicated Discord Voice Stage with speaking halos & screen sharing */
            <VoiceStage />
          ) : currentChannel.id === 'watch-party' ? (
            /* Dedicated HD Cinema Theater with synchronized playback & drawer chat */
            <WatchTogether />
          ) : currentChannel.id === 'code-sandbox' ? (
            /* Dedicated Collaborative Pair-Dev IDE & Terminal */
            <CodeSandbox />
          ) : currentChannel.id === 'tasks' ? (
            /* Dedicated Team Tasks & Sprint Planner */
            <DuoTodoList />
          ) : (
            /* Default Spacious Discord Text Channel View */
            <ChatContainer channelId={currentChannel.id} />
          )}
        </main>
      </div>

      {/* 4. Right Collapsible Member List Sidebar (240px) */}
      <MemberSidebar isOpen={isMemberListOpen} />

      {/* Global Modals & Overlays */}
      <BurnCountdown />
      <TelemetryModal isOpen={isTelemetryOpen} onClose={() => setIsTelemetryOpen(false)} />
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CallRequestModal />
      <ScreenShareView isOpen={isScreenViewerOpen} onClose={() => setIsScreenViewerOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <SocketProvider>
      <WebRTCProvider>
        <MainSanctuary />
      </WebRTCProvider>
    </SocketProvider>
  );
}
