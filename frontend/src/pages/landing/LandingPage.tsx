import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Truck, Search, MapPin, Star, Package, ChevronRight,
  Shield, Clock, ArrowRight, Users, CheckCircle, ArrowDown, Menu, X,
} from "lucide-react";
import api from "../../lib/api";
import { PROVINCIAS_AR, VEHICULO_TIPO_LABELS } from "../../lib/api-tipos";
import type { VehiculoTipo } from "../../lib/api-tipos";

interface TransportistaPublico {
  user_id: string;
  nombre: string;
  apellido: string | null;
  ciudad: string | null;
  provincia: string | null;
  radio_operacion_km: number;
  bio: string | null;
  rating_promedio: number;
  cantidad_viajes: number;
  vehiculos: { id: string; tipo: VehiculoTipo; capacidad_kg: number; refrigerado: boolean; tiene_hidrogrua: boolean }[];
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [transportistas, setTransportistas] = useState<TransportistaPublico[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [origenProvincia, setOrigenProvincia] = useState("");
  const [origenCiudad, setOrigenCiudad] = useState("");
  const [destinoProvincia, setDestinoProvincia] = useState("");
  const [destinoCiudad, setDestinoCiudad] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { buscar(); }, []);

  // Cierra el menú mobile si se hace scroll
  useEffect(() => {
    const close = () => menuOpen && setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  const buscar = async () => {
    setLoading(true);
    setBuscado(true);
    try {
      const params = new URLSearchParams();
      if (origenProvincia) params.set("provincia", origenProvincia);
      if (tipoCarga) params.set("tipo_carga", tipoCarga);
      const res = await api.get(`/transportistas/publico?${params.toString()}`);
      setTransportistas(res.data);
    } catch {
      setTransportistas([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setOrigenProvincia(""); setOrigenCiudad("");
    setDestinoProvincia(""); setDestinoCiudad("");
    setTipoCarga("");
    setTimeout(buscar, 0);
  };

  const inputCls = "w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 cursor-pointer placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <Truck className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-display font-bold text-gray-900 text-lg">RutaCarga</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Iniciar sesión
            </Link>
            <Link to="/register" className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-colors">
              Busco transporte
            </Link>
            <Link to="/register/transportista" className="text-sm font-bold bg-primary-500 hover:bg-primary-600 text-gray-900 px-4 py-2 rounded-xl transition-colors">
              Soy transportista
            </Link>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/register/transportista" className="text-xs font-bold bg-primary-500 hover:bg-primary-600 text-gray-900 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
              Soy transportista
            </Link>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2 shadow-lg">
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
              Iniciar sesión
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
              Registrarme para buscar transporte
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="pt-16 bg-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-28">
          <div className="max-w-2xl">

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Marketplace de cargas Argentina
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-5">
              Encontrá el transporte
              <span className="text-primary-500 block sm:inline"> que necesitás</span>
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
              Conectamos dadores de carga con transportistas verificados en todo el país.
              Sin intermediarios, sin comisiones ocultas.
            </p>

            {/* Search box */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 space-y-3">

              {/* Origen */}
              <div>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Origen
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <select value={origenProvincia} onChange={e => setOrigenProvincia(e.target.value)} className={inputCls}>
                    <option value="">Provincia de origen</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={origenCiudad} onChange={e => setOrigenCiudad(e.target.value)}
                    placeholder="Ciudad de origen" className={inputCls} />
                </div>
              </div>

              {/* Separador */}
              <div className="flex items-center gap-2 text-gray-200">
                <div className="flex-1 h-px bg-gray-100" />
                <ArrowDown className="w-4 h-4 text-primary-400 shrink-0" />
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Destino */}
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Destino
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <select value={destinoProvincia} onChange={e => setDestinoProvincia(e.target.value)} className={inputCls}>
                    <option value="">Provincia de destino</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={destinoCiudad} onChange={e => setDestinoCiudad(e.target.value)}
                    placeholder="Ciudad de destino" className={inputCls} />
                </div>
              </div>

              {/* Tipo de carga + botón */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                <div className="relative flex-1">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select value={tipoCarga} onChange={e => setTipoCarga(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 cursor-pointer">
                    <option value="">Tipo de carga</option>
                    <option value="general">Cargas generales</option>
                    <option value="refrigerado">Refrigerados</option>
                    <option value="granos">Granos</option>
                  </select>
                </div>
                <button onClick={buscar} disabled={loading}
                  className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 cursor-pointer sm:shrink-0 w-full sm:w-auto">
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="h-8 bg-gray-50" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
            {[
              { value: "500+", label: "Transportistas" },
              { value: "24", label: "Provincias" },
              { value: "100%", label: "Verificados" },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-2xl sm:text-3xl font-bold text-zinc-900">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTADOS ────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-6 sm:mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900">
              {buscado && !loading
                ? transportistas.length > 0
                  ? `${transportistas.length} transportistas disponibles`
                  : "Sin resultados para esos filtros"
                : "Transportistas verificados"}
            </h2>
            {(origenProvincia || origenCiudad || destinoProvincia || destinoCiudad || tipoCarga) && (
              <button onClick={limpiarFiltros} className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer shrink-0 ml-4">
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : transportistas.length === 0 && buscado ? (
            <div className="text-center py-16 text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No encontramos transportistas con esos filtros</p>
              <p className="text-sm mt-1">Probá con otra provincia o tipo de carga</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {transportistas.map(t => (
                <TransportistaCard key={t.user_id} t={t} onContactar={() => navigate("/register")} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">¿Cómo funciona?</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">Conectarte con un transportista es simple y rápido</p>
          </div>

          {/* Mobile: cards apiladas con número destacado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {[
              { n: "01", icon: Search, title: "Buscás", desc: "Filtrá por provincia y tipo de carga. Sin registro necesario." },
              { n: "02", icon: Users, title: "Contactás", desc: "Creá una cuenta gratis y contactá directamente al transportista." },
              { n: "03", icon: Truck, title: "Fletás", desc: "Acordás precio y condiciones directo con el transportista. Sin comisiones." },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 bg-gray-50 sm:bg-transparent rounded-2xl p-4 sm:p-0 sm:text-center">
                <div className="relative shrink-0">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 sm:mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">{n.slice(1)}</span>
                </div>
                <div className="sm:mt-0">
                  <h3 className="font-display font-bold text-zinc-900 text-base sm:text-lg mb-1 sm:mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA TRANSPORTISTA ─────────────────────────────────────── */}
      <section className="bg-zinc-900 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Truck className="w-3.5 h-3.5" />
            Para transportistas
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            ¿Tenés transporte? Conseguí más trabajo
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mb-8 leading-relaxed">
            Registrá tu vehículo, verificá tu perfil y empezá a recibir cargas en tu zona.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/register/transportista"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-gray-900 font-bold px-8 py-4 rounded-xl transition-colors text-sm sm:text-base">
              Registrarme como transportista <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm sm:text-base">
              Ya tengo cuenta
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10">
            {[
              { icon: Shield, text: "Verificación gratuita" },
              { icon: Clock, text: "Activá en 24 horas" },
              { icon: CheckCircle, text: "Sin comisiones por viaje" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
                <Icon className="w-4 h-4 text-primary-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1 rounded-md">
              <Truck className="w-4 h-4 text-gray-900" />
            </div>
            <span className="font-display font-bold text-white text-sm">RutaCarga</span>
          </div>
          <p className="text-zinc-500 text-xs text-center">© 2025 RutaCarga · Marketplace de cargas Argentina</p>
        </div>
      </footer>
    </div>
  );
}

function TransportistaCard({ t, onContactar }: { t: TransportistaPublico; onContactar: () => void }) {
  const initials = `${t.nombre[0]}${t.apellido?.[0] ?? ""}`.toUpperCase();
  const vehiculoPrincipal = t.vehiculos[0];
  const hasRating = t.rating_promedio > 0;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 flex flex-col group cursor-pointer active:scale-[0.99]"
      onClick={onContactar}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 font-display font-bold text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 text-sm truncate">{t.nombre} {t.apellido}</p>
          {t.ciudad && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" /> {t.ciudad}, {t.provincia}
            </p>
          )}
        </div>
        {hasRating && (
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {t.rating_promedio.toFixed(1)}
          </div>
        )}
      </div>

      {t.bio && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{t.bio}</p>
      )}

      {t.vehiculos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {t.vehiculos.slice(0, 3).map(v => (
            <span key={v.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
              {VEHICULO_TIPO_LABELS[v.tipo]}
            </span>
          ))}
          {t.vehiculos.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">+{t.vehiculos.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {vehiculoPrincipal && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {(vehiculoPrincipal.capacidad_kg / 1000).toFixed(1)}t
            </span>
          )}
          <span>{t.radio_operacion_km} km radio</span>
        </div>
        <span className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
          Contactar <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
