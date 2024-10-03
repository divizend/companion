import React, { useEffect, useState, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { SSE } from 'sse.js';
import 'event-target-polyfill'; // needed for sse.js
import { usedConfig } from '@/common/config';
import { useSessionToken } from '@/common/sessionToken';
import { t } from '@/i18n';
import { apiPost } from '@/common/api';
import ModalView from './ModalView';
import Markdown from 'react-native-markdown-display';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  chatId?: string;
  systemPrompt?: string; // only relevant for new chats
  initialUserMessage?: string;
}

enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

interface Message {
  content: string;
  role: MessageRole;
}

const MESSAGE_MARGIN_VERTICAL = 5;

(globalThis as any).CustomEvent = Event;

const DownArrowIndicator = ({ visible, onPress }: { visible: boolean; onPress: () => void }) => {
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
  const [inputText, setInputText] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);
  const [userAttemptedScroll, setUserAttemptedScroll] = useState(false);

  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollYAnim = useRef(new Animated.Value(0)).current;

  const smoothScrollToBottom = () => {
    const offset = contentHeight - containerHeight > 0 ? contentHeight - containerHeight : 0;
    Animated.timing(scrollYAnim, {
      toValue: offset,
      duration: 600, // Increase the duration for smoother scrolling
      useNativeDriver: true,
    }).start(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    });
  };

  useEffect(() => {
    if (isAIResponding && !userAttemptedScroll) {
      smoothScrollToBottom();
    }
  }, [isAIResponding, messages]);

  useEffect(() => {
    if (messages.length > 0 && !userAttemptedScroll) {
      smoothScrollToBottom(); // Smooth scroll on new message
    }
  }, [messages]);

  useEffect(() => {
    if (!userAttemptedScroll && contentHeight > containerHeight) {
      smoothScrollToBottom();
    }
  }, [contentHeight]);

  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sseRef = useRef<SSE | null>(null);

  const [lastTimeAtBottom, setLastTimeAtBottom] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await apiPost('/ai-chat', {
          id: givenChatId,
          systemPrompt,
        });
        setChatId(response.id);
        if (response.messages) {
          setMessages(response.messages);
        }
        setLastTimeAtBottom(null);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
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
    } else if (!lastTimeAtBottom || new Date().getTime() - lastTimeAtBottom.getTime() > 500) {
      setShowDownArrow(true);
    }
  }, [chatId, scrollY, contentHeight, containerHeight]);

  useEffect(() => {
    if (!isAIResponding && !userAttemptedScroll) {
      smoothScrollToBottom();
    }
  }, [isAIResponding, messages]);

  useEffect(() => {
    const isAtBottom = scrollY >= contentHeight - containerHeight - 20;
    if (!userAttemptedScroll && isAtBottom) {
      // Ensure smooth scrolling to bottom when content height increases (new messages)
      smoothScrollToBottom();
    }
  }, [contentHeight, messages]);

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
    setMessages(prevMessages => [
      ...prevMessages,
      { content: messageToSend, role: MessageRole.USER },
      { content: '', role: MessageRole.ASSISTANT },
    ]);
    setInputText('');
    setIsAIResponding(true);
    setUserAttemptedScroll(false);
    Keyboard.dismiss();

    const sse = new SSE(`${usedConfig.api.url}/${usedConfig.api.versionCode}/ai-chat/${chatId}/completion`, {
      headers: {
        'Content-Type': 'application/json',
        'X-SessionToken': sessionToken!,
      },
      payload: JSON.stringify({ message: messageToSend }),
    });
    sseRef.current = sse;

    sse.addEventListener('message', (event: any) => {
      const data = JSON.parse(event.data);
      if (data.content) {
        setMessages(prevMessages => {
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

    sse.addEventListener('end', (event: any) => {
      sse.close();
      sseRef.current = null;
      setIsAIResponding(false);
    });

    sse.addEventListener('error', (event: any) => {
      console.error('SSE error:', event);
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
    <View style={[styles.messageBubble, item.role === MessageRole.USER ? styles.userMessage : styles.aiMessage]}>
      {item.role === MessageRole.USER ? (
        <Text style={styles.userMessageText}>{item.content}</Text>
      ) : (
        <Markdown>{item.content}</Markdown>
      )}
    </View>
  );

  useEffect(() => {
    if (initialUserMessage && !isLoading) {
      sendMessage(initialUserMessage);
    }
  }, [isLoading, initialUserMessage]);

  return (
    <ModalView visible={visible} onClose={onClose} title={t('chat.title')} noScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View
          className="flex-1 bg-[#f2f2f2]"
          onLayout={(event: LayoutChangeEvent) => {
            setContainerHeight(event.nativeEvent.layout.height);
          }}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) =>
              item.role === MessageRole.SYSTEM ? null : <View>{renderMessage({ item, index })}</View>
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
            scrollEventThrottle={32} // Increase this value slightly for smoother rendering
          />

          <DownArrowIndicator
            visible={showDownArrow}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
              setUserAttemptedScroll(false); // Reset manual scroll state when arrow is pressed
            }}
          />
        </View>
        <View className="flex flex-row p-4 items-center bg-[#f2f2f2]">
          <TextInput
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 mr-2 min-h-[44px] bg-white"
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat.inputPlaceholder')}
            onSubmitEditing={handleSendMessage}
            multiline
            numberOfLines={1}
            blurOnSubmit={false}
            editable={!!chatId && !isAIResponding}
            key={isAIResponding ? 'sending' : 'idle'}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!chatId || inputText.trim() === '' || isLoading) && !isAIResponding && styles.sendButtonDisabled,
            ]}
            onPress={isAIResponding ? abortRequest : handleSendMessage}
            disabled={(!chatId || inputText.trim() === '' || isLoading) && !isAIResponding}
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
      </KeyboardAvoidingView>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  chatListContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: MESSAGE_MARGIN_VERTICAL,
    marginHorizontal: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  userMessageText: {
    color: '#fff',
  },
  sendButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#888',
  },
  downArrowIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
