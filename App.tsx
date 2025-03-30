import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import LoginSignup from './components/LoginSignup';
import UserInfoPage from './components/UserInfoPage';
import MapNavigation from './MapNavigation';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const checkAuthState = async () => {
      const storedUserEmail = await AsyncStorage.getItem('userEmail');
      if (storedUserEmail) {
        setUserEmail(storedUserEmail);
        setIsAuthenticated(true);
      }
    };

    checkAuthState();
  }, []);

  const handleAuthSuccess = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleUserInfoSubmit = (info: any) => {
    setUserInfo(info);
    setShowUserInfo(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserInfo(null);
  };

  const handleBackPress = () => {
    setShowUserInfo(false);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userEmail) {
        const userDoc = await firestore().collection('UserDetail').doc(userEmail).get();
        if (userDoc.exists) {
          setUserInfo(userDoc.data());
        }
      }
    };
    fetchUserInfo();
  }, [userEmail]);

  const handleProfilePress = () => {
    setShowUserInfo(true);
  };

  return (
    <View style={styles(isDarkMode).container}>
      {!isAuthenticated ? (
        <LoginSignup onAuthSuccess={handleAuthSuccess} />
      ) : showUserInfo || !userInfo ? (
        <UserInfoPage email={userEmail!} onUserInfoSubmit={handleUserInfoSubmit} onLogout={handleLogout} onBackPress={handleBackPress} />
      ) : (
        <MapNavigation onProfilePress={handleProfilePress} />
      )}
    </View>
  );
};

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
  },
});

export default App;
