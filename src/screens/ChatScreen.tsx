import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, Sparkles, Zap, Phone, Smile, PenTool, Mic, Server, Coffee } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'Chat'>;

const IconMap: Record<string, any> = {
  'PenTool': PenTool,
  'Mic': Mic,
  'Server': Server,
  'Zap': Zap,
  'Coffee': Coffee
};

export const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const { activeMatch, chatMessages, sendChatMessage, isTeammateTyping, startSprint } = useApp();
  const [inputVal, setInputVal] = useState('');
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatMessages, isTeammateTyping]);

  if (!activeMatch) return null;

  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendChatMessage(inputVal);
    setInputVal('');
  };

  const handleSprint = () => {
    startSprint();
    navigation.navigate('SprintRoom');
  };

  const ArchetypeIcon = IconMap[activeMatch.archetype.icon] || Sparkles;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#767676" size={20} />
        </TouchableOpacity>
        <Image source={{ uri: activeMatch.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={styles.headerName}>{activeMatch.name}</Text>
          <View style={styles.headerVibeContainer}>
            <ArchetypeIcon color="#800020" size={12} style={{ marginRight: 4 }} />
            <Text style={styles.headerVibe}>{activeMatch.archetype.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.voiceBtn} onPress={handleSprint}>
          <Phone color="#800020" size={18} />
        </TouchableOpacity>
      </View>

      {/* Sprint banner */}
      <TouchableOpacity style={styles.sprintBanner} onPress={handleSprint}>
        <View style={styles.sprintBannerContainer}>
          <Zap color="#800020" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.sprintBannerText}>Start 10-Min Compatibility Sprint</Text>
          <Sparkles color="#800020" size={12} style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>

      {/* Messages */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {chatMessages.map(msg => {
          if (msg.isSystem) return (
            <View key={msg.id} style={styles.icebreakerCard}>
              <Sparkles color="#800020" size={14} style={{ marginRight: 10, marginTop: 2 }} />
              <Text style={styles.icebreakerText}>{msg.text}</Text>
            </View>
          );
          const isMe = msg.senderId === 'me';
          return (
            <View key={msg.id} style={[styles.messageRow, isMe ? styles.rowMe : styles.rowThem]}>
              {!isMe && <Image source={{ uri: activeMatch.avatar }} style={styles.chatAvatar} />}
              <View style={[styles.chatBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.chatText, isMe ? styles.textMe : styles.textThem]}>{msg.text}</Text>
              </View>
            </View>
          );
        })}
        {isTeammateTyping && (
          <View style={[styles.messageRow, styles.rowThem]}>
            <Image source={{ uri: activeMatch.avatar }} style={styles.chatAvatar} />
            <View style={[styles.chatBubble, styles.bubbleThem, styles.typingBubble]}>
              <View style={styles.dot} /><View style={[styles.dot, { marginHorizontal: 3 }]} /><View style={styles.dot} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.smileBtn}><Smile color="#767676" size={20} /></TouchableOpacity>
          <TextInput
            placeholder={`Message ${activeMatch.name.split(' ')[0]}...`}
            placeholderTextColor="#767676"
            style={styles.textInput}
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend}><Send color="#800020" size={20} /></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', borderStyle: 'dotted' },
  backBtn: { padding: 8, marginRight: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#E0E0E0', marginRight: 10 },
  headerMeta: { flex: 1 },
  headerName: { color: '#2C2C2C', fontSize: 16, fontWeight: '800', fontFamily: 'serif' },
  headerVibeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  headerVibe: { color: '#767676', fontSize: 11, fontWeight: '600' },
  voiceBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center' },
  sprintBanner: { marginHorizontal: 16, marginVertical: 10, borderRadius: 14, overflow: 'hidden' },
  sprintBannerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', borderRadius: 14 },
  sprintBannerText: { color: '#800020', fontSize: 11, fontWeight: '800', letterSpacing: 0.2, textTransform: 'uppercase' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  icebreakerCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 16, padding: 14, marginBottom: 20 },
  icebreakerText: { flex: 1, color: '#767676', fontSize: 12, lineHeight: 18, fontWeight: '600', fontStyle: 'italic' },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '80%' },
  rowMe: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  rowThem: { alignSelf: 'flex-start' },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, alignSelf: 'flex-end' },
  chatBubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#800020', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  chatText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  textMe: { color: '#FFFFFF' },
  textThem: { color: '#2C2C2C' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#767676', opacity: 0.6 },
  inputArea: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#F9F6F0', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 100, paddingHorizontal: 16, height: 50, marginTop: 10 },
  smileBtn: { marginRight: 10 },
  textInput: { flex: 1, color: '#2C2C2C', fontSize: 14, fontWeight: '500' },
});
