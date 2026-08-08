import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpDown, Grid, List, Mail, Phone, Trash2, Edit3, Archive, Users, Search } from 'lucide-react';
import { Patient } from '../PatientWorkspace';
import { Card, Badge, Button, Input, Avatar, Table, EmptyState, Select } from '@/components/ui/design-system';
import type { Column } from '@/components/ui/design-system/primitives';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
  onEditPatient: (patient: Patient, e: React.MouseEvent) => void;
  onDeletePatient: (id: string, e: React.MouseEvent) => void;
  onArchivePatient: (id: string, e: React.MouseEvent) => void;
}

const statusFilterOptions = [
  { value: 'All', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'New', label: 'New' },
  { value: 'Under Treatment', label: 'Under Treatment' },
  { value: 'Completed', label: 'Completed' }
];

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

  const columns: Column<Patient>[] = [
    {
      key: 'id',
      header: 'ID',
      sticky: true,
      render: (p) => <span className="font-mono font-bold text-[var(--velvet-text-muted)]">{p.id}</span>
    },
    {
      key: 'name',
      header: 'Name',
      render: (p) => (
        <button onClick={() => onSelectPatient(p.id)} className="flex items-center gap-3 font-bold text-[var(--velvet-text)]">
          <Avatar name={p.name} src={p.photoUrl} size="sm" className="rounded-2xl" />
          {p.name}
        </button>
      )
    },
    {
      key: 'age',
      header: 'Age/Gender',
      render: (p) => <span>{p.age} Yrs / {p.gender}</span>
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (p) => (
        <div className="text-start">
          <p className="font-mono text-[var(--velvet-text-sub)]">{p.phone}</p>
          <p className="text-2xs text-[var(--velvet-text-muted)]">{p.email}</p>
        </div>
      )
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      render: (p) => <span className="font-mono">{p.lastVisit}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={p.status === 'Completed' ? 'success' : 'default'}>{p.status}</Badge>
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (p) => (
        <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={(e) => onEditPatient(p, e as any)} className="p-1.5" aria-label={`Edit ${p.name}`}>
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => onArchivePatient(p.id, e as any)} className="p-1.5" aria-label={`Archive ${p.name}`}>
            <Archive className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => onDeletePatient(p.id, e as any)} className="p-1.5 text-[var(--velvet-error)]" aria-label={`Delete ${p.name}`}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <Card variant="gradient" hover={false} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl">
        <div>
          <h2 className="text-xl font-bold text-[var(--velvet-text)] tracking-tight sm:text-2xl flex items-center gap-2">
            Patients Workspace
            <Badge tone="success">{patients.length} Registered</Badge>
          </h2>
          <p className="text-[var(--velvet-text-muted)] text-xs">Prosthodontics & Digital Dentistry Centralized EHR Database Node.</p>
        </div>
        <Button onClick={onAddPatient} size="sm" className="self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Patient Record
        </Button>
      </Card>

      {/* Toolbar filter */}
      <Card variant="elevated" hover={false} className="flex flex-col md:flex-row justify-between items-center p-4 rounded-3xl gap-4">
        <div className="w-full max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, ID, or phone..."
            leftIcon={<Search className="w-4 h-4" />}
            aria-label="Search patients"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              options={statusFilterOptions}
              aria-label="Filter by status"
            />
          </div>
          <div className="w-44">
            <Select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as any)}
              options={[
                { value: 'id', label: 'Sort: ID' },
                { value: 'name', label: 'Sort: Name' },
                { value: 'age', label: 'Sort: Age' },
                { value: 'lastVisit', label: 'Sort: Last Visit' }
              ]}
              aria-label="Sort by"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-1.5"
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--velvet-surface-2)', border: '1px solid var(--velvet-border)' }}>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="p-1.5"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="p-1.5"
              aria-label="Card view"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid or Table List */}
      {viewMode === 'table' ? (
        <Card variant="elevated" hover={false} className="rounded-3xl overflow-hidden">
          <Table
            columns={columns}
            data={paginatedPatients}
            keyExtractor={(p) => p.id}
            stickyFirstColumn
            emptyState={
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title="No patients found"
                description="Try adjusting your search query or filters."
              />
            }
          />
        </Card>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPatients.length === 0 ? (
            <div className="col-span-full">
              <Card variant="elevated" hover={false} className="rounded-3xl">
                <EmptyState
                  icon={<Users className="w-6 h-6" />}
                  title="No patients found"
                  description="Try adjusting your search query or filters."
                />
              </Card>
            </div>
          ) : paginatedPatients.map((p) => (
            <Card
              key={p.id}
              variant="elevated"
              hover
              onClick={() => onSelectPatient(p.id)}
              className="p-5 rounded-3xl cursor-pointer flex flex-col justify-between h-48"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPatient(p.id); }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} src={p.photoUrl} size="md" className="rounded-2xl" />
                  <div>
                    <h3 className="text-xs font-bold text-[var(--velvet-text)] leading-normal">{p.name}</h3>
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{p.id}</span>
                  </div>
                </div>
                <Badge tone={p.status === 'Completed' ? 'success' : 'default'}>{p.status}</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-[var(--velvet-text-muted)] font-sans my-4">
                <p className="flex items-center gap-1.5 font-mono"><Phone className="w-3 h-3" /> {p.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> <span className="truncate">{p.email}</span></p>
              </div>

              <div className="flex items-center justify-between border-t pt-2 text-2xs text-[var(--velvet-text-muted)] font-mono" style={{ borderColor: 'var(--velvet-border)' }}>
                <span>Last Visit: {p.lastVisit}</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={(e) => onEditPatient(p, e as any)} className="p-1 text-[var(--velvet-text-sub)]">Edit</Button>
                  <span>•</span>
                  <Button variant="ghost" size="sm" onClick={(e) => onDeletePatient(p.id, e as any)} className="p-1 text-[var(--velvet-error)]">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs font-mono pt-4 border-t text-[var(--velvet-text-muted)]" style={{ borderColor: 'var(--velvet-border)' }}>
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
