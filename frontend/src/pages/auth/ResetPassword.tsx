import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";

const schema = z.object({
  nueva_password: z.string().min(8, "Mínimo 8 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const token = params.get("token");
    if (!token) {
      setError("Link inválido");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, ...data });
      navigate("/login?reset=ok");
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Link expirado o inválido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-xl font-bold mb-1">Nueva contraseña</h1>
          <p className="text-gray-500 text-sm mb-6">Elegí una contraseña segura.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nueva contraseña</label>
              <input
                {...register("nueva_password")}
                type="password"
                className="input-field"
                placeholder="Mínimo 8 caracteres"
              />
              {errors.nueva_password && <p className="error-msg">{errors.nueva_password.message}</p>}
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary-600 hover:underline">
              Cancelar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
