'use client';

import { WorkspaceToast } from './Workspace/WorkspaceToast';
import { useWorkspaceToast } from './Workspace/useWorkspaceToast';
import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Calendar,
  Plus,
  Trash2,
  Clock,
  User,
  Users,
  Flame,
  Layout,
  ChevronRight,
  Paperclip,
  MessageSquare,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Filter,
  Activity,
  PlusCircle,
  TrendingUp,
  Inbox,
  Search
} from 'lucide-react';

// --- MOCK TASKS DATA ---
const INITIAL_TASKS = [
  {
    id: 'tsk-1',
    title: 'Pre-op Periodontal Clearance Check',
    desc: 'Verify active bleeding index and verify medical history log for Arthur Pendragon before surgical implant.',
    assignee: 'Dr. Sarah Jenkins',
    myTask: false,
    priority: 'High',
    dueDate: '2026-07-18',
    status: 'In-Progress',
    commentsCount: 3,
    attachmentsCount: 2,
    recurring: true,
    completed: false,
    timelineStart: '2026-07-16',
    comments: [
      { author: 'Dr. Ahmed', text: 'Ensure patient blood pressure indices are loaded.' },
      { author: 'Hygienist Jenkins', text: 'Checked. Loaded in EHR chart.' }
    ]
  },
  {
    id: 'tsk-2',
    title: 'Crown Preparation Fit Check',
    desc: 'Align intraoral STL scans against milled translucent zirconia crowns for Clara Oswald prep validation.',
    assignee: 'Dr. Ahmed',
    myTask: true,
    priority: 'High',
    dueDate: '2026-07-17',
    status: 'In-Progress',
    commentsCount: 1,
    attachmentsCount: 1,
    recurring: false,
    completed: false,
    timelineStart: '2026-07-17',
    comments: []
  },
  {
    id: 'tsk-3',
    title: 'Pre-Auth Billing Clearance (Aetna)',
    desc: 'Verify Aetna pre-authorization for Bruce Wayne surgical implants & clinical CT imaging.',
    assignee: 'Billing Operator',
    myTask: false,
    priority: 'Medium',
    dueDate: '2026-07-20',
    status: 'Pending',
    commentsCount: 0,
    attachmentsCount: 1,
    recurring: false,
    completed: false,
    timelineStart: '2026-07-19',
    comments: []
  },
  {
    id: 'tsk-4',
    title: 'Smile Design CAD Mockups Alignment',
    desc: 'Load 12-angle facial portrait sets of Diana Prince into Exocad virtual design articulator.',
    assignee: 'Dr. Ahmed',
    myTask: true,
    priority: 'Medium',
    dueDate: '2026-07-16',
    status: 'Completed',
    commentsCount: 2,
    attachmentsCount: 3,
    recurring: false,
    completed: true,
    timelineStart: '2026-07-15',
    comments: [
      { author: 'Lab Tech Barton', text: 'Milling finished cleanly.' }
    ]
  },
  {
    id: 'tsk-5',
    title: 'Daily Sintering Calibration Maintenance',
    desc: 'Calibrate milling machine 4 and run cleaning scripts on BioMed resin printer.',
    assignee: 'Lab Tech Barton',
    myTask: false,
    priority: 'Low',
    dueDate: '2026-07-17',
    status: 'Completed',
    commentsCount: 0,
    attachmentsCount: 0,
    recurring: true,
    completed: true,
    timelineStart: '2026-07-17',
    comments: []
  }
];

export default function TasksWorkspace() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');
  const [filterAssignee, setFilterAssignee] = useState<'all' | 'my' | 'team'>('all');
  const [selectedTaskId, setSelectedTaskId] = useState('tsk-1');
  const [searchQuery, setSearchQuery] = useState('');

  // Creation State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-07-18');
  const [newTaskRecurring, setNewTaskRecurring] = useState(false);

  // Comments state
  const [newCommentText, setNewCommentText] = useState('');

  // Toast
  const { toastMsg, showToast, triggerToast } = useWorkspaceToast();

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || tasks[0];
  }, [tasks, selectedTaskId]);

  // Filtered Task Collection
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchAssign = filterAssignee === 'all' || 
                           (filterAssignee === 'my' && task.myTask) || 
                           (filterAssignee === 'team' && !task.myTask);
                           
      return matchSearch && matchAssign;
    });
  }, [tasks, searchQuery, filterAssignee]);

  // Kanban groups
  const kanbanColumns = useMemo(() => {
    const pending = filteredTasks.filter(t => t.status === 'Pending' && !t.completed);
    const inProgress = filteredTasks.filter(t => t.status === 'In-Progress' && !t.completed);
    const completed = filteredTasks.filter(t => t.completed);
    return {
      'Pending Try-ins': pending,
      'Active Execution': inProgress,
      'Archived Completed': completed
    };
  }, [filteredTasks]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;
    const myCount = tasks.filter(t => t.myTask && !t.completed).length;
    return { total, completedCount, pendingCount, myCount };
  }, [tasks]);

  // Toggle Complete
  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        const nextStatus = nextCompleted ? 'Completed' : 'In-Progress';
        triggerToast(`Task "${task.title}" updated to ${nextCompleted ? 'completed' : 'pending'}.`);
        return { ...task, completed: nextCompleted, status: nextStatus };
      }
      return task;
    }));
  };

  // Add Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle,
      desc: newTaskDesc || 'No task description provided.',
      assignee: 'Dr. Ahmed',
      myTask: true,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      status: 'In-Progress',
      commentsCount: 0,
      attachmentsCount: 0,
      recurring: newTaskRecurring,
      completed: false,
      timelineStart: new Date().toISOString().substring(0, 10),
      comments: []
    };

    setTasks([newTask, ...tasks]);
    setSelectedTaskId(newTask.id);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskRecurring(false);
    triggerToast(`EHR Task "${newTask.title}" initialized and assigned successfully.`);
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setTasks(prev => prev.map(task => {
      if (task.id === selectedTaskId) {
        return {
          ...task,
          commentsCount: task.commentsCount + 1,
          comments: [
            ...(task.comments || []),
            { author: 'Dr. Ahmed', text: newCommentText }
          ]
        };
      }
      return task;
    }));

    setNewCommentText('');
    triggerToast('Audit comment posted securely.');
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Alert */}
      {showToast && <WorkspaceToast message={toastMsg} />}

      {/* HORIZONTAL STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Tasks Queue', value: stats.pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Assigned to Me', value: stats.myCount, icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed Actions', value: stats.completedCount, icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Platform Backlog', value: stats.total, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-xl font-bold text-white font-mono">{stat.value}</span>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & VIEW SWITCH BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-3xl border border-zinc-850">
          {[
            { id: 'kanban', label: 'Kanban board', icon: Layout },
            { id: 'list', label: 'EHR Grid List', icon: Sliders },
            { id: 'calendar', label: 'Monthly Calendar', icon: Calendar },
            { id: 'timeline', label: 'Prosthesis Timeline', icon: Clock }
          ].map(t => {
            const Icon = t.icon;
            const isSel = viewMode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSel ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'my', label: 'My Scope' },
              { id: 'team', label: 'Team Scope' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterAssignee(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition-all ${
                  filterAssignee === tab.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="pl-9 pr-4 py-1 w-48 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* MAIN RENDER ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Workspace Display Area - 8 Columns */}
        <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 min-h-[500px]">
          
          {/* 1. KANBAN BOARD */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-stretch">
              {Object.entries(kanbanColumns).map(([colName, colTasks]) => (
                <div key={colName} className="p-4 rounded-3xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-start space-y-3 min-h-[400px]">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                      {colName}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500">
                      {colTasks.length} tasks
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px]">
                    {colTasks.map(task => {
                      const isSelected = task.id === selectedTaskId;
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                            isSelected 
                              ? 'bg-zinc-900 border-zinc-800 shadow-xl' 
                              : 'bg-zinc-950/50 border-transparent hover:bg-zinc-900/40'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleComplete(task.id); }}
                              className={`p-1 hover:bg-zinc-800 rounded transition-colors ${
                                task.completed ? 'text-emerald-400' : 'text-zinc-600 hover:text-white'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 fill-current" />
                            </button>
                          </div>

                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">{task.desc}</p>

                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-900/60">
                            <span className="text-zinc-400">{task.assignee}</span>
                            
                            <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                              task.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                              task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. GRID LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-2 overflow-y-auto max-h-[500px]">
              {filteredTasks.map(task => {
                const isSelected = task.id === selectedTaskId;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-800' 
                        : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleComplete(task.id); }}
                        className={`p-1 hover:bg-zinc-800 rounded shrink-0 mt-0.5 ${
                          task.completed ? 'text-emerald-400' : 'text-zinc-600'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                          {task.recurring && (
                            <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 py-0.5 rounded font-mono font-bold">
                              RECURRING
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 font-sans">{task.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[10px] text-zinc-500 shrink-0">
                      <span>Owner: <strong className="text-zinc-300">{task.assignee}</strong></span>
                      <span>Due: <strong className="text-zinc-300">{task.dueDate}</strong></span>
                      
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${
                        task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-zinc-900">
                <span>Active Clinical Shift Calendar</span>
                <span className="text-white font-bold">JULY 2026</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <span key={d} className="text-zinc-600 font-bold py-1 uppercase text-[10px]">{d}</span>
                ))}

                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dayStr = `2026-07-${day < 10 ? '0' + day : day}`;
                  const hasTasks = filteredTasks.filter(t => t.dueDate === dayStr);
                  
                  return (
                    <div key={i} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-2 min-h-[64px] flex flex-col justify-between text-left">
                      <span className="text-[10px] text-zinc-500">{day}</span>
                      {hasTasks.length > 0 && (
                        <div className="space-y-1">
                          {hasTasks.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => setSelectedTaskId(t.id)}
                              className={`text-[9px] px-1.5 py-0.5 rounded truncate font-sans font-bold cursor-pointer ${
                                t.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              {t.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div className="space-y-4 font-mono text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Prosthetic Case Progress Timelines</span>
              
              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <div key={task.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{task.title}</h4>
                      <p className="text-[10px] text-zinc-500">Case Owner: {task.assignee}</p>
                    </div>

                    <div className="flex-1 max-w-md relative h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className={`absolute top-0 bottom-0 left-0 rounded-full ${
                        task.completed ? 'bg-emerald-500 w-full' : 'bg-blue-500 w-[60%]'
                      }`} />
                    </div>

                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {task.timelineStart} to {task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Selected Task Details & Comments - 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active details */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">EHR Job Specifications</span>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <h4 className="font-bold text-white text-sm">{activeTask.title}</h4>
                <button
                  onClick={() => handleToggleComplete(activeTask.id)}
                  className={`text-[10px] font-mono font-black px-2 py-1 rounded border uppercase ${
                    activeTask.completed 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:text-emerald-400'
                  }`}
                >
                  {activeTask.completed ? 'COMPLETED' : 'PENDING'}
                </button>
              </div>

              <p className="text-zinc-400 leading-relaxed font-sans mt-2">{activeTask.desc}</p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900 font-mono text-[10px] text-zinc-500">
                <div>
                  <p className="uppercase">Assignee</p>
                  <p className="text-white font-bold font-sans">{activeTask.assignee}</p>
                </div>
                <div>
                  <p className="uppercase">Due Date</p>
                  <p className="text-white font-bold">{activeTask.dueDate}</p>
                </div>
                <div>
                  <p className="uppercase">Priority Level</p>
                  <p className={`font-bold ${
                    activeTask.priority === 'High' ? 'text-red-400' : 'text-zinc-300'
                  }`}>{activeTask.priority}</p>
                </div>
                <div>
                  <p className="uppercase">Recurring State</p>
                  <p className="text-zinc-300 font-bold">{activeTask.recurring ? 'Every Monday' : 'One-Time'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task comments audit trail */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Clinical Discussion Logs</span>
            
            <div className="space-y-3 overflow-y-auto max-h-[160px]">
              {(activeTask.comments || []).length === 0 ? (
                <div className="text-center py-6 text-zinc-600">No logs posted on this EHR chart.</div>
              ) : (
                (activeTask.comments || []).map((comm, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-zinc-500">
                      <span className="font-bold text-zinc-300">{comm.author}</span>
                      <span>EHR Verified</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="border-t border-zinc-900 pt-3 flex gap-2">
              <input 
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Log internal note..."
                className="flex-1 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500 text-white text-xs"
                required
              />
              <button 
                type="submit"
                className="px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg cursor-pointer"
              >
                Log
              </button>
            </form>
          </div>

          {/* Quick Task Creation Portal */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Create Clinical Activity</span>
            
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-500">Task Title</label>
                <input 
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule CBCT Try-in"
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Task Objective Details</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Clinical objectives, patient ID etc."
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-500">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none text-[11px]"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500">Due Date</label>
                  <input 
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-1.5 text-white outline-none rounded-xl text-[11px]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2 rounded-xl text-center font-bold transition-all cursor-pointer mt-2"
              >
                Launch Unified Project Task
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
