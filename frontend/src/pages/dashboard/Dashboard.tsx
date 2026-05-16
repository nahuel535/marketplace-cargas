import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, LogOut, FileText, Car, User, AlertCircle } from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import type { TransportistaProfile, Vehiculo, Documento } from "../../lib/api-tipos";

interface DadorProfile {
  cuit_dni: string;
  tipo: string;
  ciudad: string | null;
  provincia: string | null;
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transportistaData, setTransportistaData] = useState<{
    perfil: TransportistaProfile | null;
    vehiculos: Vehiculo[];
    documentos: Documento[];
  } | null>(null);
  const [dadorData, setDadorData] = useState<DadorProfile | null>(null);

  useEffect(() => {
    verificarPerfil();
  }, []);

  const verificarPerfil = async () => {
    if (!user) return;
    try {
      if (user.rol === "transportista") {
        const [perfilRes, veicRes, docsRes] = await Promise.all([
          api.get("/transportistas/me").catch(() => null),
          api.get("/vehiculos/me").catch(() => ({ data: [] })),
          api.get("/documentos/me").catch(() => ({ data: [] })),
        ]);
        if (!perfilRes) {
          navigate("/onboarding/transportista");
          return;
        }
        setTransportistaData({
          perfil: perfilRes.data,
          vehiculos: veicRes?.data ?? [],
          documentos: docsRes?.data ?? [],
        });

      } else if (user.rol === "dador") {
        const res = await api.get("/dadores/me").catch(() => null);
        if (!res) {
          navigate("/onboarding/dador");
          return;
        }
        setDadorData(res.data);

      } else if (user.rol === "admin") {
        navigate("/admin");
        return;
      }
    } catch {
      // si falla la verificación dejamos cargar igual
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const docsAprobados = transportistaData?.documentos.filter(d => d.estado === "aprobado").length ?? 0;
  const docsPendientes = transportistaData?.documentos.filter(d => d.estado === "pendiente").length ?? 0;
  const docsRechazados = transportistaData?.documentos.filter(d => d.estado === "rechazado").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-gray-900" />
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Estado cuenta */}
        {user?.status === "pendiente_verificacion" && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Tu cuenta está pendiente de verificación. El equipo la revisará en las próximas 24-48 horas.</span>
          </div>
        )}

        {/* Transportista dashboard */}
        {user?.rol === "transportista" && transportistaData && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="card flex items-center gap-3">
                <div className="bg-green-50 p-2.5 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{docsAprobados}</p>
                  <p className="text-xs text-gray-500">Docs aprobados</p>
                </div>
              </div>
              <div className="card flex items-center gap-3">
                <div className="bg-yellow-50 p-2.5 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{docsPendientes}</p>
                  <p className="text-xs text-gray-500">En revisión</p>
                </div>
              </div>
              <div className="card flex items-center gap-3">
                <div className="bg-primary-50 p-2.5 rounded-lg">
                  <Car className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{transportistaData.vehiculos.length}</p>
                  <p className="text-xs text-gray-500">Vehículos</p>
                </div>
              </div>
            </div>

            {docsRechazados > 0 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Tenés {docsRechazados} documento(s) rechazado(s). Actualizalos para completar tu verificación.</span>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Tu perfil
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">CUIT:</span>
                  <span className="ml-2 font-medium">{transportistaData.perfil?.cuit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Ubicación:</span>
                  <span className="ml-2 font-medium">{transportistaData.perfil?.ciudad}, {transportistaData.perfil?.provincia}</span>
                </div>
                <div>
                  <span className="text-gray-500">Radio de operación:</span>
                  <span className="ml-2 font-medium">{transportistaData.perfil?.radio_operacion_km} km</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="ml-2 font-medium">{transportistaData.perfil?.rating_promedio?.toFixed(1) ?? "—"}</span>
                </div>
              </div>
            </div>

            {transportistaData.vehiculos.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Mis vehículos
                </h3>
                <div className="space-y-2">
                  {transportistaData.vehiculos.map(v => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="font-medium text-sm">{v.patente}</span>
                        <span className="text-xs text-gray-500 ml-2">{v.marca} {v.modelo}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.verificado ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {v.verificado ? "Verificado" : "Pendiente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Dador dashboard */}
        {user?.rol === "dador" && dadorData && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Tu perfil
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">CUIT/DNI:</span>
                <span className="ml-2 font-medium">{dadorData.cuit_dni}</span>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <span className="ml-2 font-medium capitalize">{dadorData.tipo?.replace(/_/g, " ")}</span>
              </div>
              {dadorData.ciudad && (
                <div>
                  <span className="text-gray-500">Ubicación:</span>
                  <span className="ml-2 font-medium">{dadorData.ciudad}, {dadorData.provincia}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coming soon */}
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Sprint 3 en camino</p>
          <p className="text-xs text-blue-600 mt-1">Próximamente: publicar cargas, recibir ofertas y gestionar viajes.</p>
        </div>
      </main>
    </div>
  );
}
