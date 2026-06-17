export default function ServiceSelector({ services = [], onSelect }) {
  return (
    <div className="services-container animate-input">
      <h3>1. Seleccioná un servicio</h3>
      <div className="services-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {services.map((service) => (
          <button
            type="button"
            key={service.id}
            onClick={() => onSelect(service)}
            className="service-card-btn"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: ' Nawaz-between',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                {service.name}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🕒 {service.duration}
              </span>
            </div>
            
            <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>
              {service.price}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}