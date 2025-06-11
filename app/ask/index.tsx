import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { generateAPIUrl } from '~/app/utils/utils';
import { fetch as expoFetch } from 'expo/fetch';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';


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
      <Input
        style=""
        placeholder="Ask a question"
        value={message}
        onChangeText={setMessage}
      />
      <Button  onPress={() => {handleSubmit}} >
        <Text>Ask</Text>
      </Button>
    </View>
  );
}
