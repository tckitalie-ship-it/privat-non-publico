import { MembershipDto } from "./memberships.dto";

export function toMembershipDto(m: any): MembershipDto {
  return {
    id: m.id,
    role: m.role,
    memberNumber: m.memberNumber ?? null,
    createdAt: m.createdAt,

    user: {
      id: m.user?.id ?? "",
      email: m.user?.email ?? "",
    },
  };
}