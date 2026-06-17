import { useState } from 'react';

export function ViewAdmin({ turnosPorFecha = {}, setTurnosPorFecha }) {
  const [filtro, setFiltro] = useState('todos');
  
  // Estados para la sección de bloqueo rápido de horarios
  const [fechaGestion, setFechaGestion] = useState('');
  // 🕒 Mismos horarios para el panel de gestión del Admin
  const horariosDisponiblesTemplate = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  // Transforma el diccionario a array plano para la tabla de abajo
  const turnosPlanos = [];
  Object.keys(turnosPorFecha).forEach(fecha => {
    turnosPorFecha[fecha].forEach(turno => {
      turnosPlanos.push({
        fecha,
        ...turno
      });
    });
  });

  // Ordenamos la lista cronológicamente
  turnosPlanos.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    return a.hora.localeCompare(b.hora);
  });

  // Métricas reales (excluyendo bloqueos de la caja estimada)
  const turnosOcupadosReales = turnosPlanos.filter(t => t.estado === 'ocupado' && t.cliente !== '🚫 HORARIO BLOQUEADO');
  const bloqueosTotales = turnosPlanos.filter(t => t.cliente === '🚫 HORARIO BLOQUEADO');
  const totalCajaEstimada = turnosOcupadosReales.length * 1500; 

  // Filtrado para la tabla general
  const turnosFiltrados = turnosPlanos.filter(t => {
    if (filtro === 'ocupados') return t.estado === 'ocupado';
    if (filtro === 'libres') return t.estado !== 'ocupado';
    return true;
  });

  // 🔒 FUNCIÓN PARA ACCIONES RÁPIDAS (Bloquear o Liberar)
  const alternarEstadoHorario = (fecha, hora, accion) => {
    if (!fecha) return alert("Por favor, selecciona una fecha primero.");

    const turnosDelDia = [...(turnosPorFecha[fecha] || [])];
    const indexTurno = turnosDelDia.findIndex(t => t.hora === hora);

    if (accion === 'bloquear') {
      const nuevoTurnoBloqueado = {
        hora,
        estado: 'ocupado',
        cliente: '🚫 HORARIO BLOQUEADO',
        telefono: '—',
        codigo: `BLK-${Math.floor(1000 + Math.random() * 9000)}`
      };

      if (indexTurno !== -1) {
        turnosDelDia[indexTurno] = nuevoTurnoBloqueado;
      } else {
        turnosDelDia.push(nuevoTurnoBloqueado);
      }
    } else if (accion === 'liberar') {
      if (indexTurno !== -1) {
        turnosDelDia[indexTurno] = {
          hora,
          estado: 'libre',
          cliente: '',
          telefono: '',
          codigo: ''
        };
      }
    }

    // Impacta en tu setTurnosPorFecha nativo que sincroniza con Supabase
    setTurnosPorFecha({
      ...turnosPorFecha,
      [fecha]: turnosDelDia
    });
  };

  return (
    <div className="admin-dashboard animate-input" style={{ padding: '80px 20px 20px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Encabezado */}
      <header style={{ marginBottom: '25px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Internal Management
        </span>
        <h1 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '1.8rem' }}>
          Panel de Control — Barbería
        </h1>
      </header>

      {/* Tarjetas de Métricas */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Turnos Reservados</span>
          <div style={{ color: 'var(--accent)', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{turnosOcupadosReales.length}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Horarios Bloqueados</span>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{bloqueosTotales.length}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Caja Estimada</span>
          <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>${totalCajaEstimada}</div>
        </div>
      </div>

      {/* 🛠️ NUEVA SECCIÓN: GESTION RAPIDA DE HORARIOS (BLOQUEOS / FRANCOS) */}
      <section style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>⚡ Bloqueo Rápido de Horarios</h3>
        <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Seleccioná una fecha para congelar turnos (francos, feriados o clientes espontáneos).</p>
        
        {/* Selector de fecha nativo pero con estilo oscuro */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="date" 
            value={fechaGestion}
            onChange={(e) => setFechaGestion(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px 14px',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {fechaGestion && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {horariosDisponiblesTemplate.map(hora => {
              // Verificamos el estado actual de esa hora en la fecha seleccionada
              const turnoExistente = turnosPorFecha[fechaGestion]?.find(t => t.hora === hora);
              const esOcupado = turnoExistente?.estado === 'ocupado';
              const esBloqueo = turnoExistente?.cliente === '🚫 HORARIO BLOQUEADO';

              return (
                <div 
                  key={hora} 
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{hora} hs</span>
                  
                  {esBloqueo ? (
                    <button
                      type="button"
                      onClick={() => alternarEstadoHorario(fechaGestion, hora, 'liberar')}
                      style={{ width: '100%', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      🔓 Desbloquear
                    </button>
                  ) : esOcupado ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '4px 0' }}>
                      👤 Reservado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alternarEstadoHorario(fechaGestion, hora, 'bloquear')}
                      style={{ width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      🚫 Bloquear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filtros de la Tabla General */}
      <div className="filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['todos', 'ocupados', 'libres'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: filtro === f ? 'var(--accent)' : 'rgba(255, 255, 255, 0.02)',
              color: filtro === f ? '#000' : 'var(--text-secondary)',
              fontWeight: filtro === f ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla de Gestión Histórica */}
      <div className="table-responsive" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 16px' }}>Fecha</th>
              <th style={{ padding: '12px 16px' }}>Hora</th>
              <th style={{ padding: '12px 16px' }}>Estado</th>
              <th style={{ padding: '12px 16px' }}>Cliente</th>
              <th style={{ padding: '12px 16px' }}>Código</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay registros disponibles.
                </td>
              </tr>
            ) : (
              turnosFiltrados.map((turno, index) => {
                const esOcupado = turno.estado === 'ocupado';
                const esBloqueo = turno.cliente === '🚫 HORARIO BLOQUEADO';
                return (
                  <tr key={`${turno.fecha}-${turno.hora}-${index}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>{turno.fecha}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '4px' }}>
                        {turno.hora} hs
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: esBloqueo ? 'rgba(239, 68, 68, 0.1)' : esOcupado ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: esBloqueo ? '#ef4444' : esOcupado ? 'var(--accent)' : 'var(--text-secondary)',
                        border: `1px solid ${esOcupado ? 'rgba(245, 158, 11, 0.2)' : 'transparent'}`
                      }}>
                        {esBloqueo ? 'Bloqueado' : esOcupado ? 'Ocupado' : 'Disponible'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {esOcupado ? (
                        <div>
                          <strong style={{ color: esBloqueo ? '#ef4444' : 'var(--text-primary)' }}>{turno.cliente}</strong>
                          {!esBloqueo && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📞 {turno.telefono || 'Sin número'}</div>}
                        </div>
                      ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--accent)' }}>
                      {turno.codigo || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {esOcupado ? (
                        <button
                          type="button"
                          onClick={() => alternarEstadoHorario(turno.fecha, turno.hora, 'liberar')}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#000'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          Liberar
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}