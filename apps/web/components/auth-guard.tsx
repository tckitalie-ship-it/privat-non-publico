'use client';

import { ReactNode } from 'react';

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}