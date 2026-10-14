import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsuarioToken } from '../interfaces/usuario-token.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean {
        const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        
        if (!rolesRequeridos || rolesRequeridos.length === 0) {
            return true;
        }
        
        const { user } = context
        .switchToHttp()
        .getRequest<{ user?: UsuarioToken }>();
        
        if (!user || !rolesRequeridos.includes(user.rol)) {
            throw new ForbiddenException(
                `Acceso denegado: se requiere rol ${rolesRequeridos.join(' o ')}`,
            );
        }
        return true;
    }
}