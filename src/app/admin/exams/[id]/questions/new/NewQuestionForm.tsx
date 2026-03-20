'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createQuestionForm } from '@/actions/admin';

interface Props {
  examId: string;
  examTitle: string;
  nextQNum: number;
}

export default function NewQuestionForm({ examId, examTitle, nextQNum }: Props) {
  const [type, setType] = useState<'MCQ' | 'TF'>('MCQ');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createQuestionForm(formData);
      router.push(`/admin/exams/${examId}`);
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/exams/${examId}`} className="text-gray-400 hover:text-indigo-600 transition">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Question</h2>
          <p className="text-gray-500 text-sm">{examTitle} · Q{nextQNum}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
        {/* Hidden fields */}
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="q_num" value={nextQNum} />

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Type *</label>
          <select
            name="type"
            required
            value={type}
            onChange={e => setType(e.target.value as 'MCQ' | 'TF')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
          >
            <option value="MCQ">MCQ — Multiple Choice</option>
            <option value="TF">TF — True / False</option>
          </select>
        </div>

        {/* Stem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Stem *</label>
          <textarea
            name="stem"
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            placeholder="Enter the question text…"
          />
        </div>

        {/* MCQ Options — only shown when type is MCQ */}
        {type === 'MCQ' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {['A', 'B', 'C', 'D', 'E'].map(letter => (
              <div key={letter} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-4">{letter}.</span>
                <input
                  type="text"
                  name={`opt_${letter.toLowerCase()}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder={`Option ${letter}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
          <select
            name="answer"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
          >
            {type === 'MCQ' ? (
              <>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </>
            ) : (
              <>
                <option value="T">True</option>
                <option value="F">False</option>
              </>
            )}
          </select>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
          <textarea
            name="explanation"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            placeholder="Optional explanation shown after the answer…"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
          <Link href={`/admin/exams/${examId}`} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Question'}
          </button>
        </div>
      </form>
    </div>
  );
}
