import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import PatientsScreen from './src/screens/PatientsScreen';
import UsersScreen from './src/screens/UsersScreen';
import MedicamentosScreen from './src/screens/MedicamentosScreen';
import LotesScreen from './src/screens/LotesScreen';
import AuditoriaScreen from './src/screens/AuditoriaScreen';
import { setToken } from './src/services/sigamService';

type ModuloActivo = 'Inicio' | 'Usuarios' | 'Pacientes' | 'Medicamentos' | 'Lotes' | 'Auditoría';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>('Pacientes');

  const handleLoginSuccess = (token: string, usuario: any) => {
    setToken(token);
    setUsuarioActual(usuario);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUsuarioActual(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </View>
    );
  }

  const modulos: ModuloActivo[] = [
    'Inicio',
    'Usuarios',
    'Pacientes',
    'Medicamentos',
    'Lotes',
    'Auditoría',
  ];

  const renderContenidoModulo = () => {
    switch (moduloActivo) {
      case 'Pacientes':
        return <PatientsScreen />;
      case 'Usuarios':
        return <UsersScreen />;
      case 'Medicamentos':
        return <MedicamentosScreen />;
      case 'Lotes':
        return <LotesScreen />;
      case 'Auditoría':
        return <AuditoriaScreen />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>{moduloActivo}</Text>
            <View style={styles.placeholderBanner}>
              <Text style={styles.placeholderText}>Bienvenido al sistema S.I.G.A.M.</Text>
            </View>
          </View>
        );
    }
  };

  const esMovil = Platform.OS !== 'web';

  return (
    <View style={styles.appWrapper}>
      {/* Barra Superior Institucional */}
      <View style={styles.topNavbar}>
        <View>
          <Text style={styles.brandTitle}>S.I.G.A.M.</Text>
          <Text style={styles.brandSubtitle}>SISTEMA INTEGRAL DE GESTIÓN MÉDICA</Text>
        </View>

        <View style={styles.userSection}>
          {!esMovil && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {usuarioActual ? `${usuarioActual.nombres} ${usuarioActual.apellidos}` : 'Admin'}
              </Text>
              <Text style={styles.userRole}>{usuarioActual?.rol || 'Administrador'}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menú Horizontal Superior para Celular / Menú Lateral para Web */}
      {esMovil ? (
        <View style={styles.mobileNavWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNavScroll}>
            {modulos.map((item) => {
              const activo = moduloActivo === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.mobileNavItem, activo && styles.mobileNavItemActive]}
                  onPress={() => setModuloActivo(item)}
                >
                  <Text style={[styles.mobileNavText, activo && styles.mobileNavTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Cuerpo Principal */}
      <View style={[styles.mainBody, esMovil && { flexDirection: 'column' }]}>
        {!esMovil && (
          <View style={styles.sidebar}>
            {modulos.map((item) => {
              const activo = moduloActivo === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.menuItem, activo && styles.menuItemActive]}
                  onPress={() => setModuloActivo(item)}
                >
                  <Text style={[styles.menuItemText, activo && styles.menuItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.contentArea}>
          {renderContenidoModulo()}
        </View>
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>S.I.G.A.M. · Gestión hospitalaria</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  appWrapper: { flex: 1, backgroundColor: '#f8fafc' },
  topNavbar: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  brandSubtitle: { color: '#dbeafe', fontSize: 9, fontWeight: '600', marginTop: 1 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { alignItems: 'flex-end', marginRight: 12 },
  userName: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  userRole: { color: '#bfdbfe', fontSize: 11 },
  logoutButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  
  // Estilos específicos para navegación móvil en la parte superior
  mobileNavWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  mobileNavScroll: {
    paddingHorizontal: 12,
  },
  mobileNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  mobileNavItemActive: {
    backgroundColor: '#1d4ed8',
  },
  mobileNavText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  mobileNavTextActive: {
    color: '#ffffff',
  },

  mainBody: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
  menuItemActive: { backgroundColor: '#eff6ff' },
  menuItemText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  menuItemTextActive: { color: '#1d4ed8', fontWeight: '700' },
  contentArea: { flex: 1, backgroundColor: '#f8fafc' },
  placeholderContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  placeholderTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  placeholderBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    borderRadius: 6,
  },
  placeholderText: { color: '#1e40af', fontSize: 13 },
  footer: {
    backgroundColor: '#1e40af',
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: { color: '#dbeafe', fontSize: 11 },
});