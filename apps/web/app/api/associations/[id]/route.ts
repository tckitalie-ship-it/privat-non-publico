import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://127.0.0.1:3001/api/associations";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Errore DELETE /associations/:id:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 }
    );
  }
}