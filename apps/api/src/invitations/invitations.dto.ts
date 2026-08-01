export class InvitationDto {
  id: string;
  email: string;
  associationId: string;

  createdAt: Date;
  expiresAt: Date | null;
  acceptedAt: Date | null;

  invitedBy: {
    id: string;
    email: string;
  };
}
