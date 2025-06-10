
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { generateAPIUrl } from './utils/utils';
import { fetch as expoFetch } from 'expo/fetch';


export default function Ask() {
  const [message, setMessage] = useState('');
  const  { complete, completion} = useCompletion({
    api: generateAPIUrl('/api/chat'),
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onError: (error) => {
      console.error(error);
    },
    streamProtocol: 'text',
  })

  const handleSubmit = async () => {
    complete(message);
  };

  return (
    <View >
      <TextInput
        style=""
        placeholder="Ask a question"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Ask" onPress={() => {handleSubmit}} />
    </View>
  );
}
