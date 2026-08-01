import { InvitationDto } from "./invitations.dto";

export function toInvitationDto(inv: any): InvitationDto {
  return {
    id: inv.id,
    email: inv.email,
    associationId: inv.associationId,

    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt ?? null,
    acceptedAt: inv.acceptedAt ?? null,

    invitedBy: inv.invitedBy
      ? {
          id: inv.invitedBy.id,
          email: inv.invitedBy.email,
        }
      : {
          id: "",
          email: "",
        },
  };
}
