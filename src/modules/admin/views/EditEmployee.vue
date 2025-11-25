<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { UserCog } from "lucide-vue-next";
import { toast } from "vue-sonner";

import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteNames } from "@/router";
import { Role } from "@/types";

import { getEmployeeById, updateEmployee } from "@/modules/employee/api/employeeApi";
import { EmployeeUpdateError } from "@/modules/employee/types/employeeTypes";

type FormData = {
    document: string;
    name: string;
    email: string;
    rol: Role;
}

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const employeeId = route.params.id as string;

const formData = reactive<FormData>({
    document: "",
    name: "",
    email: "",
    rol: Role.Employee,
});
const isLoadingEmployee = ref(false);

const errors = reactive<Record<string, string>>({});

const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => updateEmployee(employeeId, data),
    onSuccess: (result) => {
        if (result === EmployeeUpdateError.UNAUTHORIZED) {
            toast.error("No tiene permisos para realizar esta acción");
            return;
        }
        if (result === EmployeeUpdateError.INVALID_ROLE) {
            toast.error("Rol inválido");
            return;
        }
        if (result === EmployeeUpdateError.EMAIL_ALREADY_EXISTS) {
            errors.correo = "El correo electrónico ya está registrado";
            return;
        }

        queryClient.invalidateQueries({ queryKey: ["employess", "all"] });
        queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });

        toast.success("✅ Empleado actualizado exitosamente");
        goBack();
    },
    onError: () => {
        errors.general = "Error al actualizar el empleado. Intente nuevamente.";
    },
});

const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
    if (errors[field]) {
        errors[field] = "";
    }
    if (errors.general) {
        errors.general = "";
    }
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
        name: formData.name,
        email: formData.email,
        role: formData.rol,
    });
};

const goBack = () => {
    router.replace({ name: RouteNames.EMPLOYEES_LIST });
};

const loadEmployee = async () => {
    isLoadingEmployee.value = true;

    try {
        const employee = await getEmployeeById(employeeId);
        formData.document = employee.id;
        formData.name = employee.name;
        formData.email = employee.email;
        formData.rol = employee.role;
    } catch (_) {
        toast.error("Error al cargar el empleado");
        goBack();
    } finally {
        isLoadingEmployee.value = false;
    }
}

onMounted(() => {
    loadEmployee();
})
</script>

<template>
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#A3EBB133] rounded-lg">
                        <UserCog class="h-6 w-6 text-brand-base" />
                    </div>
                    <div>
                        <CardTitle class="text-xl">
                            Editar Empleado
                        </CardTitle>
                        <CardDescription>
                            Modifique los datos del empleado. El documento de identidad no puede ser cambiado.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div v-if="isLoadingEmployee" class="flex justify-center p-8">
                    <p>Cargando información del empleado...</p>
                </div>
                <form v-else @submit="handleSubmit" class="space-y-6">
                    <!-- General Error -->
                    <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p class="text-sm text-red-600">{{ errors.general }}</p>
                    </div>

                    <!-- Documento (Read-only) -->
                    <div class="space-y-2">
                        <Label for="documento" class="text-gray-900">
                            Documento de Identidad
                        </Label>
                        <Input id="documento" v-model="formData.document" type="text" disabled class="bg-gray-100" />
                        <p class="text-xs text-gray-500">
                            El documento de identidad no se puede modificar.
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
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <Button type="submit" :disabled="isPending"
                            class="flex-1 bg-brand-soft hover:bg-brand-base text-white cursor-pointer">
                            {{ isPending ? "Guardando..." : "Guardar Cambios" }}
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
