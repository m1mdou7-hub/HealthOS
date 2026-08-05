import React from 'react';
import { Patient } from '../PatientWorkspace';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
  form: any;
  onChange: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  editingPatient,
  form,
  onChange,
  onSubmit
}: PatientDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl w-full max-w-xl space-y-4 text-xs text-left max-h-[90vh] overflow-y-auto scrollbar-thin">
        <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">
          {editingPatient ? 'Modify Clinical Patient Record' : 'Register New Patient Profile'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Patient Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500/40"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Email Contact</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Phone Contact</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => onChange({ ...form, age: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => onChange({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Blood Group</label>
            <input
              type="text"
              value={form.bloodGroup}
              onChange={(e) => onChange({ ...form, bloodGroup: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Medical Status</label>
            <select
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="New">New</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-400 font-semibold">Systemic Medical Alerts (Comma separated)</label>
            <input
              type="text"
              value={form.medicalAlerts}
              onChange={(e) => onChange({ ...form, medicalAlerts: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
              placeholder="e.g. Type II Diabetes, Hypertension"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-400 font-semibold">Drug Allergies (Comma separated)</label>
            <input
              type="text"
              value={form.allergies}
              onChange={(e) => onChange({ ...form, allergies: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
              placeholder="e.g. Penicillin, Latex"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-400 font-semibold">Clinical Background Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => onChange({ ...form, summary: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
          >
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
