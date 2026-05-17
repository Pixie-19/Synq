import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Platform, Animated
} from 'react-native';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react-native';
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

const SKILLS_CATEGORIES = {
  'Frontend': ['React', 'Next.js', 'Vue', 'Angular', 'Tailwind CSS', 'TypeScript', 'Three.js', 'WebGL'],
  'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Go', 'Rust', 'ASP.NET', 'GraphQL'],
  'Databases': ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis', 'Supabase', 'SQLite'],
  'AI / ML': ['TensorFlow', 'PyTorch', 'LangChain', 'OpenAI APIs', 'Mistral AI', 'RAG Systems', 'Vector Databases', 'NLP', 'AI Agents'],
  'Cloud / DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Vercel', 'Netlify'],
  'Blockchain': ['Solidity', 'Ethereum', 'Solana', 'Web3.js', 'Smart Contracts'],
  'Mobile': ['React Native', 'Android', 'Kotlin', 'Swift', 'Expo', 'Flutter', 'Ionic'],
  'Design': ['Figma', 'UI/UX', 'Framer', 'Canva', 'Motion Design'],
  'Product / Business': ['Pitching', 'Product Strategy', 'Startup Validation', 'Growth Hacking'],
  'Cybersecurity': ['Penetration Testing', 'Ethical Hacking', 'Cryptography'],
  'Game Dev': ['Unity', 'Unreal Engine', 'Blender', 'Godot']
};

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
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
  const [searchQuery, setSearchQuery] = useState('');
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
      snack: snack || 'Coffee',
      toxicHabit: toxicHabit || 'Over-engineering everything',
      musicVibe: musicVibe || 'Lo-fi',
      shipVsPolish: shipVsPolish || 'Healthy Balance',
    };
    completeOnboarding(data);
    navigation.navigate('Archetype');
  };

  const renderSkills = () => {
    const q = searchQuery.toLowerCase();
    return Object.entries(SKILLS_CATEGORIES).map(([category, skills]) => {
      const filtered = skills.filter(s => s.toLowerCase().includes(q));
      if (filtered.length === 0) return null;
      return (
        <View key={category} style={{ marginBottom: 24 }}>
          <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
          <View style={styles.chipRow}>
            {filtered.map(s => <Chip key={s} label={s} selected={selectedSkills.includes(s)} onPress={() => toggleSkill(s)} />)}
          </View>
        </View>
      );
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.stepTitle}>Hey there. What's your name?</Text>
            <TextInput placeholder="Your name" placeholderTextColor="#767676" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Your college / university" placeholderTextColor="#767676" style={[styles.input, { marginTop: 12 }]} value={college} onChangeText={setCollege} />
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>What is your role?</Text>
            <View style={styles.chipRow}>
              {ROLES.map(r => <Chip key={r} label={r} selected={selectedRole === r} onPress={() => setSelectedRole(r)} />)}
            </View>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Pick your skills.</Text>
            <View style={styles.searchContainer}>
              <Search color="#800020" size={18} style={styles.searchIcon} />
              <TextInput 
                placeholder="Search stacks (e.g. Next.js, Go)" 
                placeholderTextColor="#767676" 
                style={styles.searchInput} 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
              />
            </View>
            <ScrollView style={{ height: 320, marginHorizontal: -24, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {renderSkills()}
            </ScrollView>

            <Text style={[styles.stepTitle, { marginTop: 28 }]}>When do you prefer to code?</Text>
            <View style={styles.chipRow}>
              {SCHEDULES.map(s => <Chip key={s} label={s} selected={schedule === s} onPress={() => setSchedule(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>What is your ideal team size?</Text>
            <View style={styles.chipRow}>
              {TEAM_SIZES.map(s => <Chip key={s} label={s} selected={teamSize === s} onPress={() => setTeamSize(s)} />)}
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Describe your communication style.</Text>
            <View style={styles.chipRow}>
              {COMM_STYLES.map(s => <Chip key={s} label={s} selected={commStyle === s} onPress={() => setCommStyle(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>What is your work energy?</Text>
            <View style={styles.chipRow}>
              {WORK_ENERGIES.map(s => <Chip key={s} label={s} selected={workEnergy === s} onPress={() => setWorkEnergy(s)} />)}
            </View>
            <Text style={[styles.stepTitle, { marginTop: 28 }]}>Do you prefer shipping or polishing?</Text>
            <View style={styles.chipRow}>
              {SHIP_OPTIONS.map(s => <Chip key={s} label={s} selected={shipVsPolish === s} onPress={() => setShipVsPolish(s)} />)}
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Fuel your grind.</Text>
            <TextInput placeholder="Favourite hackathon snack" placeholderTextColor="#767676" style={styles.input} value={snack} onChangeText={setSnack} />
            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Toxic debugging habit.</Text>
            <TextInput placeholder="e.g. Console-logging everything" placeholderTextColor="#767676" style={styles.input} value={toxicHabit} onChangeText={setToxicHabit} />
            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Music vibe while coding.</Text>
            <TextInput placeholder="e.g. Lofi Hip-Hop" placeholderTextColor="#767676" style={styles.input} value={musicVibe} onChangeText={setMusicVibe} />
          </>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
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
            <ArrowLeft color="#800020" size={20} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <View style={styles.nextGrad}>
            <Text style={styles.nextText}>{step === TOTAL_STEPS - 1 ? 'Generate AI Archetype' : 'Next Step'}</Text>
            <ArrowRight color="#FFFFFF" size={18} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 56 : 28 },
  progressBarBg: { marginHorizontal: 24, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 6 },
  progressBarFill: { height: 4, backgroundColor: '#800020', borderRadius: 2 },
  progressLabel: { color: '#767676', fontSize: 11, fontWeight: '700', marginHorizontal: 24, marginBottom: 8, fontStyle: 'italic' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  
  stepTitle: { color: '#800020', fontSize: 26, fontFamily: 'serif', marginTop: 20, marginBottom: 14, letterSpacing: -0.3, fontWeight: '800' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 14, padding: 14, color: '#2C2C2C', fontSize: 15 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: '#2C2C2C', fontSize: 15 },
  
  categoryTitle: { color: '#767676', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF', borderStyle: 'dotted' },
  chipSelected: { backgroundColor: '#800020', borderColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, borderStyle: 'solid' },
  chipText: { color: '#767676', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  
  navRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingTop: 16, backgroundColor: '#F9F6F0', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted' },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nextBtn: { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  nextText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, fontFamily: 'serif' },
});
