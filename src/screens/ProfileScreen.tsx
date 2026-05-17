import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Briefcase,
  Camera,
  Calendar,
  Check,
  ChevronDown,
  LogOut,
  MessageSquare,
  Plus,
  Save,
  Search,
  Sparkles,
  X,
  PenTool,
  Mic,
  Server,
  Coffee,
} from 'lucide-react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { GlassCard } from '../components/GlassCard';
import { Github, Linkedin, Twitter } from '../components/SocialIcons';
import { useApp } from '../context/AppContext';
import { auth, db, storage } from '../services/firebase';
import { RoleType } from '../types';

type Props = BottomTabScreenProps<any, 'Profile'>;

const ROLES: RoleType[] = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'UI/UX Designer', 'Product Manager', 'Pitch Wizard'];
const SCHEDULES = ['Late Night', 'Early Bird', '24/7 Machine', 'Flexible'] as const;
const COMM_STYLES = ['Direct & Fast', 'Collaborative & Gentle', 'Silent & Structured', 'Enthusiastic & High Energy'] as const;
const SHIP_OPTIONS = ['Ship Fast', 'Polish to Perfection', 'Healthy Balance'] as const;

const SKILL_CATEGORIES: Record<string, string[]> = {
  Frontend: ['React', 'React Native', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Three.js', 'Framer'],
  Backend: ['Node.js', 'Go', 'Python', 'Rust', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes'],
  AI: ['OpenAI APIs', 'LangChain', 'PyTorch', 'TensorFlow', 'AI Agents'],
  Design: ['Figma', 'UI/UX', 'Motion Design'],
  Mobile: ['Expo', 'Flutter', 'Swift', 'Kotlin'],
  Product: ['Pitching', 'Product Strategy', 'Project Management', 'Startup Validation'],
  Web3: ['Solidity', 'Ethereum', 'Web3.js'],
};

const PROJECT_INTERESTS = [
  'AI',
  'Social',
  'Developer Tools',
  'Education',
  'Health',
  'Climate',
  'Finance',
  'Creator Tools',
  'Games',
  'Accessibility',
  'Campus Life',
];

const ARCHETYPE_ICON_MAP: Record<string, any> = {
  PenTool,
  Mic,
  Server,
  Coffee,
  Zap: Sparkles,
};

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const normalizeUsername = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '');

const normalizeHandle = (value: string) => value.trim().replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/$/, '');

const socialValue = (value: string, platform: 'github' | 'twitter' | 'linkedin') => {
  const handle = normalizeHandle(value);
  if (!handle) return '';
  if (platform === 'github') return handle.replace(/^github\.com\//i, '');
  if (platform === 'twitter') return handle.replace(/^(x\.com|twitter\.com)\//i, '');
  return handle.replace(/^linkedin\.com\/(in\/)?/i, '');
};

const socialDisplay = (value: string, platform: 'github' | 'twitter' | 'linkedin') => {
  const cleaned = socialValue(value, platform);
  if (!cleaned) return '';
  if (platform === 'github') return `github.com/${cleaned}`;
  if (platform === 'twitter') return `x.com/${cleaned}`;
  return `linkedin.com/in/${cleaned}`;
};

export const ProfileScreen: React.FC<Props> = () => {
  const { userProfile, userArchetype, updateProfile, signOut } = useApp();
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const [localName, setLocalName] = useState('');
  const [localUsername, setLocalUsername] = useState('');
  const [localBio, setLocalBio] = useState('');
  const [localTagline, setLocalTagline] = useState('');
  const [localCollege, setLocalCollege] = useState('');
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [localRole, setLocalRole] = useState<RoleType>('Frontend Developer');
  const [localSchedule, setLocalSchedule] = useState<typeof SCHEDULES[number]>('Flexible');
  const [localCommStyle, setLocalCommStyle] = useState<typeof COMM_STYLES[number]>('Collaborative & Gentle');
  const [localShipVsPolish, setLocalShipVsPolish] = useState<typeof SHIP_OPTIONS[number]>('Healthy Balance');
  const [localSnack, setLocalSnack] = useState('');
  const [localMusic, setLocalMusic] = useState('');
  const [localHabit, setLocalHabit] = useState('');
  const [localProjectInterests, setLocalProjectInterests] = useState<string[]>([]);
  const [localGithub, setLocalGithub] = useState('');
  const [localTwitter, setLocalTwitter] = useState('');
  const [localLinkedin, setLocalLinkedin] = useState('');
  const [avatarUri, setAvatarUri] = useState('');

  const currentUsername = normalizeUsername(userProfile?.username || '');
  const filteredCategories = Object.entries(SKILL_CATEGORIES)
    .map(([category, skills]) => ({
      category,
      skills: skills.filter(skill => skill.toLowerCase().includes(searchQuery.trim().toLowerCase())),
    }))
    .filter(entry => entry.skills.length > 0);

  const ArchetypeIcon = ARCHETYPE_ICON_MAP[userArchetype?.icon || ''] || Sparkles;

  useEffect(() => {
    if (!userProfile) return;
    setLocalName(userProfile.name || '');
    setLocalUsername(userProfile.username || '');
    setLocalBio(userProfile.bio || '');
    setLocalTagline(userProfile.tagline || userProfile.bio || '');
    setLocalCollege(userProfile.college || '');
    setLocalSkills(userProfile.skills || []);
    setLocalRole((userProfile.preferredRole || userProfile.role || 'Frontend Developer') as RoleType);
    setLocalSchedule(userProfile.schedule || 'Flexible');
    setLocalCommStyle(userProfile.commStyle || 'Collaborative & Gentle');
    setLocalShipVsPolish(userProfile.shipVsPolish || 'Healthy Balance');
    setLocalSnack(userProfile.snack || '');
    setLocalMusic(userProfile.musicVibe || '');
    setLocalHabit(userProfile.toxicHabit || '');
    setLocalProjectInterests(userProfile.projectInterests || []);
    setLocalGithub(userProfile.github || '');
    setLocalTwitter(userProfile.twitter || '');
    setLocalLinkedin(userProfile.linkedin || '');
    setAvatarUri(userProfile.avatar || '');
  }, [userProfile]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const normalized = normalizeUsername(localUsername);
    if (!normalized) {
      setUsernameStatus('idle');
      setUsernameMessage('Choose a unique handle.');
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Use 3-20 characters: lowercase letters, numbers, or underscores.');
      return;
    }
    if (normalized === currentUsername) {
      setUsernameStatus('available');
      setUsernameMessage('This is your current username.');
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      setUsernameMessage('Checking availability...');
      try {
        const snapshot = await getDocs(query(collection(db, 'users'), where('username', '==', normalized)));
        if (cancelled) return;
        const taken = snapshot.docs.some(doc => doc.id !== auth.currentUser?.uid);
        if (taken) {
          setUsernameStatus('taken');
          setUsernameMessage('That username is already taken.');
        } else {
          setUsernameStatus('available');
          setUsernameMessage('Username is available.');
        }
      } catch {
        if (!cancelled) {
          setUsernameStatus('idle');
          setUsernameMessage('Could not verify username right now.');
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [localUsername, currentUsername]);

  if (!userProfile || !userArchetype) {
    return (
      <View style={styles.loadingScreen}>
        <LinearGradient colors={['#05050A', '#0E1022', '#05050A']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#00F0FF" />
        <Text style={styles.loadingText}>Loading your identity...</Text>
      </View>
    );
  }

  const toggleSkill = (skill: string) => {
    setLocalSkills(prev => prev.includes(skill) ? prev.filter(item => item !== skill) : [...prev, skill]);
  };

  const toggleProjectInterest = (interest: string) => {
    setLocalProjectInterests(prev => prev.includes(interest) ? prev.filter(item => item !== interest) : [...prev, interest]);
  };

  const addCustomProjectInterest = () => {
    const trimmed = projectInput.trim();
    if (!trimmed) return;
    if (!localProjectInterests.includes(trimmed)) {
      setLocalProjectInterests(prev => [...prev, trimmed]);
    }
    setProjectInput('');
  };

  const uploadAvatar = async (uri: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const response = await fetch(uri);
    const blob = await response.blob();
    const uploadRef = ref(storage, `profile-photos/${uid}/${Date.now()}.jpg`);
    await uploadBytes(uploadRef, blob, { contentType: 'image/jpeg' });
    const downloadUrl = await getDownloadURL(uploadRef);
    setAvatarUri(downloadUrl);
    await updateProfile({ avatar: downloadUrl });
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to update your photo.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Photo permission needed', 'Allow photo access to update your photo.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
      }

      if (result.canceled || !result.assets?.length) return;
      setUploadingPhoto(true);
      await uploadAvatar(result.assets[0].uri);
    } catch (error: any) {
      Alert.alert('Photo update failed', error?.message || 'Unable to update your profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Update profile photo', 'Choose where to pull your new avatar from.', [
      { text: 'Camera', onPress: () => openImagePicker('camera') },
      { text: 'Gallery', onPress: () => openImagePicker('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    const normalizedUsername = normalizeUsername(localUsername);
    if (!localName.trim()) {
      Alert.alert('Validation error', 'Display name is required.');
      return;
    }
    if (!normalizedUsername || !/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      Alert.alert('Validation error', 'Choose a valid username using 3-20 lowercase letters, numbers, or underscores.');
      return;
    }
    if (usernameStatus === 'taken') {
      Alert.alert('Validation error', 'Choose a different username.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: localName.trim(),
        username: normalizedUsername,
        bio: localBio.trim(),
        tagline: localTagline.trim() || localBio.trim(),
        college: localCollege.trim(),
        skills: localSkills,
        preferredRole: localRole,
        schedule: localSchedule,
        commStyle: localCommStyle,
        shipVsPolish: localShipVsPolish,
        snack: localSnack.trim(),
        musicVibe: localMusic.trim(),
        toxicHabit: localHabit.trim(),
        projectInterests: localProjectInterests,
        github: socialValue(localGithub, 'github'),
        twitter: socialValue(localTwitter, 'twitter'),
        linkedin: socialValue(localLinkedin, 'linkedin'),
        avatar: avatarUri || userProfile.avatar,
      });
      setMode('preview');
      Alert.alert('Saved', 'Your profile updated instantly.');
    } catch (error: any) {
      Alert.alert('Save failed', error?.message || 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const usernameColor = usernameStatus === 'available' ? '#00F0FF' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#FF5C7A' : '#B0B7D1';
  const previewAvatar = avatarUri || userProfile.avatar;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Your identity and skills stay synced.</Text>
            </View>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setMode('edit')} style={[styles.tabButton, mode === 'edit' && styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, mode === 'edit' && styles.tabButtonTextActive]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('preview')} style={[styles.tabButton, mode === 'preview' && styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, mode === 'preview' && styles.tabButtonTextActive]}>Preview</Text>
            </TouchableOpacity>
          </View>

          {mode === 'preview' ? (
            <View style={styles.previewContainer}>
              <GlassCard style={styles.heroCard}>
                <View style={styles.heroTop}>
                  <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85} style={styles.avatarWrap}>
                    <Image source={{ uri: previewAvatar }} style={styles.avatar} />
                    <View style={styles.avatarRing} />
                    <View style={styles.cameraPill}>
                      {uploadingPhoto ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Camera color="#FFFFFF" size={12} />}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.heroMeta}>
                    <Text style={styles.name}>{localName}</Text>
                    <Text style={styles.username}>@{localUsername || 'username'}</Text>
                    <Text style={styles.bio}>{localBio || 'A clean bio makes your profile feel alive.'}</Text>
                    <View style={styles.socialInlineRow}>
                      {localGithub ? (
                        <View style={styles.socialPill}>
                          <Github color="#767676" size={12} />
                          <Text style={styles.socialPillText}>{socialDisplay(localGithub, 'github')}</Text>
                        </View>
                      ) : null}
                      {localTwitter ? (
                        <View style={styles.socialPill}>
                          <Twitter color="#767676" size={12} />
                          <Text style={styles.socialPillText}>{socialDisplay(localTwitter, 'twitter')}</Text>
                        </View>
                      ) : null}
                      {localLinkedin ? (
                        <View style={styles.socialPill}>
                          <Linkedin color="#767676" size={12} />
                          <Text style={styles.socialPillText}>{socialDisplay(localLinkedin, 'linkedin')}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.archetypeChip}>
                  <ArchetypeIcon color="#800020" size={14} />
                  <Text style={styles.archetypeChipText}>{userArchetype.name}</Text>
                </View>
                <Text style={styles.archetypeIdentity}>{userArchetype.identity}</Text>
                <Text style={styles.archetypeDescription}>{userArchetype.description}</Text>

                <View style={styles.statGrid}>
                  <View style={styles.statCard}>
                    <Briefcase color="#800020" size={14} />
                    <Text style={styles.statLabel}>Preferred Role</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{localRole}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Calendar color="#800020" size={14} />
                    <Text style={styles.statLabel}>Schedule</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{localSchedule}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MessageSquare color="#800020" size={14} />
                    <Text style={styles.statLabel}>Style</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{localCommStyle.split(' ')[0]}</Text>
                  </View>
                </View>
              </GlassCard>

              <Text style={styles.sectionLabel}>Skill Highlights</Text>
              <View style={styles.chipWrap}>
                {localSkills.length ? localSkills.map(skill => (
                  <View key={skill} style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{skill}</Text>
                  </View>
                )) : <Text style={styles.emptyText}>No skills selected yet.</Text>}
              </View>

              <Text style={styles.sectionLabel}>Compatibility</Text>
              <View style={styles.compatibilityCard}>
                <View style={styles.compatibilityHeader}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreText}>{userProfile.compatibilityScore || 92}%</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.compatibilityTitle}>Archetype Alignment</Text>
                    <Text style={styles.compatibilityText} numberOfLines={2}>
                      {userArchetype.name} energy, tuned to {localRole.toLowerCase()} workflows and {localCommStyle.toLowerCase()} communication.
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Vibe Prompts</Text>
              <View style={styles.promptStack}>
                {localTagline ? (
                  <View style={styles.promptBubble}>
                    <Text style={styles.promptLabel}>Tagline</Text>
                    <Text style={styles.promptValue}>{localTagline}</Text>
                  </View>
                ) : null}
                <View style={styles.promptGrid}>
                  <View style={[styles.promptBubble, { flex: 1 }]}>
                    <Text style={styles.promptLabel}>Snack</Text>
                    <Text style={styles.promptValue}>{localSnack || 'Coffee'}</Text>
                  </View>
                  <View style={[styles.promptBubble, { flex: 1 }]}>
                    <Text style={styles.promptLabel}>Music</Text>
                    <Text style={styles.promptValue}>{localMusic || 'Lo-fi'}</Text>
                  </View>
                </View>
                <View style={styles.promptBubble}>
                  <Text style={styles.promptLabel}>Toxic Habit</Text>
                  <Text style={styles.promptValue}>{localHabit || 'Over-engineering everything.'}</Text>
                </View>
                <View style={styles.promptBubble}>
                  <Text style={styles.promptLabel}>Project Interests</Text>
                  <View style={styles.interestRow}>
                    {localProjectInterests.length ? localProjectInterests.map(interest => (
                      <View key={interest} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    )) : <Text style={styles.emptyText}>No interests selected.</Text>}
                  </View>
                </View>
              </View>

              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.primaryAction} onPress={() => setMode('edit')}>
                  <Save color="#FFFFFF" size={16} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryActionText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction} onPress={handleSignOut}>
                  <LogOut color="#FF5C7A" size={16} style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryActionText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.editColumn}>
              <GlassCard style={styles.sectionCard} borderColor="rgba(0, 240, 255, 0.12)" backgroundColor="rgba(11, 14, 27, 0.82)">
                <Text style={styles.sectionTitle}>Identity</Text>
                <View style={styles.heroTop}>
                  <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85} style={styles.avatarWrap}>
                    <Image source={{ uri: avatarUri || userProfile.avatar }} style={styles.avatar} />
                    <View style={styles.avatarRing} />
                    <View style={styles.cameraPill}>
                      {uploadingPhoto ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Camera color="#FFFFFF" size={14} />}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.heroMeta}>
                    <Text style={styles.helperText}>Tap the avatar to upload from camera or gallery.</Text>
                    <Text style={styles.helperTextStrong}>Instantly syncs to Firebase Storage.</Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput value={localName} onChangeText={setLocalName} placeholder="Your display name" placeholderTextColor="#727A95" style={styles.input} />

                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.usernameRow}>
                  <Text style={styles.usernamePrefix}>@</Text>
                  <TextInput
                    value={localUsername}
                    onChangeText={setLocalUsername}
                    placeholder="username"
                    placeholderTextColor="#727A95"
                    style={styles.usernameInput}
                    autoCapitalize="none"
                  />
                </View>
                <Text style={[styles.usernameFeedback, { color: usernameColor }]}>{usernameMessage}</Text>

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput value={localBio} onChangeText={setLocalBio} placeholder="Tell people what you build and why." placeholderTextColor="#727A95" style={[styles.input, styles.textArea]} multiline numberOfLines={4} />

                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput value={localTagline} onChangeText={setLocalTagline} placeholder="Short profile headline." placeholderTextColor="#727A95" style={styles.input} />

                <Text style={styles.inputLabel}>College</Text>
                <TextInput value={localCollege} onChangeText={setLocalCollege} placeholder="School or university" placeholderTextColor="#727A95" style={styles.input} />
              </GlassCard>

              <GlassCard style={styles.sectionCard} borderColor="rgba(255, 255, 255, 0.08)" backgroundColor="rgba(11, 14, 27, 0.8)">
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.searchBox}>
                  <Search color="#00F0FF" size={16} />
                  <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search skills and categories" placeholderTextColor="#727A95" style={styles.searchInput} />
                </View>

                <View style={styles.activeSkillsRow}>
                  {localSkills.length ? localSkills.map(skill => (
                    <TouchableOpacity key={skill} style={styles.activeChip} onPress={() => toggleSkill(skill)}>
                      <Text style={styles.activeChipText}>{skill}</Text>
                      <X color="#05050A" size={12} />
                    </TouchableOpacity>
                  )) : <Text style={styles.emptyText}>No skills selected yet.</Text>}
                </View>

                {filteredCategories.map(({ category, skills }) => (
                  <View key={category} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.chipGrid}>
                      {skills.map(skill => {
                        const selected = localSkills.includes(skill);
                        return (
                          <TouchableOpacity key={skill} style={[styles.skillChip, selected && styles.skillChipActive]} onPress={() => toggleSkill(skill)}>
                            <Text style={[styles.skillChipText, selected && styles.skillChipTextActive]}>{skill}</Text>
                            {selected ? <Check color="#05050A" size={12} /> : <Plus color="#00F0FF" size={12} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </GlassCard>

              <GlassCard style={styles.sectionCard} borderColor="rgba(255, 255, 255, 0.08)" backgroundColor="rgba(11, 14, 27, 0.8)">
                <Text style={styles.sectionTitle}>Preferences</Text>
                <Text style={styles.inputLabel}>Preferred Role</Text>
                <View style={styles.optionWrap}>
                  {ROLES.map(role => (
                    <TouchableOpacity key={role} style={[styles.optionChip, localRole === role && styles.optionChipActive]} onPress={() => setLocalRole(role)}>
                      <Text style={[styles.optionText, localRole === role && styles.optionTextActive]}>{role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Coding Schedule</Text>
                <View style={styles.optionWrap}>
                  {SCHEDULES.map(item => (
                    <TouchableOpacity key={item} style={[styles.optionChip, localSchedule === item && styles.optionChipActive]} onPress={() => setLocalSchedule(item)}>
                      <Text style={[styles.optionText, localSchedule === item && styles.optionTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Communication Style</Text>
                <View style={styles.optionWrap}>
                  {COMM_STYLES.map(item => (
                    <TouchableOpacity key={item} style={[styles.optionChip, localCommStyle === item && styles.optionChipActive]} onPress={() => setLocalCommStyle(item)}>
                      <Text style={[styles.optionText, localCommStyle === item && styles.optionTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Ship vs Polish</Text>
                <View style={styles.optionWrap}>
                  {SHIP_OPTIONS.map(item => (
                    <TouchableOpacity key={item} style={[styles.optionChip, localShipVsPolish === item && styles.optionChipActive]} onPress={() => setLocalShipVsPolish(item)}>
                      <Text style={[styles.optionText, localShipVsPolish === item && styles.optionTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>

              <GlassCard style={styles.sectionCard} borderColor="rgba(255, 255, 255, 0.08)" backgroundColor="rgba(11, 14, 27, 0.8)">
                <Text style={styles.sectionTitle}>Vibe Prompts</Text>
                <TextInput value={localSnack} onChangeText={setLocalSnack} placeholder="Favorite hackathon snack" placeholderTextColor="#727A95" style={styles.input} />
                <TextInput value={localMusic} onChangeText={setLocalMusic} placeholder="Coding music vibe" placeholderTextColor="#727A95" style={styles.input} />
                <TextInput value={localHabit} onChangeText={setLocalHabit} placeholder="Toxic hackathon habit" placeholderTextColor="#727A95" style={styles.input} />

                <Text style={styles.inputLabel}>Project Interests</Text>
                <View style={styles.optionWrap}>
                  {PROJECT_INTERESTS.map(item => (
                    <TouchableOpacity key={item} style={[styles.optionChip, localProjectInterests.includes(item) && styles.optionChipActive]} onPress={() => toggleProjectInterest(item)}>
                      <Text style={[styles.optionText, localProjectInterests.includes(item) && styles.optionTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.searchBox}>
                  <ChevronDown color="#00F0FF" size={16} />
                  <TextInput value={projectInput} onChangeText={setProjectInput} placeholder="Add a custom project interest" placeholderTextColor="#727A95" style={styles.searchInput} onSubmitEditing={addCustomProjectInterest} />
                </View>
              </GlassCard>

              <GlassCard style={styles.sectionCard} borderColor="rgba(255, 255, 255, 0.08)" backgroundColor="rgba(11, 14, 27, 0.8)">
                <Text style={styles.sectionTitle}>Social Accounts</Text>

                <Text style={styles.inputLabel}>GitHub</Text>
                <View style={styles.socialRow}>
                  <Github color="#00F0FF" size={16} />
                  <TextInput value={localGithub} onChangeText={setLocalGithub} placeholder="github.com/username" placeholderTextColor="#727A95" style={styles.socialInput} autoCapitalize="none" />
                </View>

                <Text style={styles.inputLabel}>Twitter / X</Text>
                <View style={styles.socialRow}>
                  <Twitter color="#00F0FF" size={16} />
                  <TextInput value={localTwitter} onChangeText={setLocalTwitter} placeholder="x.com/username" placeholderTextColor="#727A95" style={styles.socialInput} autoCapitalize="none" />
                </View>

                <Text style={styles.inputLabel}>LinkedIn</Text>
                <View style={styles.socialRow}>
                  <Linkedin color="#00F0FF" size={16} />
                  <TextInput value={localLinkedin} onChangeText={setLocalLinkedin} placeholder="linkedin.com/in/username" placeholderTextColor="#727A95" style={styles.socialInput} autoCapitalize="none" />
                </View>
              </GlassCard>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || usernameStatus === 'taken' || usernameStatus === 'invalid'}>
                <Save color="#05050A" size={18} />
                <Text style={styles.saveButtonText}>{saving ? 'Saving changes...' : 'Save Profile'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryEditButton} onPress={() => setMode('preview')}>
                <Text style={styles.secondaryEditText}>Preview how others see me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <LogOut color="#FF5C7A" size={16} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#800020', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#767676', fontSize: 13, fontWeight: '600', marginTop: 2, fontStyle: 'italic' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6F0' },
  loadingText: { color: '#800020', marginTop: 14, fontSize: 14, fontWeight: '600', fontStyle: 'italic' },
  
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted' },
  tabButtonText: { color: '#767676', fontSize: 13, fontWeight: '800' },
  tabButtonTextActive: { color: '#800020' },

  heroCard: { padding: 18, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  heroTop: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9F6F0', borderWidth: 2, borderColor: '#800020' },
  avatarRing: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 44, borderWidth: 1, borderColor: 'rgba(128, 0, 32, 0.2)' },
  cameraPill: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#800020', borderWidth: 2, borderColor: '#FFFFFF' },
  heroMeta: { flex: 1 },
  name: { color: '#2C2C2C', fontSize: 22, fontWeight: '900', fontFamily: 'serif' },
  username: { color: '#800020', fontSize: 14, fontWeight: '800', marginTop: 2 },
  bio: { color: '#767676', fontSize: 13, lineHeight: 18, marginTop: 8 },
  socialInlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  socialPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9F6F0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  socialPillText: { color: '#767676', fontSize: 11, fontWeight: '700' },
  
  archetypeChip: { marginTop: 16, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF5F5', borderColor: '#800020', borderStyle: 'dotted', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  archetypeChipText: { color: '#800020', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  archetypeIdentity: { color: '#2C2C2C', fontSize: 14, fontStyle: 'italic', marginTop: 12, fontWeight: '700' },
  archetypeDescription: { color: '#767676', fontSize: 13, lineHeight: 18, marginTop: 4 },
  
  statGrid: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 12, padding: 12 },
  statLabel: { color: '#767676', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, fontWeight: '800' },
  statValue: { color: '#800020', fontSize: 12, fontWeight: '800', marginTop: 2 },
  
  sectionLabel: { color: '#2C2C2C', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#FFF5F5', borderColor: '#800020', borderStyle: 'dotted', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  skillBadgeText: { color: '#800020', fontSize: 11, fontWeight: '800' },
  
  editColumn: { gap: 16 },
  sectionCard: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  sectionTitle: { color: '#2C2C2C', fontSize: 18, fontWeight: '900', fontFamily: 'serif', marginBottom: 10 },
  inputLabel: { color: '#767676', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: '#F9F6F0', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#2C2C2C', fontSize: 14, fontWeight: '600' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F6F0', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 12, paddingLeft: 12 },
  usernamePrefix: { color: '#800020', fontSize: 15, fontWeight: '900', marginRight: 4 },
  usernameInput: { flex: 1, paddingVertical: 10, color: '#2C2C2C', fontSize: 14, fontWeight: '600' },
  usernameFeedback: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9F6F0', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, color: '#2C2C2C', fontSize: 13, fontWeight: '600' },
  
  activeSkillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 8 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#800020', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  activeChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  
  categoryBlock: { marginTop: 12 },
  categoryTitle: { color: '#767676', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: 1, borderStyle: 'dotted', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  skillChipActive: { backgroundColor: '#FFF5F5', borderColor: '#800020' },
  skillChipText: { color: '#767676', fontSize: 11, fontWeight: '800' },
  skillChipTextActive: { color: '#800020' },
  
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: 1, borderStyle: 'dotted' },
  optionChipActive: { backgroundColor: '#FFF5F5', borderColor: '#800020' },
  optionText: { color: '#767676', fontSize: 11, fontWeight: '800' },
  optionTextActive: { color: '#800020' },
  
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9F6F0', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  socialInput: { flex: 1, color: '#2C2C2C', fontSize: 14, fontWeight: '600', paddingVertical: 10 },
  
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#800020', borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderColor: '#800020', borderStyle: 'dotted', borderWidth: 1, borderRadius: 14, paddingVertical: 14, marginTop: 12 },
  signOutText: { color: '#800020', fontSize: 15, fontWeight: '800' },
  secondaryEditButton: { alignItems: 'center', paddingVertical: 12 },
  secondaryEditText: { color: '#767676', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  helperText: { color: '#767676', fontSize: 12, lineHeight: 18 },
  helperTextStrong: { color: '#800020', fontSize: 12, fontWeight: '800' },
  emptyText: { color: '#767676', fontSize: 12, fontStyle: 'italic' },

  // Preview Specifics
  previewContainer: { gap: 4 },
  compatibilityHeader: { flexDirection: 'row', alignItems: 'center' },
  compatibilityTitle: { color: '#2C2C2C', fontSize: 15, fontWeight: '900', fontFamily: 'serif' },
  compatibilityCard: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#800020', alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#800020', fontSize: 14, fontWeight: '900' },
  compatibilityText: { color: '#767676', fontSize: 12, lineHeight: 17, marginTop: 2 },
  
  promptStack: { gap: 10 },
  promptGrid: { flexDirection: 'row', gap: 10 },
  promptBubble: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  promptLabel: { color: '#767676', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promptValue: { color: '#2C2C2C', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  interestTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted' },
  interestTagText: { color: '#800020', fontSize: 11, fontWeight: '700' },
  
  previewActions: { marginTop: 24, gap: 12 },
  primaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#800020', paddingVertical: 14, borderRadius: 14 },
  primaryActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF5C7A', borderStyle: 'dotted', paddingVertical: 14, borderRadius: 14 },
  secondaryActionText: { color: '#FF5C7A', fontSize: 15, fontWeight: '800' },
});
