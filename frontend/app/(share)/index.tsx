import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";

export default function ShareEntry() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;

    const file =
      shareIntent?.files?.[0] as { path?: string; uri?: string };

    const url =
      shareIntent?.webUrl ||
      shareIntent?.text ||
      file?.path ||
      file?.uri;

    if (url?.includes("tiktok.com")) {
        console.log('dbiuhfsb')
      router.replace({
        pathname: "/",
        params: { url },
      });
    }

    resetShareIntent();
  }, [hasShareIntent]);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
