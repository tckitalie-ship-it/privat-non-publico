"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(
  data: ApiErrorResponse | null,
  fallback: string,
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ChangePasswordDialog
      onClose={onClose}
    />
  );
}

function ChangePasswordDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showOldPassword,
    setShowOldPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  function closeModal() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!oldPassword) {
      toast.error(
        "Inserisci la password attuale",
      );
      return;
    }

    if (!newPassword) {
      toast.error(
        "Inserisci la nuova password",
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "La nuova password deve contenere almeno 8 caratteri",
      );
      return;
    }

    if (newPassword === oldPassword) {
      toast.error(
        "La nuova password deve essere diversa da quella attuale",
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      toast.error(
        "Le nuove password non corrispondono",
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        },
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore cambio password (${response.status})`,
          ),
        );
      }

      toast.success(
        "Password modificata con successo",
      );

      onClose();
    } catch (error) {
      console.error(
        "Errore cambio password:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile modificare la password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Cambia password
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Inserisci la password
                attuale e scegli una nuova
                password sicura.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <PasswordField
            id="old-password"
            label="Password attuale"
            value={oldPassword}
            showPassword={
              showOldPassword
            }
            disabled={loading}
            onChange={setOldPassword}
            onToggleVisibility={() =>
              setShowOldPassword(
                (current) => !current,
              )
            }
            autoComplete="current-password"
          />

          <PasswordField
            id="new-password"
            label="Nuova password"
            value={newPassword}
            showPassword={
              showNewPassword
            }
            disabled={loading}
            onChange={setNewPassword}
            onToggleVisibility={() =>
              setShowNewPassword(
                (current) => !current,
              )
            }
            autoComplete="new-password"
          />

          <PasswordField
            id="confirm-password"
            label="Conferma nuova password"
            value={confirmPassword}
            showPassword={
              showConfirmPassword
            }
            disabled={loading}
            onChange={
              setConfirmPassword
            }
            onToggleVisibility={() =>
              setShowConfirmPassword(
                (current) => !current,
              )
            }
            autoComplete="new-password"
          />

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
            La nuova password deve contenere
            almeno 8 caratteri ed essere
            diversa dalla password attuale.
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Aggiornamento..."
                : "Aggiorna password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  showPassword: boolean;
  disabled: boolean;
  autoComplete:
    | "current-password"
    | "new-password";
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

function PasswordField({
  id,
  label,
  value,
  showPassword,
  disabled,
  autoComplete,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-300"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            showPassword
              ? "Nascondi password"
              : "Mostra password"
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}