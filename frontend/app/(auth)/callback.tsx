import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
//import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = params.access_token as string;
      const refreshToken = params.refresh_token as string;

      if (accessToken && refreshToken) {
        //await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        return;
      }

      const url = await Linking.getInitialURL();
      if (url) {
        const parsed = Linking.parse(url);
        const token = parsed.queryParams?.access_token as string;
        const refresh = parsed.queryParams?.refresh_token as string;
        if (token && refresh) {
          //await supabase.auth.setSession({ access_token: token, refresh_token: refresh });
        }
      }
    };
    handleCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
