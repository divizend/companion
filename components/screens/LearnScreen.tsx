import React, { useState } from "react";
import { View, Text, Button, SafeAreaView, Modal } from "react-native";
import ChatModal from "@/components/ChatModal";

export default function LearnScreen() {
  const [chatModalVisible, setChatModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome to the Learn Screen!</Text>
        <Button
          title="Open AI Chat"
          onPress={() => setChatModalVisible(true)}
        />
      </View>
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <ChatModal
          onClose={() => setChatModalVisible(false)}
          chatId="66e6da4fc7383490c3387dca"
        />
      </Modal>
    </SafeAreaView>
  );
}
