<script setup lang="ts">
import { useRouter } from "vue-router";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { RouteNames } from "@/router";

const userStore = useUserStore();
const router = useRouter();

const logout = () => {
    userStore.logout();
    router.push({ name: RouteNames.LOGIN, replace: true })
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">
                    Panel de Administrador - NextPapyros
                </h1>
                <p class="text-gray-600 mb-6">
                    Bienvenido, {{ userStore.profile?.name }}. Aquí puedes gestionar el sistema.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-blue-900">Gestión de Usuarios</h3>
                        <p class="text-blue-700 text-sm">Próximamente...</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-900">Inventario</h3>
                        <p class="text-green-700 text-sm">Próximamente...</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-purple-900">Reportes</h3>
                        <p class="text-purple-700 text-sm">Próximamente...</p>
                    </div>
                </div>

                <Button @click="logout" variant="outline">
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    </div>
</template>