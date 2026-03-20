// src/app/admin/login/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { adminLogin } from '@/app/admin/actions';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('password', password);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-50 p-3 rounded-2xl">
            <Lock size={24} className="text-indigo-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center mb-6">Admin Access</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
              ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
