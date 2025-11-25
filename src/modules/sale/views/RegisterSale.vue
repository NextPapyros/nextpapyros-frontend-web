<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useDebounce } from "@vueuse/core";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Package,
    DollarSign,
} from "lucide-vue-next";

import { getProductsApi } from "../api/saleApi";
import type { Product, CartItem } from "../types/saleTypes";

// Estado reactivo
const searchTerm = ref("");
const cart = ref<CartItem[]>([]);
const isProcessing = ref(false);

// Debounce para búsqueda
const debouncedSearch = useDebounce(searchTerm, 300);

// Query para productos
const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => getProductsApi(debouncedSearch.value || undefined),
    enabled: computed(() => debouncedSearch.value.length > 0 || debouncedSearch.value === ""),
});

// Filtrar productos activos
const activeProducts = computed(() =>
    products.value?.filter(product => product.activo) || []
);

// Agregar producto al carrito
const addToCart = (product: Product) => {
    const existingItem = cart.value.find(item => item.codigo === product.codigo);

    if (existingItem) {
        // Validar stock
        if (existingItem.cantidad >= product.stock) {
            alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
            return;
        }
        existingItem.cantidad += 1;
    } else {
        // Validar stock mínimo
        if (product.stock === 0) {
            alert("Este producto no tiene stock disponible.");
            return;
        }
        cart.value.push({
            codigo: product.codigo,
            nombre: product.nombre,
            precio: product.precio,
            cantidad: 1,
            stockDisponible: product.stock,
        });
    }
};

// Aumentar cantidad
const increaseQuantity = (codigo: string) => {
    const item = cart.value.find(item => item.codigo === codigo);
    if (item && item.cantidad >= item.stockDisponible) {
        alert(`Stock insuficiente. Solo hay ${item.stockDisponible} unidades disponibles.`);
        return;
    }
    if (item) item.cantidad += 1;
};

// Disminuir cantidad
const decreaseQuantity = (codigo: string) => {
    const item = cart.value.find(item => item.codigo === codigo);
    if (item) {
        item.cantidad -= 1;
        if (item.cantidad <= 0) {
            cart.value = cart.value.filter(item => item.cantidad > 0);
        }
    }
};

// Eliminar del carrito
const removeFromCart = (codigo: string) => {
    cart.value = cart.value.filter(item => item.codigo !== codigo);
};

// Calcular subtotal
const subtotal = computed(() =>
    cart.value.reduce((total, item) => total + item.precio * item.cantidad, 0)
);

// Finalizar venta
const finalizeSale = async () => {
    if (cart.value.length === 0) {
        toast("⚠ El carrito está vacío. Agregue productos para continuar.");
        return;
    }

    isProcessing.value = true;

    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("[v0] Venta finalizada:", {
        productos: cart.value,
        total: subtotal.value,
        fecha: new Date().toISOString(),
    });

    toast(
        `🛒 Venta finalizada exitosamente.\nTotal: $${subtotal.value.toLocaleString("es-CO")}`
    );

    // Limpiar carrito
    cart.value = [];
    searchTerm.value = "";
    isProcessing.value = false;
};
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Product Search and List -->
        <div class="lg:col-span-2 space-y-4">
            <!-- Search Bar -->
            <Card>
                <CardContent class="pt-6">
                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-soft" />
                        <Input v-model="searchTerm" type="text" placeholder="Buscar por código, nombre o categoría..."
                            class="pl-10 h-12 text-base" />
                    </div>
                </CardContent>
            </Card>

            <!-- Products Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="isLoading" class="col-span-2 text-center py-12">
                    <Package class="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p class="text-gray-400">Cargando productos...</p>
                </div>
                <div v-else-if="error" class="col-span-2 text-center py-12">
                    <Package class="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p class="text-red-600">Error al cargar productos</p>
                </div>
                <div v-else-if="activeProducts.length === 0" class="col-span-2 text-center py-12">
                    <Package class="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p class="text-dark-soft">No se encontraron productos</p>
                </div>
                <Card v-else v-for="product in activeProducts" :key="product.codigo"
                    class="hover:shadow-md transition-shadow">
                    <CardContent class="p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <h3 class="font-semibold text-dark-base mb-1">
                                    {{ product.nombre }}
                                </h3>
                                <p class="text-sm text-dark-soft mb-1">
                                    {{ product.categoria }}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    Código: {{ product.codigo }}
                                </p>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-lg font-bold text-brand-base">
                                    ${{ product.precio.toLocaleString("es-CO") }}
                                </p>
                                <p class="text-xs text-dark-soft">
                                    Stock: {{ product.stock }} unidades
                                </p>
                            </div>
                            <Button @click="addToCart(product)" :disabled="product.stock === 0"
                                class="bg-brand-soft hover:bg-brand-base text-white" size="sm">
                                <Plus class="h-4 w-4 mr-1" />
                                Agregar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Right Column - Shopping Cart Sidebar -->
        <div class="lg:col-span-1">
            <Card class="sticky top-24">
                <CardHeader class="bg-[#A3EBB133] border-b">
                    <CardTitle class="flex items-center gap-2 text-brand-base">
                        <ShoppingCart class="h-5 w-5" />
                        Carrito de Compra
                    </CardTitle>
                </CardHeader>
                <CardContent class="p-4">
                    <div v-if="cart.length === 0" class="text-center py-8">
                        <ShoppingCart class="h-12 w-12 text-dark-soft mx-auto mb-3 opacity-30" />
                        <p class="text-sm text-dark-soft">El carrito está vacío</p>
                        <p class="text-xs text-muted-foreground mt-1">
                            Agregue productos para comenzar
                        </p>
                    </div>
                    <div v-else class="space-y-4">
                        <!-- Cart Items -->
                        <div class="space-y-3 max-h-[400px] overflow-y-auto">
                            <div v-for="item in cart" :key="item.codigo"
                                class="border border-gray-200 rounded-lg p-3 bg-white">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex-1 pr-2">
                                        <h4 class="font-medium text-sm text-dark-base leading-tight">
                                            {{ item.nombre }}
                                        </h4>
                                        <p class="text-xs text-dark-soft mt-1">
                                            ${{ item.precio.toLocaleString("es-CO") }}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" @click="removeFromCart(item.codigo)"
                                        class="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 class="h-4 w-4" />
                                    </Button>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Button variant="outline" size="icon" @click="decreaseQuantity(item.codigo)"
                                            class="h-7 w-7">
                                            <Minus class="h-3 w-3" />
                                        </Button>
                                        <span class="text-sm font-medium w-8 text-center">
                                            {{ item.cantidad }}
                                        </span>
                                        <Button variant="outline" size="icon" @click="increaseQuantity(item.codigo)"
                                            class="h-7 w-7">
                                            <Plus class="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p class="text-sm font-semibold text-brand-base">
                                        $
                                        {{ (item.precio * item.cantidad).toLocaleString("es-CO") }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Divider -->
                        <div class="border-t border-gray-200 pt-4">
                            <!-- Subtotal -->
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-base font-medium text-gray-900">
                                    Subtotal:
                                </span>
                                <span class="text-base font-semibold text-gray-900">
                                    ${{ subtotal.toLocaleString("es-CO") }}
                                </span>
                            </div>

                            <!-- Total -->
                            <div class="flex justify-between items-center mb-4 p-3 bg-[#A3EBB133] rounded-lg">
                                <span class="text-lg font-bold text-gray-900">
                                    Total:
                                </span>
                                <span class="text-2xl font-bold text-brand-base">
                                    ${{ subtotal.toLocaleString("es-CO") }}
                                </span>
                            </div>

                            <!-- Finalizar Venta Button -->
                            <Button @click="finalizeSale" :disabled="isProcessing"
                                class="w-full bg-brand-base hover:bg-brand-intense text-white h-12 text-base font-semibold">
                                <DollarSign class="h-5 w-5 mr-2" />
                                {{ isProcessing ? "Procesando..." : "Finalizar Venta" }}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>