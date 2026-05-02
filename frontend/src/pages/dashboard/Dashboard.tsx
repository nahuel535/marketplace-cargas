import { useAuthStore } from "../../stores/authStore";
import { Truck, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Marketplace de Cargas</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-2">
            Bienvenido, {user?.nombre}!
          </h2>
          <p className="text-gray-500 text-sm">
            Rol: <span className="font-medium capitalize">{user?.rol}</span> —{" "}
            Estado:{" "}
            <span className="font-medium">{user?.status.replace(/_/g, " ")}</span>
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 text-sm">
            Sprint 1 completo. El dashboard completo viene en Sprint 2 y 3.
          </div>
        </div>
      </main>
    </div>
  );
}
