import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthScreen = ({ navigation, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuth = () => {
    // Call the onLogin callback to handle successful authentication
    onLogin && onLogin();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2491/2491935.png' }} 
            style={styles.logo} 
          />
          <Text style={styles.appName}>AI Fitness</Text>
          <Text style={styles.tagline}>Transform your fitness journey</Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureEntry}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setSecureEntry(!secureEntry)}
            >
              <Ionicons 
                name={secureEntry ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.authButton}
            onPress={handleAuth}
          >
            <Text style={styles.authButtonText}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
              style={styles.socialIcon} 
            />
            <Text style={styles.socialButtonText}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    height: 56,
    marginBottom: 24,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthScreen;
