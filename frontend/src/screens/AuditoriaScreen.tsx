import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { sigamService } from '../services/sigamService';

export default function AuditoriaScreen() {
  const [logs, setLogs] = useState<any[]>([]);

  const cargarAuditoria = async () => {
    try {
      const data = await sigamService.obtenerAuditoria();
      if (Array.isArray(data)) setLogs(data);
    } catch (error) {
      console.error('Error cargando registros de auditoría:', error);
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Auditoría y Bitácora del Sistema</Text>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 0.6 }]}>ID</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Fecha y Hora</Text>
          <Text style={[styles.th, { flex: 1.8 }]}>Usuario</Text>
          <Text style={[styles.th, { flex: 1 }]}>Acción</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Tabla Afectada</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>IP Origen</Text>
        </View>

        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id_log)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay registros de auditoría.</Text>}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: 0.6, fontWeight: '600', color: '#1e40af' }]}>{item.id_log}</Text>
              <Text style={[styles.td, { flex: 1.5 }]}>
                {item.fecha_hora ? String(item.fecha_hora).replace('T', ' ').substring(0, 19) : '—'}
              </Text>
              <Text style={[styles.td, { flex: 1.8 }]}>
                {item.nombres ? `${item.nombres} ${item.apellidos}` : 'Sistema / Desconocido'}
              </Text>
              <Text style={[styles.td, { flex: 1, fontWeight: 'bold', color: item.accion === 'LOGIN' ? '#047857' : '#b45309' }]}>
                {item.accion}
              </Text>
              <Text style={[styles.td, { flex: 1.2 }]}>{item.tabla_afectada || '—'}</Text>
              <Text style={[styles.td, { flex: 1.5, color: '#64748b' }]}>{item.direccion_ip || '—'}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  tableCard: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  th: { fontSize: 13, fontWeight: '700', color: '#475569' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  td: { fontSize: 13, color: '#334155' },
  emptyText: { padding: 20, textAlign: 'center', color: '#94a3b8' }
});