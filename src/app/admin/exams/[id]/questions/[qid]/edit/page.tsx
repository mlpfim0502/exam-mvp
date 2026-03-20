'use client';

import { useState, useTransition, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { updateQuestion } from '@/app/admin/actions';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/lib/types';

type QType = 'MCQ' | 'TF';

export default function AdminEditQuestionPage() {
  const { id, qid } = useParams<{ id: string; qid: string }>();
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const [qType, setQType] = useState<QType>('MCQ');
  const [stem, setStem] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [answer, setAnswer] = useState('A');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    supabase
      .from('questions')
      .select('*')
      .eq('id', qid)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setQuestion(data);
          setQType(data.type);
          setStem(data.stem);
          setOptA(data.opt_a ?? '');
          setOptB(data.opt_b ?? '');
          setOptC(data.opt_c ?? '');
          setOptD(data.opt_d ?? '');
          setAnswer(data.answer);
          setExplanation(data.explanation ?? '');
        }
        setLoading(false);
      });
  }, [qid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('type', qType);
    formData.set('stem', stem);
    formData.set('answer', answer);
    if (qType === 'MCQ') {
      if (optA) formData.set('opt_a', optA);
      if (optB) formData.set('opt_b', optB);
      if (optC) formData.set('opt_c', optC);
      if (optD) formData.set('opt_d', optD);
    }
    if (explanation) formData.set('explanation', explanation);

    startTransition(async () => {
      const result = await updateQuestion(qid, id, formData);
      if (result?.error) toast.error(result.error);
    });
  };

  if (loading) return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
  if (!question) return <p className="text-gray-400">Question not found.</p>;

  return (
    <div className="max-w-lg">
      <Link
        href={`/admin/exams/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> Back to exam
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Question</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-2">
            {(['MCQ', 'TF'] as QType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setQType(t);
                  setAnswer(t === 'TF' ? 'T' : 'A');
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  qType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'MCQ' ? 'Multiple Choice' : 'True / False'}
              </button>
            ))}
          </div>
        </div>

        {/* Stem */}
        <div>
          <label htmlFor="stem" className="block text-sm font-medium text-gray-700 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            id="stem"
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            rows={3}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* MCQ options */}
        {qType === 'MCQ' && (
          <>
            {[
              { label: 'A', value: optA, set: setOptA },
              { label: 'B', value: optB, set: setOptB },
              { label: 'C', value: optC, set: setOptC },
              { label: 'D', value: optD, set: setOptD },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer <span className="text-red-500">*</span>
              </label>
              <select
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </>
        )}

        {/* TF answer */}
        {qType === 'TF' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[{ label: 'True', val: 'T' }, { label: 'False', val: 'F' }].map(({ label, val }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAnswer(val)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    answer === val
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
            Explanation (optional)
          </label>
          <textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
            ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
