'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, Sparkles, X, Check, CheckSquare, Filter, AlertTriangle, Info } from 'lucide-react';
import { OperationalNotification } from './types';

interface NotificationCenterProps {
  notifications: OperationalNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<OperationalNotification[]>>;
}

export default function NotificationCenter({
  notifications,
  setNotifications
}: NotificationCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchCat = selectedCategory === 'All' || n.category === selectedCategory;
      const matchPri = selectedPriority === 'All' || n.priority === selectedPriority;
      return matchCat && matchPri;
    });
  }, [notifications, selectedCategory, selectedPriority]);

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityBadge = (priority: OperationalNotification['priority']) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Low': default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getCategoryIcon = (category: OperationalNotification['category']) => {
    switch (category) {
      case 'AI': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Medical Alerts': return <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'Lab': return <Bell className="w-4 h-4 text-amber-400" />;
      default: return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div id="notification-center" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Bell className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Clinic Dispatch Notification Hub
            </h3>
            {unreadCount > 0 && (
              <span className="badge badge-danger font-mono font-black text-2xs px-2 py-0.5 rounded-full animate-bounce">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Stay aligned with system updates, AI margin warnings, medical alert conditions, and prosthetic milling cycles.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <CheckSquare className="w-3.5 h-3.5" /> Mark All as Read
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl card-gradient">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-2xs font-mono uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs py-1 px-2.5 rounded-lg border font-mono"
          style={{ background: 'var(--surface-2)', color: 'var(--text-sub)', borderColor: 'var(--border)' }}
        >
          <option value="All">All Categories</option>
          <option value="Appointments">Appointments</option>
          <option value="Lab">Laboratory</option>
          <option value="AI">AI Insights</option>
          <option value="Medical Alerts">Medical Alerts</option>
          <option value="Recalls">Recalls</option>
          <option value="Treatment Reminders">Reminders</option>
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="text-xs py-1 px-2.5 rounded-lg border font-mono"
          style={{ background: 'var(--surface-2)', color: 'var(--text-sub)', borderColor: 'var(--border)' }}
        >
          <option value="All">All Priorities</option>
          <option value="High">High Urgency</option>
          <option value="Medium">Medium Urgency</option>
          <option value="Low">Low Urgency</option>
        </select>
      </div>

      {/* Notification Stream */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto scrollbar-none pe-1">
        <AnimatePresence initial={false}>
          {filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`p-4 rounded-xl border text-start flex items-start gap-3.5 transition-all card-hover ${
                notif.unread 
                  ? 'card-gradient' 
                  : 'card-elevated'
              }`}
            >
              <div className="p-2 rounded-lg border shrink-0" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                {getCategoryIcon(notif.category)}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs" style={{ color: 'var(--text)' }}>{notif.title}</span>
                    <span className={`text-2xs px-1.5 py-0.5 rounded font-mono border font-bold ${getPriorityBadge(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <span className="text-2xs font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{notif.time}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{notif.desc}</p>
                <div className="pt-1.5 flex items-center gap-2 text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  <span>Category: {notif.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {notif.unread && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--success)' }}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1 rounded hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
            No dispatch alerts found.
          </div>
        )}
      </div>
    </div>
  );
}
