import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../../lib/api";

export default function VerificarEmail() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setEstado("error");
      setMensaje("Token inválido");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        setEstado("ok");
        setMensaje(res.data.mensaje);
      })
      .catch((e) => {
        setEstado("error");
        setMensaje(e.response?.data?.detail ?? "El link expiró o es inválido");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {estado === "cargando" && (
          <>
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verificando tu email...</p>
          </>
        )}
        {estado === "ok" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">¡Email verificado!</h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <Link to="/login" className="btn-primary">
              Ingresar
            </Link>
          </>
        )}
        {estado === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Link inválido</h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <Link to="/login" className="btn-secondary">
              Volver al login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
