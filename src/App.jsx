import { useState, useEffect } from 'react';
import ViewCliente from './components/ViewCliente';
import { ViewLogin } from './components/ViewLogin'; 
import { ViewAdmin } from './components/ViewAdmin';
import { Navbar } from './components/Navbar';       
import { supabase } from './supabaseClient';
import './App.css';                      

export default function App() {
  const [vista, setVista] = useState('cliente');
  const [turnosPorFecha, setTurnosPorFecha] = useState({});

  // 🔄 CARGAR DATOS DESDE SUPABASE (Reutilizable)
  const descargarTurnos = async () => {
    const { data, error } = await supabase
      .from('turnos')
      .select('*');

    if (error) {
      console.error("Error al traer turnos de Supabase:", error);
      return;
    }

    if (data) {
      const diccionarioAgrupado = {};
      data.forEach(t => {
        if (!diccionarioAgrupado[t.fecha]) {
          diccionarioAgrupado[t.fecha] = [];
        }
        diccionarioAgrupado[t.fecha].push({
          id: t.id, // Guardamos el ID para facilitar operaciones de borrado/edición directo
          hora: t.hora,
          estado: t.estado,
          cliente: t.cliente || "",
          telefono: t.telefono || "",
          codigo: t.codigo || ""
        });
      });
      setTurnosPorFecha(diccionarioAgrupado);
    }
  };

  useEffect(() => {
    descargarTurnos();
  }, []);

  // 💾 FUNCIÓN PARA GUARDAR O ACTUALIZAR UN DIA EN SUPABASE
  const guardarTurnosEnBaseDeDatos = async (fecha, nuevosTurnos) => {
    setTurnosPorFecha(prev => ({ ...prev, [fecha]: nuevosTurnos }));

    for (const turno of nuevosTurnos) {
      const { error } = await supabase
        .from('turnos')
        .upsert({ 
          fecha: fecha, 
          hora: turno.hora, 
          estado: turno.estado, 
          cliente: turno.cliente || "", 
          telefono: turno.telefono || "", 
          codigo: turno.codigo || "" 
        }, { onConflict: 'fecha,hora' });

      if (error) {
        console.error("Error detallado en Supabase:", error);
      }
    }
    // Forzamos sincronización limpia con la DB
    descargarTurnos();
  };

  return (
    <div className="app-layout">
      
      {/* ☰ NAVBAR CON MENÚ HAMBURGUESA ELEGANTE */}
      {vista !== 'admin' && (
        <Navbar onIrALogin={() => setVista('login')} />
      )}

      {/* RENDER CONDICIONAL DE LAS VISTAS */}
      {vista === 'cliente' && (
        <ViewCliente 
          turnosPorFecha={turnosPorFecha} 
          setTurnosPorFecha={(nuevosTurnos) => {
            const fechaModificada = Object.keys(nuevosTurnos).find(
              key => JSON.stringify(nuevosTurnos[key]) !== JSON.stringify(turnosPorFecha[key])
            ) || Object.keys(nuevosTurnos)[0];
            
            if (fechaModificada) {
              guardarTurnosEnBaseDeDatos(fechaModificada, nuevosTurnos[fechaModificada]);
            }
          }} 
        />
      )}

      {vista === 'login' && (
        <ViewLogin 
          onLoginSuccess={() => setVista('admin')} 
          onVolver={() => setVista('cliente')} 
        />
      )}

      {vista === 'admin' && (
        <div style={{ width: '100%' }}>
          {/* Botón flotante superior de cierre de sesión */}
          <button 
            type="button"
            onClick={() => setVista('cliente')} 
            style={styles.btnCerrarSesionAdmin}
          >
            🚪 Cerrar Sesión
          </button>
          
          <ViewAdmin 
            turnosPorFecha={turnosPorFecha} 
            alActualizar={descargarTurnos}
            setTurnosPorFecha={(nuevosTurnos) => {
              const fechaModificada = Object.keys(nuevosTurnos).find(
                key => JSON.stringify(nuevosTurnos[key]) !== JSON.stringify(turnosPorFecha[key])
              ) || Object.keys(nuevosTurnos)[0];

              if (fechaModificada) {
                guardarTurnosEnBaseDeDatos(fechaModificada, nuevosTurnos[fechaModificada]);
              }
            }} 
          />
        </div>
      )}

    </div>
  );
}

const styles = {
  btnCerrarSesionAdmin: {
    position: 'fixed',
    top: '20px',
    right: '24px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  }
};