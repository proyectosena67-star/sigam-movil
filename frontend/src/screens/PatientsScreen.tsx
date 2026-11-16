import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Platform, ScrollView, FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sigamService } from '../services/sigamService';

export default function PatientsScreen() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<any>(null);

  const [tipoDoc, setTipoDoc] = useState('CC');
  const [documento, setDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [genero, setGenero] = useState('M');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');

  // Estado para mostrar el calendario en móvil
  const [showDatePicker, setShowDatePicker] = useState(false);

  const cargarPacientes = async () => {
    try {
      const data = await sigamService.obtenerPacientes();
      if (Array.isArray(data)) setPacientes(data);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const abrirModalNuevo = () => {
    setPacienteEditando(null);
    setTipoDoc('CC');
    setDocumento('');
    setNombres('');
    setApellidos('');
    setFechaNac('');
    setGenero('M');
    setTelefono('');
    setCorreo('');
    setDireccion('');
    setModalVisible(true);
  };

  const abrirModalEditar = (paciente: any) => {
    setPacienteEditando(paciente);
    setTipoDoc(paciente.tipo_documento || 'CC');
    setDocumento(paciente.documento || '');
    setNombres(paciente.nombres || '');
    setApellidos(paciente.apellidos || '');
    setFechaNac(paciente.fecha_nacimiento ? String(paciente.fecha_nacimiento).split('T')[0] : '');
    setGenero(paciente.genero || 'M');
    setTelefono(paciente.telefono || '');
    setCorreo(paciente.correo || '');
    setDireccion(paciente.direccion || '');
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFechaNac(formatted);
    }
  };

  const handleGuardar = async () => {
    if (!documento.trim() || !nombres.trim() || !apellidos.trim() || !fechaNac) {
      alert('Por favor complete los campos obligatorios (Documento, Nombres, Apellidos, Fecha de nacimiento).');
      return;
    }

    const payload = {
      tipo_documento: tipoDoc,
      documento: documento.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fecha_nacimiento: fechaNac,
      genero,
      telefono: telefono.trim() || null,
      correo: correo.trim() || null,
      direccion: direccion.trim() || null
    };

    try {
      if (pacienteEditando) {
        await sigamService.actualizarPaciente(pacienteEditando.id_paciente, payload);
        alert('¡Paciente actualizado con éxito!');
      } else {
        await sigamService.crearPaciente(payload);
        alert('¡Paciente registrado con éxito!');
      }
      setModalVisible(false);
      cargarPacientes();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el paciente.');
    }
  };

  const esMovil = Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Pacientes</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirModalNuevo}>
          <Text style={styles.primaryButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {esMovil ? (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => String(item.id_paciente)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay pacientes registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cardMobile}>
              <View style={styles.cardHeaderMobile}>
                <Text style={styles.cardTitleMobile}>{item.nombres} {item.apellidos}</Text>
                <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.editButtonMobile}>
                  <Text style={styles.editTextMobile}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBodyMobile}>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Documento:</Text> {item.tipo_documento} - {item.documento}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Género:</Text> {item.genero || '—'}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Teléfono:</Text> {item.telefono || '—'}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Nacimiento:</Text> {item.fecha_nacimiento ? String(item.fecha_nacimiento).split('T')[0] : '—'}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.2 }]}>Documento</Text>
            <Text style={[styles.th, { flex: 2 }]}>Nombres y Apellidos</Text>
            <Text style={[styles.th, { flex: 1 }]}>Género</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Teléfono</Text>
            <Text style={[styles.th, { flex: 1 }]}>Acciones</Text>
          </View>
          <FlatList
            data={pacientes}
            keyExtractor={(item) => String(item.id_paciente)}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay pacientes registrados.</Text>}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: '600', color: '#1e40af' }]}>
                  {item.tipo_documento}: {item.documento}
                </Text>
                <Text style={[styles.td, { flex: 2 }]}>{item.nombres} {item.apellidos}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.genero || '—'}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{item.telefono || '—'}</Text>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.editButton}>
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {modalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>
                {pacienteEditando ? 'Editar Paciente' : 'Nuevo Paciente'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} style={{ maxHeight: '75vh' }}>
              
              {/* Tipo de Documento */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tipo de Documento</Text>
                {Platform.OS === 'web' ? (
                  <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} style={styles.webSelect}>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {['CC', 'TI', 'CE', 'PA'].map((doc) => (
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
                <TextInput style={styles.input} placeholder="Ej: 1023456789" value={documento} onChangeText={setDocumento} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombres</Text>
                <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput style={styles.input} placeholder="Apellidos" value={apellidos} onChangeText={setApellidos} />
              </View>

              {/* Fecha de Nacimiento con Calendario Nativo en Móvil */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                {Platform.OS === 'web' ? (
                  <input type="date" value={fechaNac} onChange={(e) => setFechaNac(e.target.value)} style={styles.webDateInput} />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.datePickerButton} 
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerButtonText}>
                        {fechaNac ? `📅 ${fechaNac}` : '📅 Toca para seleccionar fecha'}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={fechaNac ? new Date(fechaNac + 'T00:00:00') : new Date(2000, 0, 1)}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Género */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Género</Text>
                {Platform.OS === 'web' ? (
                  <select value={genero} onChange={(e) => setGenero(e.target.value)} style={styles.webSelect}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {[
                      { label: 'Masculino', val: 'M' },
                      { label: 'Femenino', val: 'F' },
                      { label: 'Otro', val: 'O' }
                    ].map((g) => (
                      <TouchableOpacity
                        key={g.val}
                        style={[styles.optionChip, genero === g.val && styles.optionChipActive]}
                        onPress={() => setGenero(g.val)}
                      >
                        <Text style={[styles.optionChipText, genero === g.val && styles.optionChipTextActive]}>{g.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput style={styles.input} placeholder="correo@ejemplo.com" value={correo} onChangeText={setCorreo} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput style={styles.input} placeholder="Dirección" value={direccion} onChangeText={setDireccion} />
              </View>
            </ScrollView>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>{pacienteEditando ? 'Actualizar' : 'Guardar'}</Text>
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
  editButtonMobile: { backgroundColor: '#eff6ff', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, borderWidth: 1, borderColor: '#dbeafe' },
  editTextMobile: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  cardBodyMobile: { gap: 4 },
  cardTextMobile: { fontSize: 13, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#1e293b' },

  tableCard: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  th: { fontSize: 13, fontWeight: '700', color: '#475569' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  td: { fontSize: 14, color: '#334155' },
  emptyText: { padding: 20, textAlign: 'center', color: '#94a3b8' },
  editButton: { backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1, borderColor: '#dbeafe' },
  editText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },

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
  
  // Estilo para el botón del calendario táctil en móvil
  datePickerButton: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 11, justifyContent: 'center' },
  datePickerButtonText: { fontSize: 14, color: '#1f2937', fontWeight: '500' },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', marginRight: 6, marginBottom: 6 },
  optionChipActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  optionChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  optionChipTextActive: { color: '#ffffff', fontWeight: '600' },

  webSelect: { width: '100%', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', fontSize: 14, color: '#1f2937' },
  webDateInput: { width: '100%', padding: 9, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', fontSize: 14, color: '#1f2937' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 6, marginRight: 8 },
  cancelButtonText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#1e3a8a', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 6 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 }
});