'use client';
import AdminDashboard from '../components/AdminDash';
import ProtectedPage from '../components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedPage requiredRole="admin">
      <AdminDashboard />
    </ProtectedPage>
  );
}
