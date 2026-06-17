import { useState } from 'react';

export default function CalendarSelector({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, turnosOcupados = [] }) {
  const [offset, setOffset] = useState(0);

  const generarDiasPaginados = (baseOffset) => {
    const diasComerciales = [];
    let contador = baseOffset;
    
    while (diasComerciales.length < 5) {
      const fechaAux = new Date(); 
      fechaAux.setDate(fechaAux.getDate() + contador);
      
      const numeroDiaSemana = fechaAux.getDay();
      
      // Saltamos los domingos (0) para la barbería
      if (numeroDiaSemana !== 0) {
        const nombreMes = fechaAux.toLocaleString('es-ES', { month: 'long' });
        const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

        let shortName = fechaAux.toLocaleString('es-ES', { weekday: 'short' }).replace('.', '');
        shortName = shortName.charAt(0).toUpperCase() + shortName.slice(1);

        const nombreDiaLargo = fechaAux.toLocaleString('es-ES', { weekday: 'long' });
        const diaLargoCapitalizado = nombreDiaLargo.charAt(0).toUpperCase() + nombreDiaLargo.slice(1);

        diasComerciales.push({
          dayNameShort: shortName, 
          dayNameLong: diaLargoCapitalizado,
          num: fechaAux.getDate().toString(),
          mes: mesCapitalizado,
          año: fechaAux.getFullYear()
        });
      }
      contador++;
    }
    return diasComerciales;
  };

  const availableDays = generarDiasPaginados(offset);
  const availableHours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const mesActualHeader = availableDays[0]?.mes || "";
  const añoActualHeader = availableDays[0]?.año || "2026";

  // 🚀 Control de navegación extendido a 90 días para permitir reservas a largo plazo
  const handleNext = () => { if (offset < 90) setOffset(offset + 5); };
  const handlePrev = () => { if (offset > 0) setOffset(offset - 5); };

  return (
    <div className="calendar-wrapper">
      <div className="month-navigation">
        <button type="button" className="nav-arrow-btn" onClick={handlePrev} disabled={offset === 0}>←</button>
        <div className="month-header-badge">
          <span className="month-icon">📅</span>
          <span className="month-name">{mesActualHeader} {añoActualHeader}</span>
        </div>
        {/* Deshabilitamos la flecha recién cuando llega al límite de 90 días */}
        <button type="button" className="nav-arrow-btn" onClick={handleNext} disabled={offset >= 90}>→</button>
      </div>

      <h3>1. Seleccioná el día</h3>
      <div className="days-container">
        {availableDays.map((d, index) => {
          const dateStr = `${d.dayNameLong} ${d.num} de ${d.mes}`;
          return (
            <button
              type="button"
              key={index}
              onClick={() => {
                setSelectedDate(dateStr);
                setSelectedTime(null); 
              }}
              className={`day-btn ${selectedDate === dateStr ? 'selected' : ''}`}
            >
              <span className="day-name-text">{d.dayNameShort}</span>
              <span className="day-num-text">{d.num}</span>
              {/* Indicador premium: si el día cambia de mes, avisa visualmente cuál es */}
              {d.mes !== mesActualHeader && (
                <span className="next-month-indicator" style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>
                  {d.mes.substring(0,3)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="hours-section animate-input">
          <h3>2. Horarios libres para el {selectedDate}</h3>
          <div className="hours-grid">
            {availableHours.map((time) => {
              const estaOcupado = turnosOcupados.some(
                (t) => t.fecha === selectedDate && t.hora === time && t.estado === 'ocupado'
              );
              const estaSeleccionado = selectedTime === time;

              return (
                <button
                  type="button"
                  key={time}
                  className={`hour-btn ${estaOcupado ? 'disabled' : estaSeleccionado ? 'selected' : ''}`}
                  disabled={estaOcupado}
                  onClick={() => !estaOcupado && setSelectedTime(time)}
                >
                  {time} hs
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}