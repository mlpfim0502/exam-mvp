// src/components/LiffProvider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import LoadingScreen from './LoadingScreen';

interface LiffProfile {
  userId: string;       // LINE userId
  displayName: string;
  pictureUrl?: string;
}

interface LiffContextValue {
  isInitialized: boolean;
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  supabaseUserId: string | null; // UUID from our users table
  error: string | null;
}

const LiffContext = createContext<LiffContextValue>({
  isInitialized: false,
  isLoggedIn: false,
  profile: null,
  supabaseUserId: null,
  error: null,
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiffContextValue>({
    isInitialized: false,
    isLoggedIn: false,
    profile: null,
    supabaseUserId: null,
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Dynamic import avoids SSR issues with LIFF
        const liff = (await import('@line/liff')).default;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

        if (!liffId) {
          throw new Error('NEXT_PUBLIC_LIFF_ID is not set in .env.local');
        }

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          // In LINE browser: auto-redirect to login
          // In external browser: redirect to LINE login page
          liff.login();
          return; // component stays in loading state during redirect
        }

        const lineProfile = await liff.getProfile();

        // 1. Check if user exists first
        let user;
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('line_id', lineProfile.userId)
          .maybeSingle();

        if (fetchError) {
          throw new Error(`Supabase fetch failed: ${fetchError.message}`);
        }

        if (existingUser) {
          if (existingUser.is_blocked) {
            throw new Error('Your account has been blocked by the administrator.');
          }
          
          // Update profile if changed
          if (
            existingUser.display_name !== lineProfile.displayName ||
            existingUser.avatar_url !== lineProfile.pictureUrl
          ) {
            await supabase
              .from('users')
              .update({
                display_name: lineProfile.displayName,
                avatar_url: lineProfile.pictureUrl ?? null,
              })
              .eq('id', existingUser.id);
          }
          user = existingUser;
        } else {
          // 2. Insert new user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              line_id: lineProfile.userId,
              display_name: lineProfile.displayName,
              avatar_url: lineProfile.pictureUrl ?? null,
            })
            .select('*')
            .single();

          if (insertError) {
            throw new Error(`Supabase insert failed: ${insertError.message}`);
          }
          user = newUser;
        }

        setState({
          isInitialized: true,
          isLoggedIn: true,
          profile: {
            userId: lineProfile.userId,
            displayName: lineProfile.displayName,
            pictureUrl: lineProfile.pictureUrl,
          },
          supabaseUserId: user.id,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState({
          isInitialized: true,
          isLoggedIn: false,
          profile: null,
          supabaseUserId: null,
          error: message,
        });
        console.error('[LiffProvider] Initialization error:', message);
      }
    };

    init();
  }, []);

  // Block render until LIFF has initialized
  if (!state.isInitialized) {
    return <LoadingScreen message="Connecting to LINE..." />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
        <div className="bg-white rounded-2xl shadow p-6 max-w-sm w-full text-center">
          <p className="text-red-500 font-semibold mb-2">Initialization Error</p>
          <p className="text-gray-600 text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return <LiffContext.Provider value={state}>{children}</LiffContext.Provider>;
}

export const useLiff = () => useContext(LiffContext);
