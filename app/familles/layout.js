// app/familles/layout.js
import ProtectedRoute from "../components/ProtectedRoute";

export default function FamillesLayout({ children }) {
  return (
    <ProtectedRoute>{children}</ProtectedRoute>
  );
}
