'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Copy,
  Archive,
  RotateCcw,
  Eye,
  GitCompareArrows,
  Users,
  History,
  ShieldCheck,
  Check,
  Star,
  Search,
  RefreshCw,
  CheckSquare,
  X,
  Pencil,
  Crown,
  Building2,
  Sparkles,
  UserCheck,
  Layers,
  Save,
  CheckCircle2
} from 'lucide-react';
import {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  ACCESS_SCOPES,
  DEPARTMENTS,
  hasPermission,
  savePermissionTemplates,
  resetPermissionTemplates,
  createPermissionTemplate,
  updatePermissionTemplate,
  duplicatePermissionTemplate,
  archivePermissionTemplate,
  restorePermissionTemplate,
  clonePermissionsFromTemplate,
  markTemplateDefault,
  getActiveTemplates,
  getArchivedTemplates,
  getTemplatesByCategory,
  comparePermissionTemplates,
  previewPermissionTemplate,
  countTemplatePermissions,
  PERMISSION_TEMPLATE_CATEGORIES,
  type PermissionTemplate,
  type PermissionTemplateCategory,
  type ModuleId,
  type PermissionAction,
  type AccessScopeType,
  type TemplateDiff,
  type DepartmentId
} from '@/utils/enterprise/directory';
import { PRACTICE_TYPES } from '@/utils/enterprise/practice';
import type { PracticeTypeId } from '@/utils/enterprise/practice';
import { RESPONSIBILITIES } from '@/utils/enterprise/responsibilities';
import type { ResponsibilityId } from '@/utils/enterprise/responsibilities';

export interface AssignableUser {
  id: string;
  name: string;
  role: string;
  departmentId?: DepartmentId;
  responsibilityIds?: ResponsibilityId[];
  permissionTemplateId?: string;
}

interface PermissionTemplateManagerProps {
  templates: PermissionTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<PermissionTemplate[]>>;
  users: AssignableUser[];
  onAssign: (userIds: string[], templateId: string) => void;
  onAudit: (action: string) => void;
}

const CATEGORY_STYLES: Record<PermissionTemplateCategory, string> = {
  general: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  department: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  practice: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  responsibility: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

const CATEGORY_ICONS: Record<PermissionTemplateCategory, typeof Layers> = {
  general: Layers,
  department: Building2,
  practice: Sparkles,
  responsibility: UserCheck
};

interface TemplateFormState {
  name: string;
  description: string;
  scope: AccessScopeType;
  category: PermissionTemplateCategory;
  departmentIds: DepartmentId[];
  practiceTypeIds: PracticeTypeId[];
  responsibilityIds: ResponsibilityId[];
}

const EMPTY_FORM: TemplateFormState = {
  name: '',
  description: '',
  scope: 'department',
  category: 'general',
  departmentIds: [],
  practiceTypeIds: [],
  responsibilityIds: []
};

export default function PermissionTemplateManager({
  templates,
  setTemplates,
  users,
  onAssign,
  onAudit
}: PermissionTemplateManagerProps) {
  const t = useTranslations('PermissionManager');
  const tDir = useTranslations('EnterpriseDirectory');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('owner');
  const [selectedScope, setSelectedScope] = useState<AccessScopeType>('organization');
  const [matrixStatus, setMatrixStatus] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PermissionTemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);

  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');

  const [previewOpen, setPreviewOpen] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSelected, setAssignSelected] = useState<Set<string>>(new Set());

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAId, setCompareAId] = useState('');
  const [compareBId, setCompareBId] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;
  const selectedActive = selectedTemplate ? !selectedTemplate.archived : false;

  useEffect(() => {
    if (!selectedTemplate) {
      const first = getActiveTemplates(templates)[0];
      if (first) setSelectedTemplateId(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const activeCount = getActiveTemplates(templates).length;
  const archivedCount = getArchivedTemplates(templates).length;
  const defaultTemplate = templates.find((t) => t.isDefault && !t.archived) ?? null;

  const filteredTemplates = getTemplatesByCategory(templates, categoryFilter).filter((tpl) => {
    if (tpl.archived && !showArchived) return false;
    if (!tpl.archived && showArchived) return false;
    if (search && !tpl.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const persist = (next: PermissionTemplate[]) => {
    setTemplates(next);
    savePermissionTemplates(next);
  };

  const flash = (key: string) => {
    setMatrixStatus(key);
    setTimeout(() => setMatrixStatus(null), 4000);
  };

  // ---- Matrix editing (same primitives as before) ----
  const toggleMatrixCell = (moduleId: ModuleId, action: PermissionAction) => {
    if (!selectedActive) return;
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTemplateId) return t;
        const current = t.modulePermissions[moduleId] ?? [];
        const next = current.includes(action)
          ? current.filter((a) => a !== action)
          : [...current, action];
        return { ...t, modulePermissions: { ...t.modulePermissions, [moduleId]: next } };
      })
    );
  };

  const saveMatrix = () => {
    savePermissionTemplates(templates);
    flash('matrixSaved');
    onAudit(`Persisted permission matrix for ${templates.length} templates. Active matrix: ${selectedTemplateId}.`);
  };

  const handleResetTemplates = () => {
    persist(resetPermissionTemplates());
    setSelectedTemplateId('owner');
    setSelectedScope('organization');
    flash('templatesReset');
    onAudit('Reset all permission templates to factory defaults.');
  };

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setSelectedScope(tpl.scope);
  };

  const handleScopeChange = (scope: AccessScopeType) => {
    setSelectedScope(scope);
    if (!selectedActive) return;
    setTemplates((prev) => prev.map((t) => (t.id === selectedTemplateId ? { ...t, scope } : t)));
  };

  // ---- Create / Edit ----
  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!selectedTemplate) return;
    setForm({
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      scope: selectedTemplate.scope,
      category: selectedTemplate.category ?? 'general',
      departmentIds: selectedTemplate.departmentIds ?? [],
      practiceTypeIds: selectedTemplate.practiceTypeIds ?? [],
      responsibilityIds: selectedTemplate.responsibilityIds ?? []
    });
    setFormMode('edit');
    setFormOpen(true);
  };

  const submitForm = () => {
    if (!form.name.trim()) return;
    if (formMode === 'create') {
      const tpl = createPermissionTemplate({
        name: form.name.trim(),
        description: form.description.trim(),
        scope: form.scope,
        category: form.category,
        departmentIds: form.departmentIds,
        practiceTypeIds: form.practiceTypeIds,
        responsibilityIds: form.responsibilityIds,
        actor: 'Security Admin'
      });
      persist([...templates, tpl]);
      setSelectedTemplateId(tpl.id);
      setSelectedScope(tpl.scope);
      onAudit(`Created permission template [${tpl.id}] ${tpl.name}.`);
      flash('templateCreated');
    } else if (selectedTemplate) {
      const updated = updatePermissionTemplate(
        selectedTemplate,
        {
          name: form.name.trim(),
          description: form.description.trim(),
          scope: form.scope,
          category: form.category,
          departmentIds: form.departmentIds,
          practiceTypeIds: form.practiceTypeIds,
          responsibilityIds: form.responsibilityIds
        },
        'Security Admin',
        'Edited in template manager'
      );
      persist(templates.map((x) => (x.id === updated.id ? updated : x)));
      setSelectedTemplateId(updated.id);
      setSelectedScope(updated.scope);
      onAudit(`Updated permission template [${updated.id}] to version ${updated.version}.`);
      flash('templateUpdated');
    }
    setFormOpen(false);
  };

  // ---- Duplicate / Archive / Restore ----
  const handleDuplicate = () => {
    if (!selectedTemplate) return;
    const dup = duplicatePermissionTemplate(selectedTemplate, 'Security Admin');
    persist([...templates, dup]);
    setSelectedTemplateId(dup.id);
    setSelectedScope(dup.scope);
    onAudit(`Duplicated permission template [${selectedTemplate.id}] to [${dup.id}].`);
    flash('templateDuplicated');
  };

  const handleArchive = () => {
    if (!selectedTemplate || selectedTemplate.archived) return;
    const archived = archivePermissionTemplate(selectedTemplate, 'Security Admin');
    persist(templates.map((x) => (x.id === archived.id ? archived : x)));
    const nextId = getActiveTemplates(templates.filter((x) => x.id !== archived.id))[0]?.id;
    if (nextId) setSelectedTemplateId(nextId);
    onAudit(`Archived permission template [${selectedTemplate.id}] ${selectedTemplate.name}.`);
    flash('templateArchived');
  };

  const handleRestore = () => {
    if (!selectedTemplate || !selectedTemplate.archived) return;
    const restored = restorePermissionTemplate(selectedTemplate, 'Security Admin');
    persist(templates.map((x) => (x.id === restored.id ? restored : x)));
    setSelectedTemplateId(restored.id);
    onAudit(`Restored permission template [${restored.id}] ${restored.name}.`);
    flash('templateRestored');
  };

  // ---- Clone permissions from another template ----
  const submitClone = () => {
    if (!selectedTemplate || !cloneSourceId) return;
    const source = templates.find((s) => s.id === cloneSourceId);
    if (!source) return;
    const updated = clonePermissionsFromTemplate(selectedTemplate, source, 'Security Admin');
    persist(templates.map((x) => (x.id === updated.id ? updated : x)));
    setCloneOpen(false);
    setCloneSourceId('');
    onAudit(`Cloned permissions from [${source.id}] into [${updated.id}] (v${updated.version}).`);
    flash('permissionsCloned');
  };

  // ---- Set default ----
  const handleSetDefault = () => {
    if (!selectedTemplate || !selectedActive) return;
    const next = markTemplateDefault(templates, selectedTemplate.id);
    persist(next);
    onAudit(`Marked permission template [${selectedTemplate.id}] as organization default.`);
    flash('defaultSet');
  };

  // ---- Assign to users / bulk assign ----
  const toggleAssignUser = (userId: string) => {
    setAssignSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAllVisible = () => {
    setAssignSelected(new Set(users.map((u) => u.id)));
  };

  const clearAssignSelection = () => {
    setAssignSelected(new Set());
  };

  const submitAssign = () => {
    if (!selectedTemplate || assignSelected.size === 0) return;
    const userIds = Array.from(assignSelected);
    onAssign(userIds, selectedTemplate.id);
    onAudit(`Assigned permission template [${selectedTemplate.id}] to ${userIds.length} user(s).`);
    setAssignOpen(false);
    setAssignSelected(new Set());
    flash('templateAssigned');
  };

  // ---- Compare ----
  const templateA = templates.find((t) => t.id === compareAId);
  const templateB = templates.find((t) => t.id === compareBId);
  const diffs: TemplateDiff[] =
    templateA && templateB ? comparePermissionTemplates(templateA, templateB) : [];
  const diffCount = diffs.filter((d) => d.onlyInA.length > 0 || d.onlyInB.length > 0).length;

  const openCompare = () => {
    const others = templates.filter((t) => t.id !== selectedTemplateId);
    setCompareAId(selectedTemplateId);
    setCompareBId(others[0]?.id ?? '');
    setCompareOpen(true);
  };

  // ---- Render helpers ----
  const renderTags = (tpl: PermissionTemplate) => {
    const depts = (tpl.departmentIds ?? []).map((d) => DEPARTMENTS.find((x) => x.id === d)?.name ?? d);
    const pract = (tpl.practiceTypeIds ?? []).map((p) => PRACTICE_TYPES.find((x) => x.id === p)?.name ?? p);
    const resp = (tpl.responsibilityIds ?? []).map((r) => RESPONSIBILITIES.find((x) => x.id === r)?.name ?? r);
    const all = [...depts, ...pract, ...resp];
    if (all.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {all.slice(0, 3).map((tag) => (
          <span key={tag} className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            {tag}
          </span>
        ))}
        {all.length > 3 && (
          <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            +{all.length - 3}
          </span>
        )}
      </div>
    );
  };

  const CategoryIcon = selectedTemplate ? CATEGORY_ICONS[selectedTemplate.category ?? 'general'] : Layers;

  // ---------- RENDER ----------
  return (
    <div className="space-y-4">
      {/* Header / status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> {t('createTemplate')}
          </button>
          <button
            onClick={openCompare}
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
          >
            <GitCompareArrows className="w-3.5 h-3.5" /> {t('compareTemplates')}
          </button>
          <button
            onClick={handleResetTemplates}
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {tDir('resetTemplates')}
          </button>
          <button
            onClick={saveMatrix}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {tDir('saveMatrix')}
          </button>
        </div>
        {matrixStatus && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {tDir(matrixStatus)}
          </span>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 card-elevated rounded-2xl">
          <p className="text-2xs font-mono text-zinc-500 uppercase">{t('activeTemplates')}</p>
          <p className="text-xl font-black text-white">{activeCount}</p>
        </div>
        <div className="p-3 card-elevated rounded-2xl">
          <p className="text-2xs font-mono text-zinc-500 uppercase">{t('archivedTemplates')}</p>
          <p className="text-xl font-black text-white">{archivedCount}</p>
        </div>
        <div className="p-3 card-elevated rounded-2xl col-span-2">
          <p className="text-2xs font-mono text-zinc-500 uppercase flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-amber-400" /> {t('defaultTemplate')}
          </p>
          <p className="text-sm font-black text-amber-300 truncate">{defaultTemplate?.name ?? t('none')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ---------- LEFT: TEMPLATE LIBRARY ---------- */}
        <div className="p-3.5 card-elevated rounded-3xl space-y-3 flex flex-col h-[560px] overflow-hidden">
          <div className="space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full ps-8 pe-3 py-1.5 rounded-xl text-xs text-white outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([{ id: 'all', label: t('categoryAll') }] as { id: PermissionTemplateCategory | 'all'; label: string }[])
                .concat(PERMISSION_TEMPLATE_CATEGORIES.map((c) => ({ id: c.id, label: t(`categories.${c.id}`) })))
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-2 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
            </div>
            <label className="flex items-center gap-2 text-2xs font-mono text-zinc-500 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="accent-purple-500"
              />
              {t('showArchived')} ({archivedCount})
            </label>
          </div>

          <div className="flex-1 overflow-y-auto pe-1 space-y-1">
            {filteredTemplates.length === 0 && (
              <p className="text-center text-xs text-zinc-600 py-8">{t('noTemplates')}</p>
            )}
            {filteredTemplates.map((tpl) => {
              const Icon = CATEGORY_ICONS[tpl.category ?? 'general'];
              const isSel = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-purple-500/10 border-purple-500/40'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${tpl.archived ? 'text-zinc-600' : 'text-zinc-300'}`} />
                      <span className={`text-xs font-bold truncate ${tpl.archived ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {tpl.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {tpl.isDefault && !tpl.archived && (
                        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> {t('defaultBadge')}
                        </span>
                      )}
                      {tpl.archived && (
                        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                          {t('archivedBadge')}
                        </span>
                      )}
                      <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                        v{tpl.version ?? 1}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xs text-zinc-500 truncate mt-0.5">{tpl.description || '—'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-2xs font-mono px-1.5 py-0.5 rounded border ${CATEGORY_STYLES[tpl.category ?? 'general']}`}>
                      {t(`categories.${tpl.category ?? 'general'}`)}
                    </span>
                    <span className="text-2xs font-mono text-zinc-600">
                      {tDir(`scopes.${tpl.scope}`)}
                    </span>
                  </div>
                  {renderTags(tpl)}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- RIGHT: SELECTED TEMPLATE + MATRIX ---------- */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {selectedTemplate ? (
            <>
              {/* Template meta card */}
              <div className="p-4 card-elevated rounded-3xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-3 rounded-2xl shrink-0 bg-purple-500/10 border border-purple-500/30 text-purple-300">
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                        {selectedTemplate.name}
                        {selectedTemplate.isDefault && !selectedTemplate.archived && (
                          <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> {t('defaultBadge')}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{selectedTemplate.description || '—'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-2xs font-mono px-1.5 py-0.5 rounded border ${CATEGORY_STYLES[selectedTemplate.category ?? 'general']}`}>
                          {t(`categories.${selectedTemplate.category ?? 'general'}`)}
                        </span>
                        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          v{selectedTemplate.version ?? 1}
                        </span>
                        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {countTemplatePermissions(selectedTemplate)} {t('grantedCellCount')}
                        </span>
                        {selectedTemplate.updatedAt && (
                          <span className="text-2xs font-mono text-zinc-600">
                            {t('updatedAt')}: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {renderTags(selectedTemplate)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button onClick={openEdit} disabled={!selectedActive} className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                      <Pencil className="w-3.5 h-3.5" /> {t('editTemplate')}
                    </button>
                    <button onClick={handleDuplicate} className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer">
                      <Copy className="w-3.5 h-3.5" /> {t('duplicateTemplate')}
                    </button>
                    {selectedTemplate.archived ? (
                      <button onClick={handleRestore} className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" /> {t('restoreTemplate')}
                      </button>
                    ) : (
                      <button onClick={handleArchive} className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer text-rose-300">
                        <Archive className="w-3.5 h-3.5" /> {t('archiveTemplate')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Action row: clone / preview / assign / default / history */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-zinc-900">
                  <button
                    onClick={() => { setCloneSourceId(''); setCloneOpen(true); }}
                    disabled={!selectedActive}
                    className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Copy className="w-3.5 h-3.5" /> {t('cloneFromTemplate')}
                  </button>
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> {t('previewTemplate')}
                  </button>
                  <button
                    onClick={() => { setAssignSelected(new Set()); setAssignOpen(true); }}
                    disabled={!selectedActive}
                    className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Users className="w-3.5 h-3.5" /> {t('assignTemplate')}
                  </button>
                  <button
                    onClick={handleSetDefault}
                    disabled={!selectedActive || selectedTemplate.isDefault}
                    className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 text-amber-300"
                  >
                    <Star className="w-3.5 h-3.5" /> {t('setDefault')}
                  </button>
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="btn-secondary px-2.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" /> {t('versionHistory')}
                  </button>
                  <span className="ms-auto text-2xs font-mono text-zinc-600">
                    {selectedTemplate.history?.length ?? 0} {t('revisionsCount')}
                  </span>
                </div>
              </div>

              {/* Access scope selector */}
              <div className="p-4 card-elevated rounded-3xl space-y-2">
                <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block">{tDir('accessScope')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESS_SCOPES.map((s) => {
                    const active = selectedScope === s.type;
                    return (
                      <button
                        key={s.type}
                        onClick={() => handleScopeChange(s.type)}
                        className={`px-2.5 py-1.5 rounded-xl text-2xs font-bold font-mono border transition-all cursor-pointer ${
                          active ? 'bg-purple-500/10 border-purple-500/40 text-purple-200' : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {tDir(`scopes.${s.type}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Module × Action matrix */}
              <div className="p-4 card-elevated rounded-3xl flex flex-col">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3 shrink-0">
                  <span className="text-xs font-black text-white font-mono uppercase">
                    {tDir('module')} × {tDir('action')}: <span className="text-purple-400">{selectedTemplate.name}</span>
                  </span>
                  <span className="text-2xs font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 border border-zinc-800 rounded">
                    HIPAA Scope Enforcement
                  </span>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin rounded-xl max-h-[340px]">
                  <table className="w-full border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-zinc-950 text-zinc-500 text-2xs uppercase font-bold border-b border-zinc-900 sticky top-0">
                        <th className="p-2 text-start w-40">{tDir('module')}</th>
                        {PERMISSION_ACTIONS.map((a) => (
                          <th key={a} className="p-2 text-center">{tDir(`actions.${a}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                      {PERMISSION_MODULES.map((mod) => (
                        <tr key={mod.id} className="hover:bg-zinc-900/20">
                          <td className="p-2 text-xs font-bold text-white">{mod.name}</td>
                          {PERMISSION_ACTIONS.map((a) => {
                            const checked = hasPermission(selectedTemplate.modulePermissions, mod.id, a);
                            return (
                              <td key={a} className="p-2 text-center">
                                <button
                                  onClick={() => toggleMatrixCell(mod.id, a)}
                                  disabled={!selectedActive}
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                                    checked ? 'bg-purple-500 border-purple-400 text-zinc-950' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                                  }`}
                                  aria-label={`${mod.name} ${a}`}
                                >
                                  {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pt-2 mt-2 border-t border-zinc-900 flex items-center justify-between font-mono text-2xs text-zinc-500 shrink-0">
                  <span>LAST AUDITED: {new Date().toLocaleDateString()}</span>
                  <span className="text-purple-400 font-bold">MUTABLE ON-THE-FLY · {tDir('customOverride')}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">{t('selectTemplateHint')}</div>
          )}
        </div>
      </div>

      {/* ---------- CREATE / EDIT MODAL ---------- */}
      {formOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                {formMode === 'create' ? t('createTemplate') : t('editTemplate')}
              </h4>
              <button onClick={() => setFormOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-2xs text-zinc-400 font-bold uppercase">{t('templateName')}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-zinc-400 font-bold uppercase">{t('templateDescription')}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs text-zinc-400 font-bold uppercase">{t('category')}</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as PermissionTemplateCategory }))}
                  className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
                >
                  {PERMISSION_TEMPLATE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-2xs text-zinc-400 font-bold uppercase">{tDir('accessScope')}</label>
                <select
                  value={form.scope}
                  onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as AccessScopeType }))}
                  className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
                >
                  {ACCESS_SCOPES.map((s) => (
                    <option key={s.type} value={s.type}>{tDir(`scopes.${s.type}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.category === 'department' && (
              <div className="space-y-1.5">
                <label className="text-2xs text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-sky-400" /> {t('departmentTags')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENTS.map((d) => {
                    const active = form.departmentIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => setForm((p) => ({
                          ...p,
                          departmentIds: active ? p.departmentIds.filter((x) => x !== d.id) : [...p.departmentIds, d.id]
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                          active ? 'bg-sky-500/15 text-sky-300 border-sky-500/40' : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {form.category === 'practice' && (
              <div className="space-y-1.5">
                <label className="text-2xs text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-violet-400" /> {t('practiceTypeTags')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRACTICE_TYPES.map((pt) => {
                    const active = form.practiceTypeIds.includes(pt.id);
                    return (
                      <button
                        key={pt.id}
                        onClick={() => setForm((p) => ({
                          ...p,
                          practiceTypeIds: active ? p.practiceTypeIds.filter((x) => x !== pt.id) : [...p.practiceTypeIds, pt.id]
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                          active ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {pt.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {form.category === 'responsibility' && (
              <div className="space-y-1.5">
                <label className="text-2xs text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-emerald-400" /> {t('responsibilityTags')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RESPONSIBILITIES.map((r) => {
                    const active = form.responsibilityIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        onClick={() => setForm((p) => ({
                          ...p,
                          responsibilityIds: active ? p.responsibilityIds.filter((x) => x !== r.id) : [...p.responsibilityIds, r.id]
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                          active ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="btn-secondary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer">
                {tDir('cancel')}
              </button>
              <button onClick={submitForm} className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <CheckSquare className="w-4 h-4" /> {formMode === 'create' ? t('createTemplate') : t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CLONE PERMISSIONS MODAL ---------- */}
      {cloneOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Copy className="w-4 h-4 text-purple-400" /> {t('cloneFromTemplate')}
            </h4>
            <p className="text-xs text-zinc-500">
              {t('cloneFromHint')} <span className="text-purple-300 font-bold">{selectedTemplate.name}</span>.
            </p>
            <div className="space-y-1">
              <label className="text-2xs text-zinc-400 font-bold uppercase">{t('sourceTemplate')}</label>
              <select
                value={cloneSourceId}
                onChange={(e) => setCloneSourceId(e.target.value)}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              >
                <option value="">{t('selectSource')}</option>
                {templates.filter((x) => !x.archived && x.id !== selectedTemplate.id).map((x) => (
                  <option key={x.id} value={x.id}>{x.name} · v{x.version ?? 1}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCloneOpen(false)} className="btn-secondary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer">{tDir('cancel')}</button>
              <button onClick={submitClone} disabled={!cloneSourceId} className="btn-primary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40">
                {t('clonePermissions')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PREVIEW MODAL ---------- */}
      {previewOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> {t('previewTemplate')}: <span className="text-purple-300">{selectedTemplate.name}</span>
              </h4>
              <button onClick={() => setPreviewOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-2xs font-mono">
              <span className={`px-2 py-1 rounded-lg border ${CATEGORY_STYLES[selectedTemplate.category ?? 'general']}`}>
                {t(`categories.${selectedTemplate.category ?? 'general'}`)}
              </span>
              <span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">v{selectedTemplate.version ?? 1}</span>
              <span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                {tDir(`scopes.${selectedTemplate.scope}`)}
              </span>
              <span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                {countTemplatePermissions(selectedTemplate)} {t('grantedCellCount')}
              </span>
            </div>
            <div className="overflow-auto scrollbar-thin rounded-xl max-h-[520px] border border-zinc-900">
              <table className="w-full border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-500 text-2xs uppercase font-bold border-b border-zinc-900 sticky top-0">
                    <th className="p-2 text-start w-40">{tDir('module')}</th>
                    {PERMISSION_ACTIONS.map((a) => (
                      <th key={a} className="p-2 text-center">{tDir(`actions.${a}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {PERMISSION_MODULES.map((mod) => (
                    <tr key={mod.id} className="hover:bg-zinc-900/20">
                      <td className="p-2 text-xs font-bold text-white">{mod.name}</td>
                      {PERMISSION_ACTIONS.map((a) => {
                        const checked = hasPermission(selectedTemplate.modulePermissions, mod.id, a);
                        return (
                          <td key={a} className="p-2 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
                              checked ? 'bg-purple-500 border-purple-400 text-zinc-950' : 'border-zinc-800 bg-zinc-900'
                            }`}>
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ASSIGN MODAL ---------- */}
      {assignOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> {t('assignTemplate')}: <span className="text-purple-300">{selectedTemplate.name}</span>
              </h4>
              <button onClick={() => setAssignOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={selectAllVisible} className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
                <Check className="w-3.5 h-3.5 inline me-1" /> {t('selectAll')}
              </button>
              <button onClick={clearAssignSelection} className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
                {t('clearSelection')}
              </button>
              <span className="text-2xs font-mono text-zinc-500 ms-auto">{assignSelected.size}/{users.length} {t('usersSelected')}</span>
            </div>
            <div className="border border-zinc-900 rounded-2xl divide-y divide-zinc-900/60 max-h-[320px] overflow-y-auto">
              {users.length === 0 && (
                <p className="p-6 text-center text-xs text-zinc-600">{t('noUsers')}</p>
              )}
              {users.map((u) => {
                const checked = assignSelected.has(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-zinc-900/30 transition-all">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssignUser(u.id)}
                      className="accent-purple-500"
                    />
                    <span className="text-xs font-bold text-white">{u.name}</span>
                    <span className="text-2xs font-mono text-zinc-500">{u.role}</span>
                    <span className="ms-auto text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                      {u.permissionTemplateId
                        ? templates.find((x) => x.id === u.permissionTemplateId)?.name ?? u.permissionTemplateId
                        : '—'}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignOpen(false)} className="btn-secondary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer">{tDir('cancel')}</button>
              <button onClick={submitAssign} disabled={assignSelected.size === 0} className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                <CheckSquare className="w-4 h-4" /> {t('assignToUsers')} ({assignSelected.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- COMPARE MODAL ---------- */}
      {compareOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <GitCompareArrows className="w-4 h-4 text-purple-400" /> {t('compareTemplates')}
              </h4>
              <button onClick={() => setCompareOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={compareAId}
                onChange={(e) => setCompareAId(e.target.value)}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              >
                {templates.filter((x) => !x.archived).map((x) => (
                  <option key={x.id} value={x.id}>{x.name} · v{x.version ?? 1}</option>
                ))}
              </select>
              <select
                value={compareBId}
                onChange={(e) => setCompareBId(e.target.value)}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              >
                {templates.filter((x) => !x.archived && x.id !== compareAId).map((x) => (
                  <option key={x.id} value={x.id}>{x.name} · v{x.version ?? 1}</option>
                ))}
              </select>
            </div>

            {templateA && templateB && (
              <>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold">A · {templateA.name}</span>
                  <span className="text-zinc-500">{diffCount}/{PERMISSION_MODULES.length} {t('modulesDiffer')}</span>
                  <span className="text-sky-300 font-bold">B · {templateB.name}</span>
                </div>
                <div className="overflow-auto scrollbar-thin rounded-xl max-h-[380px] border border-zinc-900">
                  <table className="w-full border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-zinc-950 text-zinc-500 text-2xs uppercase font-bold border-b border-zinc-900 sticky top-0">
                        <th className="p-2 text-start w-40">{tDir('module')}</th>
                        <th className="p-2">{t('onlyInA')}</th>
                        <th className="p-2">{t('onlyInB')}</th>
                        <th className="p-2">{t('inBoth')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                      {diffs.map((d) => {
                        const changed = d.onlyInA.length > 0 || d.onlyInB.length > 0;
                        return (
                          <tr key={d.module} className={`${changed ? 'bg-purple-500/[0.04]' : 'opacity-50'} hover:bg-zinc-900/20`}>
                            <td className="p-2 text-xs font-bold text-white">{d.moduleName}</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {d.onlyInA.map((a) => (
                                  <span key={a} className="text-2xs font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {d.onlyInB.map((a) => (
                                  <span key={a} className="text-2xs font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {d.inBoth.map((a) => (
                                  <span key={a} className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------- VERSION HISTORY MODAL ---------- */}
      {historyOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" /> {t('versionHistory')}: <span className="text-purple-300">{selectedTemplate.name}</span>
              </h4>
              <button onClick={() => setHistoryOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-2xs font-mono text-zinc-500">
              {t('currentVersion')}: <span className="text-amber-300 font-bold">v{selectedTemplate.version ?? 1}</span>
            </div>
            <div className="space-y-2">
              {(selectedTemplate.history ?? []).slice().reverse().map((h, i) => (
                <div key={i} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t(`historyActions.${h.action}`) ?? h.action}</span>
                    <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                      v{h.version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-2xs font-mono text-zinc-500">
                    <span>{h.actor}</span>
                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                  {h.note && <p className="text-2xs text-zinc-400">{h.note}</p>}
                </div>
              ))}
              {!selectedTemplate.history?.length && (
                <p className="text-center text-xs text-zinc-600 py-6">{t('noHistory')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
