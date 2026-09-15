import React, { useState } from 'react';
import { X, Calendar, Clock, Plus, Bell, CheckCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const CallScheduler = ({ isOpen, onClose }) => {
  const { scheduledCalls, scheduleCall } = useSocket();
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !datetime) return;

    scheduleCall({
      title,
      scheduledTime: new Date(datetime).getTime(),
      notes
    });

    setTitle('');
    setDatetime('');
    setNotes('');
  };

  const formatScheduledDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="max-w-md w-full glass-panel border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
            <Calendar size={18} />
            <span>Schedule Duo Sessions</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Schedule Form */}
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Session Agenda / Topic</label>
            <input
              type="text"
              placeholder="e.g. Pair-Coding LeetCode or Movie Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Link to problem or movie playlist"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>Schedule Session</span>
          </button>
        </form>

        {/* List of upcoming scheduled sessions */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Upcoming Sessions ({scheduledCalls.length})
          </div>
          <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {scheduledCalls.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-white/5">
                No calls scheduled yet.
              </div>
            ) : (
              scheduledCalls.map((item) => {
                const isPast = item.scheduledTime < Date.now();
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock size={12} className="text-cyan-400" />
                        <span>{formatScheduledDate(item.scheduledTime)}</span>
                      </div>
                      {item.notes && <div className="text-[10px] text-slate-500 mt-0.5">{item.notes}</div>}
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isPast 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {isPast ? 'Passed' : 'Upcoming'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
