import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import api from "../../lib/api";

const schema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  apellido: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rol: z.enum(["dador", "transportista"], { error: "Seleccioná un rol" }),
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  {
    value: "dador",
    label: "Dador de carga",
    desc: "Necesito transportar mercadería",
  },
  {
    value: "transportista",
    label: "Transportista",
    desc: "Ofrezco servicio de transporte",
  },
] as const;

export default function Register() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const rolSeleccionado = watch("rol");

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await api.post("/auth/register", data);
      setOk(true);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al registrarse");
    }
  };

  if (ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-600 mb-6">
            Te enviamos un email para verificar tu cuenta. Revisá tu bandeja de entrada.
          </p>
          <Link to="/login" className="btn-primary">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-600 p-3 rounded-xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 mt-1">Marketplace de Cargas</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Selector de rol */}
            <div>
              <label className="label">Soy...</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue("rol", r.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      rolSeleccionado === r.value
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{r.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
              {errors.rol && <p className="error-msg">{errors.rol.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input {...register("nombre")} className="input-field" placeholder="Juan" />
                {errors.nombre && <p className="error-msg">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input {...register("apellido")} className="input-field" placeholder="García" />
              </div>
            </div>

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

            <div>
              <label className="label">Teléfono (opcional)</label>
              <input
                {...register("telefono")}
                type="tel"
                className="input-field"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                {...register("password")}
                type="password"
                className="input-field"
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
