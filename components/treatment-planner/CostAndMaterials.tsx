'use client';

import React, { useState } from 'react';
import { DollarSign, Package, CheckSquare, Plus } from 'lucide-react';

export interface MaterialItem {
  id: string;
  name: string;
  checked: boolean;
}

interface CostAndMaterialsProps {
  totalCost: number;
  setTotalCost: (val: number) => void;
  materials: MaterialItem[];
  setMaterials: (val: MaterialItem[]) => void;
  labWork: MaterialItem[];
  setLabWork: (val: MaterialItem[]) => void;
}

export default function CostAndMaterials({
  totalCost, setTotalCost,
  materials, setMaterials,
  labWork, setLabWork
}: CostAndMaterialsProps) {

  const [newMaterialName, setNewMaterialName] = useState('');
  const [newLabName, setNewLabName] = useState('');

  const handleToggle = (setter: (val: MaterialItem[]) => void, list: MaterialItem[], id: string) => {
    setter(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAdd = (setter: (val: MaterialItem[]) => void, list: MaterialItem[], name: string, resetName: () => void) => {
    if (name.trim()) {
      setter([...list, { id: Math.random().toString(36).substr(2, 9), name: name.trim(), checked: false }]);
      resetName();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2 space-y-6">
        {/* Required Materials & Checklist */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> Required Materials & Inventory
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd(setMaterials, materials, newMaterialName, () => setNewMaterialName(''))}
                placeholder="New item..."
                className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 w-32"
              />
              <button
                onClick={() => handleAdd(setMaterials, materials, newMaterialName, () => setNewMaterialName(''))}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg text-zinc-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {materials.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggle(setMaterials, materials, item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.checked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                  item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-zinc-950'
                }`}>
                  {item.checked && <CheckSquare className="w-3 h-3 text-black" />}
                </div>
                <span className={`text-xs ${item.checked ? 'text-emerald-400 line-through opacity-70' : 'text-zinc-300'}`}>
                  {item.name}
                </span>
              </div>
            ))}
            {materials.length === 0 && (
              <p className="text-xs text-zinc-600 italic col-span-full">No specific materials flagged for this plan.</p>
            )}
          </div>
        </div>

        {/* Required Lab Work */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-400" /> Required Lab Work & Prescriptions
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLabName}
                onChange={(e) => setNewLabName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd(setLabWork, labWork, newLabName, () => setNewLabName(''))}
                placeholder="New lab Rx..."
                className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500/50 w-32"
              />
              <button
                onClick={() => handleAdd(setLabWork, labWork, newLabName, () => setNewLabName(''))}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg text-zinc-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {labWork.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggle(setLabWork, labWork, item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.checked ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  item.checked ? 'bg-purple-500 border-purple-500' : 'border-zinc-600 bg-zinc-950'
                }`}>
                  {item.checked && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
                <span className={`text-xs ${item.checked ? 'text-purple-400' : 'text-zinc-300'}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 h-fit space-y-6">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-900/60 pb-3">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Treatment Cost Summary
        </h4>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold font-mono text-zinc-500 uppercase block mb-1">Estimated Base Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">$</span>
              <input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 pl-8 rounded-xl text-lg font-mono font-bold text-white focus:border-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900/60 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Estimated Insurance</span>
              <span className="text-amber-500">- ${(totalCost * 0.4).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-2 border-t border-zinc-900/60">
              <span>Patient Responsibility</span>
              <span className="text-emerald-400">${(totalCost * 0.6).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
