import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioToken } from '../interfaces/usuario-token.interface';

export const UsuarioActual = createParamDecorator(
    (_data: unknown, context: ExecutionContext): UsuarioToken => {
        const request = context.switchToHttp().getRequest<{ user: UsuarioToken }>();
        return request.user;
    },
);