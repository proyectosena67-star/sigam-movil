import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Platform, ScrollView, FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sigamService } from '../services/sigamService';

export default function LotesScreen() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [vias, setVias] = useState<any[]>([]);
  const [presentaciones, setPresentaciones] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loteEditando, setLoteEditando] = useState<any>(null);

  const [idMedicamento, setIdMedicamento] = useState('');
  const [idVia, setIdVia] = useState('');
  const [idPresentacion, setIdPresentacion] = useState('');
  const [numLote, setNumLote] = useState('');
  const [fechaVence, setFechaVence] = useState('');
  const [stockActual, setStockActual] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);

  const cargarDatos = async () => {
    try {
      const [dataLotes, dataMeds, dataVias, dataPres] = await Promise.all([
        sigamService.obtenerLotes(),
        sigamService.obtenerMedicamentos(),
        sigamService.obtenerViasAdministracion(),
        sigamService.obtenerPresentaciones()
      ]);

      if (Array.isArray(dataLotes)) setLotes(dataLotes);
      if (Array.isArray(dataMeds)) setMedicamentos(dataMeds);
      if (Array.isArray(dataVias)) setVias(dataVias);
      if (Array.isArray(dataPres)) setPresentaciones(dataPres);
    } catch (error) {
      console.error('Error cargando datos de lotes:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setLoteEditando(null);
    setIdMedicamento('');
    setIdVia('');
    setIdPresentacion('');
    setNumLote('');
    setFechaVence('');
    setStockActual('');
    setModalVisible(true);
  };

  const abrirModalEditar = (lote: any) => {
    setLoteEditando(lote);
    setIdMedicamento(String(lote.id_medicamento || ''));
    setIdVia(String(lote.id_via || ''));
    setIdPresentacion(String(lote.id_presentacion || ''));
    setNumLote(lote.num_lote || '');
    setFechaVence(lote.fecha_vence ? String(lote.fecha_vence).split('T')[0] : '');
    setStockActual(String(lote.stock_actual ?? ''));
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFechaVence(formatted);
    }
  };

  const handleGuardar = async () => {
    if (!idMedicamento || !idVia || !idPresentacion || !numLote.trim() || !fechaVence || !stockActual) {
      alert('Por favor complete todos los campos.');
      return;
    }

    const payload = {
      id_medicamento: Number(idMedicamento),
      id_via: Number(idVia),
      id_presentacion: Number(idPresentacion),
      num_lote: numLote.trim(),
      fecha_vence: fechaVence,
      stock_actual: Number(stockActual) || 0
    };

    try {
      if (loteEditando) {
        await sigamService.actualizarLote(loteEditando.id_lote, payload);
        alert('¡Lote actualizado con éxito!');
      } else {
        await sigamService.crearLote(payload);
        alert('¡Lote registrado con éxito!');
      }
      setModalVisible(false);
      cargarDatos();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el lote.');
    }
  };

  const esMovil = Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Lotes e Inventario</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirModalNuevo}>
          <Text style={styles.primaryButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {esMovil ? (
        <FlatList
          data={lotes}
          keyExtractor={(item) => String(item.id_lote)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay lotes registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cardMobile}>
              <View style={styles.cardHeaderMobile}>
                <Text style={styles.cardTitleMobile}>Lote: {item.num_lote}</Text>
                <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.editButtonMobile}>
                  <Text style={styles.editTextMobile}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBodyMobile}>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Medicamento:</Text> {item.medicamento}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Vía adm.:</Text> {item.via}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Presentación:</Text> {item.presentacion}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Stock:</Text> {item.stock_actual}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Vence:</Text> {item.fecha_vence ? String(item.fecha_vence).split('T')[0] : '—'}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.2 }]}>Nº Lote</Text>
            <Text style={[styles.th, { flex: 2 }]}>Medicamento</Text>
            <Text style={[styles.th, { flex: 1 }]}>Vía adm.</Text>
            <Text style={[styles.th, { flex: 1 }]}>Presentación</Text>
            <Text style={[styles.th, { flex: 1 }]}>Vencimiento</Text>
            <Text style={[styles.th, { flex: 0.6 }]}>Stock</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Acciones</Text>
          </View>
          <FlatList
            data={lotes}
            keyExtractor={(item) => String(item.id_lote)}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay lotes registrados.</Text>}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: '600', color: '#1e40af' }]}>{item.num_lote}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{item.medicamento}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.via}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.presentacion}</Text>
                <Text style={[styles.td, { flex: 1 }]}>
                  {item.fecha_vence ? String(item.fecha_vence).split('T')[0] : '—'}
                </Text>
                <Text style={[styles.td, { flex: 0.6, fontWeight: 'bold' }]}>{item.stock_actual}</Text>
                <View style={{ flex: 0.8, flexDirection: 'row' }}>
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
                {loteEditando ? 'Editar Lote' : 'Nuevo Lote'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} style={{ maxHeight: '75vh' }}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Medicamento</Text>
                {Platform.OS === 'web' ? (
                  <select value={idMedicamento} onChange={(e) => setIdMedicamento(e.target.value)} style={styles.webSelect}>
                    <option value="">Seleccione un medicamento...</option>
                    {medicamentos.map((m) => (
                      <option key={m.id_medicamento} value={String(m.id_medicamento)}>
                        {m.codigo_cums} - {m.nombre_generico}
                      </option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {medicamentos.map((m) => (
                      <TouchableOpacity
                        key={m.id_medicamento}
                        style={[styles.optionChip, idMedicamento === String(m.id_medicamento) && styles.optionChipActive]}
                        onPress={() => setIdMedicamento(String(m.id_medicamento))}
                      >
                        <Text style={[styles.optionChipText, idMedicamento === String(m.id_medicamento) && styles.optionChipTextActive]}>
                          {m.nombre_generico}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Vía de Administración</Text>
                {Platform.OS === 'web' ? (
                  <select value={idVia} onChange={(e) => setIdVia(e.target.value)} style={styles.webSelect}>
                    <option value="">Seleccione la vía...</option>
                    {vias.map((v) => (
                      <option key={v.id_via} value={String(v.id_via)}>{v.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {vias.map((v) => (
                      <TouchableOpacity
                        key={v.id_via}
                        style={[styles.optionChip, idVia === String(v.id_via) && styles.optionChipActive]}
                        onPress={() => setIdVia(String(v.id_via))}
                      >
                        <Text style={[styles.optionChipText, idVia === String(v.id_via) && styles.optionChipTextActive]}>{v.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Presentación</Text>
                {Platform.OS === 'web' ? (
                  <select value={idPresentacion} onChange={(e) => setIdPresentacion(e.target.value)} style={styles.webSelect}>
                    <option value="">Seleccione presentación...</option>
                    {presentaciones.map((p) => (
                      <option key={p.id_presentacion} value={String(p.id_presentacion)}>{p.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {presentaciones.map((p) => (
                      <TouchableOpacity
                        key={p.id_presentacion}
                        style={[styles.optionChip, idPresentacion === String(p.id_presentacion) && styles.optionChipActive]}
                        onPress={() => setIdPresentacion(String(p.id_presentacion))}
                      >
                        <Text style={[styles.optionChipText, idPresentacion === String(p.id_presentacion) && styles.optionChipTextActive]}>{p.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Número de Lote</Text>
                <TextInput style={styles.input} placeholder="Ej: L-2026-03" value={numLote} onChangeText={setNumLote} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Stock Actual en Lote</Text>
                <TextInput style={styles.input} placeholder="Ej: 100" value={stockActual} onChangeText={setStockActual} keyboardType="numeric" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Fecha de Vencimiento</Text>
                {Platform.OS === 'web' ? (
                  <input type="date" value={fechaVence} onChange={(e) => setFechaVence(e.target.value)} style={styles.webDateInput} />
                ) : (
                  <>
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.datePickerButtonText}>
                        {fechaVence ? `📅 ${fechaVence}` : '📅 Toca para seleccionar vencimiento'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={fechaVence ? new Date(fechaVence + 'T00:00:00') : new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                      />
                    )}
                  </>
                )}
              </View>
            </ScrollView>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>{loteEditando ? 'Actualizar' : 'Guardar'}</Text>
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