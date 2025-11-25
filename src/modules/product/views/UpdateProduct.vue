<script setup lang="ts">
import { reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { PackageCheck } from "lucide-vue-next";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteNames } from "@/router";

import { getProductByCode, updateProduct } from "../api/productApi";
import type { ProductUpdate } from "../types/productTypes";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const productCode = route.params.id as string;

const formData = reactive({
    code: "",
    name: "",
    category: "",
    cost: 0,
    price: 0,
    minStock: 0,
});

const errors = reactive<Record<string, string>>({});

const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productCode],
    queryFn: () => getProductByCode(productCode),
    enabled: !!productCode,
});

watch(product, (newProduct) => {
    if (newProduct) {
        formData.code = newProduct.codigo;
        formData.name = newProduct.nombre;
        formData.category = newProduct.categoria;
        formData.cost = newProduct.costo;
        formData.price = newProduct.precio;
        formData.minStock = newProduct.stockMinimo;
    }
}, { immediate: true });

const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductUpdate) => updateProduct(productCode, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product", productCode] });

        toast("✅ Producto actualizado exitosamente");
        goBack();
    },
    onError: (err: any) => {
        if (err?.response?.status === 401) {
            errors.general = "No autorizado. Debe iniciar sesión como administrador.";
        } else if (err?.response?.status === 403) {
            errors.general = "No tiene permisos para actualizar productos.";
        } else {
            errors.general = "Error al actualizar el producto. Intente nuevamente.";
        }
    },
});

const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.category.trim()) {
        newErrors.categoria = "La categoría es obligatoria";
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

    const payload: ProductUpdate = {
        name: formData.name,
        category: formData.category,
        cost: formData.cost,
        price: formData.price,
        minStock: formData.minStock,
    };

    mutate(payload);
};

const goBack = () => {
    router.replace({ name: RouteNames.PRODUCTS_LIST });
};
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#A3EBB133] rounded-lg">
                        <PackageCheck class="h-6 w-6 text-brand-base" />
                    </div>
                    <div>
                        <CardTitle class="text-xl">
                            Actualizar Producto
                        </CardTitle>
                        <CardDescription>
                            Modifique los detalles del producto
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div v-if="isLoadingProduct" class="flex justify-center py-8">
                    <p class="text-gray-500">Cargando información del producto...</p>
                </div>

                <form v-else @submit="handleSubmit" class="space-y-6">
                    <!-- General Error -->
                    <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p class="text-sm text-red-600">{{ errors.general }}</p>
                    </div>

                    <!-- Código (Readonly) -->
                    <div class="space-y-2">
                        <Label for="codigo" class="text-gray-900">
                            Código del Producto
                        </Label>
                        <Input id="codigo" v-model="formData.code" type="text" disabled class="bg-gray-100" />
                    </div>

                    <!-- Nombre -->
                    <div class="space-y-2">
                        <Label for="nombre" class="text-gray-900">
                            Nombre del Producto <span class="text-red-500">*</span>
                        </Label>
                        <Input id="nombre" v-model="formData.name" type="text" placeholder="Ej: Lapicero Azul"
                            :class="{ 'border-red-500': errors.nombre }"
                            @input="handleInputChange('name', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.nombre" class="text-sm text-red-600">
                            {{ errors.nombre }}
                        </p>
                    </div>

                    <!-- Categoría -->
                    <div class="space-y-2">
                        <Label for="categoria" class="text-gray-900">
                            Categoría <span class="text-red-500">*</span>
                        </Label>
                        <Input id="categoria" v-model="formData.category" type="text" placeholder="Ej: Papelería"
                            :class="{ 'border-red-500': errors.categoria }"
                            @input="handleInputChange('category', ($event.target as HTMLInputElement).value)" />
                        <p v-if="errors.categoria" class="text-sm text-red-600">
                            {{ errors.categoria }}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Costo -->
                        <div class="space-y-2">
                            <Label for="costo" class="text-gray-900">
                                Costo <span class="text-red-500">*</span>
                            </Label>
                            <Input id="costo" v-model.number="formData.cost" type="number" step="0.01" min="0"
                                placeholder="0.00" :class="{ 'border-red-500': errors.costo }"
                                @input="handleInputChange('cost', parseFloat(($event.target as HTMLInputElement).value))" />
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
                                @input="handleInputChange('price', parseFloat(($event.target as HTMLInputElement).value))" />
                            <p v-if="errors.precio" class="text-sm text-red-600">
                                {{ errors.precio }}
                            </p>
                        </div>
                    </div>

                    <!-- Stock Minimo -->
                    <div class="space-y-2">
                        <Label for="stockMinimo" class="text-gray-900">
                            Stock Minimo <span class="text-red-500">*</span>
                        </Label>
                        <Input id="stockMinimo" v-model.number="formData.minStock" type="number" min="0" step="1"
                            placeholder="0" :class="{ 'border-red-500': errors.stockMinimo }"
                            @input="handleInputChange('minStock', parseInt(($event.target as HTMLInputElement).value))" />
                        <p v-if="errors.stockMinimo" class="text-sm text-red-600">
                            {{ errors.stockMinimo }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <Button type="submit" :disabled="isPending"
                            class="flex-1 bg-brand-soft hover:bg-brand-base text-white cursor-pointer">
                            {{ isPending ? "Guardando..." : "Actualizar Producto" }}
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
