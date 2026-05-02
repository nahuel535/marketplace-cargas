import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ChevronRight, Truck, FileText, Car } from "lucide-react";
import api from "../../lib/api";
import { PROVINCIAS_AR, VEHICULO_TIPO_LABELS, type VehiculoTipo } from "../../lib/api-tipos";

// ── Schemas ──────────────────────────────────────────────────────────────────
const schemaPerfil = z.object({
  cuit: z.string().min(10, "CUIT inválido"),
  tipo: z.enum(["particular", "monotributista", "responsable_inscripto", "empresa"]),
  razon_social: z.string().optional(),
  ciudad: z.string().min(2, "Ingresá tu ciudad"),
  provincia: z.string().min(2, "Seleccioná una provincia"),
  radio_operacion_km: z.number().min(50).max(5000),
  bio: z.string().optional(),
});

const schemaVehiculo = z.object({
  tipo: z.enum(["utilitario","furgon","camion_chico","camion_grande","semi","tractor","batea","tolva","cisterna","porta_contenedor","otro"]),
  patente: z.string().min(6, "Patente inválida").toUpperCase(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().min(1980).max(2030).optional(),
  capacidad_kg: z.number().min(100, "Ingresá la capacidad"),
  refrigerado: z.boolean().default(false),
  tiene_hidrogrua: z.boolean().default(false),
});

type PerfilData = z.infer<typeof schemaPerfil>;
type VehiculoData = z.infer<typeof schemaVehiculo>;

const PASOS = [
  { label: "Tu perfil", icon: Truck },
  { label: "Vehículo", icon: Car },
  { label: "Documentos", icon: FileText },
];

export default function OnboardingTransportista() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState("");
  const [vehiculoId, setVehiculoId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, File>>({});

  // ── Paso 1: Perfil ────────────────────────────────────────────────────────
  const perfilForm = useForm<PerfilData>({
    resolver: zodResolver(schemaPerfil),
    defaultValues: { radio_operacion_km: 500 },
  });

  const guardarPerfil = async (data: PerfilData) => {
    setError("");
    try {
      await api.post("/transportistas/profile", data);
      setPaso(1);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al guardar perfil");
    }
  };

  // ── Paso 2: Vehículo ─────────────────────────────────────────────────────
  const vehiculoForm = useForm<VehiculoData>({
    resolver: zodResolver(schemaVehiculo),
    defaultValues: { refrigerado: false, tiene_hidrogrua: false },
  });

  const guardarVehiculo = async (data: VehiculoData) => {
    setError("");
    try {
      const res = await api.post("/vehiculos", data);
      setVehiculoId(res.data.id);
      setPaso(2);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al guardar vehículo");
    }
  };

  // ── Paso 3: Documentos ───────────────────────────────────────────────────
  const DOCS_REQUERIDOS = [
    { key: "dni", label: "DNI (frente y dorso)" },
    { key: "ruta", label: "RUTA (Reg. Único Transporte Automotor)" },
    { key: "poliza_seguro", label: "Póliza de seguro" },
    { key: "vtv", label: "VTV del vehículo" },
  ];

  const subirDocumentos = async () => {
    setError("");
    try {
      for (const [tipo, file] of Object.entries(docs)) {
        const fd = new FormData();
        fd.append("tipo", tipo);
        fd.append("archivo", file);
        if (vehiculoId && ["vtv", "cedula_verde"].includes(tipo)) {
          fd.append("vehiculo_id", vehiculoId);
        }
        await api.post("/documentos", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al subir documentos");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Marketplace de Cargas</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {PASOS.map((p, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= paso ? "text-primary-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i < paso ? "bg-primary-600 border-primary-600 text-white"
                  : i === paso ? "border-primary-600 text-primary-600"
                  : "border-gray-300 text-gray-400"
                }`}>
                  {i < paso ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{p.label}</span>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < paso ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          {/* ── PASO 1: PERFIL ── */}
          {paso === 0 && (
            <form onSubmit={perfilForm.handleSubmit(guardarPerfil)} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Completá tu perfil</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CUIT</label>
                  <input {...perfilForm.register("cuit")} className="input-field" placeholder="20-12345678-9" />
                  {perfilForm.formState.errors.cuit && <p className="error-msg">{perfilForm.formState.errors.cuit.message}</p>}
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select {...perfilForm.register("tipo")} className="input-field">
                    <option value="">Seleccioná...</option>
                    <option value="particular">Particular</option>
                    <option value="monotributista">Monotributista</option>
                    <option value="responsable_inscripto">Resp. Inscripto</option>
                    <option value="empresa">Empresa</option>
                  </select>
                  {perfilForm.formState.errors.tipo && <p className="error-msg">{perfilForm.formState.errors.tipo.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Razón social (opcional)</label>
                <input {...perfilForm.register("razon_social")} className="input-field" placeholder="Tu empresa S.A." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ciudad</label>
                  <input {...perfilForm.register("ciudad")} className="input-field" placeholder="Córdoba" />
                  {perfilForm.formState.errors.ciudad && <p className="error-msg">{perfilForm.formState.errors.ciudad.message}</p>}
                </div>
                <div>
                  <label className="label">Provincia</label>
                  <select {...perfilForm.register("provincia")} className="input-field">
                    <option value="">Seleccioná...</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {perfilForm.formState.errors.provincia && <p className="error-msg">{perfilForm.formState.errors.provincia.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Radio de operación (km)</label>
                <input {...perfilForm.register("radio_operacion_km", { valueAsNumber: true })} type="number" className="input-field" />
                <p className="text-xs text-gray-500 mt-1">Hasta dónde estás dispuesto a viajar</p>
              </div>

              <div>
                <label className="label">Bio (opcional)</label>
                <textarea {...perfilForm.register("bio")} className="input-field" rows={3} placeholder="Contá sobre tu experiencia..." />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <button type="submit" disabled={perfilForm.formState.isSubmitting} className="btn-primary">
                {perfilForm.formState.isSubmitting ? "Guardando..." : <>Siguiente <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ── PASO 2: VEHÍCULO ── */}
          {paso === 1 && (
            <form onSubmit={vehiculoForm.handleSubmit(guardarVehiculo)} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Agregá tu vehículo principal</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de vehículo</label>
                  <select {...vehiculoForm.register("tipo")} className="input-field">
                    <option value="">Seleccioná...</option>
                    {Object.entries(VEHICULO_TIPO_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  {vehiculoForm.formState.errors.tipo && <p className="error-msg">{vehiculoForm.formState.errors.tipo.message}</p>}
                </div>
                <div>
                  <label className="label">Patente</label>
                  <input {...vehiculoForm.register("patente")} className="input-field" placeholder="ABC123" />
                  {vehiculoForm.formState.errors.patente && <p className="error-msg">{vehiculoForm.formState.errors.patente.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Marca</label>
                  <input {...vehiculoForm.register("marca")} className="input-field" placeholder="Mercedes" />
                </div>
                <div>
                  <label className="label">Modelo</label>
                  <input {...vehiculoForm.register("modelo")} className="input-field" placeholder="Actros" />
                </div>
                <div>
                  <label className="label">Año</label>
                  <input {...vehiculoForm.register("anio", { valueAsNumber: true })} type="number" className="input-field" placeholder="2020" />
                </div>
              </div>

              <div>
                <label className="label">Capacidad (kg)</label>
                <input {...vehiculoForm.register("capacidad_kg", { valueAsNumber: true })} type="number" className="input-field" placeholder="20000" />
                {vehiculoForm.formState.errors.capacidad_kg && <p className="error-msg">{vehiculoForm.formState.errors.capacidad_kg.message}</p>}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...vehiculoForm.register("refrigerado")} type="checkbox" className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">Refrigerado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...vehiculoForm.register("tiene_hidrogrua")} type="checkbox" className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">Tiene hidrogrúa</span>
                </label>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setPaso(0)} className="btn-secondary flex-1">Atrás</button>
                <button type="submit" disabled={vehiculoForm.formState.isSubmitting} className="btn-primary flex-1">
                  {vehiculoForm.formState.isSubmitting ? "Guardando..." : <>Siguiente <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── PASO 3: DOCUMENTOS ── */}
          {paso === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-2">Subí tus documentos</h2>
              <p className="text-sm text-gray-500 mb-4">El equipo los revisará en 24-48hs. Podés continuar y agregar más después.</p>

              {DOCS_REQUERIDOS.map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setDocs(prev => ({ ...prev, [key]: file }));
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {docs[key] && <p className="text-xs text-green-600 mt-1">✓ {docs[key].name}</p>}
                </div>
              ))}

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="btn-secondary flex-1">Atrás</button>
                <button
                  onClick={subirDocumentos}
                  disabled={Object.keys(docs).length === 0}
                  className="btn-primary flex-1"
                >
                  Finalizar y enviar a revisión
                </button>
              </div>

              <button onClick={() => navigate("/dashboard")} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2">
                Omitir por ahora (podés subir los docs después)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
