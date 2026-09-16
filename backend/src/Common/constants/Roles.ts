/** Admin/staff roles — see docs/DATA_MODEL.md `AdminUser / Role`. */
export const AdminRole = {
    OWNER: 'owner',
    MANAGER: 'manager',
    CATALOG_EDITOR: 'catalog_editor',
    ORDER_MANAGER: 'order_manager',
    SUPPORT: 'support'
} as const;

export type AdminRoleType = (typeof AdminRole)[keyof typeof AdminRole];

/** Roles allowed to manage catalog data (products, categories, brands, coupons). */
export const CATALOG_MANAGER_ROLES: AdminRoleType[] = [
    AdminRole.OWNER,
    AdminRole.MANAGER,
    AdminRole.CATALOG_EDITOR
];

/** Roles allowed to manage orders/customers. */
export const ORDER_MANAGER_ROLES: AdminRoleType[] = [
    AdminRole.OWNER,
    AdminRole.MANAGER,
    AdminRole.ORDER_MANAGER,
    AdminRole.SUPPORT
];

/** Roles allowed to manage staff accounts — owner only. */
export const STAFF_MANAGER_ROLES: AdminRoleType[] = [AdminRole.OWNER];
