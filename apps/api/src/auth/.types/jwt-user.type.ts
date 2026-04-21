export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type MembershipPayload = {
  associationId: string;
  role: MembershipRole;
};

export type JwtUser = {
  sub: string;
  email: string;
  memberships: MembershipPayload[];
  iat: number;
  exp: number;
};