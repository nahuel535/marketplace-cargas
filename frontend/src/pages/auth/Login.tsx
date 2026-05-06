import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Truck, ArrowLeft } from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      const { access_token, refresh_token } = res.data;
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setAuth(meRes.data, access_token, refresh_token);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to landing */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary-600 p-2 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">RutaCarga</span>
          </div>
          <p className="text-gray-500 text-sm">Iniciá sesión en tu cuenta</p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
