<script setup lang="ts">
import { useRouter } from "vue-router";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { RouteNames } from "@/router";

const userStore = useUserStore();
const router = useRouter();

const logout = () => {
    userStore.logout();
    router.push({ name: RouteNames.LOGIN, replace: true });
};
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <h1 class="text-xl font-semibold text-gray-900">
                        NextPapyros
                    </h1>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">
                            {{ userStore.profile?.name }}
                        </span>
                        <Button @click="logout" variant="outline" size="sm">
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <router-view />
        </main>
    </div>
</template>
