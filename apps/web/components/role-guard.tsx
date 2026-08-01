'use client';

import { ReactNode } from 'react';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: (
    | 'OWNER'
    | 'ADMIN'
    | 'MEMBER'
  )[];
};

export default function RoleGuard({
  children,
}: RoleGuardProps) {
  return <>{children}</>;
}