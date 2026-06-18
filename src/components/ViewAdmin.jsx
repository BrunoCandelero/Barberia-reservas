import { useState } from 'react';

const PRECIO_POR_SERVICIO = {
  'Corte de pelo': 1500,
  'Perfilado de barba': 800,
  'Barba completa': 1200,
  'Tratamiento capilar': 2000,
};

const PRECIO_DEFECTO = 1500;

const horariosTemplate = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"
];

export function ViewAdmin({ turnosPorFecha = {}, setTurnosPorFecha, alActualizar }) {
  const [filtro, setFiltro] = useState('todos');
  const [fechaGestion, setFechaGestion] = useState('');

  const turnosPlanos = Object.keys(turnosPorFecha).flatMap(fecha =>
    turnosPorFecha[fecha].map(t => ({ fecha, ...t }))
  ).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  const turnosOcupadosReales = turnosPlanos.filter(t => t.estado === 'ocupado' && t.cliente !== '🚫 HORARIO BLOQUEADO');
  const bloqueosTotales = turnosPlanos.filter(t => t.cliente === '🚫 HORARIO BLOQUEADO');

  const totalCaja = turnosOcupadosReales.reduce((acc, t) => {
    const precio = PRECIO_POR_SERVICIO[t.servicio] ?? PRECIO_DEFECTO;
    return acc + precio;
  }, 0);

  const turnosFiltrados = turnosPlanos.filter(t => {
    if (filtro === 'ocupados') return t.estado === 'ocupado';
    if (filtro === 'libres') return t.estado !== 'ocupado';
    return true;
  });

  const alternarEstadoHorario = (fecha, hora, accion) => {
    if (!fecha) return alert('Seleccioná una fecha primero.');
    const turnosDelDia = [...(turnosPorFecha[fecha] || [])];
    const idx = turnosDelDia.findIndex(t => t.hora === hora);

    if (accion === 'bloquear') {
      const bloqueado = { hora, estado: 'ocupado', cliente: '🚫 HORARIO BLOQUEADO', telefono: '—', email: '', codigo: `BLK-${Math.floor(1000 + Math.random() * 9000)}`, servicio: '' };
      idx !== -1 ? (turnosDelDia[idx] = bloqueado) : turnosDelDia.push(bloqueado);
    } else if (accion === 'liberar') {
      if (idx !== -1) turnosDelDia[idx] = { hora, estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '' };
    }

    setTurnosPorFecha({ ...turnosPorFecha, [fecha]: turnosDelDia });
  };

  return (
    <div className="admin-dashboard animate-input" style={{ padding: '80px 20px 40px', maxWidth: '1060px', margin: '0 auto' }}>

      <header style={{ marginBottom: '28px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Internal Management
        </span>
        <h1 style={{ margin: '4px 0 0', color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '700' }}>
          Panel de Control
        </h1>
      </header>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {[
          { label: 'Turnos Reservados', value: turnosOcupadosReales.length, color: 'var(--accent)' },
          { label: 'Horarios Bloqueados', value: bloqueosTotales.length, color: 'var(--text-secondary)' },
          { label: 'Caja Estimada', value: `$${totalCaja.toLocaleString('es-AR')}`, color: 'var(--success)' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px 20px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
            <div style={{ color: m.color, fontSize: '2rem', fontWeight: '700', marginTop: '6px' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Bloqueo rápido */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)' }}>⚡ Bloqueo Rápido de Horarios</h3>
        <p style={{ margin: '0 0 18px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
          Bloqueá francos, feriados o turnos espontáneos.
        </p>
        <input
          type="date"
          value={fechaGestion}
          onChange={(e) => setFechaGestion(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', outline: 'none', cursor: 'pointer', marginBottom: '18px' }}
        />
        {fechaGestion && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {horariosTemplate.map(hora => {
              const turnoExistente = turnosPorFecha[fechaGestion]?.find(t => t.hora === hora);
              const esBloqueo = turnoExistente?.cliente === '🚫 HORARIO BLOQUEADO';
              const esOcupado = turnoExistente?.estado === 'ocupado';
              return (
                <div key={hora} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{hora}</span>
                  {esBloqueo ? (
                    <button type="button" onClick={() => alternarEstadoHorario(fechaGestion, hora, 'liberar')}
                      style={{ width: '100%', background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.73rem', fontWeight: '600' }}>
                      🔓 Desbloquear
                    </button>
                  ) : esOcupado ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>👤 Reservado</span>
                  ) : (
                    <button type="button" onClick={() => alternarEstadoHorario(fechaGestion, hora, 'bloquear')}
                      style={{ width: '100%', background: 'rgba(255,69,58,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.73rem', fontWeight: '600' }}>
                      🚫 Bloquear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {['todos', 'ocupados', 'libres'].map(f => (
          <button key={f} type="button" onClick={() => setFiltro(f)} style={{
            padding: '6px 14px', borderRadius: '50px', border: '1px solid var(--border)',
            background: filtro === f ? 'var(--accent)' : 'var(--bg-card)',
            color: filtro === f ? '#000' : 'var(--text-secondary)',
            fontWeight: filtro === f ? '700' : '400',
            cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem', transition: 'all 0.2s'
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha', 'Hora', 'Estado', 'Cliente', 'Servicio', 'Código', 'Acción'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay registros disponibles.
                </td>
              </tr>
            ) : turnosFiltrados.map((t, i) => {
              const esOcupado = t.estado === 'ocupado';
              const esBloqueo = t.cliente === '🚫 HORARIO BLOQUEADO';
              return (
                <tr key={`${t.fecha}-${t.hora}-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '13px 16px', fontWeight: '500' }}>{t.fecha}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{t.hora}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '700',
                      background: esBloqueo ? 'rgba(255,69,58,0.12)' : esOcupado ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.04)',
                      color: esBloqueo ? 'var(--danger)' : esOcupado ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {esBloqueo ? 'Bloqueado' : esOcupado ? 'Ocupado' : 'Disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {esOcupado ? (
                      <div>
                        <strong style={{ color: esBloqueo ? 'var(--danger)' : 'var(--text-primary)' }}>{t.cliente}</strong>
                        {!esBloqueo && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>📞 {t.telefono || '—'}</div>}
                      </div>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                    {t.servicio || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.83rem' }}>
                    {t.codigo || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                    {esOcupado ? (
                      <button type="button" onClick={() => alternarEstadoHorario(t.fecha, t.hora, 'liberar')}
                        style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.25)', color: 'var(--danger)', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}>
                        Liberar
                      </button>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
