import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "@/store/userStore";
import type { Role } from "@/types";

export const RouteNames = {
  LOGIN: "login",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  UNAUTHORIZED: "unauthorized",
  PASSWORD_RECOVERY: "password-recovery",
  CREATE_EMPLOYEE: "create-employee",
  CREATE_PRODUCT: "create-product",
  CREATE_SUPPLIER: "create-supplier",
} as const;

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: RouteNames.LOGIN,
    component: () => import("@/modules/auth/views/LoginView.vue"),
    beforeEnter() {
      const user = useUserStore();
      if (!user.isAuthenticated) return undefined;

      if (user.isAdmin) return { name: RouteNames.ADMIN };
      return { name: RouteNames.EMPLOYEE };
    },
  },
  {
    path: "/password-recovery",
    name: RouteNames.PASSWORD_RECOVERY,
    component: () => import("@/modules/auth/views/PasswordRecovery.vue"),
    beforeEnter() {
      const user = useUserStore();
      if (user.isAuthenticated) return { path: "/" };
    },
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect() {
          const user = useUserStore();

          if (!user.isAuthenticated) return { name: RouteNames.LOGIN };
          if (user.isAdmin) return { name: RouteNames.ADMIN };
          return { name: RouteNames.EMPLOYEE };
        },
      },
      {
        path: "admin",
        name: RouteNames.ADMIN,
        component: () => import("@/modules/admin/views/AdminDashboard.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/employees/create",
        name: RouteNames.CREATE_EMPLOYEE,
        component: () => import("@/modules/admin/views/CreateEmployee.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/products/create",
        name: RouteNames.CREATE_PRODUCT,
        component: () => import("@/modules/product/views/CreateProduct.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/suppliers/create",
        name: RouteNames.CREATE_SUPPLIER,
        component: () => import("@/modules/supplier/views/CreateSupplier.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "employee",
        name: RouteNames.EMPLOYEE,
        component: () =>
          import("@/modules/employee/views/EmployeeDashboard.vue"),
        meta: { roles: ["Employee"] },
      },
    ],
  },
  {
    path: "/unauthorized",
    name: RouteNames.UNAUTHORIZED,
    component: () => import("@/modules/auth/views/UnauthorizedView.vue"),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const user = useUserStore();
  if (!user.token) user.hydrateFromStorage();

  if (to.meta?.requiresAuth && !user.isAuthenticated) {
    return { name: RouteNames.LOGIN, query: { redirect: to.fullPath } };
  }
  const allowed = to.meta?.roles as Role[] | undefined;
  if (allowed && user.profile?.roles) {
    const hasRole = allowed.some((role) => user.profile!.roles.includes(role));
    if (!hasRole) {
      return { name: RouteNames.UNAUTHORIZED };
    }
  }
});

export default router;
