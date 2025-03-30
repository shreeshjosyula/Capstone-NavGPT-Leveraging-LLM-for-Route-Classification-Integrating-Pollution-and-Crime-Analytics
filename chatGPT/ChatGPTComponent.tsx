import { chatgpt_api_key, weather_api_key } from '@env';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

const knowledgeBase = require('./knowledgeBase.json');

const ChatGPTComponent: React.FC<{ location: { latitude: number, longitude: number } | null }> = ({ location }) => {
  const [greeting, setGreeting] = useState<string>('');
  const [weather, setWeather] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string, actions?: Array<{ text: string, type: string, data: any }> }>>([]);
  const isDarkMode = useColorScheme() === 'dark';
  const [chatOpen, setChatOpen] = useState(true);


  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await firestore()
          .collection('UserDetail')
          .doc('shreeshjosyula@gmail.com')
          .get();
        const userData = userDoc.data();
        if (userData && userData.firstName) {
          setFirstName(userData.firstName);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    if(chatOpen && firstName){
      fetchWeather();
      setChatOpen(false);
    }
    fetchUserName();
  },[chatOpen, firstName]);

  

  const fetchWeather = async () => {
    if (location) {
      try {
        const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${weather_api_key}&q=${location.latitude},${location.longitude}`);
        const weatherData = response.data;
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: "gpt-4",
              messages: [
                { role: "system", content: "You are a helpful map assistant and you are located in the map navigation application." },
                { role: "user", content: `Greet the user named ${firstName} and tell the temperature ${weatherData.current.temp_c}°C with ${weatherData.current.condition.text}.` }
              ],
              max_tokens: 50,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatgpt_api_key}`,
              },
            }
          );
          const gptGreeting = response.data.choices[0].message.content.trim();
          setGreeting(gptGreeting);
          setWeather(gptGreeting);
          setChatOpen(false);
        } catch (error) {
          console.error('Error fetching greeting from ChatGPT:', error.response ? error.response.data : error.message);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }

  };

  const handleButtonPress = (action: { type: string, data: any }) => {
    if (action.type === 'show_map') {
      // console.log('Show map at coordinates:', action.data);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const newChatHistory = [...chatHistory, { role: 'user', content: inputText }];

    // Extract relevant knowledge base entries
    const relevantEntries = knowledgeBase.filter(entry =>
      entry.location.toLowerCase().includes(inputText.toLowerCase())
    );

    const chatMessage = {
      role: 'assistant',
      content: relevantEntries.map(entry => entry.suggestion).join('\n'),
      actions: relevantEntries.flatMap(entry => entry.actions)
    };

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4",
          messages: [
            ...newChatHistory.map(({ role, content }) => ({ role, content })),
            {
              role: "system",
              content: `Here is some additional information: ${JSON.stringify(relevantEntries)}`
            }
          ],
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${chatgpt_api_key}`,
          },
        }
      );

      const gptResponse = response.data.choices[0].message.content.trim();
      setChatHistory([...newChatHistory, { role: 'assistant', content: gptResponse, actions: chatMessage.actions }]);
      setInputText('');
    } catch (error) {
      console.error('Error sending message to ChatGPT:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles(isDarkMode).container}>
        <Text style={styles(isDarkMode).greeting}>{greeting}</Text>
        <ScrollView style={styles(isDarkMode).chatHistory} contentContainerStyle={{ flexGrow: 1 }}>
          {chatHistory.map((message, index) => (
            <View key={index} style={styles(isDarkMode).messageContainer}>
              <Text style={message.role === 'user' ? styles(isDarkMode).userMessage : styles(isDarkMode).assistantMessage}>
                {message.content}
              </Text>
              {message.actions && message.actions.map((action, actionIndex) => (
                <TouchableOpacity key={actionIndex} onPress={() => handleButtonPress(action)} style={styles(isDarkMode).actionButton}>
                  <Text style={styles(isDarkMode).actionButtonText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
        <View style={styles(isDarkMode).inputContainer}>
          <TextInput
            style={styles(isDarkMode).input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message"
            placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
          />
          <TouchableOpacity onPress={sendMessage} style={styles(isDarkMode).sendButton}>
            <Text style={styles(isDarkMode).sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: isDarkMode ? '#333' : '#fff',
    borderRadius: 5,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flex: 1,
    maxHeight: '90%',
  },
  greeting: {
    fontSize: 15,
    color: isDarkMode ? '#fff' : '#000',
  },
  weather: {
    fontSize: 14,
    color: isDarkMode ? '#ccc' : '#555',
  },
  chatHistory: {
    flex: 1,
    marginVertical: 10,
    height: 300,
  },
  messageContainer: {
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    color: '#000',
    padding: 8,
    borderRadius: 5,
    marginVertical: 2,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ececec',
    color: '#000',
    padding: 8,
    borderRadius: 5,
    marginVertical: 2,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: isDarkMode ? '#555' : '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: isDarkMode ? '#fff' : '#000',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  sendButtonText: {
    color: 'white',
  },
});

export default ChatGPTComponent;
