import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Dashboard() {
    return (
     <DashboardLayout>
        <Head title="Dashboard" />

        <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Dashboard
            </h1>
        </div>
     </DashboardLayout>
    );
}
