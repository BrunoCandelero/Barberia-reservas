import { useState } from 'react';
import CalendarSelector from './CalendarSelector';

const CONFIG_NEGOCIO = {
  nombre: "The Gents Barber",
  rubro: "Barbería & Estilo Masculino",
  ubicacion: "Av. de la Constitución 45, Sevilla, España",
  horariosSemana: "Lunes a Viernes: 09:00 - 20:00 hs",
  horariosSabado: "Sábados: 09:00 - 14:00 hs"
};

export default function ViewCliente({ turnosPorFecha, setTurnosPorFecha }) {
  const [activeTab, setActiveTab] = useState('agendar');
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [emailNotification, setEmailNotification] = useState(null);

  const triggerEmailMock = (title, message) => {
    setEmailNotification({ title, message });
    setTimeout(() => setEmailNotification(null), 6000);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const randomCode = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const horasPorDefecto = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];

    // Buscamos si el día ya tenía movimientos, si no, creamos el día vacío primero
    const turnosActualesDelDia = turnosPorFecha[selectedDate] || horasPorDefecto.map(h => ({
      hora: h, estado: "libre", cliente: "", telefono: "", codigo: ""
    }));

    // Modificamos solo la hora que el cliente seleccionó
    const turnosModificados = turnosActualesDelDia.map(t => {
      if (t.hora === selectedTime) {
        return { ...t, estado: 'ocupado', cliente: clientData.name, telefono: clientData.phone, codigo: randomCode };
      }
      return t;
    });

    // Guardamos de vuelta en el objeto global
    setTurnosPorFecha({
      ...turnosPorFecha,
      [selectedDate]: turnosModificados
    });

    alert(`¡Turno Reservado con éxito!`);
    triggerEmailMock(
      `📩 Confirmación de ${CONFIG_NEGOCIO.nombre}`,
      `Hola ${clientData.name}, tu turno fue reservado para el ${selectedDate} a las ${selectedTime} hs.`
    );

    setClientData({ name: '', email: '', phone: '' });
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <>
      {emailNotification && (
        <div className="email-toast">
          <div className="email-toast-header"><span>📬</span> <strong>{emailNotification.title}</strong></div>
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
          <button className={`tab-btn ${activeTab === 'agendar' ? 'active' : ''}`} onClick={() => setActiveTab('agendar')}>Agendar Turno</button>
          <button className={`tab-btn ${activeTab === 'cancelar' ? 'active' : ''}`} onClick={() => setActiveTab('cancelar')}>Gestionar Reserva</button>
        </div>

        <div className="app-body">
          {activeTab === 'agendar' ? (
            <form onSubmit={handleConfirm}>
              <CalendarSelector 
                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                selectedTime={selectedTime} setSelectedTime={setSelectedTime}
              />
              {selectedDate && selectedTime && (
                <div className="form-section animate-input">
                  <h3>3. Datos de contacto</h3>
                  <div className="input-group"><label>Nombre Completo</label><input type="text" required placeholder="Ej. Alexander Wright" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} /></div>
                  <div className="input-group"><label>Email</label><input type="email" required placeholder="tu-correo@example.com" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} /></div>
                  <div className="input-group"><label>WhatsApp</label><input type="tel" required placeholder="+34 600 00 00 00" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} /></div>
                  <button type="submit" className="btn-confirm-final">Confirmar Reserva — {selectedTime} hs</button>
                </div>
              )}
            </form>
          ) : (
            <div className="cancel-flow">
              <h3>Cancelación de Citas</h3>
              <p className="cancel-desc">Colocá el código que te llegó por correo para liberar la hora.</p>
              <div className="input-group"><label>Código de Reserva</label><input type="text" required placeholder="Ej. TRN-749201" /></div>
              <button type="button" className="btn-cancel-submit" onClick={() => alert('Turno anulado')}>Anular Turno</button>
            </div>
          )}

          <div className="info-footer-box">
            <h4>Horarios de Atención</h4>
            <p>🕒 {CONFIG_NEGOCIO.horariosSemana}</p>
            <p>🕒 {CONFIG_NEGOCIO.horariosSabado}</p>
          </div>
        </div>
        <footer className="app-footer"><p>© {CONFIG_NEGOCIO.nombre}. Powered by Systems Suite</p></footer>
      </main>
    </>
  );
}