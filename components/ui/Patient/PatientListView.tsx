import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Plus, Filter, ArrowUpDown, Grid, List, Mail, Phone, Calendar, Stethoscope, Scissors, Trash2, Edit3, Archive } from 'lucide-react';
import { Patient } from '../PatientWorkspace';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
  onEditPatient: (patient: Patient, e: React.MouseEvent) => void;
  onDeletePatient: (id: string, e: React.MouseEvent) => void;
  onArchivePatient: (id: string, e: React.MouseEvent) => void;
}

export default function PatientListView({
  patients,
  onSelectPatient,
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  onArchivePatient
}: PatientListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'New' | 'Under Treatment' | 'Completed'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [sortField, setSortField] = useState<'id' | 'name' | 'age' | 'lastVisit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field: 'id' | 'name' | 'age' | 'lastVisit') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort
  const processedPatients = useMemo(() => {
    let result = [...patients];

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      else if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'age') comparison = a.age - b.age;
      else if (sortField === 'lastVisit') comparison = a.lastVisit.localeCompare(b.lastVisit);

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [patients, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedPatients.length / itemsPerPage);
  const paginatedPatients = processedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/25 p-4 rounded-3xl border border-zinc-900/80 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            Patients Workspace
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              {patients.length} Registered
            </span>
          </h2>
          <p className="text-zinc-400 text-xs">Prosthodontics & Digital Dentistry Centralized EHR Database Node.</p>
        </div>
        <button
          onClick={onAddPatient}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Patient Record
        </button>
      </div>

      {/* Toolbar filter */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-900/10 p-4 rounded-3xl border border-zinc-900 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, ID, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500/40"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900">
            {['All', 'Active', 'New', 'Under Treatment', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  statusFilter === status ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-zinc-850 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg ${viewMode === 'card' ? 'bg-zinc-850 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table List */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/20">
          <table className="w-full text-xs text-left text-zinc-300">
            <thead className="bg-zinc-900/40 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('id')}>ID <ArrowUpDown className="w-3 h-3 inline" /></th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>Name <ArrowUpDown className="w-3 h-3 inline" /></th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('age')}>Age/Gender <ArrowUpDown className="w-3 h-3 inline" /></th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('lastVisit')}>Last Visit <ArrowUpDown className="w-3 h-3 inline" /></th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {paginatedPatients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className="hover:bg-zinc-900/25 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono font-bold text-zinc-500">{p.id}</td>
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <Image
                      src={p.photoUrl}
                      alt={p.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {p.name}
                  </td>
                  <td className="px-6 py-4">{p.age} Yrs / {p.gender}</td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-zinc-400">{p.phone}</p>
                    <p className="text-[10px] text-zinc-500">{p.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono">{p.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono border ${
                      p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'Under Treatment' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => onEditPatient(p, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onArchivePatient(p.id, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onDeletePatient(p.id, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-950 border border-zinc-800 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPatient(p.id)}
              className="p-5 rounded-3xl border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/25 transition-all cursor-pointer flex flex-col justify-between h-48"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Image
                    src={p.photoUrl}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white leading-normal">{p.name}</h3>
                    <span className="text-[9px] font-mono text-zinc-500">{p.id}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono border ${
                  p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400 font-sans my-4">
                <p className="flex items-center gap-1.5 font-mono"><Phone className="w-3 h-3 text-zinc-500" /> {p.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-zinc-500 truncate" /> {p.email}</p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 text-[10px] text-zinc-500 font-mono">
                <span>Last Visit: {p.lastVisit}</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={(e) => onEditPatient(p, e)} className="text-zinc-400 hover:text-white">Edit</button>
                  <span>•</span>
                  <button onClick={(e) => onDeletePatient(p.id, e)} className="text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs font-mono pt-4 border-t border-zinc-900 text-zinc-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
