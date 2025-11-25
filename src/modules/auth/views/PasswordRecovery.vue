<script setup lang="ts">
import { computed, ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { LucideArrowLeft, LucideCircleCheckBig } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RouteNames } from "@/router";

import { sendRecoveryInstructions } from "../api/authApi";

const email = ref("");
const success = ref(false);

const { mutate: sendInstructions, isPending } = useMutation({
    mutationFn: sendRecoveryInstructions,
    onSuccess: () => success.value = true,
});

const isDisabled = computed(() => !email.value || isPending.value);

const onSubmit = (e: Event) => {
    if (isDisabled.value) return;

    e.preventDefault();
    sendInstructions(email.value);
}
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center bg-light-base">
        <div className="flex flex-col gap-6 justify-center items-center">
            <img src="/logo.png" width="250" />

            <Card class="max-w-96">
                <CardHeader class="flex flex-col items-center gap-2.5">
                    <div v-if="success"
                        class="aspect-square w-14 flex justify-center items-center bg-[#a3ebb37a] rounded-full">
                        <LucideCircleCheckBig class="text-brand-base" />
                    </div>
                    <CardTitle class="title-2">{{ success ? "Email Enviado" : "Recuperar Contraseña" }}</CardTitle>
                    <template v-if="success">
                        <CardDescription class="text-center text-regular-small text-dark-soft">
                            Hemos enviado las instrucciones para restablecer tu contraseña a <span
                                class="text-regular-medium">{{
                                    email }}</span>
                        </CardDescription>
                        <CardDescription class="text-center text-regular-small text-dark-soft">
                            Revisa tu bandeja de entrada y sigue la instrucciones.
                        </CardDescription>
                    </template>
                    <CardDescription v-else class="text-center text-regular-small text-dark-soft">
                        Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RouterLink v-if="success" :to="{ name: RouteNames.LOGIN }"
                        class="w-full block p-2 text-light-intense text-center bg-brand-base hover:bg-brand-intense rounded-md">
                        <LucideArrowLeft class="inline" /> Volver al Login
                    </RouterLink>
                    <form v-else @submit="onSubmit" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="email">Correo electrónico</Label>
                            <Input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
                        </div>

                        <Button type="submit" class="w-full mt-2 bg-brand-base cursor-pointer hover:bg-brand-intense"
                            :disabled="isDisabled">
                            {{ isPending ? "Enviando..." : "Enviar instrucciones" }}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <footer class="flex flex-col items-center font-normal text-sm leading-5 text-dark-soft">
                <p>Sistema de Gestión de Papelería</p>
                <p>&copy; 2024 NextPapyros. Todos los derechos reservados.</p>
            </footer>
        </div>
    </div>
</template>