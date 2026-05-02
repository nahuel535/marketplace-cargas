import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../lib/api";

const schema = z.object({ email: z.string().email("Email inválido") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await api.post("/auth/forgot-password", data).catch(() => {});
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2">Revisá tu email</h2>
          <p className="text-gray-600 mb-6">
            Si el email existe, recibirás instrucciones para resetear tu contraseña.
          </p>
          <Link to="/login" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al login
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold mb-1">Recuperar contraseña</h1>
          <p className="text-gray-500 text-sm mb-6">
            Te enviamos un link para resetearla.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" className="input-field" placeholder="tu@email.com" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
