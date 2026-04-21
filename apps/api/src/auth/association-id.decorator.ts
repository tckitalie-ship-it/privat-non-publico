import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AssociationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-association-id'];
  },
);