export default function ServiceSelector({ services = [], selectedService, onSelect }) {
  return (
    <div className="services-container animate-input">
      <h3>1. Seleccioná un servicio</h3>
      <div className="services-grid">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <button
              type="button"
              key={service.id}
              onClick={() => onSelect(isSelected ? null : service)}
              className={`service-card-btn ${isSelected ? 'selected' : ''}`}
            >
              <span className="service-icon">{service.icon}</span>
              <span className="service-name">{service.name}</span>
              <span className="service-duration">{service.duration}</span>
              <span className="service-price">{service.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
