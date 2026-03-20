'use client';

import { useState } from 'react';
import type { Exam } from '@/lib/types';

type Mode = 'memory' | 'practice' | 'test';
type Order = 'random' | 'order';

export interface StartOptions {
  mode: Mode;
  order: Order;
  questionCount: 'all' | number;
}

interface Props {
  exam: Exam;
  onClose: () => void;
  onStart: (options: StartOptions) => void;
}

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: 'memory', label: 'Memory', desc: 'See Q & A together' },
  { value: 'practice', label: 'Practice', desc: 'Answer, then see result' },
  { value: 'test', label: 'Test', desc: 'Submit all, then see results' },
];

export default function ExamModeSheet({ exam, onClose, onStart }: Props) {
  const [mode, setMode] = useState<Mode>('practice');
  const [order, setOrder] = useState<Order>('random');

  const handleStart = () => {
    onStart({ mode, order, questionCount: 'all' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="sheet-backdrop"
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-2xl z-50 p-5 pb-8">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="text-base font-bold text-gray-800 mb-4">{exam.title}</h3>

        {/* Mode selection */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode</p>
        <div className="space-y-2 mb-5">
          {MODES.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                mode === value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  mode === value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                }`}
              />
              <div className="text-left">
                <p className={`text-sm font-medium ${mode === value ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Order */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order</p>
        <div className="flex gap-2 mb-6">
          {(['random', 'order'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrder(o)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                order === o
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-100 bg-gray-50 text-gray-500'
              }`}
            >
              {o === 'random' ? 'Random' : 'In Order'}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl active:bg-indigo-700 transition-colors"
        >
          Start
        </button>
      </div>
    </>
  );
}
