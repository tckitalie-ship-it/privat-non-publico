import { MembershipDto } from "./memberships.dto";

export function toMembershipDto(membership: any): MembershipDto {
  return {
    id: membership.id,
    role: membership.role,
    memberNumber: membership.memberNumber ?? null,
    firstName: membership.firstName ?? null,
    lastName: membership.lastName ?? null,
    birthDate: membership.birthDate ?? null,
    address: membership.address ?? null,
    phone: membership.phone ?? null,
    createdAt: membership.createdAt,
    user: {
      id: membership.user.id,
      email: membership.user.email,
    },
  };
}
