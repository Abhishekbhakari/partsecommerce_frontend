import { Request, Response, NextFunction } from 'express';
import { AdminRole } from '../constants/Roles';

class RBACMiddleware {
    /** Allows only the specified admin roles. Usage: RBAC.requireRole(AdminRole.OWNER). */
    requireRole(...roles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Please provide a valid token to access this endpoint.'
                });
                return;
            }
            if (req.user.type !== 'admin' || !roles.includes(req.user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'You are not authorized to perform this action.'
                });
                return;
            }
            next();
        };
    }
}

const RBAC = new RBACMiddleware();

export const requireOwner = RBAC.requireRole(AdminRole.OWNER);
export const requireAnyAdmin = RBAC.requireRole(
    AdminRole.OWNER,
    AdminRole.MANAGER,
    AdminRole.CATALOG_EDITOR,
    AdminRole.ORDER_MANAGER,
    AdminRole.SUPPORT
);

export default RBAC;
