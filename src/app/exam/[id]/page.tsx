// src/app/exam/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLiff } from '@/components/LiffProvider';
import { useExam } from '@/hooks/useExam';
import { supabase } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import LoadingScreen from '@/components/LoadingScreen';

export default function ExamPage() {
  const params             = useParams<{ id: string }>();
  const router             = useRouter();
  const { supabaseUserId } = useLiff();
  const { exam, questions, loading, error } = useExam(params.id);

  // answers: { [questionId]: selectedKey }
  const [answers, setAnswers]           = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft]         = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId]       = useState<string | null>(null);

  // Create an attempt record when exam loads
  useEffect(() => {
    if (!exam || !supabaseUserId) return;
    const createAttempt = async () => {
      const { data } = await supabase
        .from('exam_attempts')
        .insert({ user_id: supabaseUserId, exam_id: exam.id })
        .select('id')
        .single();
      if (data) setAttemptId(data.id);
    };
    createAttempt();
  }, [exam, supabaseUserId]);

  // Initialise timer once when exam loads
  useEffect(() => {
    if (!exam?.time_limit_minutes) return;
    setTimeLeft(exam.time_limit_minutes * 60);
  }, [exam]);

  // Countdown tick
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const answeredCount = Object.keys(answers).length;
  const totalCount    = questions.length;
  const progress      = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !attemptId) return;
    setIsSubmitting(true);

    try {
      // 1. Autograde: compare user response to correct answer
      const gradedAnswers = questions.map((q) => ({
        attempt_id:    attemptId,
        question_id:   q.id,
        user_response: answers[q.id] ?? '',
        is_correct:    (answers[q.id] ?? '').toUpperCase() === q.answer.toUpperCase(),
      }));

      const correctCount = gradedAnswers.filter((a) => a.is_correct).length;
      const score        = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      // 2. Save attempt_answers
      await supabase.from('attempt_answers').insert(gradedAnswers);

      // 3. Update exam_attempt with score and completed status
      await supabase
        .from('exam_attempts')
        .update({ score, is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', attemptId);

      // 4. Navigate to results page
      router.push(`/exam/${params.id}/results?attemptId=${attemptId}`);
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading exam..." />;
  if (error || !exam) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertCircle className="mx-auto mb-2" />
        {error ?? 'Exam not found.'}
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400">Exam</p>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{exam.title}</p>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold
              ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
              <Clock size={15} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {answeredCount} / {totalCount} answered
        </p>
      </div>

      {/* Questions */}
      <div className="px-4 pt-4 space-y-4">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            selected={answers[q.id] ?? null}
            onSelect={(value) => handleSelect(q.id, value)}
          />
        ))}
      </div>

      {/* Floating submit button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
        {answeredCount < totalCount && (
          <p className="text-center text-xs text-amber-500 mb-2">
            {totalCount - answeredCount} question{totalCount - answeredCount > 1 ? 's' : ''} unanswered
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white transition-all
            ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-200'}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Submit Exam
            </>
          )}
        </button>
      </div>
    </div>
  );
}
