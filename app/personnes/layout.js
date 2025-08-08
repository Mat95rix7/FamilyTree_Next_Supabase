// app/personnes/layout.js
import ProtectedRoute from "../components/ProtectedRoute";

export default function PersonnesLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
