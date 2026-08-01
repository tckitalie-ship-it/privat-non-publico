"use client";

import React from "react";

interface MembersToolbarProps {
  search: string;
  roleFilter: string[]; // MULTI ROLE
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (roles: string[]) => void;
}

const ROLES = ["OWNER", "ADMIN", "MEMBER"];

export default function MembersToolbar({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: MembersToolbarProps) {
  function toggleRole(role: string) {
    if (roleFilter.includes(role)) {
      onRoleFilterChange(roleFilter.filter((r) => r !== role));
    } else {
      onRoleFilterChange([...roleFilter, role]);
    }
  }

  function resetFilters() {
    onSearchChange("");
    onRoleFilterChange([]);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      {/* ===================== SEARCH ===================== */}
      <input
        type="text"
        placeholder="🔍 Cerca..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 lg:w-80"
      />

      {/* ===================== MULTI ROLE ===================== */}
      <div className="flex flex-wrap items-center gap-4">
        {ROLES.map((role) => {
          const active = roleFilter.includes(role);

          return (
            <label
              key={role}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleRole(role)}
                className="h-4 w-4 cursor-pointer rounded border-slate-400 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700">
                {role}
              </span>
            </label>
          );
        })}

        {/* ===================== RESET BUTTON ===================== */}
        <button
          onClick={resetFilters}
          className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
        >
          Reset filtri
        </button>
      </div>
    </div>
  );
}
