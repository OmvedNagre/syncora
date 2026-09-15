import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSocket } from '../../context/SocketContext';
import { soundEffects } from '../../utils/soundEffects';

export const DuoTodoList = () => {
  const { tasks, updateTasks, currentUser, allMembers } = useSocket();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('all');

  const handleAddTask = (e) => {
    e?.preventDefault();
    const clean = newTaskTitle.trim();
    if (!clean) return;

    const newTask = {
      id: `task_${Date.now()}`,
      title: clean,
      status: 'todo',
      assignedTo: 'all',
      creatorName: currentUser?.name || 'Member',
      createdAt: Date.now()
    };

    updateTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const newStatus = t.status === 'done' ? 'todo' : 'done';
        if (newStatus === 'done') {
          soundEffects.playTaskSuccess();
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.8 }
            });
          } catch (e) {}
        }
        return { ...t, status: newStatus };
      }
      return t;
    });

    updateTasks(updated);
  };

  const deleteTask = (taskId) => {
    updateTasks(tasks.filter(t => t.id !== taskId));
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'todo') return t.status === 'todo';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-discord-main select-none p-6 overflow-y-auto">
      {/* Header & Stats Banner */}
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="p-6 rounded-2xl bg-[#2b2d31] border border-white/5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Space Tasks & Sprints
              </h2>
              <p className="text-xs text-discord-muted">
                Collaborative checklist synced across {allMembers.length} space members
              </p>
            </div>
          </div>

          {/* Progress Bar Badge */}
          <div className="flex flex-col items-start sm:items-end space-y-1.5 min-w-[160px]">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-discord-muted">Sprint Progress:</span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#1e1f22] h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-discord-muted font-mono">
              {completedCount} of {tasks.length} tasks completed
            </span>
          </div>
        </div>

        {/* Filter Tabs & Add Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center bg-[#2b2d31] p-1 rounded-xl border border-white/5 text-xs font-medium self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-[#5865F2] text-white font-bold' : 'text-discord-muted hover:text-white'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'todo' ? 'bg-[#5865F2] text-white font-bold' : 'text-discord-muted hover:text-white'
              }`}
            >
              To-Do ({tasks.filter(t => t.status === 'todo').length})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'done' ? 'bg-[#5865F2] text-white font-bold' : 'text-discord-muted hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs text-discord-muted flex items-center space-x-1.5 self-center">
            <Sparkles size={14} className="text-amber-400" />
            <span>Confetti pops when tasks are completed!</span>
          </div>
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={handleAddTask} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add a new team goal or sprint task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 glass-input px-4 py-3 rounded-xl text-sm"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center space-x-1.5 px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-40 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-discord-muted bg-[#2b2d31]/40 rounded-2xl border border-white/5 space-y-2">
              <CheckSquare size={32} className="mx-auto opacity-30" />
              <p className="text-sm">No tasks in this category.</p>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isDone = t.status === 'done';
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-[#2b2d31]/50 border-emerald-500/20 text-discord-muted'
                      : 'bg-[#2b2d31] border-white/5 hover:border-white/10 text-discord-header shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 overflow-hidden pr-3">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className={`p-1 rounded-lg transition-transform hover:scale-110 shrink-0 ${
                        isDone ? 'text-emerald-400' : 'text-discord-muted hover:text-white'
                      }`}
                    >
                      {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm leading-snug truncate ${isDone ? 'line-through text-discord-muted' : 'font-medium'}`}>
                        {t.title}
                      </span>
                      {t.creatorName && (
                        <span className="text-[10px] text-discord-muted font-mono mt-0.5">
                          Added by {t.creatorName}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 rounded-lg text-discord-muted hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
