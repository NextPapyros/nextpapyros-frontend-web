<script setup lang="ts">
import { RouteNames } from "@/router";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">
                    Panel de Empleado - NextPapyros
                </h1>
                <p class="text-gray-600 mb-6">
                    Bienvenido, {{ userStore.profile?.name }}. Aquí puedes gestionar tus tareas.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <router-link :to="{ name: RouteNames.REGISTER_SALE }"
                        class="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                        <h3 class="font-semibold text-blue-900">Ventas</h3>
                        <p class="text-blue-700 text-sm">Registrar nueva venta</p>
                    </router-link>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-900">Inventario</h3>
                        <p class="text-green-700 text-sm">Próximamente...</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-purple-900">Reportes</h3>
                        <p class="text-purple-700 text-sm">Próximamente...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>