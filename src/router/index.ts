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
  REGISTER_SALE: "register-sale",
  RESET_PASSWORD: "reset-password",
  EMPLOYEES_LIST: "employees-list",
  UPDATE_EMPLOYEE: "upate-employe",
  PRODUCTS_LIST: "products-list",
  UPDATE_PRODUCT: "update-product",
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
    path: "/reset-password",
    name: RouteNames.RESET_PASSWORD,
    component: () => import("@/modules/auth/views/ResetPassword.vue"),
    beforeEnter(to) {
      const user = useUserStore();
      if (user.isAuthenticated) return { path: "/" };

      let email = to.query.email;
      let token = to.query.token;
      if (!email || !token) return { path: "/" };

      email = Array.isArray(email) ? email[0] : email;
      token = Array.isArray(token) ? token[0] : token;

      // Validate Token (100000 - 999999)
      const tokenRegex = /^[1-9]\d{5}$/;
      // Basic Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !token ||
        !email ||
        !tokenRegex.test(token) ||
        !emailRegex.test(email)
      )
        return { path: "/" };
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
        path: "/employees",
        name: RouteNames.EMPLOYEES_LIST,
        component: () => import("@/modules/employee/views/EmployeesList.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "/employees/:id",
        name: RouteNames.UPDATE_EMPLOYEE,
        component: () => import("@/modules/admin/views/EditEmployee.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/products/create",
        name: RouteNames.CREATE_PRODUCT,
        component: () => import("@/modules/product/views/CreateProduct.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/products",
        name: RouteNames.PRODUCTS_LIST,
        component: () => import("@/modules/product/views/ProductsList.vue"),
        meta: { roles: ["Admin"] },
      },
      {
        path: "admin/products/:id",
        name: RouteNames.UPDATE_PRODUCT,
        component: () => "Update product",
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
      {
        path: "employee/sales",
        name: RouteNames.REGISTER_SALE,
        component: () => import("@/modules/sale/views/RegisterSale.vue"),
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
