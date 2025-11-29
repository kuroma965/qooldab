'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client wrapper around next-auth SessionProvider.
 * Accepts `session` prop coming from server (getServerSession).
 */
export default function SessionClientProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
