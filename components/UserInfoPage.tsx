import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

interface UserInfoPageProps {
  email: string;
  onUserInfoSubmit: (info: any) => void;
  onLogout: () => void;
  onBackPress: () => void;
}

const backButtonImage = require('../assets/back.png');

const UserInfoPage: React.FC<UserInfoPageProps> = ({ email, onUserInfoSubmit, onLogout, onBackPress }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [vehicle, setVehicle] = useState('');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userDoc = await firestore().collection('UserDetail').doc(email).get();
        if (userDoc.exists) {
          const userInfo = userDoc.data();
          setFirstName(userInfo?.firstName || '');
          setLastName(userInfo?.lastName || '');
          setAge(userInfo?.age || '');
          setVehicle(userInfo?.vehicle || '');
        }
      } catch (error) {
        console.error('Error fetching user info from Firestore: ', error);
      }
    };

    fetchUserInfo();
  }, [email]);

  const handleSubmit = async () => {
    const userInfo = { firstName, lastName, age, vehicle, email };

    try {
      await firestore().collection('UserDetail').doc(email).set(userInfo);
      onUserInfoSubmit(userInfo);
      alert('User information submitted successfully');
    } catch (error) {
      console.error('Error adding user info to Firestore: ', error);
      alert('Error submitting user information');
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userEmail');
      onLogout();
    } catch (error) {
      console.error('Error during logout: ', error);
      alert('Error during logout');
    }
  };

  return (
    <View style={styles(isDarkMode).container}>
      <TouchableOpacity style={styles(isDarkMode).backButton} onPress={onBackPress}>
      <Image source={backButtonImage} style={{ width: 30, height: 30 }} />
      </TouchableOpacity>

      <Text style={styles(isDarkMode).label}>First Name:</Text>
      <TextInput
        style={styles(isDarkMode).input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
      />

      <Text style={styles(isDarkMode).label}>Last Name:</Text>
      <TextInput
        style={styles(isDarkMode).input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
      />

      <Text style={styles(isDarkMode).label}>Age:</Text>
      <TextInput
        style={styles(isDarkMode).input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
        keyboardType="numeric"
        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
      />

      <Text style={styles(isDarkMode).label}>Vehicle:</Text>
      <Picker
        selectedValue={vehicle}
        style={styles(isDarkMode).picker}
        onValueChange={(itemValue) => setVehicle(itemValue)}
      >
        <Picker.Item label="Select Vehicle" value="" />
        <Picker.Item label="4 Wheeler" value="4wheeler" />
        <Picker.Item label="2 Wheeler" value="2wheeler" />
        <Picker.Item label="Bicycle" value="bicycle" />
        <Picker.Item label="Walk" value="walk" />
      </Picker>

      <Button title="Submit" onPress={handleSubmit} />
      
      <TouchableOpacity style={styles(isDarkMode).logoutButton} onPress={handleLogout}>
        <Text style={styles(isDarkMode).logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: isDarkMode ? '#1e90ff' : 'blue',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  input: {
    height: 40,
    borderColor: isDarkMode ? '#444444' : 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default UserInfoPage;
