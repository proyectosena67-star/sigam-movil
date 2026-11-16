import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api' 
  : 'http://192.168.101.29:3000/api';

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
});

export const sigamService = {
  // --- AUTENTICACIÓN ---
  login: async (correo: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');
    if (data.token) setToken(data.token);
    return data;
  },

  // --- PACIENTES ---
  obtenerPacientes: async () => {
    const response = await fetch(`${API_URL}/pacientes`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener pacientes');
    return data;
  },

  crearPaciente: async (paciente: any) => {
    const response = await fetch(`${API_URL}/pacientes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paciente),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar el paciente');
    return data;
  },

  actualizarPaciente: async (id: number, paciente: any) => {
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(paciente),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar el paciente');
    return data;
  },

  // --- USUARIOS Y ROLES ---
  obtenerRoles: async () => {
    const response = await fetch(`${API_URL}/roles`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener roles');
    return data;
  },

  obtenerUsuarios: async () => {
    const response = await fetch(`${API_URL}/usuarios`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener usuarios');
    return data;
  },

  crearUsuario: async (usuario: any) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(usuario),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar el usuario');
    return data;
  },

  // --- MEDICAMENTOS ---
  obtenerMedicamentos: async () => {
    const response = await fetch(`${API_URL}/medicamentos`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener medicamentos');
    return data;
  },

  crearMedicamento: async (medicamento: any) => {
    const response = await fetch(`${API_URL}/medicamentos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(medicamento),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar el medicamento');
    return data;
  },

  actualizarMedicamento: async (id: number, medicamento: any) => {
    const response = await fetch(`${API_URL}/medicamentos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(medicamento),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar el medicamento');
    return data;
  },

  // --- LOTES Y CATÁLOGOS ---
  obtenerViasAdministracion: async () => {
    const response = await fetch(`${API_URL}/vias-administracion`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener vías de administración');
    return data;
  },

  obtenerPresentaciones: async () => {
    const response = await fetch(`${API_URL}/presentaciones`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener presentaciones');
    return data;
  },

  obtenerLotes: async () => {
    const response = await fetch(`${API_URL}/lotes`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener lotes');
    return data;
  },

  crearLote: async (lote: any) => {
    const response = await fetch(`${API_URL}/lotes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lote),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar el lote');
    return data;
  },

  actualizarLote: async (id: number, lote: any) => {
    const response = await fetch(`${API_URL}/lotes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(lote),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar el lote');
    return data;
  },

  // --- AUDITORÍA ---
  obtenerAuditoria: async () => {
    const response = await fetch(`${API_URL}/auditoria`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener auditoría');
    return data;
  },
};