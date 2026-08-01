export class AuditLogTimelineMapper {
  /**
   * Mappa un singolo evento audit in un formato UI-friendly
   */
  static mapEvent(event: any) {
    const { category, action, metadata, createdAt } = event;

    const base = {
      id: event.id,
      timestamp: createdAt,
      category,
      action,
      metadata,
      icon: this.getIcon(category, action),
      color: this.getColor(category),
      label: this.getLabel(category, action, metadata),
    };

    return base;
  }

  /**
   * Mappa una lista di eventi
   */
  static mapEvents(events: any[]) {
    return events.map((e) => this.mapEvent(e));
  }

  /**
   * Icone dinamiche per categoria/azione
   */
  static getIcon(category: string, action: string) {
    const icons: Record<string, string> = {
      LOGIN: "log-in",
      INVITATION: "mail-plus",
      ROLE: "shield-check",
      PROFILE: "user",
      EVENT: "calendar",
      FINANCE: "credit-card",
      FILE: "file",
      REQUEST: "activity",
      ACTION: "zap",
    };

    return icons[category] ?? "dot";
  }

  /**
   * Colori dinamici per categoria
   */
  static getColor(category: string) {
    const colors: Record<string, string> = {
      LOGIN: "blue",
      INVITATION: "purple",
      ROLE: "orange",
      PROFILE: "cyan",
      EVENT: "green",
      FINANCE: "yellow",
      FILE: "gray",
      REQUEST: "slate",
      ACTION: "pink",
    };

    return colors[category] ?? "slate";
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
          return `Invito creato per ${metadata?.invitedEmail}`;
        if (action === "INVITATION_ACCEPTED")
          return `Invito accettato (ruolo: ${metadata?.role})`;
        return "Attività invito";

      case "ROLE":
        return `Ruolo aggiornato → ${metadata?.newRole}`;

      case "PROFILE":
        return `Profilo aggiornato (${metadata?.fields?.join(", ")})`;

      case "EVENT":
        if (action === "EVENT_CREATED")
          return `Evento creato: ${metadata?.title}`;
        if (action === "EVENT_REGISTERED")
          return `Registrazione evento #${metadata?.eventId}`;
        return "Attività evento";

      case "FINANCE":
        return `Transazione ${metadata?.type} → €${metadata?.amount}`;

      case "FILE":
        return `File caricato: ${metadata?.name}`;

      case "REQUEST":
        return `${metadata?.method} ${metadata?.url}`;

      case "ACTION":
        return action.replace(/_/g, " ");

      default:
        return action;
    }
  }
}
