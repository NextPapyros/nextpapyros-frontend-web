<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, House } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { RouteNames } from "@/router";

interface ItemComprobante {
    codigo: string;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
}

const { profile } = useUserStore();

const comprobante = ref({
    numeroTransaccion: "TRX-20250125-001",
    fecha: new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }),
    empleado: profile?.name,
    items: [
        {
            codigo: "PROD-001",
            nombre: "Cuaderno Universitario 100 Hojas",
            cantidad: 2,
            precio: 3500,
            subtotal: 7000,
        },
        {
            codigo: "PROD-003",
            nombre: "Resma Papel Bond Carta",
            cantidad: 1,
            precio: 12000,
            subtotal: 12000,
        },
        {
            codigo: "PROD-002",
            nombre: "Bolígrafo Azul Punta Fina",
            cantidad: 5,
            precio: 800,
            subtotal: 4000,
        },
    ] as ItemComprobante[],
    subtotal: 23000,
    impuesto: 0,
    total: 23000,
});

const calcularTotal = () => {
    return comprobante.value.items.reduce((total, item) => total + item.subtotal, 0);
};

const handleImprimir = () => {
    window.print();
};

const handleDescargar = () => {
    console.log("[v0] Descargando comprobante:", comprobante.value.numeroTransaccion);
    // TODO: Implement PDF download functionality
};
</script>

<template>
    <div class="min-h-screen bg-light-base">
        <!-- Header -->
        <header class="bg-white border-b border-border sticky top-0 z-10">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <RouterLink to="/">

                            <img src="/hoja-icono.png" alt="NextPapyros" width="40" height="40"
                                class="object-contain" />
                        </RouterLink>
                        <div>
                            <h1 class="text-2xl font-bold text-dark-base">
                                Comprobante de Venta
                            </h1>
                            <p class="text-sm text-dark-soft">Recibo de transacción</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <Button variant="outline" @click="handleImprimir"
                            class="border-brand-base text-brand-base hover:bg-brand-soft/10 bg-transparent">
                            <Printer class="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button variant="outline" @click="handleDescargar"
                            class="border-accent-base text-accent-base hover:bg-accent-soft/10 bg-transparent">
                            <Download class="h-4 w-4 mr-2" />
                            Descargar
                        </Button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto">
                <!-- Receipt Card -->
                <Card class="border-2 border-brand-base/20 shadow-lg">
                    <!-- Header Receipt -->
                    <CardHeader
                        class="bg-gradient-to-r from-brand-soft/20 to-accent-soft/20 text-center border-b-2 border-brand-base/20">
                        <div class="flex justify-center mb-4">
                            <img src="/hoja-icono.png" alt="NextPapyros" width="60" height="60"
                                class="object-contain" />
                        </div>
                        <h2 class="text-xl font-bold text-brand-base">NextPapyros</h2>
                        <p class="text-sm text-brand-base/70">
                            Sistema de Gestión de Papelería
                        </p>
                    </CardHeader>

                    <CardContent class="p-6 space-y-6">
                        <!-- Transaction Info -->
                        <div class="grid grid-cols-2 gap-4 text-sm border-b border-border pb-4">
                            <div>
                                <p class="text-dark-soft text-xs font-medium">
                                    Transacción:
                                </p>
                                <p class="font-mono font-bold text-dark-base">
                                    {{ comprobante.numeroTransaccion }}
                                </p>
                            </div>
                            <div>
                                <p class="text-dark-soft text-xs font-medium">
                                    Fecha y Hora:
                                </p>
                                <p class="font-semibold text-dark-base">
                                    {{ comprobante.fecha }}
                                </p>
                            </div>
                            <div>
                                <p class="text-dark-soft text-xs font-medium">
                                    Empleado:
                                </p>
                                <p class="font-semibold text-dark-base">
                                    {{ comprobante.empleado }}
                                </p>
                            </div>
                            <div>
                                <p class="text-dark-soft text-xs font-medium">Estado:</p>
                                <Badge class="bg-brand-soft text-brand-intense">
                                    Finalizada
                                </Badge>
                            </div>
                        </div>

                        <!-- Items Table -->
                        <div>
                            <p class="text-sm font-semibold text-dark-base mb-3">
                                Detalles de la Compra:
                            </p>
                            <div class="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow class="bg-brand-soft/10 border-b-2 border-brand-base">
                                            <TableHead class="text-brand-base font-semibold">
                                                Código
                                            </TableHead>
                                            <TableHead class="text-brand-base font-semibold">
                                                Producto
                                            </TableHead>
                                            <TableHead class="text-brand-base font-semibold text-center">
                                                Cant.
                                            </TableHead>
                                            <TableHead class="text-brand-base font-semibold text-right">
                                                Precio
                                            </TableHead>
                                            <TableHead class="text-brand-base font-semibold text-right">
                                                Subtotal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow v-for="(item, index) in comprobante.items" :key="index"
                                            class="border-b border-border/50">
                                            <TableCell class="font-mono text-xs text-dark-soft">
                                                {{ item.codigo }}
                                            </TableCell>
                                            <TableCell class="text-sm">
                                                {{ item.nombre }}
                                            </TableCell>
                                            <TableCell class="text-center font-medium">
                                                {{ item.cantidad }}
                                            </TableCell>
                                            <TableCell class="text-right text-sm">
                                                ${{ item.precio.toLocaleString("es-CO") }}
                                            </TableCell>
                                            <TableCell class="text-right font-semibold text-brand-base">
                                                ${{ item.subtotal.toLocaleString("es-CO") }}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <!-- Summary -->
                        <div class="border-t-2 border-brand-base/20 pt-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-dark-base font-medium">Subtotal:</span>
                                <span class="font-semibold text-dark-base">
                                    ${{ comprobante.subtotal.toLocaleString("es-CO") }}
                                </span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-dark-base font-medium">Impuesto:</span>
                                <span class="font-semibold text-dark-base">
                                    ${{ comprobante.impuesto.toLocaleString("es-CO") }}
                                </span>
                            </div>
                            <div
                                class="flex justify-between bg-brand-soft/20 p-3 rounded-lg border border-brand-base/30">
                                <span class="font-bold text-brand-intense">TOTAL:</span>
                                <span class="text-2xl font-bold text-brand-base">
                                    ${{ calcularTotal().toLocaleString("es-CO") }}
                                </span>
                            </div>
                        </div>

                        <!-- Footer Message -->
                        <div class="text-center pt-4 border-t border-border text-xs text-dark-soft">
                            <p>¡Gracias por su compra!</p>
                            <p class="mt-1">
                                Por favor conserve este comprobante como constancia de pago
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <!-- Action Buttons -->
                <div class="flex gap-3 mt-6">
                    <RouterLink :to="{ name: RouteNames.REGISTER_SALE }" class="flex-1">
                        <Button class="w-full bg-brand-base hover:bg-brand-intense text-white">
                            <House class="h-4 w-4 mr-2" />
                            Nueva Venta
                        </Button>
                    </RouterLink>
                    <Button variant="outline" class="flex-1 bg-transparent" @click="handleImprimir">
                        <Printer class="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>
        </main>
    </div>
</template>