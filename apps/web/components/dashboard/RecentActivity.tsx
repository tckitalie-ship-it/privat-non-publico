"use client";

import {
  CalendarDays,
  UserPlus,
  CreditCard,
  FileText,
  Bell,
} from "lucide-react";

type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: "member" | "event" | "finance" | "file" | "notification";
};

const activities: Activity[] = [
  {
    id: 1,
    title: "Nuovo membro registrato",
    description: "Mario Rossi è stato aggiunto all'associazione.",
    time: "5 min fa",
    icon: "member",
  },
  {
    id: 2,
    title: "Evento creato",
    description: "Assemblea annuale programmata per il 15 luglio.",
    time: "25 min fa",
    icon: "event",
  },
  {
    id: 3,
    title: "Pagamento ricevuto",
    description: "Quota associativa di €50 registrata.",
    time: "1 ora fa",
    icon: "finance",
  },
  {
    id: 4,
    title: "Documento caricato",
    description: "Verbale assemblea disponibile nell'archivio.",
    time: "Oggi",
    icon: "file",
  },
  {
    id: 5,
    title: "Nuova notifica",
    description: "Un invito è stato accettato da un nuovo socio.",
    time: "Ieri",
    icon: "notification",
  },
];

function ActivityIcon({ icon }: { icon: Activity["icon"] }) {
  switch (icon) {
    case "member":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <UserPlus size={20} />
        </div>
      );

    case "event":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <CalendarDays size={20} />
        </div>
      );

    case "finance":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CreditCard size={20} />
        </div>
      );

    case "file":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <FileText size={20} />
        </div>
      );

    default:
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <Bell size={20} />
        </div>
      );
  }
}

export default function RecentActivity() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">

      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Attività recenti
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Ultime operazioni effettuate nella piattaforma.
        </p>
      </div>

      <div className="relative p-6">

        <div className="absolute bottom-6 left-[47px] top-6 w-px bg-gray-200" />

        <div className="space-y-6">

          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative flex items-start gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-gray-50"
            >
              <div className="relative z-10">
                <ActivityIcon icon={activity.icon} />
              </div>

              <div className="flex-1">

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {activity.title}
                  </h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    {activity.time}
                  </span>

                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {activity.description}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}