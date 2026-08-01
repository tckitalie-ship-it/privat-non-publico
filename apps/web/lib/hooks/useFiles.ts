"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadFiles = useCallback(async () => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = (await res.json()) as unknown[];

      setFiles(data.map((f) => f as FileItem));
    } catch {
      setMessage("Errore durante il caricamento dei file");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      loadFiles();
    });
  }, [loadFiles]);

  const deleteFile = useCallback(async (id: string) => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setMessage("Errore durante l'eliminazione");
        return;
      }

      setFiles((prev) =>
        prev.filter((f) => f.id !== id)
      );

      setMessage("File eliminato");
    } catch {
      setMessage("Errore di rete");
    }
  }, []);

  const downloadFile = useCallback(async (id: string) => {
    try {
      const token = getAccessToken();

      const res = await fetch(
        `${API_URL}/files/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setMessage("Errore durante il download");
        return;
      }

      const blob = await res.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "file";
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      setMessage("Errore di rete");
    }
  }, []);

  return {
    files,
    loading,
    message,
    deleteFile,
    downloadFile,
  };
}