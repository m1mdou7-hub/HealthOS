import React from 'react';
import { Patient } from '../PatientWorkspace';
import { Modal, Input, Select, Textarea, Button } from '@/components/ui/design-system';

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
  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={editingPatient ? 'Modify Clinical Patient Record' : 'Register New Patient Profile'}
      description="Core demographics, alerts, and clinical background for the EHR directory."
      size="lg"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="patient-details-form">
            Save Record
          </Button>
        </>
      }
    >
      <form id="patient-details-form" onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
        <Input
          label="Patient Name"
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email Contact"
          type="email"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
        />
        <Input
          label="Phone Contact"
          type="text"
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Age"
            type="number"
            value={form.age}
            onChange={(e) => onChange({ ...form, age: Number(e.target.value) })}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(e) => onChange({ ...form, gender: e.target.value })}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Non-binary', label: 'Non-binary' }
            ]}
          />
        </div>
        <Input
          label="Blood Group"
          type="text"
          value={form.bloodGroup}
          onChange={(e) => onChange({ ...form, bloodGroup: e.target.value })}
        />
        <Select
          label="Medical Status"
          value={form.status}
          onChange={(e) => onChange({ ...form, status: e.target.value as any })}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'New', label: 'New' },
            { value: 'Under Treatment', label: 'Under Treatment' },
            { value: 'Completed', label: 'Completed' }
          ]}
        />
        <Input
          label="Systemic Medical Alerts (Comma separated)"
          type="text"
          value={form.medicalAlerts}
          onChange={(e) => onChange({ ...form, medicalAlerts: e.target.value })}
          placeholder="e.g. Type II Diabetes, Hypertension"
        />
        <Input
          label="Drug Allergies (Comma separated)"
          type="text"
          value={form.allergies}
          onChange={(e) => onChange({ ...form, allergies: e.target.value })}
          placeholder="e.g. Penicillin, Latex"
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Clinical Background Summary"
            value={form.summary}
            onChange={(e) => onChange({ ...form, summary: e.target.value })}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
