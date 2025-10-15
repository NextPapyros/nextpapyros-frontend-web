<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";
import { Truck } from "lucide-vue-next";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteNames } from "@/router";

import { createSupplierApi } from "../api/supplierApi";
import type { NewSupplier } from "../types/supplierTypes";

const router = useRouter();

const formData: NewSupplier = reactive({
    nombre: "",
    nit: "",
    personaContacto: "",
    telefono: "",
    correo: "",
});

const errors = reactive<Record<string, string>>({});

const { mutate, isPending } = useMutation({
    mutationFn: createSupplierApi,
    onSuccess: () => {
        // Reset form
        formData.nombre = "";
        formData.nit = "";
        formData.personaContacto = "";
        formData.telefono = "";
        formData.correo = "";

        toast("✅ Proveedor creado exitosamente");
        goBack();
    },
    onError: (err: any) => {
        // Handle specific errors
        if (err?.response?.status === 409) {
            const errorData = err.response.data;
            if (errorData.message?.includes("NIT")) {
                errors.nit = "Ya existe un proveedor con ese NIT.";
            } else if (errorData.message?.includes("nombre")) {
                errors.nombre = "Ya existe un proveedor con ese nombre.";
            } else {
                errors.general = "Los datos proporcionados ya existen en el sistema";
            }
        } else if (err?.response?.status === 401) {
            errors.general = "No autorizado. Debe iniciar sesión como administrador.";
        } else if (err?.response?.status === 403) {
            errors.general = "No tiene permisos para crear proveedores.";
        } else {
            errors.general = "Error al crear el proveedor. Intente nuevamente.";
        }
    },
});

const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.nit.trim()) {
        newErrors.nit = "El NIT es obligatorio";
    }

    if (!formData.personaContacto.trim()) {
        newErrors.personaContacto = "La persona de contacto es obligatoria";
    }

    if (!formData.telefono.trim()) {
        newErrors.telefono = "El teléfono es obligatorio";
    }

    if (!formData.correo.trim()) {
        newErrors.correo = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
        newErrors.correo = "El correo electrónico no es válido";
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

    mutate(formData);
};

const goBack = () => {
    router.push({ name: RouteNames.ADMIN });
};
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#A3EBB133] rounded-lg">
                        <Truck class="h-6 w-6 text-brand-base" />
                    </div>
                    <div>
                        <CardTitle class="text-xl">
                            Registrar Nuevo Proveedor
                        </CardTitle>
                        <CardDescription>
                            Complete los datos del proveedor para agregarlo al sistema
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

                    <!-- Nombre -->
                    <div class="space-y-2">
                        <Label for="nombre" class="text-gray-900">
                            Nombre del Proveedor <span class="text-red-500">*</span>
                        </Label>
                        <Input id="nombre" v-model="formData.nombre" type="text"
                            placeholder="Ej: Distribuidora Papelera S.A." :class="{ 'border-red-500': errors.nombre }"
                            @input="handleInputChange('nombre', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.nombre" class="text-sm text-red-600">
                            {{ errors.nombre }}
                        </p>
                    </div>

                    <!-- NIT -->
                    <div class="space-y-2">
                        <Label for="nit" class="text-gray-900">
                            NIT <span class="text-red-500">*</span>
                        </Label>
                        <Input id="nit" v-model="formData.nit" type="text" placeholder="Ej: 900123456-7"
                            :class="{ 'border-red-500': errors.nit }"
                            @input="handleInputChange('nit', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.nit" class="text-sm text-red-600">
                            {{ errors.nit }}
                        </p>
                    </div>

                    <!-- Persona de Contacto -->
                    <div class="space-y-2">
                        <Label for="personaContacto" class="text-gray-900">
                            Persona de Contacto <span class="text-red-500">*</span>
                        </Label>
                        <Input id="personaContacto" v-model="formData.personaContacto" type="text"
                            placeholder="Ej: Juan Pérez" :class="{ 'border-red-500': errors.personaContacto }"
                            @input="handleInputChange('personaContacto', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.personaContacto" class="text-sm text-red-600">
                            {{ errors.personaContacto }}
                        </p>
                    </div>

                    <!-- Teléfono -->
                    <div class="space-y-2">
                        <Label for="telefono" class="text-gray-900">
                            Teléfono <span class="text-red-500">*</span>
                        </Label>
                        <Input id="telefono" v-model="formData.telefono" type="text" placeholder="Ej: +57 300 1234567"
                            :class="{ 'border-red-500': errors.telefono }"
                            @input="handleInputChange('telefono', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.telefono" class="text-sm text-red-600">
                            {{ errors.telefono }}
                        </p>
                    </div>

                    <!-- Correo -->
                    <div class="space-y-2">
                        <Label for="correo" class="text-gray-900">
                            Correo Electrónico <span class="text-red-500">*</span>
                        </Label>
                        <Input id="correo" v-model="formData.correo" type="email" placeholder="contacto@proveedor.com"
                            :class="{ 'border-red-500': errors.correo }"
                            @input="handleInputChange('correo', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.correo" class="text-sm text-red-600">
                            {{ errors.correo }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <Button type="submit" :disabled="isPending"
                            class="flex-1 bg-brand-soft hover:bg-brand-base text-white cursor-pointer">
                            {{ isPending ? "Guardando..." : "Crear Proveedor" }}
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