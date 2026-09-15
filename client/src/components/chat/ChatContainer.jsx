import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  PlusCircle, 
  Sparkles, 
  Paperclip, 
  FileText, 
  Download, 
  Crown, 
  Hash,
  Reply,
  X
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { GifPickerModal } from './GifPickerModal';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '🚀', '✨', '👍'];

export const ChatContainer = ({ channelId = null }) => {
  const { 
    room, 
    currentUser, 
    activeChannelId, 
    channels,
    messagesByChannel, 
    sendMessage, 
    setTyping, 
    toggleReaction,
    typingUsers 
  } = useSocket();

  const currentChannelId = channelId || activeChannelId;
  const currentChannel = channels.find(c => c.id === currentChannelId) || {
    id: currentChannelId,
    name: currentChannelId,
    topic: 'Discussion in DuoSpace'
  };

  const channelMessages = messagesByChannel[currentChannelId] || [];
  const currentTypingUser = typingUsers[currentChannelId];

  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages.length, currentTypingUser]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    setTyping(true, currentChannelId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false, currentChannelId);
    }, 1200);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    const clean = inputMessage.trim();
    if (!clean) return;

    if (clean.startsWith('/gif ')) {
      setIsGifModalOpen(true);
      setInputMessage('');
      return;
    }

    sendMessage({ 
      content: clean, 
      type: 'text',
      channelId: currentChannelId,
      replyTo: replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderName, content: replyingTo.content } : null
    });
    setInputMessage('');
    setReplyingTo(null);
    setTyping(false, currentChannelId);
  };

  const handleSelectGif = (gifUrl) => {
    sendMessage({ 
      content: gifUrl, 
      type: 'gif',
      channelId: currentChannelId 
    });
  };

  const handleFileUpload = async (file) => {
    if (!file || !room) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomCode', room.code);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        sendMessage({
          content: data.file.originalName,
          type: 'file',
          fileData: data.file,
          channelId: currentChannelId
        });
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="relative flex flex-col h-full bg-discord-main select-text overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-[#1e1f22]/90 backdrop-blur-md border-2 border-dashed border-[#5865F2] rounded-2xl flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <Paperclip size={44} className="text-[#5865F2] animate-bounce" />
          <div className="text-base font-bold text-white">Upload to #{currentChannel.name}</div>
          <div className="text-xs text-discord-muted">Encrypted ephemeral transfer</div>
        </div>
      )}

      {/* Messages Stream Viewport */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Discord Channel Hero Header */}
        <div className="pt-6 pb-4 border-b border-white/5 space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#35373c] flex items-center justify-center text-white shadow-md">
            <Hash size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-discord-header tracking-tight">
            Welcome to #{currentChannel.name}!
          </h2>
          <p className="text-sm text-discord-muted max-w-lg leading-relaxed">
            {currentChannel.topic || `This is the start of the #${currentChannel.name} channel. Send messages, media, and code with instant relay.`}
          </p>
        </div>

        {/* Message List */}
        {channelMessages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.socketId;
          const isOwner = msg.senderRole === 'owner';
          const prevMsg = channelMessages[index - 1];
          const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId && (msg.timestamp - prevMsg.timestamp < 300000);

          return (
            <div 
              key={msg.id || index}
              className={`group relative flex space-x-4 pr-4 pl-2 py-1 -mx-2 rounded-lg hover:bg-black/10 transition-colors ${
                isSameSenderAsPrev ? 'mt-0.5' : 'mt-4'
              }`}
            >
              {/* Floating Action Bar on Hover */}
              <div className="absolute right-4 -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-[#2b2d31] border border-white/10 rounded-md px-1.5 py-0.5 shadow-lg z-10">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(msg.id, emoji, currentChannelId)}
                    className="p-1 hover:scale-125 transition-transform text-xs"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 hover:bg-white/10 rounded text-discord-muted hover:text-white transition-colors"
                  title="Reply to message"
                >
                  <Reply size={13} />
                </button>
              </div>

              {/* Avatar on Left */}
              {!isSameSenderAsPrev ? (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md mt-0.5"
                  style={{ backgroundColor: msg.senderColor || '#5865F2' }}
                >
                  {msg.senderName?.charAt(0) || 'U'}
                </div>
              ) : (
                <div className="w-10 shrink-0 text-right pr-1 select-none">
                  <span className="text-[10px] text-discord-muted opacity-0 group-hover:opacity-100 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Message Body */}
              <div className="flex-1 overflow-hidden">
                {/* Reply Quote Indicator */}
                {msg.replyTo && (
                  <div className="flex items-center space-x-1.5 text-xs text-discord-muted mb-1 pl-1 select-none">
                    <span className="text-discord-muted font-mono">↳</span>
                    <span className="font-semibold text-discord-header">@{msg.replyTo.senderName}</span>
                    <span className="truncate max-w-sm text-discord-muted/80">"{msg.replyTo.content}"</span>
                  </div>
                )}
                {!isSameSenderAsPrev && (
                  <div className="flex items-center space-x-2 leading-none mb-1">
                    <span 
                      className="font-bold text-sm hover:underline cursor-pointer"
                      style={{ color: msg.senderColor || '#dbdee1' }}
                    >
                      {msg.senderName}
                    </span>
                    {isOwner && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 flex items-center space-x-1 tracking-wider">
                        <Crown size={10} />
                        <span>OWNER</span>
                      </span>
                    )}
                    <span className="text-[11px] text-discord-muted font-normal">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="text-sm text-discord-normal leading-relaxed break-words select-text">
                  {msg.type === 'text' && (
                    <span>{msg.content}</span>
                  )}

                  {/* GIF */}
                  {msg.type === 'gif' && (
                    <div className="mt-1.5 max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <img 
                        src={msg.content} 
                        alt="GIF" 
                        className="w-full h-auto object-contain rounded-xl"
                        loading="lazy" 
                      />
                    </div>
                  )}

                  {/* File / Image Attachment */}
                  {msg.type === 'file' && msg.fileData && (
                    <div className="mt-2">
                      {msg.fileData.mimetype?.startsWith('image/') ? (
                        <div className="max-w-md rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <img
                            src={msg.fileData.url}
                            alt={msg.fileData.originalName}
                            className="w-full h-auto object-cover rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-3 p-3 rounded-xl bg-[#2b2d31] border border-white/10 max-w-md">
                          <FileText size={26} className="text-[#5865F2] shrink-0" />
                          <div className="overflow-hidden text-left pr-3">
                            <div className="font-semibold text-xs text-white truncate max-w-[200px]">
                              {msg.fileData.originalName}
                            </div>
                            <div className="text-[10px] text-discord-muted font-mono">
                              {(msg.fileData.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <a
                            href={msg.fileData.url}
                            download={msg.fileData.originalName}
                            className="p-2 rounded-lg bg-white/10 hover:bg-[#5865F2] text-white transition-colors"
                            title="Download Ephemeral File"
                          >
                            <Download size={15} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reactions list */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(msg.reactions).map(([emoji, users]) => {
                      const hasReacted = users.includes(currentUser?.socketId);
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji, currentChannelId)}
                          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-xs transition-all ${
                            hasReacted 
                              ? 'bg-[#5865F2]/25 border border-[#5865F2] text-white' 
                              : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal border border-white/5'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="font-mono text-[11px] font-semibold">{users.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {currentTypingUser && (
        <div className="px-6 py-1 text-xs text-discord-muted flex items-center space-x-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-ping" />
          <span className="font-medium text-white">{currentTypingUser}</span>
          <span>is typing...</span>
        </div>
      )}

      {/* Modern Discord Message Input Bar */}
      <div className="px-5 pb-5 pt-1">
        {/* Reply Context Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#2b2d31] rounded-t-xl text-xs text-discord-muted border-t border-x border-white/10 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 truncate">
              <Reply size={13} className="text-[#5865F2] shrink-0" />
              <span>Replying to</span>
              <span className="font-semibold text-white">@{replyingTo.senderName}</span>
              <span className="truncate max-w-xs text-discord-muted/80 italic">"{replyingTo.content}"</span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 text-discord-muted hover:text-white rounded hover:bg-white/10 transition-colors ml-2"
              title="Cancel reply"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <form 
          onSubmit={handleSend}
          className={`flex items-center bg-discord-input ${replyingTo ? 'rounded-b-xl' : 'rounded-xl'} px-4 py-2.5 shadow-inner border border-white/5`}
        >
          {/* File Upload Hidden Input & Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-discord-muted hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors mr-2 shrink-0"
            title="Upload File or Image"
          >
            <PlusCircle size={22} className={uploading ? 'animate-spin' : ''} />
          </button>

          {/* Text input */}
          <input
            type="text"
            placeholder={`Message #${currentChannel.name}...`}
            value={inputMessage}
            onChange={handleInputChange}
            className="flex-1 bg-transparent text-sm text-discord-header placeholder:text-discord-muted focus:outline-none"
          />

          {/* GIF Picker Trigger */}
          <button
            type="button"
            onClick={() => setIsGifModalOpen(true)}
            className="text-discord-muted hover:text-pink-400 p-1 rounded-lg hover:bg-white/10 transition-colors mx-1"
            title="Tenor GIF Search"
          >
            <Sparkles size={20} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-40 text-white shadow transition-all ml-1 shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={isGifModalOpen}
        onClose={() => setIsGifModalOpen(false)}
        onSelectGif={handleSelectGif}
      />
    </div>
  );
};
