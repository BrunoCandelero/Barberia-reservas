import { useState } from 'react';
import { supabase } from '../Backend/supabaseClient';
import CalendarSelector from './CalendarSelector';
import ServiceSelector from './ServiceSelector';

const SERVICIOS = [
  { id: 1, name: 'Corte de pelo',       price: '$1.500', priceNum: 1500, duration: '30 min', icon: '✂️' },
  { id: 2, name: 'Perfilado de barba',  price: '$800',   priceNum: 800,  duration: '20 min', icon: '🪒' },
  { id: 3, name: 'Barba completa',      price: '$1.200', priceNum: 1200, duration: '30 min', icon: '🧔' },
  { id: 4, name: 'Tratamiento capilar', price: '$2.000', priceNum: 2000, duration: '45 min', icon: '💆' },
];

const CONFIG_NEGOCIO = {
  nombre: "The Gents Barber",
  rubro: "Barbería & Estilo Masculino",
  ubicacion: "Av. de la Constitución 45, Sevilla, España",
  horariosSemana: "Lunes a Viernes: 09:00 - 20:00 hs",
  horariosSabado: "Sábados: 09:00 - 14:00 hs"
};

export { SERVICIOS };

export default function ViewCliente({ turnosPorFecha, setTurnosPorFecha, onRefrescar, session }) {
  const [activeTab, setActiveTab] = useState('agendar');
  const [selectedService, setSelectedService] = useState(null);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [emailNotification, setEmailNotification] = useState(null);

  const [codigoCancelacion, setCodigoCancelacion] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const triggerToast = (title, message) => {
    setEmailNotification({ title, message });
    setTimeout(() => setEmailNotification(null), 6000);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const randomCode = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const horasPorDefecto = [
      "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00",
      "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"
    ];

    const turnosActualesDelDia = turnosPorFecha[selectedDate] || horasPorDefecto.map(h => ({
      hora: h, estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: ''
    }));

    const turnosModificados = turnosActualesDelDia.map(t =>
      t.hora === selectedTime
        ? { ...t, estado: 'ocupado', cliente: clientData.name, telefono: clientData.phone, email: clientData.email, codigo: randomCode, servicio: selectedService?.name || '' }
        : t
    );

    setTurnosPorFecha({ ...turnosPorFecha, [selectedDate]: turnosModificados });

    triggerToast(
      `Confirmación — ${CONFIG_NEGOCIO.nombre}`,
      `Hola ${clientData.name}, tu turno fue reservado para el ${selectedDate} a las ${selectedTime} hs. Tu código: ${randomCode}`
    );

    setClientData({ name: '', email: '', phone: '' });
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedService(null);
  };

  const handleCancelacion = async () => {
    if (!codigoCancelacion.trim()) return;
    setCancelError('');
    setCancelSuccess('');
    setCancelLoading(true);

    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('codigo', codigoCancelacion.trim())
      .single();

    if (error || !data) {
      setCancelError('Código no encontrado. Verificá que sea correcto.');
      setCancelLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('turnos')
      .update({ estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '' })
      .eq('codigo', codigoCancelacion.trim());

    if (updateError) {
      setCancelError('Error al cancelar. Intentá de nuevo.');
      setCancelLoading(false);
      return;
    }

    setCancelSuccess(`Turno del ${data.fecha} a las ${data.hora} hs cancelado exitosamente.`);
    setCodigoCancelacion('');
    setCancelLoading(false);
    if (onRefrescar) onRefrescar();
  };

  const misReservas = session?.user?.email
    ? Object.entries(turnosPorFecha)
        .flatMap(([fecha, turnos]) =>
          (turnos || [])
            .filter(t => t.email === session.user.email && t.estado === 'ocupado')
            .map(t => ({ ...t, fecha }))
        )
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    : [];

  return (
    <>
      {emailNotification && (
        <div className="email-toast">
          <div className="email-toast-header">
            <span>📬</span> <strong>{emailNotification.title}</strong>
          </div>
          <p className="email-toast-body">{emailNotification.message}</p>
        </div>
      )}

      <main className="app-card animate-input">
        <section className="business-hero">
          <div className="badge-rubro">{CONFIG_NEGOCIO.rubro}</div>
          <h1>{CONFIG_NEGOCIO.nombre}</h1>
          <p className="hero-address">📍 {CONFIG_NEGOCIO.ubicacion}</p>
        </section>

        <div className="tab-header">
          <button className={`tab-btn ${activeTab === 'agendar' ? 'active' : ''}`} onClick={() => setActiveTab('agendar')}>
            Agendar Turno
          </button>
          <button className={`tab-btn ${activeTab === 'cancelar' ? 'active' : ''}`} onClick={() => setActiveTab('cancelar')}>
            Gestionar Reserva
          </button>
          {session && (
            <button className={`tab-btn ${activeTab === 'mis-reservas' ? 'active' : ''}`} onClick={() => setActiveTab('mis-reservas')}>
              Mis Reservas
            </button>
          )}
        </div>

        <div className="app-body">

          {activeTab === 'agendar' && (
            <form onSubmit={handleConfirm}>
              <ServiceSelector
                services={SERVICIOS}
                selectedService={selectedService}
                onSelect={(s) => { setSelectedService(s); setSelectedDate(null); setSelectedTime(null); }}
              />
              {selectedService && (
                <CalendarSelector
                  turnosPorFecha={turnosPorFecha}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime} setSelectedTime={setSelectedTime}
                />
              )}
              {selectedDate && selectedTime && (
                <div className="form-section animate-input">
                  <h3>3. Datos de contacto</h3>
                  <div className="input-group">
                    <label>Nombre Completo</label>
                    <input type="text" required placeholder="Ej. Alexander Wright" value={clientData.name}
                      onChange={(e) => setClientData({ ...clientData, name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" required placeholder="tu-correo@example.com" value={clientData.email}
                      onChange={(e) => setClientData({ ...clientData, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>WhatsApp</label>
                    <input type="tel" required placeholder="+34 600 00 00 00" value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-confirm-final">
                    Confirmar — {selectedService.name} · {selectedTime} hs · {selectedService.price}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'cancelar' && (
            <div className="cancel-flow">
              <h3>Cancelación de Citas</h3>
              <p className="cancel-desc">Ingresá el código que recibiste al reservar para liberar tu turno.</p>
              {cancelError && <div className="cancel-error">⚠️ {cancelError}</div>}
              {cancelSuccess && <div className="cancel-success">✅ {cancelSuccess}</div>}
              <div className="input-group">
                <label>Código de Reserva</label>
                <input
                  type="text"
                  placeholder="Ej. TRN-749201"
                  value={codigoCancelacion}
                  onChange={(e) => { setCodigoCancelacion(e.target.value); setCancelError(''); setCancelSuccess(''); }}
                />
              </div>
              <button
                type="button"
                className="btn-cancel-submit"
                onClick={handleCancelacion}
                disabled={cancelLoading || !codigoCancelacion.trim()}
              >
                {cancelLoading ? 'Cancelando...' : 'Anular Turno'}
              </button>
            </div>
          )}

          {activeTab === 'mis-reservas' && (
            <div className="mis-reservas-section">
              <h3>Mis Reservas</h3>
              {misReservas.length === 0 ? (
                <p className="cancel-desc">No tenés reservas activas.</p>
              ) : (
                <div className="reservas-list">
                  {misReservas.map((r, i) => (
                    <div key={i} className="reserva-card">
                      <div className="reserva-info">
                        <strong>{r.fecha}</strong>
                        <span>{r.hora} hs</span>
                        {r.servicio && <span className="reserva-servicio-badge">{r.servicio}</span>}
                      </div>
                      <span className="reserva-codigo">{r.codigo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="info-footer-box">
            <h4>Horarios de Atención</h4>
            <p>🕒 {CONFIG_NEGOCIO.horariosSemana}</p>
            <p>🕒 {CONFIG_NEGOCIO.horariosSabado}</p>
          </div>
        </div>

        <footer className="app-footer">
          <p>© {CONFIG_NEGOCIO.nombre}. Powered by Systems Suite</p>
        </footer>
      </main>
    </>
  );
}
