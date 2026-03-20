import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function QbankIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <BookOpen size={48} className="text-indigo-200" />
      <h2 className="text-lg font-semibold text-gray-700">Select a subject</h2>
      <p className="text-sm text-gray-400">Go to the Class tab and pick a subject to start practicing.</p>
      <Link
        href="/"
        className="mt-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-2xl"
      >
        Go to Class
      </Link>
    </div>
  );
}
