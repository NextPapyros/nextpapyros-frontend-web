<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { PackagePlus } from "lucide-vue-next";
import { toast } from "vue-sonner";

import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteNames } from "@/router";
import { getSupplierOptionsListApi } from "@/modules/supplier/api/supplierApi";

import { createProductApi } from "../api/productApi";
import type { NewProduct } from "../types/productTypes";

const router = useRouter();

const formData: NewProduct = reactive({
    code: "",
    name: "",
    category: "",
    supplier: "",
    cost: 0,
    price: 0,
    minStock: 0,
});

const errors = reactive<Record<string, string>>({});

const { data: proveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: getSupplierOptionsListApi,
});

const { mutate, isPending } = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
        // Reset form
        formData.code = "";
        formData.name = "";
        formData.category = "";
        formData.supplier = "";
        formData.cost = 0;
        formData.price = 0;
        formData.minStock = 0;

        toast("✅ Producto creado exitosamente");
        goBack();
    },
    onError: (err: any) => {
        // Handle specific errors
        if (err?.response?.status === 409) {
            errors.codigo = "El código del producto ya existe en el sistema";
        } else if (err?.response?.status === 401) {
            errors.general = "No autorizado. Debe iniciar sesión como administrador.";
        } else if (err?.response?.status === 403) {
            errors.general = "No tiene permisos para crear productos.";
        } else {
            errors.general = "Error al crear el producto. Intente nuevamente.";
        }
    },
});

const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
        newErrors.codigo = "El código es obligatorio";
    }

    if (!formData.name.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.category.trim()) {
        newErrors.categoria = "La categoría es obligatoria";
    }

    if (!formData.supplier) {
        newErrors.proveedor = "Debe seleccionar un proveedor";
    }

    if (formData.cost <= 0) {
        newErrors.costo = "El costo debe ser un valor numérico positivo";
    }

    if (formData.price <= 0) {
        newErrors.precio = "El precio debe ser un valor numérico positivo";
    } else if (formData.price < formData.cost) {
        newErrors.precio = "El precio de venta debe ser mayor o igual al costo";
    }

    if (formData.minStock < 0 || !Number.isInteger(formData.minStock)) {
        newErrors.stockMinimo = "El stock inicial debe ser un número entero mayor o igual a cero";
    }

    Object.assign(errors, newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleInputChange = (field: string, value: string | number) => {
    (formData as any)[field] = value;
    // Clear error when user starts typing
    if (errors[field]) {
        errors[field] = "";
    }
    if (errors.general) {
        errors.general = "";
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
                        <PackagePlus class="h-6 w-6 text-brand-base" />
                    </div>
                    <div>
                        <CardTitle class="text-xl">
                            Registrar Nuevo Producto
                        </CardTitle>
                        <CardDescription>
                            Complete los detalles del producto para agregarlo al catálogo
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

                    <!-- Código -->
                    <div class="space-y-2">
                        <Label for="codigo" class="text-gray-900">
                            Código del Producto <span class="text-red-500">*</span>
                        </Label>
                        <Input id="codigo" v-model="formData.code" type="text" placeholder="Ej: PROD001"
                            :class="{ 'border-red-500': errors.codigo }"
                            @input="handleInputChange('codigo', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.codigo" class="text-sm text-red-600">
                            {{ errors.codigo }}
                        </p>
                    </div>

                    <!-- Nombre -->
                    <div class="space-y-2">
                        <Label for="nombre" class="text-gray-900">
                            Nombre del Producto <span class="text-red-500">*</span>
                        </Label>
                        <Input id="nombre" v-model="formData.name" type="text" placeholder="Ej: Lapicero Azul"
                            :class="{ 'border-red-500': errors.nombre }"
                            @input="handleInputChange('nombre', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.nombre" class="text-sm text-red-600">
                            {{ errors.nombre }}
                        </p>
                    </div>

                    <!-- Categoría -->
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="categoria" class="text-gray-900">
                                Categoría <span class="text-red-500">*</span>
                            </Label>
                            <Input id="categoria" v-model="formData.category" type="text" placeholder="Ej: Papelería"
                                :class="{ 'border-red-500': errors.categoria }"
                                @input="handleInputChange('categoria', ($event.target as HTMLInputElement).value)" />
                            <p v-if="errors.categoria" class="text-sm text-red-600">
                                {{ errors.categoria }}
                            </p>
                        </div>

                        <!-- Proveedor -->
                        <div class="space-y-2">
                            <Label for="proveedor" class="text-gray-900">
                                Proveedor <span class="text-red-500">*</span>
                            </Label>
                            <Select v-model="formData.supplier">
                                <SelectTrigger :class="errors.proveedor ? 'border-red-500' : ''">
                                    <SelectValue placeholder="Seleccione un proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="prov in proveedores" :key="prov.id" :value="prov.name">
                                        {{ prov.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p v-if="errors.proveedor" class="text-sm text-red-600">
                                {{ errors.proveedor }}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Costo -->
                        <div class="space-y-2">
                            <Label for="costo" class="text-gray-900">
                                Costo <span class="text-red-500">*</span>
                            </Label>
                            <Input id="costo" v-model.number="formData.cost" type="number" step="0.01" min="0"
                                placeholder="0.00" :class="{ 'border-red-500': errors.costo }"
                                @input="handleInputChange('costo', parseFloat(($event.target as HTMLInputElement).value))" />
                            <p v-if="errors.costo" class="text-sm text-red-600">
                                {{ errors.costo }}
                            </p>
                        </div>

                        <!-- Precio -->
                        <div class="space-y-2">
                            <Label for="precio" class="text-gray-900">
                                Precio de Venta <span class="text-red-500">*</span>
                            </Label>
                            <Input id="precio" v-model.number="formData.price" type="number" step="0.01" min="0"
                                placeholder="0.00" :class="{ 'border-red-500': errors.precio }"
                                @input="handleInputChange('precio', parseFloat(($event.target as HTMLInputElement).value))" />
                            <p v-if="errors.precio" class="text-sm text-red-600">
                                {{ errors.precio }}
                            </p>
                        </div>
                    </div>

                    <!-- Stock Inicial -->
                    <div class="space-y-2">
                        <Label for="stockMinimo" class="text-gray-900">
                            Stock Inicial <span class="text-red-500">*</span>
                        </Label>
                        <Input id="stockMinimo" v-model.number="formData.minStock" type="number" min="0" step="1"
                            placeholder="0" :class="{ 'border-red-500': errors.stockMinimo }"
                            @input="handleInputChange('stockMinimo', parseInt(($event.target as HTMLInputElement).value))" />
                        <p v-if="errors.stockMinimo" class="text-sm text-red-600">
                            {{ errors.stockMinimo }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <Button type="submit" :disabled="isPending"
                            class="flex-1 bg-brand-soft hover:bg-brand-base text-white cursor-pointer">
                            {{ isPending ? "Guardando..." : "Crear Producto" }}
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