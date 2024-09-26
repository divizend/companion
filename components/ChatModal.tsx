import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Icon } from "@rneui/themed";
import { SSE } from "sse.js";
import "event-target-polyfill"; // needed for sse.js
import { usedConfig } from "@/common/config";
import { useSessionToken } from "@/common/sessionToken";
import { t } from "@/i18n";
import { apiPost } from "@/common/api";
import ModalView from "./ModalView";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  chatId?: string;
  systemPrompt?: string; // only relevant for new chats
  initialUserMessage?: string;
}

enum MessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

interface Message {
  content: string;
  role: MessageRole;
}

const MESSAGE_MARGIN_VERTICAL = 5;

(globalThis as any).CustomEvent = Event;

const DownArrowIndicator = ({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) => {
  const scaleAndTranslateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAndTranslateAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const animatedStyle = {
    transform: [
      {
        scale: scaleAndTranslateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
      {
        translateY: scaleAndTranslateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
    opacity: scaleAndTranslateAnim,
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.downArrowIndicator, animatedStyle]}>
        <Icon name="arrow-downward" type="material" color="black" size={20} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function ChatModal({
  visible,
  onClose,
  chatId: givenChatId,
  systemPrompt,
  initialUserMessage,
}: ChatModalProps) {
  const [sessionToken] = useSessionToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);
  const [userAttemptedScroll, setUserAttemptedScroll] = useState(false);

  const [messageHeights, setMessageHeights] = useState<number[]>([]);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sseRef = useRef<SSE | null>(null);

  const [lastTimeAtBottom, setLastTimeAtBottom] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await apiPost("/ai-chat", {
          id: givenChatId,
          systemPrompt,
        });
        setChatId(response.id);
        if (response.messages) {
          setMessages(response.messages);
        }
        setLastTimeAtBottom(null);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const isScrolledToBottom = scrollY >= contentHeight - containerHeight - 20;
    if (isScrolledToBottom) {
      setShowDownArrow(false);
      setLastTimeAtBottom(new Date());
    } else if (
      !lastTimeAtBottom ||
      new Date().getTime() - lastTimeAtBottom.getTime() > 500
    ) {
      setShowDownArrow(true);
    }
  }, [chatId, scrollY, contentHeight, containerHeight]);

  useEffect(() => {
    if (isAIResponding && !userAttemptedScroll) {
      const totalHeight = messageHeights
        .slice(0, -1)
        .reduce((sum, h) => sum + h, 0);
      flatListRef.current?.scrollToOffset({
        offset: totalHeight,
        animated: true,
      });
    }
  }, [isAIResponding, userAttemptedScroll, messageHeights, contentHeight]);

  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  const abortRequest = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsAIResponding(false);
  };

  const sendMessage = (messageToSend: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: messageToSend, role: MessageRole.USER },
      { content: "", role: MessageRole.ASSISTANT },
    ]);
    setInputText("");
    setIsAIResponding(true);
    setUserAttemptedScroll(false);
    Keyboard.dismiss();

    const sse = new SSE(
      `${usedConfig.api.url}/${usedConfig.api.versionCode}/ai-chat/${chatId}/completion`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-SessionToken": sessionToken!,
        },
        payload: JSON.stringify({ message: messageToSend }),
      }
    );
    sseRef.current = sse;

    sse.addEventListener("message", (event: any) => {
      const data = JSON.parse(event.data);
      if (data.content) {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === MessageRole.ASSISTANT) {
            lastMessage.content += data.content;
          } else {
            newMessages.push({
              content: data.content,
              role: MessageRole.ASSISTANT,
            });
          }
          return newMessages;
        });
      }
    });

    sse.addEventListener("end", (event: any) => {
      sse.close();
      sseRef.current = null;
      setIsAIResponding(false);
    });

    sse.addEventListener("error", (event: any) => {
      console.error("SSE error:", event);
      sse.close();
      sseRef.current = null;
      setIsAIResponding(false);
    });
  };

  const handleSendMessage = () => {
    if (chatId && inputText.trim()) {
      sendMessage(inputText.trim());
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === MessageRole.USER ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={item.role === MessageRole.USER ? styles.userMessageText : {}}
      >
        {item.content +
          (item.role === MessageRole.ASSISTANT &&
          index === messages.length - 1 &&
          isAIResponding
            ? "⬤"
            : "")}
      </Text>
    </View>
  );

  const handleMessageLayout = (event: LayoutChangeEvent, index: number) => {
    const { height } = event.nativeEvent.layout;
    setMessageHeights((prevHeights) => {
      const newHeights = [...prevHeights];
      newHeights[index] = height;
      return newHeights;
    });
  };

  useEffect(() => {
    if (initialUserMessage && !isLoading) {
      sendMessage(initialUserMessage);
    }
  }, [isLoading, initialUserMessage]);

  return (
    <ModalView
      visible={visible}
      onClose={onClose}
      title={t("chat.title")}
      noScrollView
    >
      <View
        style={styles.chatContainer}
        onLayout={(event: LayoutChangeEvent) => {
          setContainerHeight(event.nativeEvent.layout.height);
        }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) =>
            item.role === MessageRole.SYSTEM ? null : (
              <View onLayout={(event) => handleMessageLayout(event, index)}>
                {renderMessage({ item, index })}
              </View>
            )
          }
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.chatListContent}
          ListEmptyComponent={<View style={{ flex: 1 }} />}
          onTouchStart={() => {
            setUserAttemptedScroll(true);
          }}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            setScrollY(event.nativeEvent.contentOffset.y);
          }}
          onContentSizeChange={(width: number, height: number) => {
            setContentHeight(height);
          }}
          scrollEventThrottle={16}
        />
        <DownArrowIndicator
          visible={showDownArrow}
          onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t("chat.inputPlaceholder")}
          onSubmitEditing={handleSendMessage}
          multiline
          numberOfLines={1}
          blurOnSubmit={false}
          editable={!!chatId && !isAIResponding}
          key={isAIResponding ? "sending" : "idle"}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!chatId || inputText.trim() === "" || isLoading) &&
              !isAIResponding &&
              styles.sendButtonDisabled,
          ]}
          onPress={isAIResponding ? abortRequest : handleSendMessage}
          disabled={
            (!chatId || inputText.trim() === "" || isLoading) && !isAIResponding
          }
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : isAIResponding ? (
            <Icon name="stop" type="material" color="white" size={18} />
          ) : (
            <Icon name="arrow-upward" type="material" color="white" size={18} />
          )}
        </TouchableOpacity>
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  chatListContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    marginVertical: MESSAGE_MARGIN_VERTICAL,
    marginHorizontal: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  userMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    minHeight: 44,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "black",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007AFF",
  },
  connectionMessage: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  downArrowIndicator: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
