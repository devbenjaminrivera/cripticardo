import type { Metadata } from 'next';
import AdminPanelClient from '@/components/admin/AdminPanelClient';

export const metadata: Metadata = {
  title: 'Panel de Administración',
  description: 'Panel de creación, programación y gestión de crípticos para el calendario de Cripticardo.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminPanelClient />;
}