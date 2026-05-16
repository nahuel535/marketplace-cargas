import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Truck, ArrowLeft, CheckCircle, Building2, User } from "lucide-react";
import api from "../../lib/api";
import { PROVINCIAS_AR } from "../../lib/api-tipos";

const schema = z.object({
  tipo_cuenta: z.enum(["individual", "empresa"], { error: "Seleccioná el tipo de cuenta" }),
  nombre: z.string().min(2, "Nombre muy corto"),
  apellido: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  provincia: z.string().min(2, "Seleccioná una provincia"),
  ciudad: z.string().min(2, "Ingresá tu ciudad"),
});

type FormData = z.infer<typeof schema>;

const TIPOS_CUENTA = [
  {
    value: "individual",
    label: "Individual",
    desc: "Chofer autónomo o particular",
    icon: User,
  },
  {
    value: "empresa",
    label: "Empresa",
    desc: "Empresa o flota de transporte",
    icon: Building2,
  },
] as const;

export default function RegisterTransportista() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const tipoCuenta = watch("tipo_cuenta");

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await api.post("/auth/register", {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        rol: "transportista",
      });
      sessionStorage.setItem(
        "onboarding_hint",
        JSON.stringify({
          tipo_cuenta: data.tipo_cuenta,
          provincia: data.provincia,
          ciudad: data.ciudad,
        })
      );
      setOk(true);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al registrarse");
    }
  };

  if (ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Te enviamos un email para verificar tu cuenta. Revisá tu bandeja de entrada y luego completá tu perfil.
          </p>
          <Link to="/login" className="btn-primary">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary-500 p-2 rounded-xl">
              <Truck className="w-6 h-6 text-gray-900" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">RutaCarga</span>
          </div>
          <p className="text-gray-500 text-sm">Registrate como transportista</p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de cuenta */}
            <div>
              <label className="label">¿Cómo operás?</label>
              <div className="grid grid-cols-2 gap-3">
                {TIPOS_CUENTA.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tipoCuenta === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setValue("tipo_cuenta", t.value)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-2 ${isSelected ? "text-primary-600" : "text-gray-400"}`}
                      />
                      <p
                        className={`font-semibold text-sm ${
                          isSelected ? "text-primary-700" : "text-gray-700"
                        }`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.tipo_cuenta && (
                <p className="error-msg">{errors.tipo_cuenta.message}</p>
              )}
            </div>

            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  {tipoCuenta === "empresa" ? "Nombre de contacto" : "Nombre"}
                </label>
                <input
                  {...register("nombre")}
                  className="input-field"
                  placeholder="Juan"
                />
                {errors.nombre && <p className="error-msg">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  {...register("apellido")}
                  className="input-field"
                  placeholder="García"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                type="email"
                className="input-field"
                placeholder="tu@email.com"
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="label">Teléfono (opcional)</label>
              <input
                {...register("telefono")}
                type="tel"
                className="input-field"
                placeholder="+54 11 1234-5678"
              />
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Provincia</label>
                <select {...register("provincia")} className="input-field">
                  <option value="">Seleccioná...</option>
                  {PROVINCIAS_AR.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.provincia && (
                  <p className="error-msg">{errors.provincia.message}</p>
                )}
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input
                  {...register("ciudad")}
                  className="input-field"
                  placeholder="Córdoba"
                />
                {errors.ciudad && <p className="error-msg">{errors.ciudad.message}</p>}
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label">Contraseña</label>
              <input
                {...register("password")}
                type="password"
                className="input-field"
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="error-msg">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta de transportista"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
            <p>
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Iniciá sesión
              </Link>
            </p>
            <p>
              ¿Buscás transporte?{" "}
              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Registrate como usuario
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
