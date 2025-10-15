<script setup lang="ts">
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const router = useRouter();

const goToLogin = () => {
    router.push("/login");
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle>Acceso Denegado</CardTitle>
                <CardDescription>
                    No tienes permisos para acceder a esta sección del sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button @click="goToLogin" class="w-full">
                    Ir al Login
                </Button>
            </CardContent>
        </Card>
    </div>
</template>