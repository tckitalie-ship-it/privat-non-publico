import { API_URL, getAccessToken } from "@/lib/api";

export type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;

  user: {
    id: string;
    email: string;
  };
};

type ApiMember = {
  id?: string;
  role?: Member["role"];
  createdAt?: string;
  user?: {
    id?: string;
    email?: string;
  };
};

export async function fetchMembers(): Promise<Member[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Utente non autenticato");
  }

  const response = await fetch(
    `${API_URL}/memberships`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message = "Errore caricamento membri";

    try {
      const error = await response.json();

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        message = error.message;
      }
    } catch {
      // ignora risposta non JSON
    }

    throw new Error(message);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((member): Member => {
    const item = member as ApiMember;

    return {
      id: item.id ?? "",
      role: item.role ?? "MEMBER",
      createdAt: item.createdAt ?? "",

      user: {
        id: item.user?.id ?? "",
        email: item.user?.email ?? "",
      },
    };
  });
}