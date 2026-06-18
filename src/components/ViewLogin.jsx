import { useState } from 'react';
import { supabase } from '../Backend/supabaseClient';
import '../estilos/ViewLogin.css';

export const ViewLogin = ({ onLoginSuccess, onVolver }) => {
  const [modo, setModo] = useState('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const limpiar = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    limpiar();
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(traducirError(err.message));
      return;
    }
    onLoginSuccess();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    limpiar();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    });
    setLoading(false);
    if (err) { setError(traducirError(err.message)); return; }
    setSuccess('¡Cuenta creada! Revisá tu email para confirmar tu registro y luego iniciá sesión.');
    setModo('login');
    setPassword('');
  };

  const traducirError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (msg.includes('User already registered')) return 'Este email ya está registrado. Iniciá sesión.';
    if (msg.includes('Email not confirmed')) return 'Confirmá tu email antes de iniciar sesión.';
    if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
    return 'Ocurrió un error. Intentá de nuevo.';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">✂️</div>
        <h2>{modo === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}</h2>
        <p className="login-subtitle">
          {modo === 'login' ? 'Iniciá sesión para gestionar tus reservas' : 'Registrate para reservar y ver tu historial'}
        </p>

        <div className="login-tabs">
          <button className={`login-tab ${modo === 'login' ? 'active' : ''}`} onClick={() => { setModo('login'); limpiar(); }}>
            Iniciar sesión
          </button>
          <button className={`login-tab ${modo === 'register' ? 'active' : ''}`} onClick={() => { setModo('register'); limpiar(); }}>
            Registrarse
          </button>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        <form onSubmit={modo === 'login' ? handleLogin : handleRegister}>
          {modo === 'register' && (
            <div className="input-group">
              <label>Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu-correo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Procesando...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <button onClick={onVolver} className="btn-volver">
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};
