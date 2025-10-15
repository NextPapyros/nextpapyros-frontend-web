<script setup lang="ts">
import { useUserStore } from "@/store/userStore";
import { RouteNames } from "@/router";

const userStore = useUserStore();
</script>

<template>
    <div class="">
        <div class="max-w- mx-auto">
            <div class="bg-white rounded-lg shadow p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">
                    Panel de Administrador - NextPapyros
                </h1>
                <p class="text-gray-600 mb-6">
                    Bienvenido, {{ userStore.profile?.name }}. Aquí puedes gestionar el sistema.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <router-link :to="{ name: RouteNames.CREATE_EMPLOYEE }"
                        class="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                        <h3 class="font-semibold text-blue-900">Gestión de Empleados</h3>
                        <p class="text-blue-700 text-sm">Crear nuevos empleados y gestionar roles</p>
                    </router-link>
                    <router-link :to="{ name: RouteNames.CREATE_PRODUCT }"
                        class="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                        <h3 class="font-semibold text-green-900">Gestión de Productos</h3>
                        <p class="text-green-700 text-sm">Crear nuevos productos en el catálogo</p>
                    </router-link>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-purple-900">Reportes</h3>
                        <p class="text-purple-700 text-sm">Próximamente...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>