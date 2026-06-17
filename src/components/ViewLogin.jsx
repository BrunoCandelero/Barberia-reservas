import React, { useState } from 'react';
import '../estilos/ViewLogin.css'; // 👈 Ruta modular corregida

export const ViewLogin = ({ onLoginSuccess, onVolver }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Credenciales de prueba (Podés cambiarlas por las que quieras)
    if (usuario === 'admin' && password === 'barber123') {
      setError('');
      onLoginSuccess(); // Si es correcto, le avisa a App.jsx para pasar al panel
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Ingreso Administrativo</h2>
        <p>Introduce tus credenciales para gestionar la agenda</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuario</label>
            <input 
              type="text" 
              placeholder="Ej: admin" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Ingresar al Panel
          </button>
        </form>

        <button onClick={onVolver} className="btn-volver">
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};