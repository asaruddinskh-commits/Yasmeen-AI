import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { TaskItem } from '../../types.ts';

export const TasksView: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, settings, showToast } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      priority: newPriority,
      completed: false
    });
    setNewTitle('');
    setNewDueDate('');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Browser notifications enabled!', 'success');
        new Notification(`${settings.assistantName} Reminders Active`, {
          body: `Hi ${settings.userNickname}, I will keep you updated on upcoming tasks!`
        });
      } else {
        showToast('Notification permission denied or dismissed', 'info');
      }
    } else {
      showToast('Notifications not supported in this browser', 'info');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-fuchsia-400" />
            <span>Tasks & Smart Reminders</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal productivity planner monitored continuously by {settings.assistantName}
          </p>
        </div>

        <button
          onClick={requestNotificationPermission}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold"
        >
          <Bell className="w-4 h-4 text-pink-400" />
          <span>Enable Browser Notifications</span>
        </button>
      </div>

      {/* Add Task Input Card */}
      <div className="p-5 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-4">
        <span className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-fuchsia-400" />
          <span>Add Reminder for {settings.assistantName} to track</span>
        </span>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder='e.g., "Review pull request at 3 PM", "Take evening vitamins", "Call mom"'
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none bg-[#0a0c20]"
          />
          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none bg-[#0a0c20]"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            onClick={handleAddTask}
            disabled={!newTitle.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2 glass-panel rounded-3xl">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-600" />
            <p>No tasks in this view.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl glass-panel border flex items-center justify-between cursor-pointer transition-all ${
                task.completed
                  ? 'border-slate-800/80 bg-slate-900/40 opacity-70'
                  : 'border-purple-900/30 hover:border-fuchsia-500/40 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 hover:border-fuchsia-400'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-black" />}
                </button>
                <div>
                  <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {task.priority}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
