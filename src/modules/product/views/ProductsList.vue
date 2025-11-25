<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { deactivateProduct, getProducts, reactivateProduct } from '../api/productApi';
import { computed, ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideEdit2, LucidePackage, LucidePlus, LucidePower, LucideSearch, LucideTriangleAlert } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RouteNames } from '@/router';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@vueuse/core';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Product } from '@/modules/sale/types/saleTypes';
import AlertDialogAction from '@/components/ui/alert-dialog/AlertDialogAction.vue';
import { toast } from 'vue-sonner';

const DEBOUNCE_DELAY = 500;
const productsListBaseKey = ["products", "all"] as const;

const queryClient = useQueryClient();

const search = ref("");
const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
const onlyLow = ref(false);
const debouncedOnlyLow = useDebounce(onlyLow, DEBOUNCE_DELAY);
const includeInactive = ref(false);
const debouncedIncludeInactive = useDebounce(includeInactive, DEBOUNCE_DELAY);

const isDialogOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

const debouncedFilters = computed(() => ({
    search: debouncedSearch.value,
    onlyLow: debouncedOnlyLow.value,
    includeInactive: debouncedIncludeInactive.value
}));

const { data: products, isLoading, isError } = useQuery({
    queryKey: [...productsListBaseKey, debouncedFilters],
    queryFn: () => getProducts(debouncedFilters.value)
});

const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateProduct,
    onSuccess() {
        queryClient.invalidateQueries({ queryKey: productsListBaseKey });
        toast.success("Producto desactivado correctamente");
    },
    onError() {
        toast.error("Hubo un error al desactivar el producto");
    },
    onSettled() {
        isDialogOpen.value = false;
        selectedProduct.value = null;
    }
});

const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: reactivateProduct,
    onSuccess() {
        queryClient.invalidateQueries({ queryKey: productsListBaseKey });
        toast.success("Producto reactivado correctamente");
    },
    onError() {
        toast.error("Hubo un error al reactivar el producto");
    },
    onSettled() {
        isDialogOpen.value = false;
        selectedProduct.value = null;
    }
});

const handleToggleState = (producto: Product) => {
    selectedProduct.value = producto;
    isDialogOpen.value = true;
}

const handleCancelDialog = () => {
    selectedProduct.value = null;
    isDialogOpen.value = false;
}

const handleConfirmDialog = () => {
    if (!selectedProduct.value || isDeactivating.value || isReactivating.value) return;

    if (selectedProduct.value.activo)
        deactivate(selectedProduct.value.codigo);
    else
        reactivate(selectedProduct.value.codigo);
}
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <Card class="mb-6">
            <CardHeader class="flex !flex-row justify-between">
                <div>
                    <CardTitle>Buscar Productos</CardTitle>
                    <CardDescription>Ingrese el código o nombre del producto</CardDescription>
                </div>
                <RouterLink :to="{ name: RouteNames.CREATE_PRODUCT }">
                    <Button class="bg-brand-base hover:bg-brand-intense gap-2">
                        <LucidePlus :size="20" />
                        Nuevo Producto
                    </Button>
                </RouterLink>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex gap-2">
                    <div class="flex-1 relative">
                        <LucideSearch class="absolute left-3 top-2.5 h-5 w-5 text-dark-soft" />
                        <Input placeholder="Buscar por código o nombre..." v-model="search" class="pl-10" />
                    </div>
                </div>
                <div class="flex gap-2">
                    <div class="flex items-center gap-2">
                        <Checkbox id="stock-bajo" v-model="onlyLow" />
                        <Label for="stock-bajo" class="text-sm font-medium cursor-pointer">
                            Mostrar solo productos con stock bajo
                        </Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox id="inactivos" v-model="includeInactive" />
                        <Label for="inactivos" class="text-sm font-medium cursor-pointer">
                            Mostrar productos inactivos
                        </Label>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Productos Registrados</CardTitle>
                <Skeleton v-if="isLoading" class="w-36 h-6" />
                <CardDescription v-else>Total: {{ products?.length }} producto(s)</CardDescription>
            </CardHeader>
            <CardContent>
                <div v-if="isLoading" class="flex flex-col gap-4">
                    <Skeleton v-for="_ in 5" class="h-11" />
                </div>
                <div v-else-if="isError" class="flex flex-col items-center">
                    <LucideTriangleAlert :size="80" class="text-error-base" />
                    <p class="text-medium text-dark-soft">Hubo un error al cargar los productos</p>
                </div>
                <div v-else-if="products?.length === 0" class="text-center py-8">
                    <LucidePackage class="h-12 w-12 text-dark-soft/30 mx-auto mb-3" />
                    <p class="text-dark-soft">No se encontraron productos</p>
                </div>
                <div v-else className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead class="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="producto in products!" :key="producto.codigo"
                                :class="{ 'opacity-60': !producto.activo }">
                                <TableCell className="font-mono text-sm">{{ producto.codigo }}</TableCell>
                                <TableCell className="font-medium">{{ producto.nombre }}</TableCell>
                                <TableCell>{{ producto.categoria }}</TableCell>
                                <TableCell>${{ producto.precio.toLocaleString("es-CO") }}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" :class="{
                                        'bg-error-soft text-error-intense': producto.stock === 0,
                                        'bg-accent-soft text-accent-intense': producto.stock < 10,
                                        'bg-brand-soft text-brand-intense': producto.stock >= 10
                                    }">
                                        {{ producto.stock }}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" :class="{
                                        'bg-brand-soft text-brand-intense': producto.activo,
                                        'bg-dark-soft text-light-intense': !producto.activo
                                    }">
                                        {{ producto.activo ? "Activo" : "Inactivo" }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-right">
                                    <div class="flex justify-end gap-2">
                                        <RouterLink
                                            :to="{ name: RouteNames.UPDATE_PRODUCT, params: { id: producto.codigo } }">
                                            <Button variant="ghost" size="icon" title="Editar"
                                                class="hover:bg-brand-soft">
                                                <LucideEdit2 class="h-4 w-4 text-dark-intense" />
                                            </Button>
                                        </RouterLink>
                                        <Button variant="ghost" size="icon"
                                            :title="producto.activo ? 'Desactivar' : 'Activar'"
                                            :class="producto.activo ? 'hover:bg-red-200' : 'hover:bg-green-200'"
                                            @click="handleToggleState(producto)">
                                            <LucidePower class="h-4 w-4"
                                                :class="producto.activo ? 'text-error-intense' : 'text-brand-intense'" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>

    <AlertDialog v-model:open="isDialogOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {{ selectedProduct?.activo ? "Desactivar Producto" : "Activar Producto" }}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    <template v-if="selectedProduct?.activo">
                        ¿Está seguro de que desea desactivar {{ selectedProduct?.nombre }}. El producto no estará
                        disponible para la venta pero se mantendrá en el catálogo.
                    </template>
                    <template v-else>
                        ¿Está seguro de que desea activar {{ selectedProduct?.nombre }}? El producto volverá a estar
                        disponible para la venta.
                    </template>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel @click="handleCancelDialog">Cancelar</AlertDialogCancel>
            <AlertDialogAction @click="handleConfirmDialog"
                :class="selectedProduct?.activo ? 'bg-error-base hover:bg-error-intense' : 'bg-brand-base hover:bg-brand-intense'">
                {{ selectedProduct?.activo ? 'Desactivar' : 'Activar' }}
            </AlertDialogAction>
        </AlertDialogContent>
    </AlertDialog>
</template>