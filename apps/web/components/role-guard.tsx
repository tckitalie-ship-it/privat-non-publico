"use client";

import { ReactNode, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: Role[];
  fallback?: ReactNode;
};

type JwtPayload = {
  role?: string | null;
};

function readJwtRole(token: string): Role | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      normalized +
      "=".repeat((4 - (normalized.length % 4)) % 4);

    const decoded = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map(
          (character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        )
        .join(""),
    );

    const payloadData = JSON.parse(decoded) as JwtPayload;

    if (
      payloadData.role === "OWNER" ||
      payloadData.role === "ADMIN" ||
      payloadData.role === "MEMBER"
    ) {
      return payloadData.role;
    }

    return null;
  } catch {
    return null;
  }
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setRole(token ? readJwtRole(token) : null);
  }, []);

  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  if (!role) {
    return <>{fallback}</>;
  }

  return allowedRoles.includes(role) ? <>{children}</> : <>{fallback}</>;
}
