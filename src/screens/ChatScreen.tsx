import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Sparkles, Zap, Phone, Smile } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'Chat'>;

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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <LinearGradient colors={['#0C0A1A', '#06050C', '#0A0815']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#8E8D9C" size={20} />
        </TouchableOpacity>
        <Image source={{ uri: activeMatch.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={styles.headerName}>{activeMatch.name}</Text>
          <Text style={styles.headerVibe}>{activeMatch.archetype.emoji} {activeMatch.archetype.name}</Text>
        </View>
        <TouchableOpacity style={styles.voiceBtn} onPress={handleSprint}>
          <Phone color="#00F0FF" size={18} />
        </TouchableOpacity>
      </View>

      {/* Sprint banner */}
      <TouchableOpacity style={styles.sprintBanner} onPress={handleSprint}>
        <LinearGradient colors={['rgba(138,43,226,0.25)','rgba(0,240,255,0.25)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sprintBannerGrad}>
          <Zap color="#FFD700" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.sprintBannerText}>Start 10-Min Compatibility Sprint</Text>
          <Sparkles color="#FFF" size={12} style={{ marginLeft: 6 }} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Messages */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {chatMessages.map(msg => {
          if (msg.isSystem) return (
            <View key={msg.id} style={styles.icebreakerCard}>
              <Sparkles color="#00F0FF" size={14} style={{ marginRight: 10, marginTop: 2 }} />
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
          <TouchableOpacity style={styles.smileBtn}><Smile color="#636275" size={20} /></TouchableOpacity>
          <TextInput
            placeholder={`Message ${activeMatch.name.split(' ')[0]}...`}
            placeholderTextColor="#636275"
            style={styles.textInput}
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend}><Send color="#00F0FF" size={20} /></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0A1A', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 8, marginRight: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: '#00F0FF', marginRight: 10 },
  headerMeta: { flex: 1 },
  headerName: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  headerVibe: { color: '#8E8D9C', fontSize: 11, fontWeight: '600', marginTop: 1 },
  voiceBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,240,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sprintBanner: { marginHorizontal: 16, marginVertical: 10, borderRadius: 14, overflow: 'hidden' },
  sprintBannerGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  sprintBannerText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.2, textTransform: 'uppercase' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  icebreakerCard: { flexDirection: 'row', backgroundColor: 'rgba(0,240,255,0.04)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.1)', borderRadius: 16, padding: 14, marginBottom: 20 },
  icebreakerText: { flex: 1, color: '#8E8D9C', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '80%' },
  rowMe: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  rowThem: { alignSelf: 'flex-start' },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, alignSelf: 'flex-end' },
  chatBubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#8A2BE2', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chatText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  textMe: { color: '#FFF' },
  textThem: { color: '#8E8D9C' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8E8D9C', opacity: 0.6 },
  inputArea: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#06050C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 100, paddingHorizontal: 16, height: 50, marginTop: 10 },
  smileBtn: { marginRight: 10 },
  textInput: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '500' },
});
