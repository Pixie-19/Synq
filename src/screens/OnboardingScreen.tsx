import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Platform, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { OnboardingData, RoleType } from '../types';

type Props = StackScreenProps<any, 'Onboarding'>;

const ROLES: RoleType[] = ['Frontend Developer','Backend Developer','Fullstack Developer','UI/UX Designer','Product Manager','Pitch Wizard'];
const SCHEDULES = ['Late Night','Early Bird','24/7 Machine','Flexible'] as const;
const COMM_STYLES = ['Direct & Fast','Collaborative & Gentle','Silent & Structured','Enthusiastic & High Energy'] as const;
const TEAM_SIZES = ['Solo to Duo','3-4 members','5+ members'] as const;
const WORK_ENERGIES = ['Chill & Steady','High-Speed Sprint','Deep Focus & Silos','Chaotic Innovation'] as const;
const SHIP_OPTIONS = ['Ship Fast','Polish to Perfection','Healthy Balance'] as const;
const SKILLS_OPTIONS = ['React','React Native','Node.js','Python','Go','TypeScript','Figma','Flutter','AI/ML','DevOps'];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<typeof SCHEDULES[number] | null>(null);
  const [commStyle, setCommStyle] = useState<typeof COMM_STYLES[number] | null>(null);
  const [teamSize, setTeamSize] = useState<typeof TEAM_SIZES[number] | null>(null);
  const [workEnergy, setWorkEnergy] = useState<typeof WORK_ENERGIES[number] | null>(null);
  const [snack, setSnack] = useState('');
  const [toxicHabit, setToxicHabit] = useState('');
  const [musicVibe, setMusicVibe] = useState('');
  const [shipVsPolish, setShipVsPolish] = useState<typeof SHIP_OPTIONS[number] | null>(null);

  const TOTAL_STEPS = 4;

  const toggleSkill = (skill: string) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); return; }
    // Final submit
    const data: OnboardingData = {
      name: name || 'Hacker',
      college: college || 'Your University',
      skills: selectedSkills.length ? selectedSkills : ['React'],
      preferredRole: selectedRole || 'Fullstack Developer',
      techStack: selectedSkills,
      schedule: schedule || 'Flexible',
      commStyle: commStyle || 'Enthusiastic & High Energy',
      teamSizePreference: teamSize || '3-4 members',
      workEnergy: workEnergy || 'High-Speed Sprint',
      snack: snack || 'Coffee ☕',
      toxicHabit: toxicHabit || 'Over-engineering everything',
      musicVibe: musicVibe || 'Lo-fi 🎵',
      shipVsPolish: shipVsPolish || 'Healthy Balance',
    };
    completeOnboarding(data);
    navigation.navigate('Archetype');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.stepTitle}>Hey there 👋{'\n'}What's your name?</Text>
            <TextInput placeholder="Your name" placeholderTextColor="#636275" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Your college / university" placeholderTextColor="#636275" style={[styles.input, { marginTop: 12 }]} value={college} onChangeText={setCollege} />
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>What's your role? 🛠️</Text>
            <View style={styles.chipRow}>
              {ROLES.map(r => <Chip key={r} label={r} selected={selectedRole === r} onPress={() => setSelectedRole(r)} />)}
            </View>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Pick your skills 💻</Text>
            <View style={styles.chipRow}>
              {SKILLS_OPTIONS.map(s => <Chip key={s} label={s} selected={selectedSkills.includes(s)} onPress={() => toggleSkill(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>When do you code? 🕐</Text>
            <View style={styles.chipRow}>
              {SCHEDULES.map(s => <Chip key={s} label={s} selected={schedule === s} onPress={() => setSchedule(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>Your team size vibe 👥</Text>
            <View style={styles.chipRow}>
              {TEAM_SIZES.map(s => <Chip key={s} label={s} selected={teamSize === s} onPress={() => setTeamSize(s)} />)}
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Comms style? 💬</Text>
            <View style={styles.chipRow}>
              {COMM_STYLES.map(s => <Chip key={s} label={s} selected={commStyle === s} onPress={() => setCommStyle(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>Work energy? ⚡</Text>
            <View style={styles.chipRow}>
              {WORK_ENERGIES.map(s => <Chip key={s} label={s} selected={workEnergy === s} onPress={() => setWorkEnergy(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>Ship vs Polish? 🚀</Text>
            <View style={styles.chipRow}>
              {SHIP_OPTIONS.map(s => <Chip key={s} label={s} selected={shipVsPolish === s} onPress={() => setShipVsPolish(s)} />)}
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Fuel your grind 🍕</Text>
            <TextInput placeholder="Favourite hackathon snack" placeholderTextColor="#636275" style={styles.input} value={snack} onChangeText={setSnack} />
            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Toxic debugging habit 🐛</Text>
            <TextInput placeholder="e.g. Console-logging everything" placeholderTextColor="#636275" style={styles.input} value={toxicHabit} onChangeText={setToxicHabit} />
            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Music vibe while coding 🎵</Text>
            <TextInput placeholder="e.g. Lofi Hip-Hop" placeholderTextColor="#636275" style={styles.input} value={musicVibe} onChangeText={setMusicVibe} />
          </>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>Step {step + 1} of {TOTAL_STEPS}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Nav buttons */}
      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <ArrowLeft color="#8E8D9C" size={20} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <LinearGradient colors={['#8A2BE2', '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
            <Text style={styles.nextText}>{step === TOTAL_STEPS - 1 ? 'Generate My Archetype ✨' : 'Next'}</Text>
            <ArrowRight color="#FFF" size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 56 : 28 },
  progressBarBg: { marginHorizontal: 24, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 6 },
  progressBarFill: { height: 4, backgroundColor: '#8A2BE2', borderRadius: 2 },
  progressLabel: { color: '#636275', fontSize: 11, fontWeight: '700', marginHorizontal: 24, marginBottom: 8 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  stepTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 14, letterSpacing: -0.3 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, color: '#FFF', fontSize: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  chipSelected: { backgroundColor: 'rgba(138,43,226,0.2)', borderColor: '#8A2BE2' },
  chipText: { color: '#8E8D9C', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  navRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingTop: 16, backgroundColor: '#06050C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nextBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  nextText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
