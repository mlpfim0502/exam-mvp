// src/app/exam/[id]/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/LoadingScreen';
import type { ExamAttempt, Question, ReviewItem } from '@/lib/types';

const MCQ_OPTIONS: Array<{ key: string; field: keyof Question }> = [
  { key: 'A', field: 'opt_a' },
  { key: 'B', field: 'opt_b' },
  { key: 'C', field: 'opt_c' },
  { key: 'D', field: 'opt_d' },
  { key: 'E', field: 'opt_e' },
];

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const attemptId    = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [items, setItems]     = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID found.');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      // 1. Fetch the attempt
      const { data: attemptData, error: attemptErr } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptErr || !attemptData) {
        setError('Could not load results.');
        setLoading(false);
        return;
      }
      setAttempt(attemptData);

      // 2. Fetch attempt_answers joined with questions
      const { data: answers, error: answersErr } = await supabase
        .from('attempt_answers')
        .select('*, questions(*)')
        .eq('attempt_id', attemptId);

      if (answersErr) {
        setError(answersErr.message);
        setLoading(false);
        return;
      }

      const reviewItems: ReviewItem[] = (answers ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((a: any) => ({
          question:     a.questions as Question,
          userResponse: a.user_response ?? '',
          isCorrect:    a.is_correct ?? false,
        }))
        .sort((a: ReviewItem, b: ReviewItem) => a.question.q_num - b.question.q_num);

      setItems(reviewItems);
      setLoading(false);
    };

    fetchResults();
  }, [attemptId]);

  if (loading) return <LoadingScreen message="Loading results..." />;
  if (error || !attempt) {
    return <div className="p-6 text-center text-red-500">{error ?? 'Error loading results.'}</div>;
  }

  const score    = attempt.score ?? 0;
  const passMark = 60;
  const passed   = score >= passMark;

  return (
    <div className="pb-10">
      {/* Score header */}
      <div className={`px-5 pt-10 pb-8 text-white ${passed
        ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
        : 'bg-gradient-to-br from-rose-500 to-pink-500'}`}>
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={22} />
          <h1 className="text-xl font-bold">Results</h1>
        </div>
        <div className="text-center">
          <p className="text-7xl font-extrabold">
            {score}<span className="text-3xl font-bold opacity-70">%</span>
          </p>
          <p className="mt-2 text-lg font-semibold opacity-90">
            {passed ? '🎉 Well done!' : '📚 Keep practicing!'}
          </p>
          <p className="text-sm opacity-70 mt-1">
            {items.filter((i) => i.isCorrect).length} / {items.length} correct
          </p>
        </div>
      </div>

      {/* Review list */}
      <div className="px-4 pt-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Review</h2>

        {items.map(({ question, userResponse, isCorrect }) => (
          <ReviewCard
            key={question.id}
            question={question}
            userResponse={userResponse}
            isCorrect={isCorrect}
          />
        ))}
      </div>

      {/* Back to dashboard */}
      <div className="px-4 mt-6">
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function ReviewCard({
  question,
  userResponse,
  isCorrect,
}: {
  question: Question;
  userResponse: string;
  isCorrect: boolean;
}) {
  const didAnswer = userResponse !== '';

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 shadow-sm
      ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        {isCorrect ? (
          <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
        ) : (
          <XCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
        )}
        <div className="flex-1">
          <span className="text-xs font-semibold text-gray-400 mr-2">Q{question.q_num}</span>
          <span className="text-gray-800 text-sm leading-snug">{question.stem}</span>
        </div>
      </div>

      {/* Stem image */}
      {question.stem_img_url && (
        <img
          src={question.stem_img_url}
          alt=""
          className="w-full max-h-36 object-contain rounded-xl border border-gray-100 mb-3"
        />
      )}

      {/* Options */}
      <div className="space-y-1.5 mb-3">
        {question.type === 'MCQ'
          ? MCQ_OPTIONS.filter(({ field }) => question[field] !== null).map(({ key, field }) => (
              <ReviewOption
                key={key}
                optKey={key}
                label={question[field] as string}
                userSelected={userResponse === key}
                isCorrectAnswer={question.answer.toUpperCase() === key}
              />
            ))
          : [{ key: 'T', label: 'True' }, { key: 'F', label: 'False' }].map(({ key, label }) => (
              <ReviewOption
                key={key}
                optKey={key}
                label={label}
                userSelected={userResponse === key}
                isCorrectAnswer={question.answer.toUpperCase() === key}
              />
            ))}
      </div>

      {/* Unanswered notice */}
      {!didAnswer && (
        <div className="flex items-center gap-1.5 text-amber-500 text-xs mb-2">
          <HelpCircle size={13} />
          Not answered
        </div>
      )}

      {/* Explanation */}
      {(question.explanation || question.explanation_img_url) && (
        <div className="bg-blue-50 rounded-xl px-3 py-2.5 mt-2">
          <p className="text-xs font-semibold text-blue-600 mb-0.5">Explanation</p>
          {question.explanation && (
            <p className="text-xs text-blue-700 leading-relaxed">{question.explanation}</p>
          )}
          {question.explanation_img_url && (
            <img
              src={question.explanation_img_url}
              alt="Explanation diagram"
              className="mt-2 w-full object-contain rounded-lg border border-blue-100 max-h-48"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ReviewOption({
  optKey,
  label,
  userSelected,
  isCorrectAnswer,
}: {
  optKey: string;
  label: string;
  userSelected: boolean;
  isCorrectAnswer: boolean;
}) {
  let style = 'border-gray-100 bg-gray-50 text-gray-500'; // neutral
  if (isCorrectAnswer && userSelected) style = 'border-emerald-400 bg-emerald-50 text-emerald-700';
  else if (isCorrectAnswer)            style = 'border-emerald-300 bg-emerald-50 text-emerald-600';
  else if (userSelected)               style = 'border-rose-400 bg-rose-50 text-rose-600';

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 ${style}`}>
      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0
        ${isCorrectAnswer
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : userSelected
          ? 'border-rose-400 bg-rose-400 text-white'
          : 'border-gray-300 text-gray-400'}`}>
        {optKey}
      </span>
      <span className="text-sm leading-snug">{label}</span>
      {isCorrectAnswer && (
        <span className="ml-auto text-[10px] font-semibold text-emerald-600">✓ Correct</span>
      )}
      {userSelected && !isCorrectAnswer && (
        <span className="ml-auto text-[10px] font-semibold text-rose-500">Your answer</span>
      )}
    </div>
  );
}
