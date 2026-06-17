export default function ProfessionalSelector({ staff = [], onSelect, onBack }) {
  return (
    <div className="staff-container animate-input">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <button 
          type="button" 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.03)'
          }}
        >
          ←
        </button>
        <h3 style={{ margin: 0 }}>2. Seleccioná al profesional</h3>
      </div>

      <div className="staff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
        {staff.map((barber) => (
          <button
            type="button"
            key={barber.id}
            onClick={() => onSelect(barber)}
            className="staff-card-btn"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '20px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            {/* Avatar circular con fondo suave */}
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '4px',
              border: '1px solid rgba(245, 158, 11, 0.2)' 
            }}>
              <img 
                src={barber.avatar} 
                alt={barber.name} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>

            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
              {barber.name}
            </span>
            
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
              Disponible
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}