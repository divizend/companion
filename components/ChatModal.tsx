import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '@rneui/themed';
import 'event-target-polyfill';
import { useColorScheme } from 'nativewind';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SSE } from 'sse.js';

import { apiPost } from '@/common/api';
import { clsx } from '@/common/clsx';
// needed for sse.js
import { usedConfig } from '@/common/config';
import { useSessionToken } from '@/common/sessionToken';
import { TextInput } from '@/components/base';
import { t } from '@/i18n';

import ModalLayout from './global/ModalLayout';

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
  const scaleAndTranslateAnim = useSharedValue(0);

  useEffect(() => {
    scaleAndTranslateAnim.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAndTranslateAnim.value }, { translateY: scaleAndTranslateAnim.value * 20 - 20 }],
      opacity: scaleAndTranslateAnim.value,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.downArrowIndicator, animatedStyle]}>
        <Icon name="arrow-downward" type="material" color="black" size={20} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const ChatMessage = ({ item }: { item: Message }) => {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className={clsx(item.role !== MessageRole.USER && 'dark:!bg-secondary-dark')}
      style={[styles.messageBubble, item.role === MessageRole.USER ? styles.userMessage : styles.aiMessage]}
    >
      {item.role === MessageRole.USER ? (
        <Text style={styles.userMessageText}>{item.content}</Text>
      ) : (
        <Markdown
          style={{
            body: {
              color: colorScheme === 'dark' ? 'white' : 'black',
            },
          }}
        >
          {item.content}
        </Markdown>
      )}
    </View>
  );
};

interface ChatModalProps {
  dismiss: () => void;
  chatId?: string;
  systemPrompt?: string; // only relevant for new chats
  initialUserMessage?: string;
}

export default function ChatModal({ chatId: givenChatId, systemPrompt, initialUserMessage, dismiss }: ChatModalProps) {
  const [sessionToken] = useSessionToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const sseRef = useRef<SSE | null>(null);

  const showDownArrow = scrollY > 0;

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
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        dismiss();
      } finally {
        setIsLoading(false);
      }
    })();

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
    Keyboard.dismiss();

    const sse = new SSE(`${usedConfig.api.url}/${usedConfig.api.versionCode}/ai-chat/${chatId}/completion`, {
      headers: {
        'Content-Type': 'application/json',
        'X-SessionToken': sessionToken!,
      },
      payload: JSON.stringify({ message: messageToSend }),
    });
    sseRef.current?.close();
    sseRef.current = sse;

    const minTimeBetweenMessages = 250;
    let lastMessageTime = new Date().getTime();
    const buffer: string[] = [];

    const getNewMessages = (oldMessages: Message[]) => {
      const newMessages = [...oldMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === MessageRole.ASSISTANT) {
        lastMessage.content += buffer.join('');
      } else {
        newMessages.push({
          content: buffer.join(''),
          role: MessageRole.ASSISTANT,
        });
      }
      buffer.length = 0;
      return newMessages;
    };

    sse.addEventListener('message', async (event: any) => {
      const data = JSON.parse(event.data);
      if (data.content) {
        const currentTime = new Date().getTime();
        buffer.push(data.content);
        if (currentTime - lastMessageTime < minTimeBetweenMessages) {
          return;
        }
        lastMessageTime = currentTime;
        setMessages(prevMessages => {
          return getNewMessages(prevMessages);
        });
      }
    });

    sse.addEventListener('end', () => {
      sse.close();
      sseRef.current = null;
      if (buffer.length > 0) {
        setMessages(prevMessages => {
          return getNewMessages(prevMessages);
        });
      }
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

  useEffect(() => {
    if (initialUserMessage && !isLoading) {
      sendMessage(initialUserMessage);
    }
  }, [isLoading, initialUserMessage]);

  return (
    <ModalLayout noScrollView dismiss={dismiss} title={t('common.chat.title')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View className="flex-1 bg-primary-light dark:bg-primary-dark">
          <FlatList
            inverted
            ref={flatListRef}
            data={messages.toReversed()}
            // TODO: This bad, never use index as key.
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.chatListContent}
            ListEmptyComponent={<View style={{ flex: 1 }} />}
            scrollEventThrottle={32} // Increase this value slightly for smoother rendering
            renderItem={({ item }) =>
              item.role === MessageRole.SYSTEM ? null : <View>{<ChatMessage item={item} />}</View>
            }
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              setScrollY(event.nativeEvent.contentOffset.y);
            }}
          />

          <DownArrowIndicator
            visible={showDownArrow}
            onPress={() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
          />
        </View>
        <View className="flex flex-row p-4 items-center bg-primary-light dark:bg-primary-dark">
          <TextInput
            className="flex-1 mr-2"
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('common.chat.inputPlaceholder')}
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
    </ModalLayout>
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
    display: 'flex',
    flexDirection: 'row',
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
