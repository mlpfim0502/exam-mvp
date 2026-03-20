import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createQuestion } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export default async function NewQuestionPage({ params }: { params: { id: string } }) {
  const examId = params.id;

  const { data: exam } = await supabase.from('exams').select('title').eq('id', examId).single();
  if (!exam) return <div className="p-8 text-center text-red-500">Exam not found</div>;

  // Get next question number
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', examId);
  const nextQNum = (count ?? 0) + 1;

  const formAction = createQuestion.bind(null, examId);

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/exams/${examId}`} className="text-gray-400 hover:text-indigo-600 transition">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Question</h2>
          <p className="text-gray-500 text-sm">{exam.title} · Q{nextQNum}</p>
        </div>
      </div>

      <form action={formAction} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
        {/* Hidden fields */}
        <input type="hidden" name="q_num" value={nextQNum} />

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Type *</label>
          <select
            name="type"
            required
            id="question-type"
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

        {/* MCQ Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Options (MCQ only)</label>
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

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
          <select
            name="answer"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
          >
            <optgroup label="MCQ">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </optgroup>
            <optgroup label="True / False">
              <option value="T">True</option>
              <option value="F">False</option>
            </optgroup>
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
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition">
            Save Question
          </button>
        </div>
      </form>
    </div>
  );
}
