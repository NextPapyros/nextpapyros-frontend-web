<script setup lang="ts">
import { computed, ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";
import { Eye, EyeOff } from "lucide-vue-next";
import { loginApi, getProfileApi } from "../api/authApi";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RouteNames } from "@/router";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);


const { mutate: loginMutate, isPending, error } = useMutation({
    mutationFn: loginApi,
    onSuccess: async (loginData) => {
        // Obtener perfil después del login exitoso
        try {
            userStore.setToken(loginData.token);

            const profile = await getProfileApi();
            userStore.setProfile(profile);

            // Redirigir según rol
            const redirectPathName = route.query.redirect as string || (userStore.isAdmin ? RouteNames.ADMIN : RouteNames.EMPLOYEE);
            router.push({ name: redirectPathName, replace: true });
        } catch (profileError) {
            console.error("Error obteniendo perfil:", profileError);
            // Manejar error de perfil
        }
    },
});

const isDisabled = computed(() => !email.value || !password.value || isPending.value);

const onSubmit = (e: Event) => {
    e.preventDefault();
    loginMutate({ email: email.value, password: password.value });
};

const getErrorMessage = () => {
    if (!error.value) return null;

    const status = (error.value as any)?.response?.status;
    if (status === 401) {
        return "Usuario o contraseña incorrectos";
    }
    if (status === 403) {
        return "Su cuenta no está activa";
    }
    return "Error de autenticación";
};
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center bg-light-base">
        <div className="flex flex-col gap-6 justify-center items-center">
            <img src="/logo.png" width="250" />

            <Card>
                <CardHeader class="flex flex-col items-center">
                    <CardTitle class="title-2">Iniciar Sesión</CardTitle>
                    <CardDescription class="text-regular-small text-dark-soft">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit="onSubmit" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="email">Correo electrónico</Label>
                            <Input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
                        </div>

                        <div class="space-y-2">
                            <Label for="password">Contraseña</Label>
                            <div class="relative">
                                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="••••••••" required />
                                <Button type="button" variant="ghost" size="sm"
                                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    @click="showPassword = !showPassword">
                                    <Eye v-if="showPassword" class="h-4 w-4" />
                                    <EyeOff v-else class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Alert v-if="getErrorMessage()" variant="destructive">
                            <AlertDescription>{{ getErrorMessage() }}</AlertDescription>
                        </Alert>

                        <RouterLink :to="RouteNames.PASSWORD_RECOVERY" class="text-regular-medium text-brand-base">
                            ¿Olvidaste tu contraseña?
                        </RouterLink>

                        <Button type="submit" class="w-full mt-2 bg-brand-base cursor-pointer hover:bg-brand-intense"
                            :disabled="isDisabled">
                            {{ isPending ? "Iniciando sesión..." : "Iniciar Sesión" }}
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