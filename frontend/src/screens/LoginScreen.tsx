import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { sigamService } from '../services/sigamService';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (token: string, usuario: any) => void }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    setErrorMsg(mensaje);
    if (Platform.OS !== 'web') {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    const correoLimpio = correo.trim();

    if (!correoLimpio || !password) {
      mostrarAlerta('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      console.log('Enviando login para:', correoLimpio);
      const data = await sigamService.login(correoLimpio, password);
      onLoginSuccess(data.token, data.usuario);
    } catch (error: any) {
      console.error('Error en login:', error);
      mostrarAlerta('Error de Acceso', error.message || 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>S.I.G.A.M.</Text>
        <Text style={styles.subtitle}>Sistema Integral de Dosificación</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          value={correo}
          onChangeText={(texto) => {
            setCorreo(texto);
            if (errorMsg) setErrorMsg('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={(texto) => {
            setPassword(texto);
            if (errorMsg) setErrorMsg('');
          }}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin} 
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  card: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1e3a8a', 
    textAlign: 'center', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6b7280', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  input: { 
    backgroundColor: '#f9fafb', 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    fontSize: 15,
    color: '#1f2937'
  },
  button: { 
    backgroundColor: '#2563eb', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  errorBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600'
  }
});