import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView } from "react-native";
import { usedConfig } from "@/common/config";

import { useSocket } from "@/hooks/useSocket";

export default function LearnScreen() {
  const socket = useSocket(usedConfig.api.url, {
    path: "/ai-chat",
  });

  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("response", (data: any) => {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      });

      // Cleanup
      return () => {
        socket.off("response");
      };
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket) {
      socket.emit("message", { text: "Hello, server!" });
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Text>{socket ? "Connected to WebSocket" : "Disconnected"}</Text>

        {messages.map((message, index) => (
          <Text key={index}>{message}</Text>
        ))}

        <Button title="Send Message" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}
