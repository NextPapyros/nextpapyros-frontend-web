<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { RouteNames } from "@/router";
import { formatDateForHeader } from "@/utils/format";
import { computed } from "vue";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const logout = () => {
    router.push({ name: RouteNames.LOGIN, replace: true });
    userStore.logout();
};

const title = computed(() => {
    switch (route.name) {
        case RouteNames.ADMIN:
            return "Panel Administrador"
        case RouteNames.EMPLOYEE:
            return "Panel Empleado"
        case RouteNames.CREATE_EMPLOYEE:
        case RouteNames.EMPLOYEES_LIST:
            return "Gestión de Empleados"
        default:
            return "Papeleria"
    }
})
</script>

<template>
    <main class="h-screen flex flex-col overflow-hidden">
        <header class="w-full p-4 flex justify-center bg-[#A3EBB133]">
            <div class="grow max-w-5xl flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <RouterLink :to="{ path: '/' }">
                        <img width="50" height="90" src="/hoja-icono.png"
                            alt="Ilustración de hoja con transición horizontal de verde a verde azul">
                    </RouterLink>
                    <div>
                        <h1 class="title-2">
                            {{ title }}
                        </h1>
                        <p class="text-medium text-dark-soft">
                            NextPapyros - Ecológica y Moderna
                        </p>
                    </div>
                </div>
                <div class="flex gap-4 items-center">
                    <div class="flex flex-col gap-1 items-end">
                        <p class="title-4">
                            {{ userStore.profile?.name || "Anonimo" }}
                        </p>
                        <p class="text-medium text-dark-soft">
                            {{ formatDateForHeader(new Date()) }}
                        </p>
                    </div>

                    <Button variant="ghost"
                        class="text-medium hover:text-error-base hover:bg-[#EF444433] cursor-pointer" @click="logout">
                        <LogOut class="w-5 h-5" />
                        <span>Salir</span>
                    </Button>
                </div>
            </div>
        </header>
        <section class="p-6 flex-1 flex justify-center items-start bg-light-base overflow-auto">
            <div class="w-full max-w-5xl">
                <RouterView />
            </div>
        </section>
    </main>
</template>
