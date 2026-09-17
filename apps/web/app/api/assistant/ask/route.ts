import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      console.error("[Assistant Proxy] access_token non trovato");

      return NextResponse.json(
        {
          message: "Utente non autenticato. Effettua nuovamente il login.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * Recupera l'associazione attiva.
     *
     * Il frontend può inviarla in uno di questi modi:
     * - body.associationId
     * - header x-association-id
     *
     * Diamo priorità al body, poi all'header.
     */
    const headerAssociationId =
      request.headers.get("x-association-id")?.trim() || undefined;

    const bodyAssociationId =
      typeof body?.associationId === "string"
        ? body.associationId.trim() || undefined
        : undefined;

    const associationId = bodyAssociationId ?? headerAssociationId;

    console.log("[Assistant Proxy] token trovato");

    if (associationId) {
      console.log(
        `[Assistant Proxy] associazione attiva: ${associationId}`,
      );
    } else {
      console.log(
        "[Assistant Proxy] nessuna associazione attiva ricevuta",
      );
    }

    /*
     * Manteniamo associationId anche nel body.
     * Il backend Assistant lo riceve sia dal body sia dall'header.
     */
    const backendBody = {
      ...body,
      ...(associationId ? { associationId } : {}),
    };

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      "http://localhost:3001/api/assistant/ask",
      {
        method: "POST",
        headers,
        body: JSON.stringify(backendBody),
        cache: "no-store",
      },
    );

    const text = await response.text();

    let data: unknown = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: text,
        };
      }
    }

    console.log(
      `[Assistant Proxy] backend status: ${response.status}`,
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[Assistant Proxy] errore:", error);

    return NextResponse.json(
      {
        message: "Errore nella comunicazione con il backend.",
      },
      {
        status: 500,
      },
    );
  }
}