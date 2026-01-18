import LottieView from "lottie-react-native";
import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";

export function BookLoader() {
  const messages = [
    "Finding libraries…",
    "Searching books…",
    "Reading titles…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
    "Checking status…",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // slightly snappier

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/images/Book-paging.json")}
        autoPlay
        loop
        speed={2}
        style={styles.animation}
      />

      <Text style={styles.text}>{messages[index]}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    animation: {
      width: 72,
      height: 64,
      marginBottom: 12,
    },
    text: {
      fontSize: 14,
      color: "#444",       // neutral dark gray
      fontWeight: "500",
      letterSpacing: 0.3,
    },
  });
  