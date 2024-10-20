import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export type TUserAgentAndIp = { ip_address: string; user_agent: string };

export const UserAgentAndIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TUserAgentAndIp => {
    const grqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request = grqlCtx.req;

    const ip_address = request?.ip;
    const user_agent = request.headers?.['user-agent'];

    return { ip_address, user_agent };
  },
);
