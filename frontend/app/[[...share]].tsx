import { Redirect } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";

export default function ShareCatchAll() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;

    const file =
      shareIntent?.files?.[0] as { path?: string };

    const url =
      shareIntent?.webUrl ||
      shareIntent?.text ||
      file?.path;

    if (url?.includes("tiktok.com")) {
      console.log("✅ TikTok shared:", url);
      // TODO: saveToUser(url)
    }

    resetShareIntent();
  }, [hasShareIntent]);

  return <Redirect href="/(tabs)" />;
}
