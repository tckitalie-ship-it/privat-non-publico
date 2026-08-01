export class AuditLogTimelineMapperV2 {
  /**
   * Mappa un singolo evento audit in un formato UI-ready
   */
  static mapEvent(event: any) {
    const { category, action, metadata, createdAt, userId } = event;

    return {
      id: event.id,
      timestamp: createdAt,
      category,
      action,
      metadata,
      userId,
      icon: this.getIcon(category, action),
      color: this.getColor(category),
      label: this.getLabel(category, action, metadata),
      description: this.getDescription(category, action, metadata),
      avatar: this.getAvatar(userId),
    };
  }

  /**
   * Mappa una lista di eventi
   */
  static mapEvents(events: any[]) {
    return events.map((e) => this.mapEvent(e));
  }

  /**
   * Icone SVG inline (compatibili con React)
   */
  static getIcon(category: string, action: string) {
    const icons: Record<string, string> = {
      LOGIN: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M15 3h4v18h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>`,
      INVITATION: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M4 4h16v16H4z"/><path d="M4 4l8 8 8-8"/></svg>`,
      ROLE: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z"/></svg>`,
      PROFILE: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg>`,
      EVENT: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
      FINANCE: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M2 7h20v10H2z"/><path d="M6 11h2v2H6z"/></svg>`,
      FILE: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M14 2H6v20h12V8z"/><path d="M14 2v6h6"/></svg>`,
      REQUEST: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      ACTION: `<svg class="w-4 h-4" fill="none" stroke="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>`,
    };

    return icons[category] ?? `<svg class="w-4 h-4"><circle cx="8" cy="8" r="8"/></svg>`;
  }

  /**
   * Colori Tailwind già pronti
   */
  static getColor(category: string) {
    const colors: Record<string, string> = {
      LOGIN: "text-blue-500",
      INVITATION: "text-purple-500",
      ROLE: "text-orange-500",
      PROFILE: "text-cyan-500",
      EVENT: "text-green-500",
      FINANCE: "text-yellow-500",
      FILE: "text-gray-500",
      REQUEST: "text-slate-500",
      ACTION: "text-pink-500",
    };

    return colors[category] ?? "text-slate-500";
  }

  /**
   * Label leggibile per UI
   */
  static getLabel(category: string, action: string, metadata: any) {
    switch (category) {
      case "LOGIN":
        return "Login effettuato";

      case "INVITATION":
        if (action === "INVITATION_CREATED")
          return `Invito creato`;
        if (action === "INVITATION_ACCEPTED")
          return `Invito accettato`;
        return "Attività invito";

      case "ROLE":
        return `Ruolo aggiornato`;

      case "PROFILE":
        return `Profilo aggiornato`;

      case "EVENT":
        if (action === "EVENT_CREATED")
          return `Evento creato`;
        if (action === "EVENT_REGISTERED")
          return `Registrazione evento`;
        return "Attività evento";

      case "FINANCE":
        return `Transazione finanziaria`;

      case "FILE":
        return `File caricato`;

      case "REQUEST":
        return `${metadata?.method} ${metadata?.url}`;

      case "ACTION":
        return action.replace(/_/g, " ");

      default:
        return action;
    }
  }

  /**
   * Descrizione estesa per UI
   */
  static getDescription(category: string, action: string, metadata: any) {
    switch (category) {
      case "INVITATION":
        if (metadata?.invitedEmail)
          return `Invito inviato a ${metadata.invitedEmail}`;
        if (metadata?.role)
          return `Ruolo assegnato: ${metadata.role}`;
        return "Gestione invito";

      case "ROLE":
        return `Nuovo ruolo: ${metadata?.newRole}`;

      case "PROFILE":
        return `Campi modificati: ${metadata?.fields?.join(", ")}`;

      case "EVENT":
        if (metadata?.title)
          return `Titolo evento: ${metadata.title}`;
        return "Attività evento";

      case "FINANCE":
        return `Importo: €${metadata?.amount} (${metadata?.type})`;

      case "FILE":
        return `Nome file: ${metadata?.name}`;

      case "REQUEST":
        return `Richiesta HTTP ${metadata?.method} → ${metadata?.url}`;

      default:
        return metadata ? JSON.stringify(metadata) : "";
    }
  }

  /**
   * Avatar utente (placeholder, integrabile con user service)
   */
  static getAvatar(userId: string) {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`;
  }
}
