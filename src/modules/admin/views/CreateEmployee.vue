<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";
import { UserPlus } from "lucide-vue-next";
import { toast } from "vue-sonner"

import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteNames } from "@/router";
import { Role } from "@/types";

import { createEmployeeApi } from "../api/employeeApi";
import type { NewEmployee } from "../types/adminTypes";

const router = useRouter();

const formData: NewEmployee = reactive({
    document: "",
    name: "",
    email: "",
    rol: Role.Employee,
});

const errors = reactive<Record<string, string>>({});

const { mutate, isPending } = useMutation({
    mutationFn: createEmployeeApi,
    onSuccess: () => {
        // Reset form
        formData.document = "";
        formData.name = "";
        formData.email = "";
        formData.rol = Role.Employee;

        toast("✅ Empleado creado exitosamente");
        goBack();
    },
    onError: (err: any) => {
        // Handle specific errors
        if (err?.response?.status === 409) {
            const errorData = err.response.data;
            if (errorData.message?.includes("documento")) {
                errors.documento = "El documento ya está registrado";
            } else if (errorData.message?.includes("email")) {
                errors.correo = "El correo electrónico ya está registrado";
            } else {
                errors.general = "Los datos proporcionados ya existen en el sistema";
            }
        } else {
            errors.general = "Error al crear el empleado. Intente nuevamente.";
        }
    },
});

const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.document.trim()) {
        newErrors.documento = "El documento es obligatorio";
    }

    if (!formData.name.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
        newErrors.correo = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.correo = "El correo electrónico no es válido";
    }

    if (!formData.rol) {
        newErrors.rol = "Debe seleccionar un rol";
    }

    Object.assign(errors, newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleInputChange = (field: string, value: string) => {
    (formData as any)[field] = value;
    // Clear error when user starts typing
    if (errors[field]) {
        errors[field] = "";
    }
    if (errors.general) {
        errors.general = "";
    }
    // Real-time validation for email
    if (field === 'correo' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.correo = "El correo electrónico no es válido";
    }
};

const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    mutate({
        document: formData.document,
        name: formData.name,
        email: formData.email,
        rol: formData.rol,
    });
};

const goBack = () => {
    router.push({ name: RouteNames.ADMIN });
};
</script>

<template>
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#A3EBB133] rounded-lg">
                        <UserPlus class="h-6 w-6 text-brand-base" />
                    </div>
                    <div>
                        <CardTitle class="text-xl">
                            Registrar Nuevo Empleado
                        </CardTitle>
                        <CardDescription>
                            Complete los datos del empleado para crear su cuenta en el
                            sistema
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form @submit="handleSubmit" class="space-y-6">
                    <!-- General Error -->
                    <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p class="text-sm text-red-600">{{ errors.general }}</p>
                    </div>

                    <!-- Documento -->
                    <div class="space-y-2">
                        <Label for="documento" class="text-gray-900">
                            Documento de Identidad <span class="text-red-500">*</span>
                        </Label>
                        <Input id="documento" v-model="formData.document" type="text" placeholder="Ej: 1234567890"
                            :class="{ 'border-red-500': errors.documento }"
                            @input="handleInputChange('documento', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.documento" class="text-sm text-red-600">
                            {{ errors.documento }}
                        </p>
                    </div>

                    <!-- Nombre -->
                    <div class="space-y-2">
                        <Label for="nombre" class="text-gray-900">
                            Nombre Completo <span class="text-red-500">*</span>
                        </Label>
                        <Input id="nombre" v-model="formData.name" type="text" placeholder="Ej: Juan Pérez García"
                            :class="{ 'border-red-500': errors.nombre }"
                            @input="handleInputChange('nombre', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.nombre" class="text-sm text-red-600">
                            {{ errors.nombre }}
                        </p>
                    </div>

                    <!-- Correo -->
                    <div class="space-y-2">
                        <Label for="correo" class="text-gray-900">
                            Correo Electrónico <span class="text-red-500">*</span>
                        </Label>
                        <Input id="correo" v-model="formData.email" type="email" placeholder="empleado@nextpapyros.com"
                            :class="{ 'border-red-500': errors.correo }"
                            @input="handleInputChange('correo', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.correo" class="text-sm text-red-600">
                            {{ errors.correo }}
                        </p>
                    </div>

                    <!-- Rol -->
                    <div class="space-y-2">
                        <Label for="rol" class="text-gray-900">
                            Rol <span class="text-red-500">*</span>
                        </Label>
                        <Select v-model="formData.rol">
                            <SelectTrigger class="w-40" :class="errors.rol ? 'border-error-base' : ''">
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem :value="Role.Employee">Empleado</SelectItem>
                                <SelectItem :value="Role.Admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                        <p v-if="errors.rol" class="text-sm text-red-600">
                            {{ errors.rol }}
                        </p>
                        <p class="text-sm text-gray-600">
                            Los empleados solo pueden registrar ventas y consultar
                            inventario. Los administradores tienen acceso completo al
                            sistema.
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <Button type="submit" :disabled="isPending"
                            class="flex-1 bg-brand-soft hover:bg-brand-base text-white cursor-pointer">
                            {{ isPending ? "Guardando..." : "Crear Empleado" }}
                        </Button>
                        <Button type="button" variant="outline" class="flex-1 cursor-pointer" :disabled="isPending"
                            @click="goBack">
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>