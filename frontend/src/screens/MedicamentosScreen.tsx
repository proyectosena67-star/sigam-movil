import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Platform, ScrollView, FlatList
} from 'react-native';
import { sigamService } from '../services/sigamService';

export default function MedicamentosScreen() {
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState<any>(null);

  const [codigoCums, setCodigoCums] = useState('');
  const [nombreGenerico, setNombreGenerico] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [tipoMedicamento, setTipoMedicamento] = useState('');
  const [esControlado, setEsControlado] = useState(false);
  const [stockMinimo, setStockMinimo] = useState('10');

  const cargarMedicamentos = async () => {
    try {
      const data = await sigamService.obtenerMedicamentos();
      if (Array.isArray(data)) setMedicamentos(data);
    } catch (error) {
      console.error('Error cargando medicamentos:', error);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const abrirModalNuevo = () => {
    setMedicamentoEditando(null);
    setCodigoCums('');
    setNombreGenerico('');
    setNombreComercial('');
    setTipoMedicamento('');
    setEsControlado(false);
    setStockMinimo('10');
    setModalVisible(true);
  };

  const abrirModalEditar = (med: any) => {
    setMedicamentoEditando(med);
    setCodigoCums(med.codigo_cums || '');
    setNombreGenerico(med.nombre_generico || '');
    setNombreComercial(med.nombre_comercial || '');
    setTipoMedicamento(med.tipo_medicamento || '');
    setEsControlado(med.es_controlado || false);
    setStockMinimo(String(med.stock_minimo ?? 10));
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!codigoCums.trim() || !nombreGenerico.trim()) {
      alert('El código CUMS y el nombre genérico son obligatorios.');
      return;
    }

    const payload = {
      codigo_cums: codigoCums.trim(),
      nombre_generico: nombreGenerico.trim(),
      nombre_comercial: nombreComercial.trim() || null,
      tipo_medicamento: tipoMedicamento.trim() || null,
      es_controlado: Boolean(esControlado),
      stock_minimo: Number(stockMinimo) || 10,
      estado: true
    };

    try {
      if (medicamentoEditando) {
        await sigamService.actualizarMedicamento(medicamentoEditando.id_medicamento, payload);
        alert('¡Medicamento actualizado con éxito!');
      } else {
        await sigamService.crearMedicamento(payload);
        alert('¡Medicamento registrado con éxito!');
      }
      setModalVisible(false);
      cargarMedicamentos();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el medicamento.');
    }
  };

  const esMovil = Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Medicamentos</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirModalNuevo}>
          <Text style={styles.primaryButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {esMovil ? (
        <FlatList
          data={medicamentos}
          keyExtractor={(item) => String(item.id_medicamento)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay medicamentos registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cardMobile}>
              <View style={styles.cardHeaderMobile}>
                <Text style={styles.cardTitleMobile}>{item.nombre_generico}</Text>
                <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.editButtonMobile}>
                  <Text style={styles.editTextMobile}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBodyMobile}>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>CUMS:</Text> {item.codigo_cums}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Comercial:</Text> {item.nombre_comercial || '—'}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Controlado:</Text> {item.es_controlado ? 'Sí' : 'No'}</Text>
                <Text style={styles.cardTextMobile}><Text style={styles.bold}>Stock Mín:</Text> {item.stock_minimo}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.2 }]}>Código CUMS</Text>
            <Text style={[styles.th, { flex: 2 }]}>Nombre Genérico</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Controlado</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Stock Mín.</Text>
            <Text style={[styles.th, { flex: 1 }]}>Acciones</Text>
          </View>
          <FlatList
            data={medicamentos}
            keyExtractor={(item) => String(item.id_medicamento)}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay medicamentos registrados.</Text>}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: '600', color: '#1e40af' }]}>{item.codigo_cums}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{item.nombre_generico}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{item.es_controlado ? 'Sí' : 'No'}</Text>
                <Text style={[styles.td, { flex: 0.8 }]}>{item.stock_minimo}</Text>
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
                {medicamentoEditando ? 'Editar Medicamento' : 'Nuevo Medicamento'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} style={{ maxHeight: '75vh' }}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Código CUMS</Text>
                <TextInput style={styles.input} placeholder="Ej: 19987654-1" value={codigoCums} onChangeText={setCodigoCums} />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre Genérico</Text>
                <TextInput style={styles.input} placeholder="Ej: Acetaminofén" value={nombreGenerico} onChangeText={setNombreGenerico} />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre Comercial</Text>
                <TextInput style={styles.input} placeholder="Ej: Doralgin" value={nombreComercial} onChangeText={setNombreComercial} />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tipo de Medicamento</Text>
                <TextInput style={styles.input} placeholder="Ej: Analgésico" value={tipoMedicamento} onChangeText={setTipoMedicamento} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>¿Es Controlado?</Text>
                {Platform.OS === 'web' ? (
                  <select value={String(esControlado)} onChange={(e) => setEsControlado(e.target.value === 'true')} style={styles.webSelect}>
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                ) : (
                  <View style={styles.optionsRow}>
                    {[
                      { label: 'No', val: false },
                      { label: 'Sí', val: true }
                    ].map((opt) => (
                      <TouchableOpacity
                        key={String(opt.val)}
                        style={[styles.optionChip, esControlado === opt.val && styles.optionChipActive]}
                        onPress={() => setEsControlado(opt.val)}
                      >
                        <Text style={[styles.optionChipText, esControlado === opt.val && styles.optionChipTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Stock Mínimo</Text>
                <TextInput style={styles.input} value={stockMinimo} onChangeText={setStockMinimo} keyboardType="numeric" />
              </View>
            </ScrollView>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>{medicamentoEditando ? 'Actualizar' : 'Guardar'}</Text>
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