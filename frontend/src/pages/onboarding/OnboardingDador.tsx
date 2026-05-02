import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck } from "lucide-react";
import api from "../../lib/api";
import { PROVINCIAS_AR } from "../../lib/api-tipos";
import { useState } from "react";

const schema = z.object({
  cuit_dni: z.string().min(8, "CUIT/DNI inválido"),
  tipo: z.enum(["particular", "monotributista", "responsable_inscripto", "empresa"]),
  razon_social: z.string().optional(),
  sector: z.string().optional(),
  ciudad: z.string().min(2, "Ingresá tu ciudad"),
  provincia: z.string().min(2, "Seleccioná una provincia"),
});

type FormData = z.infer<typeof schema>;

const SECTORES = ["Agro", "Industria", "Retail", "Construcción", "Logística", "Particular", "Otro"];

export default function OnboardingDador() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await api.post("/dadores/profile", data);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al guardar perfil");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Marketplace de Cargas</span>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-1">Completá tu perfil</h2>
          <p className="text-sm text-gray-500 mb-6">Solo toma un minuto</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">CUIT / DNI</label>
                <input {...register("cuit_dni")} className="input-field" placeholder="20-12345678-9" />
                {errors.cuit_dni && <p className="error-msg">{errors.cuit_dni.message}</p>}
              </div>
              <div>
                <label className="label">Tipo</label>
                <select {...register("tipo")} className="input-field">
                  <option value="">Seleccioná...</option>
                  <option value="particular">Particular</option>
                  <option value="monotributista">Monotributista</option>
                  <option value="responsable_inscripto">Resp. Inscripto</option>
                  <option value="empresa">Empresa</option>
                </select>
                {errors.tipo && <p className="error-msg">{errors.tipo.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Razón social (opcional)</label>
              <input {...register("razon_social")} className="input-field" placeholder="Mi Empresa S.A." />
            </div>

            <div>
              <label className="label">Sector (opcional)</label>
              <select {...register("sector")} className="input-field">
                <option value="">Seleccioná...</option>
                {SECTORES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ciudad</label>
                <input {...register("ciudad")} className="input-field" placeholder="Rosario" />
                {errors.ciudad && <p className="error-msg">{errors.ciudad.message}</p>}
              </div>
              <div>
                <label className="label">Provincia</label>
                <select {...register("provincia")} className="input-field">
                  <option value="">Seleccioná...</option>
                  {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.provincia && <p className="error-msg">{errors.provincia.message}</p>}
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
