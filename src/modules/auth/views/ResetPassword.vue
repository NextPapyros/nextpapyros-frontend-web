<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";
import { Eye, EyeOff, ArrowLeft, CircleCheckBig, LucideArrowLeft } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RouteNames } from "@/router"

import { resetPasswordApi } from "../api/authApi";

const REDIRECT_DELAY_MS = 4 * 1000;

// Validation Regex
const minLength = /.{8,}/;
const hasUpperCase = /[A-Z]/;
const hasLowerCase = /[a-z]/;
const hasNumber = /[0-9]/;
const hasSpecialChar = /[*!@#$%&/()=?¿+-]/;

const router = useRouter();
const route = useRoute();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const success = ref(false);

let idTimeout: number | null = null;

// Validation Computed Properties
const isLengthValid = computed(() => minLength.test(password.value));
const isUpperValid = computed(() => hasUpperCase.test(password.value));
const isLowerValid = computed(() => hasLowerCase.test(password.value));
const isNumberValid = computed(() => hasNumber.test(password.value));
const isSpecialValid = computed(() => hasSpecialChar.test(password.value));
const passwordsMatch = computed(() => password.value && password.value === confirmPassword.value);

const isPasswordValid = computed(() =>
    isLengthValid.value &&
    isUpperValid.value &&
    isLowerValid.value &&
    isNumberValid.value &&
    isSpecialValid.value
);

const isValid = computed(() => isPasswordValid.value && passwordsMatch.value);

const { mutate: resetPassword, isPending, error } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
        success.value = true;
        nextTick(() => {
            idTimeout = setTimeout(() => router.push({ name: RouteNames.LOGIN }), REDIRECT_DELAY_MS);
        })
    },
});

const onSubmit = (e: Event) => {
    e.preventDefault();
    if (!isValid.value) return;

    resetPassword({
        email: route.query.email as string,
        token: route.query.token as string,
        newPassword: password.value
    });
};

const getErrorMessage = () => {
    if (!error.value) return null;
    // You might want to map specific backend error codes here
    return "Ocurrió un error al restablecer la contraseña. El enlace podría haber expirado.";
};

onUnmounted(() => {
    if (idTimeout) clearTimeout(idTimeout);
})
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center bg-light-base">
        <div className="flex flex-col gap-6 justify-center items-center">
            <img src="/logo.png" width="250" />

            <Card class="w-[400px]">
                <CardHeader class="flex flex-col items-center">
                    <div v-if="success"
                        class="aspect-square w-14 flex justify-center items-center bg-[#a3ebb37a] rounded-full mb-4">
                        <CircleCheckBig class="text-brand-base" />
                    </div>
                    <CardTitle class="title-2">{{ success ? "Contraseña Actualizada" : "Reestablecer Contraseña" }}
                    </CardTitle>
                    <CardDescription v-if="success" class="text-regular-small text-dark-soft text-center">
                        Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos.
                    </CardDescription>
                    <CardDescription v-else class="text-regular-small text-dark-soft text-center">
                        Ingresa una nueva contraseña segura
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div v-if="success">
                        <RouterLink :to="{ name: RouteNames.LOGIN }"
                            class="w-full block p-2 text-light-intense text-center bg-brand-base hover:bg-brand-intense rounded-md">
                            <LucideArrowLeft class="inline" /> Ir al Login
                        </RouterLink>
                    </div>
                    <form v-else @submit="onSubmit" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="password">Nueva Contraseña</Label>
                            <div class="relative">
                                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="*******" required />
                                <Button type="button" variant="ghost" size="sm"
                                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    @click="showPassword = !showPassword">
                                    <Eye v-if="showPassword" class="h-4 w-4" />
                                    <EyeOff v-else class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <!-- Password Requirements List -->
                        <div class="text-mini-medium space-y-1">
                            <div :class="{ 'text-brand-base': isLengthValid, 'text-dark-soft': !isLengthValid }"
                                class="flex items-center gap-2">
                                <span>Mínimo 8 caracteres</span>
                            </div>
                            <div :class="{ 'text-brand-base': isUpperValid, 'text-dark-soft': !isUpperValid }"
                                class="flex items-center gap-2">
                                <span>Mínimo 1 letra mayúscula</span>
                            </div>
                            <div :class="{ 'text-brand-base': isLowerValid, 'text-dark-soft': !isLowerValid }"
                                class="flex items-center gap-2">
                                <span>Mínimo 1 letra minúscula</span>
                            </div>
                            <div :class="{ 'text-brand-base': isNumberValid, 'text-dark-soft': !isNumberValid }"
                                class="flex items-center gap-2">
                                <span>Mínimo 1 número</span>
                            </div>
                            <div :class="{ 'text-brand-base': isSpecialValid, 'text-dark-soft': !isSpecialValid }"
                                class="flex items-center gap-2">
                                <span>Mínimo 1 carácter especial: !@#$%^&*()</span>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <div class="relative">
                                <Input id="confirmPassword" v-model="confirmPassword"
                                    :type="showConfirmPassword ? 'text' : 'password'" placeholder="*******" required
                                    :class="{ 'border-destructive': password && confirmPassword && !passwordsMatch }" />
                                <Button type="button" variant="ghost" size="sm"
                                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    @click="showConfirmPassword = !showConfirmPassword">
                                    <Eye v-if="showConfirmPassword" class="h-4 w-4" />
                                    <EyeOff v-else class="h-4 w-4" />
                                </Button>
                            </div>
                            <p v-if="password && confirmPassword && !passwordsMatch"
                                class="text-mini-medium text-destructive">
                                Las contraseñas no coinciden
                            </p>
                        </div>

                        <Alert v-if="getErrorMessage()" variant="destructive">
                            <AlertDescription>{{ getErrorMessage() }}</AlertDescription>
                        </Alert>

                        <Button type="submit" class="w-full mt-2 bg-brand-base cursor-pointer hover:bg-brand-intense"
                            :disabled="!isValid || isPending">
                            {{ isPending ? "Cambiando..." : "Cambiar Contraseña" }}
                        </Button>

                        <div class="flex justify-center mt-4">
                            <RouterLink :to="{ name: RouteNames.LOGIN }"
                                class="flex items-center gap-2 text-sm text-dark-soft hover:text-dark-base">
                                <ArrowLeft class="h-4 w-4" /> Cancelar y volver al login
                            </RouterLink>
                        </div>
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