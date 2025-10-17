"use client";

import { useState } from "react";
import {
  User,
  Briefcase,
  FileText,
  LogOut,
  Search,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Importar tipos centralizados
import { Cargo } from "@/types";

// Importar hook personalizado
import { usePostulantePortal } from "@/hooks/usePostulantePortal";

// Importar utilidades
import { formatDate, getEstadoColor, formatCurrency } from "@/lib/formatters";

export default function PortalCandidatoPage() {
  // Usar hook personalizado para toda la lógica
  const { postulante, cargos, postulaciones, loading, logout } =
    usePostulantePortal();

  // Estados locales de UI
  const [activeTab, setActiveTab] = useState<
    "cargos" | "postulaciones" | "perfil"
  >("cargos");
  const [showModal, setShowModal] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState<Cargo | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handlePostular = (cargo: Cargo) => {
    setCargoSeleccionado(cargo);
    setRespuestas({});
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setCargoSeleccionado(null);
    setRespuestas({});
  };

  const handleEnviarPostulacion = async () => {
    if (!cargoSeleccionado || !postulante) return;

    // Validar que todas las preguntas estén respondidas
    const preguntas = cargoSeleccionado.preguntasJson?.preguntas || [];
    if (preguntas.length > 0) {
      const todasRespondidas = preguntas.every((_: any, index: number) =>
        respuestas[`pregunta_${index + 1}`]?.trim()
      );
      if (!todasRespondidas) {
        alert("Por favor responde todas las preguntas antes de enviar");
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/postulaciones`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idVacante: cargoSeleccionado.id,
            respuestasJson: respuestas,
          }),
        }
      );

      if (response.ok) {
        alert(
          "¡Postulación enviada exitosamente! El análisis con IA se está procesando."
        );
        handleCerrarModal();
        window.location.reload(); // Recargar página para actualizar datos
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Error al enviar la postulación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar la postulación");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Portal de Postulante
                </h1>
                <p className="text-sm text-slate-600">{postulante?.nombre}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all shadow-sm"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("cargos")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "cargos"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Search size={20} />
                cargos Disponibles
              </div>
            </button>
            <button
              onClick={() => setActiveTab("postulaciones")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "postulaciones"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} />
                Mis Postulaciones ({postulaciones.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("perfil")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "perfil"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={20} />
                Mi Perfil
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* cargos Tab */}
        {activeTab === "cargos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900">
                Cargos Disponibles <span className="text-orange-500">({cargos.length})</span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {cargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 hover:shadow-xl hover:border-orange-200 transition-all p-6 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {cargo.titulo}
                      </h3>
                      <p className="text-slate-600 font-semibold">
                        {cargo.empresa.nombre}
                      </p>
                    </div>
                    {cargo.empresa.logoUrl && (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm">
                        <Briefcase className="w-7 h-7 text-orange-500" />
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {cargo.descripcion}
                  </p>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="bg-orange-50 p-1.5 rounded-lg">
                        <MapPin size={16} className="text-orange-500" />
                      </div>
                      <span className="text-sm font-medium">{cargo.ubicacion}</span>
                    </div>
                    {cargo.salarioEstimado && (
                      <div className="flex items-center gap-2.5 text-slate-700">
                        <div className="bg-green-50 p-1.5 rounded-lg">
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(cargo.salarioEstimado)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <Clock size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{cargo.tipoContrato}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePostular(cargo)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Postular Ahora
                  </button>
                </div>
              ))}

              {cargos.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    No hay cargos disponibles
                  </h3>
                  <p className="text-slate-600">
                    Vuelve más tarde para ver nuevas oportunidades laborales
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Postulaciones Tab */}
        {activeTab === "postulaciones" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Mis Postulaciones ({postulaciones.length})
            </h2>

            <div className="space-y-4">
              {postulaciones.map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {postulacion.cargo.titulo}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {postulacion.cargo.empresa.nombre}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {formatDate(postulacion.fechaPostulacion)}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(postulacion.estado)}`}
                          >
                            {postulacion.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {postulacion.scoreCompatibilidad && (
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="text-blue-600" size={20} />
                          <span className="text-sm text-gray-600">Score</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {postulacion.scoreCompatibilidad}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {postulaciones.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes postulaciones aún
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explora las cargos disponibles y postula a las que te
                    interesen
                  </p>
                  <button
                    onClick={() => setActiveTab("cargos")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Ver cargos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === "perfil" && postulante && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <p className="text-lg text-gray-800">{postulante.nombre}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <p className="text-lg text-gray-800">{postulante.correo}</p>
                </div>

                {postulante.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <p className="text-lg text-gray-800">
                      {postulante.telefono}
                    </p>
                  </div>
                )}

                {postulante.experienciaAnios !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Años de Experiencia
                    </label>
                    <p className="text-lg text-gray-800">
                      {postulante.experienciaAnios} años
                    </p>
                  </div>
                )}

                {postulante.linkedinUrl && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Perfil de LinkedIn
                    </label>
                    <a
                      href={postulante.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {postulante.linkedinUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {postulaciones.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Postulaciones
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {
                        postulaciones.filter((p) => p.estado === "Aprobado")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Aprobadas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {
                        postulaciones.filter((p) => p.estado === "Pendiente")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Postulación */}
      {showModal && cargoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                Postular a {cargoSeleccionado.titulo}
              </h3>
              <button
                onClick={handleCerrarModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {cargoSeleccionado.empresa.nombre}
                </h4>
                <p className="text-sm text-blue-700">
                  {cargoSeleccionado.ubicacion} •{" "}
                  {cargoSeleccionado.tipoContrato}
                </p>
              </div>

              {cargoSeleccionado.preguntasJson?.preguntas?.length > 0 ? (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Responde las siguientes preguntas:
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Estas respuestas serán analizadas por IA para evaluar tu
                      compatibilidad con el cargo.
                    </p>
                  </div>

                  {cargoSeleccionado.preguntasJson.preguntas.map(
                    (pregunta: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {index + 1}. {pregunta.pregunta || pregunta}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={respuestas[`pregunta_${index + 1}`] || ""}
                          onChange={(e) =>
                            setRespuestas({
                              ...respuestas,
                              [`pregunta_${index + 1}`]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Escribe tu respuesta aquí..."
                          disabled={submitting}
                        />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600">
                    Esta cargo no tiene preguntas específicas. Puedes postular
                    directamente.
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCerrarModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarPostulacion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar Postulación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
