export class MembershipDto {
  id: string;
  role: string;
  memberNumber: number | null;
  createdAt: Date;

  user: {
    id: string;
    email: string;
  };
}