import React, { useState } from 'react';
import { 
  Crown, 
  Volume2, 
  X, 
  Sliders
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const MemberSidebar = ({ isOpen }) => {
  const { allMembers, currentUser, activeVoiceChannel, voiceParticipants } = useSocket();
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberVolume, setMemberVolume] = useState(100);

  if (!isOpen) return null;

  const owners = allMembers.filter(m => m.role === 'owner');
  const regularMembers = allMembers.filter(m => m.role !== 'owner');

  const renderMemberCard = (member) => {
    const isMe = member.socketId === currentUser?.socketId;
    const isOwner = member.role === 'owner';
    const inVoice = activeVoiceChannel && voiceParticipants[activeVoiceChannel]?.includes(member.socketId);

    return (
      <div
        key={member.socketId}
        onClick={() => setSelectedMember(member)}
        className="flex items-center space-x-2.5 px-2 py-1.5 rounded-md hover:bg-discord-hover transition-colors cursor-pointer group"
      >
        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md"
            style={{ backgroundColor: member.color || '#5865F2' }}
          >
            {member.name?.charAt(0) || 'M'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
        </div>

        {/* Member name & activity */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center space-x-1.5">
            <span 
              className="text-xs font-semibold truncate group-hover:text-white transition-colors"
              style={{ color: member.color || '#dbdee1' }}
            >
              {member.name}
            </span>
            {isMe && <span className="text-[10px] text-discord-muted">(you)</span>}
            {isOwner && <Crown size={13} className="text-amber-400 shrink-0" title="Space Owner" />}
          </div>

          {/* Activity Tag */}
          <div className="text-[10px] text-discord-muted truncate flex items-center space-x-1">
            {inVoice ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <Volume2 size={10} />
                <span>In Voice</span>
              </span>
            ) : member.activity ? (
              <span>{member.activity.label || 'Active'}</span>
            ) : (
              <span>Online</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside 
      aria-label="Members sidebar"
      className="w-60 bg-discord-sidebar flex flex-col select-none shrink-0 border-l border-black/20 overflow-y-auto p-3"
    >
      {/* OWNER SECTION */}
      {owners.length > 0 && (
        <div className="mb-4">
          <div className="px-1 mb-1 text-[11px] font-bold text-discord-muted uppercase tracking-wider">
            Owner — {owners.length}
          </div>
          <div className="space-y-0.5">
            {owners.map(renderMemberCard)}
          </div>
        </div>
      )}

      {/* MEMBERS / ONLINE SECTION */}
      <div>
        <div className="px-1 mb-1 text-[11px] font-bold text-discord-muted uppercase tracking-wider">
          Online — {regularMembers.length}
        </div>
        <div className="space-y-0.5">
          {regularMembers.map(renderMemberCard)}
        </div>
      </div>

      {/* Discord-style Member Profile Popover Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-80 bg-[#1e1f22] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Banner */}
            <div 
              className="h-20 w-full"
              style={{
                background: `linear-gradient(135deg, ${selectedMember.color || '#5865F2'} 0%, #111214 100%)`
              }}
            />

            {/* Profile Info */}
            <div className="relative px-5 pb-5 -mt-9">
              <div className="flex items-end justify-between mb-3">
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-full border-4 border-[#1e1f22] flex items-center justify-center text-xl font-bold text-white shadow-xl"
                    style={{ backgroundColor: selectedMember.color || '#5865F2' }}
                  >
                    {selectedMember.name?.charAt(0) || 'M'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#23a55a] border-2 border-[#1e1f22]" />
                </div>

                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-discord-muted hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedMember.name}
                  </h3>
                  {selectedMember.role === 'owner' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center space-x-1">
                      <Crown size={11} />
                      <span>OWNER</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-discord-muted font-mono">
                  {selectedMember.socketId?.slice(0, 8)}#1001
                </div>
              </div>

              <div className="h-[1px] bg-white/10 my-3" />

              {/* Roles Badge */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-discord-muted">
                  ROLES
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#313338] text-[11px] font-medium text-discord-header border border-white/5 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMember.color || '#5865F2' }} />
                    <span>{selectedMember.role === 'owner' ? 'Founder & Space Lead' : 'Space Member'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-medium border border-cyan-500/20">
                    E2EE Verified
                  </span>
                </div>
              </div>

              {/* Volume Slider for Voice */}
              <div className="mt-4 p-3 bg-[#2b2d31] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-discord-normal">
                  <span className="flex items-center space-x-1">
                    <Sliders size={13} className="text-discord-muted" />
                    <span>User Volume</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{memberVolume}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="200"
                  value={memberVolume}
                  onChange={(e) => setMemberVolume(Number(e.target.value))}
                  className="w-full accent-[#5865F2] h-1.5 bg-[#1e1f22] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
