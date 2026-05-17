import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { Camera, Edit3, Save, RotateCcw, ChevronRight, Sparkles, PenTool, Mic, Server, Coffee } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';

type Props = BottomTabScreenProps<any, 'Profile'>;

const IconMap: Record<string, any> = {
  'PenTool': PenTool,
  'Mic': Mic,
  'Server': Server,
  'Zap': Sparkles,
  'Coffee': Coffee
};

const SCHEDULES   = ['Late Night','Early Bird','24/7 Machine','Flexible'] as const;
const SHIP_OPTIONS = ['Ship Fast','Polish to Perfection','Healthy Balance'] as const;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { userProfile, userArchetype, updateProfile, resetApp } = useApp();
  const [editing, setEditing] = useState(false);
  const [localName,     setLocalName]     = useState(userProfile?.name     ?? '');
  const [localCollege,  setLocalCollege]  = useState(userProfile?.college  ?? '');
  const [localSnack,    setLocalSnack]    = useState(userProfile?.snack    ?? '');
  const [localMusic,    setLocalMusic]    = useState(userProfile?.musicVibe ?? '');
  const [localHabit,    setLocalHabit]    = useState(userProfile?.toxicHabit ?? '');
  const [avatarUri,     setAvatarUri]     = useState<string | null>(null);

  if (!userProfile || !userArchetype) return null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo library access to update your profile picture.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = () => {
    updateProfile({ name: localName, college: localCollege, snack: localSnack, musicVibe: localMusic, toxicHabit: localHabit });
    setEditing(false);
  };

  const displayAvatar = avatarUri || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  const ArchetypeIcon = IconMap[userArchetype.icon] || Sparkles;

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            <View style={styles.glowRing} />
            <View style={styles.cameraOverlay}>
              <Camera color="#FFFFFF" size={16} />
            </View>
          </TouchableOpacity>

          {editing ? (
            <TextInput value={localName} onChangeText={setLocalName} style={styles.nameInput} placeholderTextColor="#767676" />
          ) : (
            <Text style={styles.profileName}>{userProfile.name}</Text>
          )}
          <Text style={styles.profileCollege}>{userProfile.college}</Text>
        </View>

        {/* Archetype card */}
        <View style={styles.archetypeCard}>
          <View style={styles.archetypeIconBadge}>
            <ArchetypeIcon color="#800020" size={32} />
          </View>
          <Text style={styles.archetypePrefix}>Your Archetype</Text>
          <Text style={styles.archetypeName}>{userArchetype.name}</Text>
          <Text style={styles.archetypeDesc}>{userArchetype.description}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Role',     value: userProfile.preferredRole.split(' ')[0] },
            { label: 'Schedule', value: userProfile.schedule },
            { label: 'Style',    value: userProfile.shipVsPolish.split(' ')[0] },
          ].map(stat => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Editable fields */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vibe Profile</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={styles.editBtn}>
            {editing
              ? <><Save color="#800020" size={16} /><Text style={styles.editBtnText}>Save</Text></>
              : <><Edit3 color="#767676" size={16} /><Text style={[styles.editBtnText, { color: '#767676' }]}>Edit</Text></>}
          </TouchableOpacity>
        </View>

        <View style={styles.vibeCard}>
          {[
            { label: 'Favourite Snack',   value: userProfile.snack,      setter: setLocalSnack,  local: localSnack },
            { label: 'Music Vibe',         value: userProfile.musicVibe,  setter: setLocalMusic,  local: localMusic },
            { label: 'Toxic Habit',        value: userProfile.toxicHabit, setter: setLocalHabit,  local: localHabit },
          ].map((field, i, arr) => (
            <View key={field.label} style={[styles.vibeRow, i < arr.length - 1 && styles.vibeRowDivider]}>
              <Text style={styles.vibeLabel}>{field.label}</Text>
              {editing ? (
                <TextInput value={field.local} onChangeText={field.setter} style={styles.vibeInput} placeholderTextColor="#767676" />
              ) : (
                <Text style={styles.vibeValue}>{field.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsRow}>
          {userProfile.skills.map(skill => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => {
            resetApp();
          }}
        >
          <RotateCcw color="#D03B5B" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.resetText}>Reset & Start Over</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFFFFF' },
  glowRing: { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 56, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  cameraOverlay: { position: 'absolute', bottom: -4, right: -4, width: 34, height: 34, borderRadius: 17, backgroundColor: '#800020', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', borderStyle: 'solid' },
  profileName: { color: '#2C2C2C', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  nameInput: { color: '#2C2C2C', fontSize: 32, fontFamily: 'serif', fontWeight: '900', borderBottomWidth: 1, borderBottomColor: '#800020', borderStyle: 'dotted', paddingVertical: 4, minWidth: 200, textAlign: 'center' },
  profileCollege: { color: '#767676', fontSize: 13, fontWeight: '600', marginTop: 4, fontStyle: 'italic' },
  archetypeCard: { padding: 24, alignItems: 'center', marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  archetypeIconBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F9F6F0', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  archetypePrefix: { color: '#767676', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  archetypeName: { fontSize: 24, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.3, marginTop: 4, color: '#800020' },
  archetypeDesc: { color: '#767676', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  statValue: { color: '#2C2C2C', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: '#767676', fontSize: 10, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#2C2C2C', fontSize: 16, fontFamily: 'serif', fontWeight: '800' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  editBtnText: { color: '#800020', fontSize: 13, fontWeight: '700' },
  vibeCard: { padding: 0, marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', overflow: 'hidden' },
  vibeRow: { paddingHorizontal: 16, paddingVertical: 14 },
  vibeRowDivider: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', borderStyle: 'dotted' },
  vibeLabel: { color: '#767676', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  vibeValue: { color: '#2C2C2C', fontSize: 14, fontWeight: '600' },
  vibeInput: { color: '#2C2C2C', fontSize: 14, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: '#800020', borderStyle: 'dotted', paddingVertical: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  skillChip: { backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillChipText: { color: '#800020', fontSize: 12, fontWeight: '700' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: '#D03B5B', borderStyle: 'dotted', borderRadius: 14, backgroundColor: '#FFF5F5' },
  resetText: { color: '#D03B5B', fontSize: 13, fontWeight: '700' },
});
