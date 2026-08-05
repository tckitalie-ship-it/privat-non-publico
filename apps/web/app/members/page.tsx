"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { toast } from "sonner";

import MembersHeader from "@/components/members/MembersHeader";
import MembersInviteForm from "@/components/members/MembersInviteForm";
import MembersList from "@/components/members/MembersList";
import MembersPendingInvitations from "@/components/members/MembersPendingInvitations";
import MembersToolbar from "@/components/members/MembersToolbar";

import { API_URL, getAccessToken } from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Membership = {
  id: string;
  role: Role;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
};

export default function MembersPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);

    const token = getAccessToken();

    if (!token) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/memberships`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore caricamento membri (${response.status})`,
        );
      }

      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore caricamento membri:", error);
      setMembers([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile caricare i membri",
      );
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    setLoadingInvitations(true);

    const token = getAccessToken();

    if (!token) {
      setInvitations([]);
      setLoadingInvitations(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/invitations`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore caricamento inviti (${response.status})`,
        );
      }

      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore caricamento inviti:", error);
      setInvitations([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile caricare gli inviti",
      );
    } finally {
      setLoadingInvitations(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([fetchMembers(), fetchInvitations()]);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchMembers, fetchInvitations]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Inserisci un indirizzo email");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setLoadingInvite(true);

      const response = await fetch(`${API_URL}/invitations`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore invio invito (${response.status})`,
        );
      }

      setEmail("");
      setRole("MEMBER");

      toast.success("Invito inviato");
      setShowInviteForm(false);
      await fetchInvitations();
    } catch (error) {
      console.error("Errore invio invito:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile inviare l'invito",
      );
    } finally {
      setLoadingInvite(false);
    }
  }

  async function removeMember(id: string) {
    const confirmed = window.confirm(
      "Vuoi davvero rimuovere questo membro?",
    );

    if (!confirmed) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/memberships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore rimozione membro (${response.status})`,
        );
      }

      toast.success("Membro rimosso");
      await fetchMembers();
    } catch (error) {
      console.error("Errore rimozione membro:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile rimuovere il membro",
      );
    }
  }

  async function removeInvitation(id: string) {
    const confirmed = window.confirm(
      "Vuoi davvero eliminare questo invito?",
    );

    if (!confirmed) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/invitations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore rimozione invito (${response.status})`,
        );
      }

      toast.success("Invito eliminato");
      await fetchInvitations();
    } catch (error) {
      console.error("Errore rimozione invito:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile eliminare l'invito",
      );
    }
  }

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter.length === 0 || roleFilter.includes(member.role);

      return matchesSearch && matchesRole;
    });
  }, [members, roleFilter, search]);

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <MembersHeader
        membersCount={members.length}
        invitationsCount={invitations.length}
        onInviteClick={() => setShowInviteForm((current) => !current)}
      />

      {showInviteForm && (
        <MembersInviteForm
          email={email}
          role={role}
          loading={loadingInvite}
          onEmailChange={setEmail}
          onRoleChange={setRole}
          onSubmit={handleInvite}
        />
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Dashboard
      </Link>

      <h2 className="text-lg font-semibold text-white">Membri</h2>

      <MembersToolbar
        search={search}
        roleFilter={roleFilter}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
      />

      <MembersList
        members={filteredMembers}
        loading={loadingMembers}
        onRemove={removeMember}
      />

      <MembersPendingInvitations
        invitations={invitations}
        loading={loadingInvitations}
        onRemove={removeInvitation}
      />
    </div>
  );
}