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
import MemberRegistrationForm from "@/components/members/MemberRegistrationForm";
import MembersInviteForm from "@/components/members/MembersInviteForm";
import MembersList from "@/components/members/MembersList";
import MembersPendingInvitations from "@/components/members/MembersPendingInvitations";
import MembersToolbar from "@/components/members/MembersToolbar";

import { API_URL, getAccessToken } from "@/lib/api";
import { getActiveAssociationId } from "@/lib/association";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Membership = {
  id: string;
  role: Role;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: Role;
  token: string;
  createdAt: string;
};

function getErrorMessage(
  data: any,
  fallback: string,
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return fallback;
}

export default function MembersPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [currentUserRole, setCurrentUserRole] =
    useState<Role | null>(null);

  const [showInviteForm, setShowInviteForm] =
    useState(false);

  const [showRegistrationForm, setShowRegistrationForm] =
    useState(false);

  const [availableUsers, setAvailableUsers] = useState<
    { id: string; email: string }[]
  >([]);

  const [loadingRegistration, setLoadingRegistration] =
    useState(false);


  const [loadingInvite, setLoadingInvite] =
    useState(false);

  const [loadingMembers, setLoadingMembers] =
    useState(true);

  const [loadingInvitations, setLoadingInvitations] =
    useState(true);

  const [loadingRole, setLoadingRole] =
    useState(true);

  const getAssociationHeaders = useCallback(() => {
    const token = getAccessToken();
    const associationId = getActiveAssociationId();

    return {
      token,
      associationId,
      headers: {
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(associationId
          ? {
              "x-association-id": associationId,
            }
          : {}),
      },
    };
  }, []);

  const fetchAvailableUsers = useCallback(async () => {
    const { token, headers } = getAssociationHeaders();

    if (!token) {
      setAvailableUsers([]);
      return;
    }

    try {
      const response = await fetch(
        "/api/memberships/available-users",
        {
          method: "GET",
          headers,
          cache: "no-store",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Errore caricamento utenti disponibili",
          ),
        );
      }

      setAvailableUsers(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.error(
        "Errore caricamento utenti disponibili:",
        error,
      );

      setAvailableUsers([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile caricare gli utenti disponibili",
      );
    }
  }, [getAssociationHeaders]);
  const fetchCurrentMembership =
    useCallback(async () => {
      const {
        token,
        associationId,
        headers,
      } = getAssociationHeaders();

      if (!token) {
        setCurrentUserRole(null);
        setLoadingRole(false);
        return;
      }

      try {
        const response = await fetch(
          "/api/memberships/me",
          {
            method: "GET",
            headers,
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              `Errore caricamento ruolo (${response.status})`,
            ),
          );
        }

        const returnedRole = data?.role;

        if (
          returnedRole === "OWNER" ||
          returnedRole === "ADMIN" ||
          returnedRole === "MEMBER"
        ) {
          setCurrentUserRole(returnedRole);
        } else {
          setCurrentUserRole(null);
        }

        if (!associationId && data?.associationId) {
          console.log(
            "Associazione risolta dal backend:",
            data.associationId,
          );
        }
      } catch (error) {
        console.error(
          "Errore caricamento membership corrente:",
          error,
        );

        setCurrentUserRole(null);

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare il ruolo",
        );
      } finally {
        setLoadingRole(false);
      }
    }, [getAssociationHeaders]);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);

    const {
      token,
      headers,
    } = getAssociationHeaders();

    if (!token) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/memberships`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore caricamento membri (${response.status})`,
          ),
        );
      }

      setMembers(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.error(
        "Errore caricamento membri:",
        error,
      );

      setMembers([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile caricare i membri",
      );
    } finally {
      setLoadingMembers(false);
    }
  }, [getAssociationHeaders]);

  const fetchInvitations =
    useCallback(async () => {
      setLoadingInvitations(true);

      const {
        token,
        headers,
      } = getAssociationHeaders();

      if (!token) {
        setInvitations([]);
        setLoadingInvitations(false);
        return;
      }

      try {
        const response = await fetch(
          "/api/invitations",
          {
            method: "GET",
            headers,
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              `Errore caricamento inviti (${response.status})`,
            ),
          );
        }

        setInvitations(
          Array.isArray(data) ? data : [],
        );
      } catch (error) {
        console.error(
          "Errore caricamento inviti:",
          error,
        );

        setInvitations([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare gli inviti",
        );
      } finally {
        setLoadingInvitations(false);
      }
    }, [getAssociationHeaders]);

  const refreshMembersData = useCallback(
    async () => {
      await Promise.all([
        fetchCurrentMembership(),
        fetchMembers(),
        fetchInvitations(),
      ]);
    },
    [
      fetchCurrentMembership,
      fetchMembers,
      fetchInvitations,
    ],
  );

  useEffect(() => {
    void refreshMembersData();
  }, [refreshMembersData]);

  async function handleRegistration(data: {
    userId: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    address?: string;
    phone?: string;
  }) {
    console.log("[registration] dati ricevuti:", data);
    const { token, associationId, headers } =
      getAssociationHeaders();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    if (!associationId) {
      toast.error("Seleziona prima un'associazione");
      return;
    }

    if (!canManageMembers) {
      toast.error("Non hai i permessi per registrare membri");
      return;
    }

    try {
      setLoadingRegistration(true);

      const response = await fetch(
        "/api/memberships",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: data.userId,
            associationId,
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            address: data.address,
            phone: data.phone,
          }),
        },
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Errore registrazione socio",
          ),
        );
      }

      setShowRegistrationForm(false);

      toast.success(
        result?.memberNumber
          ? `Socio registrato. Tessera n. ${result.memberNumber}`
          : "Socio registrato con successo",
      );

      await refreshMembersData();
    } catch (error) {
      console.error(
        "Errore registrazione socio:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile registrare il socio",
      );
    } finally {
      setLoadingRegistration(false);
    }
  }
  async function handleInvite(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error(
        "Inserisci un indirizzo email",
      );
      return;
    }

    if (!cleanEmail.includes("@")) {
      toast.error(
        "Inserisci un indirizzo email valido",
      );
      return;
    }

    if (
      role !== "OWNER" &&
      role !== "ADMIN" &&
      role !== "MEMBER"
    ) {
      toast.error("Ruolo non valido");
      return;
    }

    const {
      token,
      associationId,
      headers,
    } = getAssociationHeaders();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    if (!associationId) {
      toast.error(
        "Seleziona prima un'associazione",
      );
      return;
    }

    if (!canManageMembers) {
      toast.error(
        "Non hai i permessi per invitare membri",
      );
      return;
    }

    try {
      setLoadingInvite(true);

      const response = await fetch(
        "/api/invitations",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            role,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore invio invito (${response.status})`,
          ),
        );
      }

      setEmail("");
      setRole("MEMBER");
      setShowInviteForm(false);

      toast.success("Invito creato con successo");

      await fetchInvitations();
    } catch (error) {
      console.error(
        "Errore invio invito:",
        error,
      );

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
    const {
      token,
      headers,
    } = getAssociationHeaders();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    if (!canManageMembers) {
      toast.error(
        "Non hai i permessi per rimuovere membri",
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/memberships/${id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore rimozione membro (${response.status})`,
          ),
        );
      }

      setMembers((current) =>
        current.filter(
          (member) => member.id !== id,
        ),
      );

      toast.success("Membro rimosso");
    } catch (error) {
      console.error(
        "Errore rimozione membro:",
        error,
      );

      throw error;
    }
  }

  async function removeInvitation(id: string) {
    const {
      token,
      headers,
    } = getAssociationHeaders();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    if (!canManageMembers) {
      toast.error(
        "Non hai i permessi per eliminare inviti",
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/invitations/${id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore eliminazione invito (${response.status})`,
          ),
        );
      }

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation.id !== id,
        ),
      );

      toast.success("Invito eliminato");
    } catch (error) {
      console.error(
        "Errore eliminazione invito:",
        error,
      );

      throw error;
    }
  }

  const filteredMembers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return members.filter((member) => {
      const email =
        member.user?.email
          ?.toLowerCase() ?? "";

      const name =
        member.user?.name
          ?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch.length === 0 ||
        email.includes(normalizedSearch) ||
        name.includes(normalizedSearch);

      const matchesRole =
        roleFilter.length === 0 ||
        roleFilter.includes(member.role);

      return (
        matchesSearch && matchesRole
      );
    });
  }, [members, roleFilter, search]);

  const canManageMembers =
    !loadingRole &&
    (currentUserRole === "OWNER" ||
      currentUserRole === "ADMIN");

  const membersCount = members.length;
  const invitationsCount =
    invitations.length;

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <MembersHeader
        membersCount={membersCount}
        invitationsCount={invitationsCount}
        canManageMembers={canManageMembers}
        onInviteClick={() =>
          setShowInviteForm(
            (current) => !current,
          )
        }
        onRegistrationClick={() => {
          setShowRegistrationForm((current) => !current);
          setShowInviteForm(false);
          if (!showRegistrationForm) {
            void fetchAvailableUsers();
          }
        }}
      />

      {showRegistrationForm &&
        canManageMembers && (
          <MemberRegistrationForm
            users={availableUsers}
            loading={loadingRegistration}
            onSubmit={handleRegistration}
            onCancel={() =>
              setShowRegistrationForm(false)
            }
          />
        )}


      {showInviteForm &&
        canManageMembers && (
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
        className="inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Dashboard
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Membri
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1
              ? "membro visualizzato"
              : "membri visualizzati"}
          </p>
        </div>

        {!loadingRole && (
          <span className="text-sm text-slate-500">
            Il tuo ruolo:{" "}
            <strong className="text-slate-900">
              {currentUserRole ?? "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â"}
            </strong>
          </span>
        )}
      </div>

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
        onSelectMember={(member) => { window.location.href = '/members/' + member.id; }}
      />
      <MembersPendingInvitations
        invitations={invitations}
        loading={loadingInvitations}
        canManageMembers={canManageMembers}
        onRemove={removeInvitation}
      />
    </div>
  );
}
