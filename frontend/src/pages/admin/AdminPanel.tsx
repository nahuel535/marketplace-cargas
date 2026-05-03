import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Users, FileText, Truck, LogOut } from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import type { Documento } from "../../lib/api-tipos";
import type { User } from "../../types";

export default function AdminPanel() {
  const { logout } = useAuthStore();
  const [tab, setTab] = useState<"usuarios" | "documentos">("documentos");
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [docsRes, usersRes, statsRes] = await Promise.all([
        api.get("/admin/documentos?estado=pendiente"),
        api.get("/admin/users?status=pendiente_verificacion"),
        api.get("/admin/dashboard"),
      ]);
      setDocumentos(docsRes.data);
      setUsuarios(usersRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const aprobarDoc = async (id: string) => {
    await api.post(`/admin/documentos/${id}/aprobar`);
    setDocumentos(prev => prev.filter(d => d.id !== id));
  };

  const rechazarDoc = async (id: string) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    await api.post(`/admin/documentos/${id}/rechazar`, { motivo_rechazo: motivo });
    setDocumentos(prev => prev.filter(d => d.id !== id));
  };

  const verificarUser = async (id: string) => {
    await api.post(`/admin/users/${id}/verificar`);
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const ESTADO_BADGE: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    vencido: "bg-gray-100 text-gray-800",
  };

  const DOC_LABELS: Record<string, string> = {
    dni: "DNI", cuit: "CUIT", ruta: "RUTA", poliza_seguro: "Póliza de seguro",
    vtv: "VTV", cedula_verde: "Cédula verde", licencia_conducir: "Licencia",
    monotributo: "Monotributo", otro: "Otro",
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Admin — Marketplace de Cargas</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Usuarios totales", value: stats.usuarios_total, icon: Users },
              { label: "Pendientes verificación", value: stats.usuarios_pendientes, icon: Users },
              { label: "Docs pendientes", value: stats.documentos_pendientes, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className="bg-primary-50 p-3 rounded-lg">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {(["documentos", "usuarios"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "documentos" ? `Documentos (${documentos.length})` : `Usuarios (${usuarios.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : tab === "documentos" ? (
          <div className="space-y-3">
            {documentos.length === 0 && (
              <div className="card text-center py-12 text-gray-500">No hay documentos pendientes</div>
            )}
            {documentos.map(doc => (
              <div key={doc.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{DOC_LABELS[doc.tipo] ?? doc.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[doc.estado]}`}>
                      {doc.estado}
                    </span>
                  </div>
                  {doc.vencimiento && (
                    <p className="text-xs text-gray-500">Vence: {doc.vencimiento}</p>
                  )}
                </div>
                <a
                  href={doc.archivo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Ver archivo
                </a>
                <button
                  onClick={() => aprobarDoc(doc.id)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> Aprobar
                </button>
                <button
                  onClick={() => rechazarDoc(doc.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {usuarios.length === 0 && (
              <div className="card text-center py-12 text-gray-500">No hay usuarios pendientes</div>
            )}
            {usuarios.map(u => (
              <div key={u.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-gray-500">{u.email} · {u.rol}</p>
                </div>
                <button
                  onClick={() => verificarUser(u.id)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> Verificar
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
