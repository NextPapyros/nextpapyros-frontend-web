<script setup lang="ts">
import { computed, h, ref } from "vue";
import type { CellContext } from "@tanstack/vue-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { LucidePencil, LucidePlus, LucideSearch, LucideTrash2, LucideTriangleAlert } from "lucide-vue-next";
import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";
import { RouterLink } from "vue-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteNames } from "@/router";
import { useUserStore } from "@/store/userStore";
import { Role } from "@/types";

import { deactivateEmployee, getAllEmployees } from "../api/employeeApi";
import type { Employee } from "../types/employeeTypes";
import { toast } from "vue-sonner";

const columnHelper = createColumnHelper<Employee>();

const queryClient = useQueryClient();
const { profile } = useUserStore();

const search = ref("");
const selectedEmployee = ref<Employee | null>(null);
const isModalOpen = ref(false);

const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateEmployee,
});

const { data, isLoading, isError } = useQuery({
    queryKey: ["employess", "all"],
    queryFn: getAllEmployees,
});

const handleDeactivate = () => {
    if (!selectedEmployee.value) return;

    deactivate(selectedEmployee.value.id, {
        onSuccess() {
            isModalOpen.value = false;
            selectedEmployee.value = null;
            queryClient.invalidateQueries({ queryKey: ["employess", "all"] });
        },
        onError() {
            toast("❌ Error al desactivar el empleado");
        }
    });
}

const renderDocumentCell = ({ cell }: CellContext<Employee, string>) => {
    return h("span",
        {
            class: "text-dark-base font-mono text-sm"
        },
        cell.getValue())
};

const renderNameCell = ({ cell }: CellContext<Employee, string>) => {
    return h("span",
        {
            class: "text-dark-base font-medium"
        },
        cell.getValue())
};

const renderEmailCell = ({ cell }: CellContext<Employee, string>) => {
    return h("span",
        {
            class: "text-dark-soft text-sm"
        },
        cell.getValue())
};

const renderRoleCell = ({ cell }: CellContext<Employee, Role>) => {
    const isAdmin = cell.getValue() === Role.Admin;
    const isEmployee = cell.getValue() === Role.Employee;

    return h("span",
        {
            class: ["inline-block px-3 py-1 rounded-full text-xs font-medium", { "bg-accent-soft text-accent-intense": isAdmin, "bg-brand-soft text-brand-intense": isEmployee }]
        },
        isAdmin ? "Administrador" : "Empleado")
};

const renderActiveCell = ({ cell }: CellContext<Employee, boolean>) => {
    return h("span",
        {
            class: ["inline-block px-3 py-1 rounded-full text-xs font-medium", { "bg-brand-soft text-brand-intense": cell.getValue(), "bg-light-soft text-dark-soft": !cell.getValue() }]
        },
        cell.getValue() ? "Activo" : "Inactivo")
};

const renderActionsCell = ({ row }: CellContext<Employee, unknown>) => {
    const linkButton = h(Button,
        {
            size: "sm",
            variant: "outline",
            class: "border-brand-base text-brand-base hover:bg-brand-soft hover:text-brand-intense gap-1 bg-transparent"
        },
        () => [h(LucidePencil, { size: 16 }), "Editar"]
    );

    const link = h(RouterLink,
        {
            to: {
                name: RouteNames.UPDATE_EMPLOYEE,
                params: { id: row.original.id }
            }
        },
        () => linkButton
    );
    if (!row.original.active) return link;

    const deactivateButton = h(Button,
        {
            size: "sm",
            variant: "outline",
            disabled: isDeactivating.value,
            onClick: () => {
                isModalOpen.value = true;
                selectedEmployee.value = row.original;
            },
            class: ['gap-1 border-error-base text-error-base hover:bg-error-soft hover:text-error-intense']
        },
        () => [
            h(LucideTrash2, { size: 16 }), "Desactivar"
        ]
    );

    return [link, deactivateButton];
};

const columns = [
    columnHelper.accessor("id", {
        header: "Documento",
        cell: renderDocumentCell
    }),
    columnHelper.accessor("name", {
        header: "Nombre",
        cell: renderNameCell
    }),
    columnHelper.accessor("email", {
        header: "Correo",
        cell: renderEmailCell
    }),
    columnHelper.accessor("role", {
        header: "Role",
        cell: renderRoleCell
    }),
    columnHelper.accessor("active", {
        header: "Estado",
        cell: renderActiveCell
    }),
    columnHelper.display({
        id: "actions",
        header: "Acciones",
        cell: renderActionsCell
    })
];

const employees = computed(
    () => {
        if (!data.value) return [];

        const normalizedSearch = search.value.trim().toLowerCase();
        const userId = profile?.id.toString();

        return data.value.filter(
            employee => employee.id !== userId &&
                (
                    !normalizedSearch ||
                    employee.name.toLowerCase().includes(normalizedSearch) ||
                    employee.id.toLowerCase().includes(normalizedSearch)
                )
        );
    }
);

const table = useVueTable({
    get data() {
        return employees.value
    },
    columns,
    getCoreRowModel: getCoreRowModel()
});
</script>

<template>
    <div class="flex flex-col gap-8">
        <div class="flex gap-8">
            <div class="flex-1 relative">
                <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-soft" :size="20" />
                <Input placeholder="Buscar por nombre o documento..." v-model="search"
                    class="pl-10 bg-light-intense border-light-soft" />
            </div>

            <RouterLink :to="{ name: RouteNames.CREATE_EMPLOYEE }">
                <Button class="bg-brand-base hover:bg-brand-intense gap-2">
                    <LucidePlus :size="20" />
                    Nuevo Empleado
                </Button>
            </RouterLink>
        </div>

        <div v-if="isLoading" class="flex flex-col gap-4">
            <Skeleton v-for="_ in 5" class="h-11" />
        </div>
        <div v-else-if="isError" class="flex flex-col items-center">
            <LucideTriangleAlert :size="80" class="text-error-base" />
            <p class="text-medium text-dark-soft">Hubo un error al cargar los empleados</p>
        </div>
        <div v-else class="bg-light-intense rounded-lg shadow-sm border border-light-soft overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id"
                        class="bg-light-base border-b border-light-soft">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id"
                            class="text-dark-base font-semibold">
                            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                :props="header.getContext()" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows.length > 0">
                        <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
                            class="border-b border-light-soft hover:bg-light-base transition-colors"
                            :class="{ 'opacity-60': !row.original.active }">
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id"
                                :class="{ 'flex gap-2': cell.column.id === 'actions' }">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colSpan="6" class="text-center py-8 text-dark-soft">
                            No se encontraron empleados
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <Dialog v-model:open="isModalOpen">
            <DialogContent class="bg-light-intense border-light-soft">
                <DialogHeader>
                    <DialogTitle class="text-dark-base">
                        {{ selectedEmployee?.active ? "Desactivar empleado" : "Activar empleado" }}
                    </DialogTitle>
                    <DialogDescription class="text-dark-soft">
                        {{ selectedEmployee?.active
                            ? `¿Está seguro de que desea desactivar a ${selectedEmployee.name}? No podrá acceder al
                        sistema.`
                            : `¿Está seguro de que desea activar a ${selectedEmployee?.name}?` }}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" class="border-light-soft text-dark-base hover:bg-light-base"
                        @click="isModalOpen = false">
                        Cancelar
                    </Button>
                    <Button
                        :class="{ 'bg-error-base hover:bg-error-intense': selectedEmployee?.active, 'bg-brand-base hover:bg-brand-intense': !selectedEmployee?.active }"
                        @click="handleDeactivate">
                        {{ selectedEmployee?.active ? "Desactivar" : "Activar" }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>