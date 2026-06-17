import React, { useState } from 'react';
import '../estilos/Navbar.css'; 

export const Navbar = ({ onIrALogin }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón de 3 líneas flotante arriba a la derecha */}
      <button className="hamburger-btn" onClick={toggleMenu} title="Menú de Administración">
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Menú desplegable */}
      <div className={`admin-dropdown-menu ${isOpen ? 'active' : ''}`}>
        <h4>Gestión Interna</h4>
        <button 
          className="btn-menu-login" 
          onClick={() => {
            onIrALogin(); // Cambia el estado de la vista en App.jsx
            setIsOpen(false); // Cierra el menú desplegable
          }}
        >
          🔒 Ingreso Admin
        </button>
      </div>
    </>
  );
};