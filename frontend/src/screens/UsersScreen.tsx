import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Platform, ScrollView, FlatList
} from 'react-native';
import { sigamService } from '../services/sigamService';

export default function UsersScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [idRol, setIdRol] = useState('');
  const [tipoDoc, setTipoDoc] = useState('CC');
  const [documento, setDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const cargarDatos = async () => {
    try {
      const [dataUsuarios, dataRoles] = await Promise.all([
        sigamService.obtenerUsuarios(),
        sigamService.obtenerRoles()
      ]);

      if (Array.isArray(dataUsuarios)) setUsuarios(dataUsuarios);
      if (Array.isArray(dataRoles)) setRoles(dataRoles);
    } catch (error) {
      console.error('Error cargando usuarios/roles:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setIdRol('');
    setTipoDoc('CC');
    setDocumento('');
    setNombres('');
    setApellidos('');
    setCorreo('');
    setPassword('');
    setTelefono('');
    setEspecialidad('');
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!idRol || !tipoDoc || !documento.trim() || !nombres.trim() || !apellidos.trim() || !correo.trim() || !password) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      await sigamService.crearUsuario({
        id_rol: Number(idRol),
        tipo_documento: tipoDoc,
        documento: documento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        password,
        telefono: telefono.trim() || null,
        especialidad: especialidad.trim() || null
      });

      alert('¡Usuario registrado con éxito!');
      setModalVisible(false);
      cargarDatos();
    } catch (error: any) {
      alert(error.message || 'Error al registrar el usuario.');
    }
  };

  const esMovil = Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Usuarios</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirModalNuevo}>
          <Text style={styles.primaryButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {esMovil ? (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => String(item.id_usuario)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay usuarios registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cardMobile}>
              <View style={styles.cardHeaderMobile}>
                <Text style={styles.cardTitleMobile}>{item.nombres} {item.apellidos}</Text>
                <Text style={styles.badgeRoleMobile}>{item.rol}</Text>
              </View>
              <View style={styles.cardBodyMobile}>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Documento:</Text> {item.tipo_documento} - {item.documento}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Correo:</Text> {item.correo}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Especialidad:</Text> {item.especialidad || '—'}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.5 }]}>Documento</Text>
            <Text style={[styles.th, { flex: 2 }]}>Nombres y Apellidos</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Correo</Text>
            <Text style={[styles.th, { flex: 1 }]}>Rol</Text>
            <Text style={[styles.th, { flex: 1 }]}>Especialidad</Text>
          </View>
          <FlatList
            data={usuarios}
            keyExtractor={(item) => String(item.id_usuario)}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay usuarios registrados.</Text>}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.5, fontWeight: '600', color: '#1e40af' }]}>
                  {item.tipo_documento}: {item.documento}
                </Text>
                <Text style={[styles.td, { flex: 2 }]}>{item.nombres} {item.apellidos}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{item.correo}</Text>
                <Text style={[styles.td, { flex: 1, fontWeight: 'bold', color: '#047857' }]}>{item.rol}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.especialidad || '—'}</Text>
              </View>
            )}
          />
        </View>
      )}

      {modalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Nuevo Usuario</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} style={{ maxHeight: '75vh' }}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rol del Sistema</Text>
                {Platform.OS === 'web' ? (
                  <select value={idRol} onChange={(e) => setIdRol(e.target.value)} style={styles.webSelect}>
                    <option value="">Seleccione un rol...</option>
                    {roles.map((r) => (
                      <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {roles.map((r) => (
                      <TouchableOpacity
                        key={r.id_rol}
                        style={[styles.optionChip, idRol === String(r.id_rol) && styles.optionChipActive]}
                        onPress={() => setIdRol(String(r.id_rol))}
                      >
                        <Text style={[styles.optionChipText, idRol === String(r.id_rol) && styles.optionChipTextActive]}>{r.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tipo de Documento</Text>
                {Platform.OS === 'web' ? (
                  <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} style={styles.webSelect}>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {['CC', 'CE', 'PA'].map((doc) => (
                      <TouchableOpacity
                        key={doc}
                        style={[styles.optionChip, tipoDoc === doc && styles.optionChipActive]}
                        onPress={() => setTipoDoc(doc)}
                      >
                        <Text style={[styles.optionChipText, tipoDoc === doc && styles.optionChipTextActive]}>{doc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Número de Documento</Text>
                <TextInput style={styles.input} placeholder="Documento" value={documento} onChangeText={setDocumento} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombres</Text>
                <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput style={styles.input} placeholder="Apellidos" value={apellidos} onChangeText={setApellidos} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput style={styles.input} placeholder="correo@sigam.com" value={correo} onChangeText={setCorreo} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput style={styles.input} placeholder="Contraseña de acceso" value={password} onChangeText={setPassword} secureTextEntry />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Especialidad (Opcional)</Text>
                <TextInput style={styles.input} placeholder="Ej: General, Pediatría" value={especialidad} onChangeText={setEspecialidad} />
              </View>
            </ScrollView>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>Guardar Usuario</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  primaryButton: { backgroundColor: '#1e40af', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  
  cardMobile: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeaderMobile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, marginBottom: 8 },
  cardTitleMobile: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },
  badgeRoleMobile: { backgroundColor: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  cardBodyMobile: { gap: 4 },
  cardTextMobile: { fontSize: 13, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#1e293b' },

  tableCard: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  th: { fontSize: 13, fontWeight: '700', color: '#475569' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  td: { fontSize: 14, color: '#334155' },
  emptyText: { padding: 20, textAlign: 'center', color: '#94a3b8' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 12 },
  modalCard: { width: '100%', maxWidth: 500, backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '90%', ...(Platform.OS === 'web' ? { overflowY: 'auto' } : {}) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#1f2937' },
  closeButton: { padding: 4 },
  closeText: { fontSize: 16, color: '#6b7280', fontWeight: 'bold' },
  formContainer: { paddingBottom: 10 },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 10, fontSize: 14, color: '#1f2937' },
  
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', marginRight: 6, marginBottom: 6 },
  optionChipActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  optionChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  optionChipTextActive: { color: '#ffffff', fontWeight: '600' },

  webSelect: { width: '100%', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', fontSize: 14, color: '#1f2937' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 6, marginRight: 8 },
  cancelButtonText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#1e3a8a', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 6 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 }
});