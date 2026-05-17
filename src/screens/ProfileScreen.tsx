import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Edit3, Save, RotateCcw, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = BottomTabScreenProps<any, 'Profile'>;

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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C','#0C0A1A','#06050C']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            <View style={[styles.glowRing, { borderColor: userArchetype.glowColor }]} />
            <View style={styles.cameraOverlay}>
              <Camera color="#FFF" size={20} />
            </View>
          </TouchableOpacity>

          {editing ? (
            <TextInput value={localName} onChangeText={setLocalName} style={styles.nameInput} placeholderTextColor="#636275" />
          ) : (
            <Text style={styles.profileName}>{userProfile.name}</Text>
          )}
          <Text style={styles.profileCollege}>{userProfile.college}</Text>
        </View>

        {/* Archetype card */}
        <GlassCard style={styles.archetypeCard} borderColor={userArchetype.glowColor + '66'}>
          <View style={[styles.archetypeEmojiBadge, { backgroundColor: userArchetype.glowColor }]}>
            <Text style={styles.archetypeEmoji}>{userArchetype.emoji}</Text>
          </View>
          <Text style={styles.archetypePrefix}>Your Archetype</Text>
          <Text style={[styles.archetypeName, { color: userArchetype.glowColor }]}>{userArchetype.name}</Text>
          <Text style={styles.archetypeDesc}>{userArchetype.description}</Text>
        </GlassCard>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Role',     value: userProfile.preferredRole.split(' ')[0] },
            { label: 'Schedule', value: userProfile.schedule },
            { label: 'Style',    value: userProfile.shipVsPolish.split(' ')[0] },
          ].map(stat => (
            <GlassCard key={stat.label} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Editable fields */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vibe Profile</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={styles.editBtn}>
            {editing
              ? <><Save color="#00F0FF" size={16} /><Text style={styles.editBtnText}>Save</Text></>
              : <><Edit3 color="#8E8D9C" size={16} /><Text style={[styles.editBtnText, { color: '#8E8D9C' }]}>Edit</Text></>}
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.vibeCard}>
          {[
            { label: '🍕 Favourite Snack',   value: userProfile.snack,      setter: setLocalSnack,  local: localSnack },
            { label: '🎵 Music Vibe',         value: userProfile.musicVibe,  setter: setLocalMusic,  local: localMusic },
            { label: '🐛 Toxic Habit',        value: userProfile.toxicHabit, setter: setLocalHabit,  local: localHabit },
          ].map((field, i, arr) => (
            <View key={field.label} style={[styles.vibeRow, i < arr.length - 1 && styles.vibeRowDivider]}>
              <Text style={styles.vibeLabel}>{field.label}</Text>
              {editing ? (
                <TextInput value={field.local} onChangeText={field.setter} style={styles.vibeInput} placeholderTextColor="#636275" />
              ) : (
                <Text style={styles.vibeValue}>{field.value}</Text>
              )}
            </View>
          ))}
        </GlassCard>

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
          <RotateCcw color="#FF4500" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.resetText}>Reset & Start Over</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  glowRing: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 54, borderWidth: 3 },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#8A2BE2', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#06050C' },
  profileName: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  nameInput: { color: '#FFF', fontSize: 24, fontWeight: '900', borderBottomWidth: 1, borderBottomColor: '#8A2BE2', paddingVertical: 4, minWidth: 200, textAlign: 'center' },
  profileCollege: { color: '#636275', fontSize: 13, fontWeight: '600', marginTop: 4 },
  archetypeCard: { padding: 20, alignItems: 'center', marginBottom: 20 },
  archetypeEmojiBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  archetypeEmoji: { fontSize: 28 },
  archetypePrefix: { color: '#636275', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  archetypeName: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, marginTop: 2 },
  archetypeDesc: { color: '#8E8D9C', fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, padding: 14, alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: '#636275', fontSize: 10, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  editBtnText: { color: '#00F0FF', fontSize: 13, fontWeight: '700' },
  vibeCard: { padding: 0, marginBottom: 24 },
  vibeRow: { paddingHorizontal: 16, paddingVertical: 14 },
  vibeRowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  vibeLabel: { color: '#636275', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  vibeValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  vibeInput: { color: '#FFF', fontSize: 14, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#8A2BE2', paddingVertical: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  skillChip: { backgroundColor: 'rgba(138,43,226,0.1)', borderWidth: 1, borderColor: 'rgba(138,43,226,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  skillChipText: { color: '#8A2BE2', fontSize: 12, fontWeight: '700' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,69,0,0.2)', borderRadius: 14, backgroundColor: 'rgba(255,69,0,0.04)' },
  resetText: { color: '#FF4500', fontSize: 13, fontWeight: '700' },
});
