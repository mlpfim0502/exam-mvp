// src/components/QuestionCard.tsx
'use client';

import type { Question } from '@/lib/types';

interface Props {
  question: Question;
  selected: string | null; // currently selected answer key ('A', 'B', ... or 'T', 'F')
  onSelect: (value: string) => void;
}

// Map option key to question field
const MCQ_OPTIONS: Array<{ key: string; field: keyof Question }> = [
  { key: 'A', field: 'opt_a' },
  { key: 'B', field: 'opt_b' },
  { key: 'C', field: 'opt_c' },
  { key: 'D', field: 'opt_d' },
  { key: 'E', field: 'opt_e' },
];

const TF_OPTIONS = [
  { key: 'T', label: 'True' },
  { key: 'F', label: 'False' },
];

export default function QuestionCard({ question, selected, onSelect }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      {/* Question number badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">
          Q{question.q_num}
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {question.type === 'MCQ' ? 'Multiple Choice' : 'True / False'}
        </span>
      </div>

      {/* Stem */}
      <p className="text-gray-800 font-medium leading-relaxed mb-3">{question.stem}</p>

      {/* Stem image (if present) */}
      {question.stem_img_url && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
          <img
            src={question.stem_img_url}
            alt={`Question ${question.q_num} image`}
            className="w-full object-contain max-h-48"
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {question.type === 'MCQ'
          ? MCQ_OPTIONS.filter(({ field }) => question[field] !== null).map(({ key, field }) => (
              <OptionButton
                key={key}
                optKey={key}
                label={question[field] as string}
                selected={selected === key}
                onSelect={onSelect}
              />
            ))
          : TF_OPTIONS.map(({ key, label }) => (
              <OptionButton
                key={key}
                optKey={key}
                label={label}
                selected={selected === key}
                onSelect={onSelect}
              />
            ))}
      </div>
    </div>
  );
}

function OptionButton({
  optKey,
  label,
  selected,
  onSelect,
}: {
  optKey: string;
  label: string;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(optKey)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
        ${selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-indigo-200'}`}
    >
      <span
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
          ${selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'}`}
      >
        {optKey}
      </span>
      <span className="text-sm leading-snug">{label}</span>
    </button>
  );
}
