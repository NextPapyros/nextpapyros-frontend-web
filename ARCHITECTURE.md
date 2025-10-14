¡Listo! Mantengo la **estructura y reglas** de la guía anterior y añado **solo los ejemplos de código imprescindibles** para que se vea claro cómo se conecta todo sin abrumar.

---

# Arquitectura mínima (NextPapyros Web)

## Principios

- **Pinia = client state** (sesión, rol, UI).
- **TanStack Query = server state** (datos del backend).
- **Módulos por dominio**, rutas con metadatos (`requiresAuth`, `roles`), **cliente HTTP único**.

---

## Estructura

```
src/
├─ assets/
├─ components/
│  └─ ui/
├─ layouts/
├─ modules/
│  ├─ auth/
│  ├─ inventory/
│  ├─ sales/
│  ├─ reports/
│  └─ employees/
├─ router/
├─ services/
├─ store/
├─ types/
├─ utils/
├─ App.vue
└─ main.ts
```

---

## `assets/`

**Propósito:** recursos estáticos.
**Reglas:** tokens en `tailwind.config.js`.

**Ejemplo `tailwind.config.js` (tokens base)**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0A0A0A",
          50: "#f6f6f6",
          900: "#0a0a0a",
        },
      },
      borderRadius: { lg: "12px" },
    },
  },
  plugins: [],
};
```

---

## `components/` y `components/ui/`

**Propósito:** componentes **agnósticos del dominio** (wrappers reutilizables).
**Reglas:** sin llamadas a API; estilo con Tailwind.

**Ejemplo `components/ui/Button.vue`**

```vue
<script setup lang="ts">
defineProps<{ disabled?: boolean; type?: "button" | "submit" }>();
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    class="inline-flex items-center justify-center px-4 py-2 rounded-md border
           bg-black text-white hover:opacity-90 disabled:opacity-50"
  >
    <slot />
  </button>
</template>
```

---

## `layouts/`

**Propósito:** estructura de página (Navbar/Sidebar + `<router-view>`).
**Reglas:** solo UI y pequeñas lecturas de estado de UI.

_(Sin código: markup estándar con slots y `<router-view/>`.)_

---

## `modules/` (por dominio)

**Estructura interna recomendada**

```
modules/<dominio>/
├─ views/     # Vistas de ese dominio
├─ api/       # Fetchers REST (usados por Vue Query)
└─ types/     # Tipos/DTOs del dominio
```

**Reglas:**

- `views/` usa **useQuery/useMutation**; no `axios` directo.
- `api/` llama siempre a `services/apiClient`.
- Nada de imports cruzados entre módulos.

### Auth (ejemplo mínimo)

**`modules/auth/api/authApi.ts`**

```ts
import { api } from "@/services/apiClient";

export type Role = "admin" | "employee";

export async function loginApi(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);
  // Esperado: { token: string, role: Role, profile?: { id: string; name: string } }
  return data as {
    token: string;
    role: Role;
    profile?: { id: string; name: string };
  };
}
```

**`modules/auth/views/LoginView.vue`** (mutation + redirección)

```vue
<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";
import { loginApi } from "../api/authApi";
import { useUserStore } from "@/store/userStore";

const router = useRouter();
const route = useRoute();
const user = useUserStore();

const { mutate, isPending, error } = useMutation({
  mutationFn: loginApi,
  onSuccess(data) {
    user.setSession(data);
    router.push((route.query.redirect as string) || "/");
  },
});

function onSubmit(e: Event) {
  e.preventDefault();
  const f = e.target as HTMLFormElement;
  mutate({
    email: (f.email as HTMLInputElement).value,
    password: (f.password as HTMLInputElement).value,
  });
}
</script>

<template>
  <form @submit="onSubmit" class="max-w-sm mx-auto p-6 space-y-3">
    <h1 class="text-xl font-semibold">Iniciar sesión</h1>
    <input
      name="email"
      type="email"
      class="w-full border p-2 rounded"
      placeholder="Correo"
      required
    />
    <input
      name="password"
      type="password"
      class="w-full border p-2 rounded"
      placeholder="Contraseña"
      required
    />
    <ui-button class="w-full" :disabled="isPending" type="submit">
      {{ isPending ? "Ingresando…" : "Entrar" }}
    </ui-button>
    <p v-if="error" class="text-red-600 text-sm">Error de autenticación</p>
  </form>
</template>
```

### Inventory (ejemplo mínimo)

**`modules/inventory/api/inventoryApi.ts`**

```ts
import { api } from "@/services/apiClient";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export async function getProducts() {
  const { data } = await api.get("/inventory/products");
  return data as Product[];
}
```

**`modules/inventory/views/InventoryList.vue`**

```vue
<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { getProducts } from "../api/inventoryApi";

const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: getProducts,
});
</script>

<template>
  <section class="p-6">
    <h2 class="text-lg font-semibold mb-4">Inventario</h2>
    <div v-if="isLoading">Cargando…</div>
    <div v-else-if="error" class="text-red-600">No se pudo cargar</div>
    <ul v-else class="space-y-2">
      <li
        v-for="p in data"
        :key="p.id"
        class="flex justify-between border rounded p-2"
      >
        <span>{{ p.name }}</span>
        <span class="tabular-nums"
          >${{ p.price.toFixed(2) }} • Stock: {{ p.stock }}</span
        >
      </li>
    </ul>
  </section>
</template>
```

---

## `router/`

**Propósito:** routing + **guardias** (auth/roles).

**`router/index.ts`**

```ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "@/store/userStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/modules/auth/views/LoginView.vue"),
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/modules/reports/views/DashboardView.vue"),
      },
      {
        path: "inventory",
        name: "inventory",
        component: () => import("@/modules/inventory/views/InventoryList.vue"),
        meta: { roles: ["admin", "employee"] },
      },
      {
        path: "employees",
        name: "employees",
        component: () => import("@/modules/employees/views/EmployeesList.vue"),
        meta: { roles: ["admin"] },
      },
    ],
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("@/modules/auth/views/UnauthorizedView.vue"),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const user = useUserStore();
  if (!user.token) user.hydrateFromStorage();

  if (to.meta?.requiresAuth && !user.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  const allowed = to.meta?.roles as string[] | undefined;
  if (allowed && user.role && !allowed.includes(user.role)) {
    return { name: "unauthorized" };
  }
});

export default router;
```

---

## `services/`

**Propósito:** integraciones compartidas.
**Reglas:** cliente HTTP único + interceptores + manejo de errores.

**`services/apiClient.ts`**

```ts
import axios from "axios";
import { useUserStore } from "@/store/userStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const { token } = useUserStore();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      const user = useUserStore();
      user.logout();
      // La redirección la maneja el router guard al siguiente intento
    }
    return Promise.reject(err);
  }
);
```

---

## `store/`

**Propósito:** **Pinia** para client state (sesión/UI).

**`store/userStore.ts`**

```ts
import { defineStore } from "pinia";
import type { Role } from "@/modules/auth/api/authApi";

interface Profile {
  id: string;
  name: string;
}
interface Session {
  token: string;
  role: Role;
  profile?: Profile;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    token: null as string | null,
    role: null as Role | null,
    profile: undefined as Profile | undefined,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    setSession({ token, role, profile }: Session) {
      this.token = token;
      this.role = role;
      this.profile = profile;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    },
    hydrateFromStorage() {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role") as Role | null;
      if (token && role) {
        this.token = token;
        this.role = role;
      }
    },
    logout() {
      this.$reset();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});
```

---

## `types/`

**Propósito:** tipos **globales** (roles, paginación, errores comunes).
**Reglas:** sin dependencias de módulos específicos.

_(Sin código: define enums/utility types compartidos.)_

---

## `utils/`

**Propósito:** funciones puras reutilizables.
**Reglas:** sin efectos secundarios ni UI.

**Ejemplo `utils/format.ts`**

```ts
export const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(n);
```

---

## `main.ts` (bootstrap)

**Objetivo:** registrar **Pinia** + **TanStack Query** + **Router**.

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css"; // Tailwind

const app = createApp(App);
app.use(createPinia());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});
app.use(VueQueryPlugin, { queryClient });

app.use(router).mount("#app");
```

---

## Reglas clave (recordatorio)

- **Nunca** dupliques datos del backend en Pinia si ya están en Vue Query.
- Los **módulos** consumen backend vía `modules/*/api/*` → `services/apiClient`.
- **Rutas** con `meta.requiresAuth`/`meta.roles`; guardia simple y predecible.
- **UI** estandarizada en `components/ui/*` (Tailwind + shadcn-vue si lo usas).
- **Errores**: manejo centralizado (interceptor + toasts en un solo lugar).

---

Si quieres, te preparo un **commit base** con estos archivos mínimos para que solo corras `pnpm install` y te pongas a trabajar.
