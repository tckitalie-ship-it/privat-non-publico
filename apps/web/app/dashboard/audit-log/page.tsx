"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  Bell,
  CalendarDays,
  Coins,
  FileText,
  Mail,
  Settings,
  ShieldCheck,
  User,
  Users,
  Building2,
  Clock3,
} from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  category: string;
  details?: Record<string, unknown> | null;
  userId?: string | null;
  actorId?: string | null;
  associationId?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    email?: string | null;
  } | null;
  user?: {
    id: string;
    email?: string | null;
  } | null;
  association?: {
    id: string;
    name?: string | null;
  } | null;
};

type AuditResponse = {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Summary = {
  total?: number;
  today?: number;
  categories?: Record<string, number>;
  actions?: Record<string, number>;
};

const LIMIT = 20;

function getAssociationId() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("associationId") ||
    localStorage.getItem("activeAssociationId") ||
    localStorage.getItem("active_association_id") ||
    ""
  );
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatDetails(details?: Record<string, unknown> | null) {
  if (!details) return "";

  const entries = Object.entries(details).filter(
    ([key, value]) =>
      value !== null &&
      value !== undefined &&
      key !== "password" &&
      key !== "token"
  );

  if (!entries.length) return "";

  return entries
    .slice(0, 4)
    .map(([key, value]) => {
      let text = "";

      if (typeof value === "object") {
        try {
          text = JSON.stringify(value);
        } catch {
          text = String(value);
        }
      } else {
        text = String(value);
      }

      return `${key}: ${text}`;
    })
    .join(" • ");
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    AUTH: "Autenticazione",
    USER: "Utenti",
    MEMBERSHIP: "Membri",
    ASSOCIATION: "Associazione",
    EVENT: "Eventi",
    FINANCE: "Finanze",
    FILE: "File",
    INVITATION: "Inviti",
    REMINDER: "Promemoria",
    NOTIFICATION: "Notifiche",
    SYSTEM: "Sistema",
  };

  return labels[category] || category;
}

function actionLabel(action: string) {
  return action
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryIcon(category: string) {
  const icons: Record<string, React.ElementType> = {
    AUTH: ShieldCheck,
    USER: User,
    MEMBERSHIP: Users,
    ASSOCIATION: Building2,
    EVENT: CalendarDays,
    FINANCE: Coins,
    FILE: FileText,
    INVITATION: Mail,
    REMINDER: Clock3,
    NOTIFICATION: Bell,
    SYSTEM: Settings,
  };

  return icons[category] || Activity;
}

export default function AuditLogPage() {
  const [associationId, setAssociationId] = useState("");

  const [data, setData] = useState<AuditResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 0,
  });

  const [summary, setSummary] = useState<Summary>({});

  const [categories, setCategories] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getAssociationId();
    setAssociationId(id);
  }, []);

  async function loadAuditLog(currentPage = page) {
    if (!associationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      if (action) {
        params.set("action", action);
      }

      params.set("page", String(currentPage));
      params.set("limit", String(LIMIT));

      const response = await fetch(
        `/api/audit-log/${associationId}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
            "x-association-id": associationId,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const message = await response.text().catch(() => "");

        console.error(
          "Audit Log HTTP error:",
          response.status,
          message
        );

        throw new Error(
          `Errore Audit Log: ${response.status}`
        );
      }

      const result = await response.json();

      setData({
        items: Array.isArray(result.items) ? result.items : [],
        total: Number(result.total || 0),
        page: Number(result.page || currentPage),
        limit: Number(result.limit || LIMIT),
        totalPages: Number(result.totalPages || 0),
      });
    } catch (err) {
      console.error("Audit Log:", err);
      setError("Impossibile caricare il registro attività .");
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    if (!associationId) {
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);

    try {
      const response = await fetch(
        `/api/audit-log/summary/${associationId}`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
            "x-association-id": associationId,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error(
          "Audit summary HTTP error:",
          response.status
        );
        return;
      }

      const result = await response.json();
      setSummary(result || {});
    } catch (err) {
      console.error("Audit summary error:", err);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadFilters() {
    if (!associationId) return;

    try {
      const authHeaders = getAuthHeaders();

      const [categoriesResponse, actionsResponse] =
        await Promise.all([
          fetch(
            `/api/audit-log/categories/${associationId}`,
            {
              method: "GET",
              headers: {
                ...authHeaders,
                "x-association-id": associationId,
              },
              cache: "no-store",
            }
          ),
          fetch(
            `/api/audit-log/actions/${associationId}`,
            {
              method: "GET",
              headers: {
                ...authHeaders,
                "x-association-id": associationId,
              },
              cache: "no-store",
            }
          ),
        ]);

      if (categoriesResponse.ok) {
        const result = await categoriesResponse.json();

        const values = Array.isArray(result)
          ? result
          : Array.isArray(result?.items)
            ? result.items
            : [];

        setCategories(
          values
            .map((item: unknown) => {
              if (typeof item === "string") {
                return item;
              }

              if (
                item &&
                typeof item === "object" &&
                "category" in item
              ) {
                return String(
                  (item as { category?: unknown }).category || ""
                );
              }

              return "";
            })
            .filter(Boolean)
        );
      }

      if (actionsResponse.ok) {
        const result = await actionsResponse.json();

        const values = Array.isArray(result)
          ? result
          : Array.isArray(result?.items)
            ? result.items
            : [];

        setActions(
          values
            .map((item: unknown) => {
              if (typeof item === "string") {
                return item;
              }

              if (
                item &&
                typeof item === "object" &&
                "action" in item
              ) {
                return String(
                  (item as { action?: unknown }).action || ""
                );
              }

              return "";
            })
            .filter(Boolean)
        );
      }
    } catch (err) {
      console.error("Audit filters error:", err);
    }
  }

  useEffect(() => {
    if (!associationId) return;

    loadAuditLog(1);
    loadSummary();
    loadFilters();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associationId]);

  useEffect(() => {
    if (!associationId) return;

    const timer = window.setTimeout(() => {
      setPage(1);
      loadAuditLog(1);
    }, 350);

    return () => window.clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, action]);

  const stats = useMemo(() => {
    const total =
      typeof summary.total === "number"
        ? summary.total
        : data.total;

    const today =
      typeof summary.today === "number"
        ? summary.today
        : 0;

    const categoryCount = categories.length;

    return {
      total,
      today,
      categoryCount,
    };
  }, [summary, data.total, categories]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setAction("");
    setPage(1);
  }

  async function changePage(nextPage: number) {
    if (
      nextPage < 1 ||
      (data.totalPages > 0 &&
        nextPage > data.totalPages)
    ) {
      return;
    }

    setPage(nextPage);
    await loadAuditLog(nextPage);
  }

  if (!associationId) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-xl font-semibold text-amber-900">
              Nessuna associazione selezionata
            </h1>

            <p className="mt-2 text-sm text-amber-800">
              Seleziona un&apos;associazione per visualizzare
              il registro attività .
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Audit Log
                  </h1>

                  <p className="text-sm text-slate-300">
                    Registro delle attività dell'associazione
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                loadAuditLog(page);
                loadSummary();
                loadFilters();
              }}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20"
            >
              ↻ Aggiorna
            </button>
          </div>
        </section>

        {/* KPI */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Attività registrate
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summaryLoading ? "â€¦" : stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-xl">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Attività di oggi
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summaryLoading ? "â€¦" : stats.today}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-xl">
                🕐
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Categorie utilizzate
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summaryLoading ? "â€¦" : stats.categoryCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-xl">
                🗂️
              </div>
            </div>
          </div>
        </section>

        {/* FILTRI */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cerca
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cerca attività , utente, dettagli..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoria
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              >
                <option value="">Tutte</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {categoryLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Azione
              </label>

              <select
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              >
                <option value="">Tutte</option>

                {actions.map((item) => (
                  <option key={item} value={item}>
                    {actionLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(search || category || action) && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                Filtri attivi
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                Azzera filtri
              </button>
            </div>
          )}
        </section>

        {/* ERRORE */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LISTA */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  attività  recenti
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {data.total} attività  trovate
                </p>
              </div>

              {loading && (
                <div className="text-sm text-slate-500">
                  Caricamento...
                </div>
              )}
            </div>
          </div>

          {loading && data.items.length === 0 ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl"><Activity className="h-10 w-10" /></div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Nessuna attività  trovata
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Prova a modificare i filtri di ricerca.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.items.map((item) => {
                const actorEmail =
                  item.actor?.email ||
                  item.user?.email ||
                  "Sistema";

                const details = formatDetails(item.details);

                return (
                  <div
                    key={item.id}
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                        {(() => { const Icon = categoryIcon(item.category); return <Icon className="h-5 w-5" />; })()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {actionLabel(item.action)}
                              </h3>

                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {categoryLabel(item.category)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {actorEmail}
                            </p>
                          </div>

                          <time className="shrink-0 text-xs text-slate-400">
                            {formatDate(item.createdAt)}
                          </time>
                        </div>

                        {details && (
                          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                            {details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINAZIONE */}
          {data.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Pagina {data.page} di {data.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1 || loading}
                  onClick={() =>
                    changePage(data.page - 1)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Precedente
                </button>

                <button
                  type="button"
                  disabled={
                    data.page >= data.totalPages ||
                    loading
                  }
                  onClick={() =>
                    changePage(data.page + 1)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Successiva ←’
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}







