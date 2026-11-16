const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Backend S.I.G.A.M. conectado a PostgreSQL (sigamm)' });
});

// 1. Autenticación (Login contra las tablas usuarios y roles)
app.post('/api/auth/login', async (req, res) => {
  const { correo, password } = req.body;
  
  if (!correo || !password) {
    return res.status(400).json({ success: false, message: 'Ingresa correo y contraseña' });
  }

  try {
    const queryText = `
      SELECT u.id_usuario, u.nombres, u.apellidos, u.correo, u.password_hash, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.correo = $1 AND u.estado = true
    `;
    const result = await db.query(queryText, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
    }

    const usuario = result.rows[0];

    if (usuario.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    res.json({
      success: true,
      token: `jwt-token-sigam-${usuario.id_usuario}`,
      usuario: {
        id: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
});

// 2. Obtener lista de pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pacientes ORDER BY id_paciente DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ success: false, message: 'Error al consultar pacientes' });
  }
});

// 3. Registrar nuevo paciente
app.post('/api/pacientes', async (req, res) => {
  const { tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, telefono, correo, direccion } = req.body;

  if (!tipo_documento || !documento || !nombres || !apellidos || !fecha_nacimiento) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const queryText = `
      INSERT INTO pacientes (tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, telefono, correo, direccion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero || null, telefono || null, correo || null, direccion || null];
    
    const result = await db.query(queryText, values);
    res.status(201).json({
      success: true,
      message: 'Paciente registrado con éxito',
      paciente: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un paciente con ese documento' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// Actualizar datos de un paciente existente
app.put('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, telefono, correo, direccion } = req.body;

  if (!tipo_documento || !documento || !nombres || !apellidos || !fecha_nacimiento) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const queryText = `
      UPDATE pacientes 
      SET tipo_documento = $1, documento = $2, nombres = $3, apellidos = $4, 
          fecha_nacimiento = $5, genero = $6, telefono = $7, correo = $8, direccion = $9
      WHERE id_paciente = $10
      RETURNING *;
    `;
    const values = [
      tipo_documento, documento.trim(), nombres.trim(), apellidos.trim(), 
      fecha_nacimiento, genero || null, telefono ? telefono.trim() : null, 
      correo ? correo.trim() : null, direccion ? direccion.trim() : null, Number(id)
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    res.json({
      success: true,
      message: 'Paciente actualizado con éxito',
      paciente: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe otro paciente con ese número de documento' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// 4. Obtener lista de roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await db.query('SELECT id_rol, nombre FROM roles ORDER BY id_rol ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ success: false, message: 'Error al consultar roles' });
  }
});

// 5. Obtener lista de usuarios activos con su rol
app.get('/api/usuarios', async (req, res) => {
  try {
    const queryText = `
      SELECT u.id_usuario, u.tipo_documento, u.documento, u.nombres, u.apellidos, 
             u.correo, u.telefono, u.especialidad, u.estado, r.nombre AS rol, u.id_rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.estado = true
      ORDER BY u.id_usuario DESC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al consultar usuarios' });
  }
});

// 6. Registrar nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const { id_rol, tipo_documento, documento, nombres, apellidos, correo, password, telefono, especialidad } = req.body;

  if (!id_rol || !tipo_documento || !documento || !nombres || !apellidos || !correo || !password) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const queryText = `
      INSERT INTO usuarios (id_rol, tipo_documento, documento, nombres, apellidos, correo, password_hash, telefono, especialidad)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_usuario, tipo_documento, documento, nombres, apellidos, correo, telefono, especialidad, estado;
    `;
    const values = [
      id_rol,
      tipo_documento,
      documento.trim(),
      nombres.trim(),
      apellidos.trim(),
      correo.trim(),
      password,
      telefono ? telefono.trim() : null,
      especialidad ? especialidad.trim() : null
    ];

    const result = await db.query(queryText, values);
    res.status(201).json({
      success: true,
      message: 'Usuario registrado con éxito',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo o documento' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// 7. Obtener lista de medicamentos activos
app.get('/api/medicamentos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM medicamentos ORDER BY id_medicamento DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ success: false, message: 'Error al consultar medicamentos' });
  }
});

// 8. Registrar nuevo medicamento
app.post('/api/medicamentos', async (req, res) => {
  const { codigo_cums, nombre_generico, nombre_comercial, tipo_medicamento, es_controlado, stock_minimo, estado } = req.body;

  if (!codigo_cums || !nombre_generico) {
    return res.status(400).json({ success: false, message: 'El código CUMS y el nombre genérico son obligatorios' });
  }

  try {
    const queryText = `
      INSERT INTO medicamentos (codigo_cums, nombre_generico, nombre_comercial, tipo_medicamento, es_controlado, stock_minimo, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      codigo_cums.trim(),
      nombre_generico.trim(),
      nombre_comercial ? nombre_comercial.trim() : null,
      tipo_medicamento ? tipo_medicamento.trim() : null,
      Boolean(es_controlado),
      stock_minimo !== undefined ? Number(stock_minimo) : 10,
      estado !== undefined ? Boolean(estado) : true
    ];

    const result = await db.query(queryText, values);
    res.status(201).json({
      success: true,
      message: 'Medicamento registrado con éxito',
      medicamento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar medicamento:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un medicamento registrado con ese código CUMS' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// Actualizar un medicamento existente
app.put('/api/medicamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo_cums, nombre_generico, nombre_comercial, tipo_medicamento, es_controlado, stock_minimo, estado } = req.body;

  if (!codigo_cums || !nombre_generico) {
    return res.status(400).json({ success: false, message: 'El código CUMS y el nombre genérico son obligatorios' });
  }

  try {
    const queryText = `
      UPDATE medicamentos 
      SET codigo_cums = $1, nombre_generico = $2, nombre_comercial = $3, 
          tipo_medicamento = $4, es_controlado = $5, stock_minimo = $6, estado = $7
      WHERE id_medicamento = $8
      RETURNING *;
    `;
    const values = [
      codigo_cums.trim(),
      nombre_generico.trim(),
      nombre_comercial ? nombre_comercial.trim() : null,
      tipo_medicamento ? tipo_medicamento.trim() : null,
      Boolean(es_controlado),
      stock_minimo !== undefined ? Number(stock_minimo) : 10,
      estado !== undefined ? Boolean(estado) : true,
      Number(id)
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }

    res.json({
      success: true,
      message: 'Medicamento actualizado con éxito',
      medicamento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe otro medicamento con ese código CUMS' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// 9. Obtener vías de administración (para selectores de lotes)
app.get('/api/vias-administracion', async (req, res) => {
  try {
    const result = await db.query('SELECT id_via, nombre FROM via_administracion ORDER BY id_via ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener vías de administración:', error);
    res.status(500).json({ success: false, message: 'Error al consultar vías' });
  }
});

// 10. Obtener presentaciones (para selectores de lotes)
app.get('/api/presentaciones', async (req, res) => {
  try {
    const result = await db.query('SELECT id_presentacion, nombre FROM presentacion ORDER BY id_presentacion ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener presentaciones:', error);
    res.status(500).json({ success: false, message: 'Error al consultar presentaciones' });
  }
});

// 11. Obtener lista de lotes con nombres unificados
app.get('/api/lotes', async (req, res) => {
  try {
    const queryText = `
      SELECT l.id_lote, l.num_lote, l.fecha_vence, l.stock_actual,
             m.nombre_generico AS medicamento, m.codigo_cums,
             v.nombre AS via, p.nombre AS presentacion,
             l.id_medicamento, l.id_via, l.id_presentacion
      FROM lotes_medicamento l
      JOIN medicamentos m ON l.id_medicamento = m.id_medicamento
      JOIN via_administracion v ON l.id_via = v.id_via
      JOIN presentacion p ON l.id_presentacion = p.id_presentacion
      ORDER BY l.id_lote DESC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    res.status(500).json({ success: false, message: 'Error al consultar lotes' });
  }
});

// 12. Registrar nuevo lote de medicamento
app.post('/api/lotes', async (req, res) => {
  const { id_medicamento, id_via, id_presentacion, num_lote, fecha_vence, stock_actual } = req.body;

  if (!id_medicamento || !id_via || !id_presentacion || !num_lote || !fecha_vence) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para registrar el lote' });
  }

  try {
    const queryText = `
      INSERT INTO lotes_medicamento (id_medicamento, id_via, id_presentacion, num_lote, fecha_vence, stock_actual)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      Number(id_medicamento),
      Number(id_via),
      Number(id_presentacion),
      num_lote.trim(),
      fecha_vence,
      stock_actual !== undefined ? Number(stock_actual) : 0
    ];

    const result = await db.query(queryText, values);
    res.status(201).json({
      success: true,
      message: 'Lote registrado con éxito',
      lote: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar lote:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe este número de lote para esta combinación' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// Actualizar un lote existente
app.put('/api/lotes/:id', async (req, res) => {
  const { id } = req.params;
  const { id_medicamento, id_via, id_presentacion, num_lote, fecha_vence, stock_actual } = req.body;

  if (!id_medicamento || !id_via || !id_presentacion || !num_lote || !fecha_vence) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para actualizar el lote' });
  }

  try {
    const queryText = `
      UPDATE lotes_medicamento 
      SET id_medicamento = $1, id_via = $2, id_presentacion = $3, 
          num_lote = $4, fecha_vence = $5, stock_actual = $6
      WHERE id_lote = $7
      RETURNING *;
    `;
    const values = [
      Number(id_medicamento),
      Number(id_via),
      Number(id_presentacion),
      num_lote.trim(),
      fecha_vence,
      stock_actual !== undefined ? Number(stock_actual) : 0,
      Number(id)
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lote no encontrado' });
    }

    res.json({
      success: true,
      message: 'Lote actualizado con éxito',
      lote: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe este número de lote para esta combinación' });
    }
    res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
  }
});

// 13. Obtener registros de auditoría desde auditoria_logs
app.get('/api/auditoria', async (req, res) => {
  try {
    const queryText = `
      SELECT a.id_log, a.accion, a.tabla_afectada, a.registro_id, 
             a.datos_anteriores, a.datos_nuevo, a.direccion_ip, a.fecha_hora,
             u.nombres, u.apellidos, r.nombre AS rol
      FROM auditoria_logs a
      LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY a.id_log DESC
      LIMIT 100
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al consultar la auditoría' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 S.I.G.A.M. Backend corriendo en http://localhost:${PORT}`);
});