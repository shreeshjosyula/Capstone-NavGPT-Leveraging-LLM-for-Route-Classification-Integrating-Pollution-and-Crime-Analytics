import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

const LoginSignup: React.FC<{ onAuthSuccess: (email: string) => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleAuth = async () => {
    if (isLogin) {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await AsyncStorage.setItem('userEmail', user.email!);
        onAuthSuccess(user.email!);
      } catch (error) {
        Alert.alert('Authentication Failed', error.message);
      }
    } else {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        Alert.alert('Signup Successful', 'Please login with your new account');
        setEmail(''); // Clear email field
        setPassword(''); // Clear password field
        setConfirmPassword(''); // Clear confirm password field
        setIsLogin(true); // Switch to login page after successful signup
      } catch (error) {
        Alert.alert('Signup Failed', error.message);
      }
    }
  };

  return (
    <View style={styles(isDarkMode).container}>
      <Text style={styles(isDarkMode).header}>{isLogin ? 'Login' : 'Signup'}</Text>
      <TextInput
        style={styles(isDarkMode).input}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles(isDarkMode).input}
        placeholder="Password"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!isLogin && (
        <TextInput
          style={styles(isDarkMode).input}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
      <View style={styles(isDarkMode).buttonContainer}>
        <Button title={isLogin ? 'Login' : 'Signup'} onPress={handleAuth} />
      </View>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles(isDarkMode).switchText}>
          {isLogin ? 'Switch to Signup' : 'Switch to Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  input: {
    height: 40,
    borderColor: isDarkMode ? '#444444' : 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '50%',
    alignSelf: 'center',
  },
  switchText: {
    marginTop: 16,
    textAlign: 'center',
    color: isDarkMode ? '#1e90ff' : 'blue',
    textDecorationLine: 'underline',
  },
});

export default LoginSignup;
