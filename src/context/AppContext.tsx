import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { UserProfile, OnboardingData, Message, SprintChallenge, TeamDynamicReport } from '../types';
import { db, auth } from '../services/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamLobbyData {
  teamName: string;
  members: string[];
  vibe: string;
  countdown: string;
}

interface HotTake {
  question: string;
  agree: number;
  disagree: number;
  userVote?: 'agree' | 'disagree';
}

interface WouldYouRather {
  q1: string;
  q2: string;
  opt1Votes: number;
  opt2Votes: number;
  userVote?: 1 | 2;
}

interface AppContextProps {
  // Auth / onboarding state
  isOnboarded: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  userProfile: (OnboardingData & Partial<UserProfile>) | null;
  userArchetype: any | null;
  completeOnboarding: (data: OnboardingData) => void;
  finishOnboarding: () => void;
  updateProfile: (data: Partial<OnboardingData & UserProfile>) => void;
  resetApp: () => void;
  signOut: () => Promise<void>;

  // Discovery
  profiles: UserProfile[];
  currentProfileIndex: number;
  advanceProfile: () => void;
  activeMatch: UserProfile | null;
  setActiveMatch: (p: UserProfile | null) => void;
  redFlagsForProfile: (p: UserProfile) => string[];

  // Matches list
  matchedProfiles: UserProfile[];
  addMatch: (p: UserProfile) => void;

  // Chat
  chatMessages: Message[];
  sendChatMessage: (text: string, senderId?: string) => void;
  isTeammateTyping: boolean;
  updateTypingStatus?: (isTyping: boolean) => Promise<void>;

  // Sprint
  sprintTimer: number;
  isSprintActive: boolean;
  startSprint: () => void;
  endSprint: () => void;
  currentSprintChallenge: SprintChallenge | null;
  sprintChatNotes: Message[];
  sendSprintChatNote: (text: string, senderId?: string) => void;
  voiceMuted: boolean;
  setVoiceMuted: (v: boolean) => void;
  isTeammateSpeaking: boolean;
  isTeammateMuted?: boolean;

  // Seeding
  seedDemoBuilders?: () => Promise<void>;

  // Post-sprint
  teamDynamicReport: TeamDynamicReport | null;
  approveTeamSelection: (status: 'APPROVE' | 'MAYBE' | 'DECLINE', nav?: any) => void;
  teamLobbyData: TeamLobbyData | null;

  // Social
  hotTakes: HotTake[];
  voteHotTake: (index: number, vote: 'agree' | 'disagree') => void;
  wouldYouRathers: WouldYouRather[];
  voteWouldYouRather: (index: number, vote: 1 | 2) => void;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const PRE_MADE_PROFILES: UserProfile[] = [
  {
    id: 'priya_ux',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    college: 'Stanford University',
    role: 'UI/UX Designer',
    skills: ['Figma', 'React Native', 'Tailwind CSS'],
    techStack: ['React Native', 'Figma', 'CSS'],
    schedule: 'Early Bird',
    commStyle: 'Collaborative & Gentle',
    teamSizePreference: '3-4 members',
    workEnergy: 'Chill & Steady',
    snack: 'Cold Brew & Croissants',
    toxicHabit: 'Refactoring button padding 20 times instead of building the backend',
    musicVibe: 'Lofi Focus / R&B',
    shipVsPolish: 'Polish to Perfection',
    tagline: 'Loves sunrise coding sessions and pixel-perfect grids',
    compatibilityScore: 94,
    archetype: { 
      name: 'The UI Perfectionist', 
      identity: 'Aesthetic wizard mapping pixels to perfection.',
      description: 'You believe a product isn\'t finished until the spacing is mathematically perfect and the transitions feel like butter.',
      glowColor: '#800020', 
      icon: 'PenTool', 
      traits: ['Detail-oriented', 'Structured workflow', 'Visually obsessed'], 
      strengths: ['Figma mastery', 'Smooth micro-interactions', 'Frontend polish'],
      idealTeammates: ['Backend architects', 'Rapid executors', 'The Pitch Wizard'],
      weaknesses: ['May spend too much time polishing before MVP is functional.']
    },
  },
  {
    id: 'alex_chaos',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    college: 'UC Berkeley',
    role: 'Frontend Developer',
    skills: ['React', 'Next.js', 'Three.js'],
    techStack: ['Next.js', 'Tailwind', 'TypeScript'],
    schedule: 'Late Night',
    commStyle: 'Enthusiastic & High Energy',
    teamSizePreference: '3-4 members',
    workEnergy: 'Chaotic Innovation',
    snack: "Flamin' Hot Cheetos",
    toxicHabit: 'Adding 3D meshes to the landing page before auth works',
    musicVibe: 'Synthwave / Phonk',
    shipVsPolish: 'Ship Fast',
    tagline: "3AM is peak productivity. Let's build the future",
    compatibilityScore: 88,
    archetype: { 
      name: 'The Chaos Innovator', 
      identity: 'Idea machine running on adrenaline and caffeine.',
      description: 'Your codebase is a mess, but your rapid prototypes win hackathons through pure creative innovation.',
      glowColor: '#800020', 
      icon: 'Zap', 
      traits: ['Rapid prototyping', 'Idea-heavy', 'Chaotic workflow'], 
      strengths: ['0-to-1 building', 'Fuzzy logic concepts', 'Demo magic'],
      idealTeammates: ['The Silent Debugger', 'The Pitch Wizard'],
      weaknesses: ['Code readability and documentation are an afterthought.']
    },
  },
  {
    id: 'elena_db',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    college: 'MIT',
    role: 'Backend Developer',
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Docker'],
    techStack: ['Express', 'Go', 'PostgreSQL'],
    schedule: 'Flexible',
    commStyle: 'Silent & Structured',
    teamSizePreference: '3-4 members',
    workEnergy: 'Deep Focus & Silos',
    snack: 'Black Coffee & Almonds',
    toxicHabit: 'Writing a custom ORM during a 24h hackathon',
    musicVibe: 'Techno / Ambient',
    shipVsPolish: 'Healthy Balance',
    tagline: 'If the schema is clean, the app is clean',
    compatibilityScore: 91,
    archetype: { 
      name: 'The Silent Debugger', 
      identity: 'The unshakeable bedrock of the architecture.',
      description: 'When everything crashes at 4 AM, you are the one quietly fixing the race condition while everyone else panics.',
      glowColor: '#800020', 
      icon: 'Server', 
      traits: ['Logical systems thinking', 'Calm presence', 'Deep focus'], 
      strengths: ['API scaling', 'Clean schemas', 'Unbreakable state management'],
      idealTeammates: ['The UI Perfectionist', 'The Chaos Innovator'],
      weaknesses: ['Can get stuck over-engineering systems for edge cases.']
    },
  },
  {
    id: 'marcus_pitch',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    college: 'Georgia Tech',
    role: 'Pitch Wizard',
    skills: ['Pitching', 'Product Strategy', 'Startup Validation'],
    techStack: ['Figma', 'Pitching', 'UI/UX'],
    schedule: '24/7 Machine',
    commStyle: 'Direct & Fast',
    teamSizePreference: '5+ members',
    workEnergy: 'High-Speed Sprint',
    snack: 'Monster Energy & Gummy Bears',
    toxicHabit: "Promising judges 5 AI integrations before we've deployed",
    musicVibe: 'Hip Hop / Trap',
    shipVsPolish: 'Ship Fast',
    tagline: "We'll code it in 2 hours. Let's make the pitch legendary",
    compatibilityScore: 83,
    archetype: { 
      name: 'The Pitch Wizard', 
      identity: 'Natural storyteller transforming code into capital.',
      description: 'You can convince any judge that a 3-page React app is the next billion-dollar unicorn startup.',
      glowColor: '#800020', 
      icon: 'Mic', 
      traits: ['Charismatic', 'Extroverted communication', 'Hype master'], 
      strengths: ['Slide structures', 'Feature scoping', 'Judge interactions'],
      idealTeammates: ['The Sleepless Builder', 'The Chaos Innovator'],
      weaknesses: ['Might promise features to judges that haven\'t been coded yet.']
    },
  },
  {
    id: 'sarah_ai',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    college: 'CMU',
    role: 'Fullstack Developer',
    skills: ['Python', 'LangChain', 'FastAPI', 'React'],
    techStack: ['Python', 'FastAPI', 'React'],
    schedule: 'Flexible',
    commStyle: 'Enthusiastic & High Energy',
    teamSizePreference: '3-4 members',
    workEnergy: 'High-Speed Sprint',
    snack: 'Matcha Latte & Dark Chocolate',
    toxicHabit: 'Fine-tuning a model for a task that needed 1 regex',
    musicVibe: 'Classical Focus',
    shipVsPolish: 'Healthy Balance',
    tagline: "Mistral, Gemini, Llama — let's chain agents and ship",
    compatibilityScore: 92,
    archetype: { 
      name: 'The Sleepless Builder', 
      identity: 'Endless energy. Ships ideas faster than most teams can discuss them.',
      description: 'You are an execution machine. You stitch APIs, build the logic, and deploy before the sun comes up.',
      glowColor: '#800020', 
      icon: 'Coffee', 
      traits: ['Rapid executor', 'Versatile developer', 'High output under pressure'], 
      strengths: ['MVP building', 'API integration', 'Rapid deployment'],
      idealTeammates: ['Structured planners', 'The UI Perfectionist', 'Organized collaborators'],
      weaknesses: ['May move too quickly for highly detail-oriented teammates.']
    },
  },
];

const SPRINT_CHALLENGES: SprintChallenge[] = [
  {
    id: 'laundry_ai',
    title: 'AI Hostel Laundry Platform',
    problem: 'Design a mobile-first app that optimizes laundry machine slots in university hostels.',
    mvpPoints: ['Real-time IoT sensor simulator', 'Smart booking dashboard', 'AI-powered finish predictions'],
    users: ['College students', 'Hostel advisors'],
    monetization: ['Ad-supported free tier', 'Peak-hour booking subscription'],
  },
  {
    id: 'zero_waste',
    title: 'Zero-Waste Campus Catering',
    problem: 'An app that alerts students of leftover food from campus events so nothing gets wasted.',
    mvpPoints: ['Interactive campus map', 'Push notifications for leftovers', 'Dietary filter checkers'],
    users: ['Club organizers', 'Hungry students'],
    monetization: ['Local diner sponsorships', 'Campus green-funding grants'],
  },
  {
    id: 'synq_red_flags',
    title: 'Team Red-Flag Early Detector',
    problem: 'Build an algorithm to detect early warning signals in student team collaboration.',
    mvpPoints: ['Semantic chat monitor', 'Quiet-hour pacing tracker', 'Emergency mediation triggers'],
    users: ['Hackathon directors', 'Team mentors'],
    monetization: ['Enterprise SaaS integration', 'Self-serve premium testing'],
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userProfile, setUserProfileState] = useState<(OnboardingData & Partial<UserProfile>) | null>(null);
  const [userArchetype, setUserArchetype] = useState<any | null>(null);

  const [discoverProfiles, setDiscoverProfiles] = useState<UserProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [activeMatch, setActiveMatch] = useState<UserProfile | null>(null);
  const [matchedProfiles, setMatchedProfiles] = useState<UserProfile[]>([]);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTeammateTyping, setIsTeammateTyping] = useState(false);

  const [isSprintActive, setIsSprintActive] = useState(false);
  const [sprintTimer, setSprintTimer] = useState(600);
  const [currentSprintChallenge, setCurrentSprintChallenge] = useState<SprintChallenge | null>(null);
  const [sprintChatNotes, setSprintChatNotes] = useState<Message[]>([]);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isTeammateSpeaking, setIsTeammateSpeaking] = useState(false);
  const [isTeammateMuted, setIsTeammateMuted] = useState(false);
  const [voiceRoomState, setVoiceRoomState] = useState<any | null>(null);

  const [teamDynamicReport, setTeamDynamicReport] = useState<TeamDynamicReport | null>(null);
  const [teamLobbyData, setTeamLobbyData] = useState<TeamLobbyData | null>(null);

  const [hotTakes, setHotTakes] = useState<HotTake[]>([
    { question: 'UI/UX matters far more than back-end in hackathon pitches.', agree: 142, disagree: 87 },
    { question: 'Writing code using AI generation tools is still "real coding".', agree: 254, disagree: 68 },
    { question: 'A clean DB schema is better than a flashy onboarding screen.', agree: 93, disagree: 201 },
  ]);
  const [wouldYouRathers, setWouldYouRathers] = useState<WouldYouRather[]>([
    { q1: 'Ship buggy code on time', q2: 'Miss deadline but fix all bugs', opt1Votes: 182, opt2Votes: 94 },
    { q1: 'Pitch a static prototype', q2: 'Debug a race condition for 6h', opt1Votes: 120, opt2Votes: 156 },
  ]);

  const sprintIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const normalizeSkillBag = (data: { skills?: string[]; techStack?: string[] }) => {
    return Array.from(new Set([...(data.skills || []), ...(data.techStack || [])].map(skill => skill.trim()).filter(Boolean)));
  };

  // ── Compatibility calculator ──────────────────────────────────────────────
  const calculateScore = (me: OnboardingData | null, them: UserProfile): number => {
    if (!me) return 85;
    let score = 70;
    if (me.preferredRole !== them.role) score += 12;
    if (me.schedule === them.schedule) score += 10;
    if (me.shipVsPolish === them.shipVsPolish) score += 5;
    if (me.workEnergy === them.workEnergy) score += 3;
    const mySkills = new Set(normalizeSkillBag(me));
    const theirSkills = normalizeSkillBag(them);
    const sharedSkills = theirSkills.filter(skill => mySkills.has(skill)).length;
    score += Math.min(10, sharedSkills * 2);

    const myInterests = new Set(me.projectInterests || []);
    const theirInterests = new Set(them.projectInterests || []);
    const sharedInterests = [...theirInterests].filter(interest => myInterests.has(interest)).length;
    score += Math.min(5, sharedInterests * 2);
    return Math.min(99, Math.max(50, score));
  };

  // ── Archetype calculator ──────────────────────────────────────────────────
  const calcArchetype = (data: OnboardingData) => {
    let scores = {
      sleeplessBuilder: 0,
      uiPerfectionist: 0,
      pitchWizard: 0,
      silentDebugger: 0,
      chaosInnovator: 0,
    };

    if (data.preferredRole === 'Backend Developer' || data.preferredRole === 'Fullstack Developer') {
      scores.sleeplessBuilder += 2;
      scores.silentDebugger += 3;
    }
    if (data.preferredRole === 'UI/UX Designer' || data.preferredRole === 'Frontend Developer') {
      scores.uiPerfectionist += 4;
    }
    if (data.preferredRole === 'Product Manager' || data.preferredRole === 'Pitch Wizard') {
      scores.pitchWizard += 5;
    }
    const skillPool = normalizeSkillBag(data);

    if (skillPool.some(s => ['React', 'Next.js', 'Framer', 'Tailwind CSS', 'React Native'].includes(s))) {
      scores.uiPerfectionist += 2;
      scores.chaosInnovator += 1;
    }
    if (skillPool.some(s => ['Docker', 'Go', 'Rust', 'PostgreSQL', 'Kubernetes'].includes(s))) {
      scores.silentDebugger += 2;
    }
    if (skillPool.some(s => ['OpenAI APIs', 'TensorFlow', 'PyTorch', 'LangChain', 'AI Agents'].includes(s))) {
      scores.sleeplessBuilder += 2;
      scores.chaosInnovator += 2;
    }

    if (data.schedule === 'Late Night' || data.schedule === '24/7 Machine') {
      scores.sleeplessBuilder += 3;
      scores.chaosInnovator += 2;
    }
    if (data.workEnergy === 'Deep Focus & Silos' || data.commStyle === 'Silent & Structured') {
      scores.silentDebugger += 4;
    }
    if (data.workEnergy === 'Chaotic Innovation' || data.commStyle === 'Enthusiastic & High Energy') {
      scores.chaosInnovator += 4;
      scores.pitchWizard += 2;
    }
    
    if (data.shipVsPolish === 'Ship Fast') {
      scores.sleeplessBuilder += 2;
      scores.chaosInnovator += 3;
    } else if (data.shipVsPolish === 'Polish to Perfection') {
      scores.uiPerfectionist += 4;
    }

    const highestScore = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b) as keyof typeof scores;

    switch (highestScore) {
      case 'uiPerfectionist':
        return {
          name: 'The UI Perfectionist',
          identity: 'Aesthetic wizard mapping pixels to perfection.',
          description: 'You believe a product isn\'t finished until the spacing is mathematically perfect and the transitions feel like butter.',
          glowColor: '#800020',
          icon: 'PenTool',
          traits: ['Detail-oriented', 'Structured workflow', 'Visually obsessed'],
          strengths: ['Figma mastery', 'Smooth micro-interactions', 'Frontend polish'],
          idealTeammates: ['Backend architects', 'Rapid executors', 'The Pitch Wizard'],
          weaknesses: ['May spend too much time polishing before MVP is functional.'],
        };
      case 'pitchWizard':
        return {
          name: 'The Pitch Wizard',
          identity: 'Natural storyteller transforming code into capital.',
          description: 'You can convince any judge that a 3-page React app is the next billion-dollar unicorn startup.',
          glowColor: '#800020',
          icon: 'Mic',
          traits: ['Charismatic', 'Extroverted communication', 'Hype master'],
          strengths: ['Slide structures', 'Feature scoping', 'Judge interactions'],
          idealTeammates: ['The Sleepless Builder', 'The Chaos Innovator'],
          weaknesses: ['Might promise features to judges that haven\'t been coded yet.'],
        };
      case 'silentDebugger':
        return {
          name: 'The Silent Debugger',
          identity: 'The unshakeable bedrock of the architecture.',
          description: 'When everything crashes at 4 AM, you are the one quietly fixing the race condition while everyone else panics.',
          glowColor: '#800020',
          icon: 'Server',
          traits: ['Logical systems thinking', 'Calm presence', 'Deep focus'],
          strengths: ['API scaling', 'Clean schemas', 'Unbreakable state management'],
          idealTeammates: ['The UI Perfectionist', 'The Chaos Innovator'],
          weaknesses: ['Can get stuck over-engineering systems for edge cases.'],
        };
      case 'chaosInnovator':
        return {
          name: 'The Chaos Innovator',
          identity: 'Idea machine running on adrenaline and caffeine.',
          description: 'Your codebase is a mess, but your rapid prototypes win hackathons through pure creative innovation.',
          glowColor: '#800020',
          icon: 'Zap',
          traits: ['Rapid prototyping', 'Idea-heavy', 'Chaotic workflow'],
          strengths: ['0-to-1 building', 'Fuzzy logic concepts', 'Demo magic'],
          idealTeammates: ['The Silent Debugger', 'The Pitch Wizard'],
          weaknesses: ['Code readability and documentation are an afterthought.'],
        };
      case 'sleeplessBuilder':
      default:
        return {
          name: 'The Sleepless Builder',
          identity: 'Endless energy. Ships ideas faster than most teams can discuss them.',
          description: 'You are an execution machine. You stitch APIs, build the logic, and deploy before the sun comes up.',
          glowColor: '#800020',
          icon: 'Coffee',
          traits: ['Rapid executor', 'Versatile developer', 'High output under pressure'],
          strengths: ['MVP building', 'API integration', 'Rapid deployment'],
          idealTeammates: ['Structured planners', 'The UI Perfectionist', 'Organized collaborators'],
          weaknesses: ['May move too quickly for highly detail-oriented teammates.'],
        };
    }
  };

  // ── Auth Observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      setIsAuthenticated(!!firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Use onSnapshot for real-time updates and better offline resilience
          const unsubscribeProfile = onSnapshot(userDocRef, async (userSnap) => {
            if (userSnap.exists()) {
              // User has completed onboarding before
              const fullProfile = userSnap.data() as UserProfile;
              setUserProfileState({
                name: fullProfile.name,
                username: fullProfile.username || '',
                email: fullProfile.email || firebaseUser.email || '',
                bio: fullProfile.bio || '',
                college: fullProfile.college,
                skills: fullProfile.skills || [],
                preferredRole: fullProfile.role,
                techStack: fullProfile.techStack || [],
                schedule: fullProfile.schedule,
                commStyle: fullProfile.commStyle,
                teamSizePreference: fullProfile.teamSizePreference,
                workEnergy: fullProfile.workEnergy,
                snack: fullProfile.snack,
                toxicHabit: fullProfile.toxicHabit,
                musicVibe: fullProfile.musicVibe,
                shipVsPolish: fullProfile.shipVsPolish,
                avatar: fullProfile.avatar,
                github: fullProfile.github || '',
                twitter: fullProfile.twitter || '',
                linkedin: fullProfile.linkedin || '',
                projectInterests: fullProfile.projectInterests || [],
                onboardingComplete: fullProfile.onboardingComplete ?? true
              } as any);
              setUserArchetype(fullProfile.archetype);
              setIsOnboarded(fullProfile.onboardingComplete ?? true);
            } else {
              // First-time user: prefill with GitHub data
              try {
                const githubProfileJson = await SecureStore.getItemAsync('github_profile');
                if (githubProfileJson) {
                  const githubProfile = JSON.parse(githubProfileJson);
                  
                  // Pre-fill onboarding form with GitHub data
                  setUserProfileState({
                    name: githubProfile.name || githubProfile.login || '',
                    username: githubProfile.login || '',
                    email: firebaseUser.email || '',
                    bio: githubProfile.bio || '',
                    college: '',
                    skills: [],
                    preferredRole: 'Fullstack Developer',
                    techStack: [],
                    schedule: 'Flexible',
                    commStyle: 'Collaborative & Gentle',
                    teamSizePreference: '3-4 members',
                    workEnergy: 'High-Speed Sprint',
                    snack: 'Coffee',
                    toxicHabit: 'Over-engineering',
                    musicVibe: 'Lofi Focus',
                    shipVsPolish: 'Ship Fast',
                    avatar: githubProfile.avatar_url || '',
                    github: githubProfile.login || '',
                    twitter: '',
                    linkedin: '',
                    projectInterests: [],
                  } as any);
                }
              } catch (err) {
                console.warn("Failed to load GitHub profile for prefill:", err);
              }
              
              setIsOnboarded(false);
            }
            setIsAuthLoading(false);
          }, (error) => {
            console.error("Firestore profile snapshot error:", error);
            // Don't log out on snapshot error, just log it.
            // Local cache will still serve data if available.
            setIsAuthLoading(false);
          });

          // Clean up the inner listener if the auth state changes
          return () => unsubscribeProfile();
        } catch (error: any) {
          console.error("Firestore setup error:", error);
          setIsAuthLoading(false);
        }
      } else {
        setIsOnboarded(false);
        setUserProfileState(null);
        setUserArchetype(null);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


























  // ── Discover Profiles Sync ────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.currentUser) {
      if (isOnboarded) {
        setDiscoverProfiles(PRE_MADE_PROFILES.map(p => ({
          ...p,
          compatibilityScore: calculateScore(userProfile, p)
        })));
      } else {
        setDiscoverProfiles([]);
      }
      return;
    }
    const myUid = auth.currentUser.uid;
    const swipesCol = collection(db, 'users', myUid, 'swipes');
    
    const unsubSwipes = onSnapshot(swipesCol, (swipesSnap) => {
      const swipedIds = new Set(swipesSnap.docs.map(d => d.id));
      const usersCol = collection(db, 'users');
      
      const unsubUsers = onSnapshot(usersCol, (usersSnap) => {
        const loaded: UserProfile[] = [];
        usersSnap.forEach(uDoc => {
          const uid = uDoc.id;
          if (uid !== myUid && !swipedIds.has(uid)) {
            const uData = uDoc.data() as UserProfile;
            uData.compatibilityScore = calculateScore(userProfile, uData);
            loaded.push({ ...uData, id: uid });
          }
        });
        setDiscoverProfiles(loaded);
      });
      
      return () => unsubUsers();
    });

    return () => unsubSwipes();
  }, [auth.currentUser, isOnboarded, userProfile]);

  // ── Matched Profiles Sync ──────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.currentUser) {
      setMatchedProfiles([]);
      return;
    }
    const myUid = auth.currentUser.uid;
    const q = query(collection(db, 'matches'), where('users', 'array-contains', myUid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: UserProfile[] = [];
      for (const docSnap of snapshot.docs) {
        const matchData = docSnap.data();
        const otherUid = matchData.users.find((uid: string) => uid !== myUid);
        if (otherUid) {
          const uDoc = await getDoc(doc(db, 'users', otherUid));
          if (uDoc.exists()) {
            const uProfile = uDoc.data() as UserProfile;
            uProfile.compatibilityScore = calculateScore(userProfile, uProfile);
            list.push({ ...uProfile, id: otherUid });
          }
        }
      }
      setMatchedProfiles(list);
    });

    return () => unsubscribe();
  }, [auth.currentUser, isOnboarded, userProfile]);

  // ── Chat Realtime Sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.currentUser || !activeMatch) {
      setChatMessages([]);
      return;
    }
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    const msgCol = collection(db, 'matches', matchId, 'messages');
    const q = query(msgCol, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          isSystem: data.isSystem || false
        };
      });
      setChatMessages(msgs);
    });

    const unsubTyping = onSnapshot(doc(db, 'matches', matchId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const otherUid = activeMatch.id;
        setIsTeammateTyping(!!data.typing?.[otherUid]);
      }
    });

    return () => {
      unsubscribe();
      unsubTyping();
    };
  }, [activeMatch]);

  // ── Voice Rooms Sync ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.currentUser || !activeMatch) {
      setVoiceRoomState(null);
      setIsSprintActive(false);
      return;
    }
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    const roomRef = doc(db, 'voiceRooms', matchId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVoiceRoomState(data);
        const otherUid = activeMatch.id;
        
        setIsTeammateSpeaking(!!data.members?.[otherUid]?.speaking);
        setIsTeammateMuted(!!data.members?.[otherUid]?.muted);
        
        if (data.active) {
          setIsSprintActive(true);
          setCurrentSprintChallenge(data.challenge);
          
          // Chat Notes Sync
          if (data.chatNotes) {
            setSprintChatNotes(data.chatNotes.map((note: any, idx: number) => ({
              id: `note_${idx}`,
              senderId: note.senderId,
              text: note.text,
              timestamp: new Date(),
              isSystem: note.isSystem || false
            })));
          }
        } else {
          setIsSprintActive(false);
        }
      } else {
        setVoiceRoomState(null);
        setIsSprintActive(false);
      }
    });

    return () => unsubscribe();
  }, [activeMatch]);

  // Sync speak ticks (to auto-update our simulated VoIP speak indicator)
  useEffect(() => {
    if (isSprintActive && !voiceMuted) {
      const interval = setInterval(() => {
        const speaking = Math.random() > 0.6;
        updateVoiceStatus(voiceMuted, speaking);
      }, 2000);
      return () => {
        clearInterval(interval);
        updateVoiceStatus(voiceMuted, false);
      };
    }
  }, [isSprintActive, voiceMuted]);

  // Sync timers
  useEffect(() => {
    if (isSprintActive && voiceRoomState?.sprintEndAt) {
      const timerInterval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((voiceRoomState.sprintEndAt - Date.now()) / 1000));
        setSprintTimer(remaining);
        if (remaining <= 0) {
          clearInterval(timerInterval);
          endSprint();
        }
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [isSprintActive, voiceRoomState]);

  // ── Helper Actions ─────────────────────────────────────────────────────────
  const seedDemoBuilders = async () => {
    const batchPromises = PRE_MADE_PROFILES.map(profile => {
      return setDoc(doc(db, 'users', profile.id), profile);
    });
    await Promise.all(batchPromises);
  };

  const completeOnboarding = (data: OnboardingData) => {
    setUserProfileState(data);
    setUserArchetype(calcArchetype(data));
  };

  const finishOnboarding = async () => {
    if (!userProfile) return;

    if (!auth.currentUser) {
      // Local fallback mode onboarding completion
      setIsOnboarded(true);
      return;
    }
    const myUid = auth.currentUser.uid;

    const fullProfile: UserProfile = {
      id: myUid,
      name: userProfile.name,
      username: userProfile.username || userProfile.name.toLowerCase().replace(/\s+/g, ''),
      email: auth.currentUser?.email || userProfile.email || '',
      bio: userProfile.bio || `${userProfile.preferredRole} ready to build!`,
      avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      college: userProfile.college,
      role: userProfile.preferredRole,
      preferredRole: userProfile.preferredRole,
      skills: userProfile.skills,
      techStack: userProfile.techStack?.length ? userProfile.techStack : userProfile.skills,
      schedule: userProfile.schedule,
      commStyle: userProfile.commStyle,
      teamSizePreference: userProfile.teamSizePreference,
      workEnergy: userProfile.workEnergy,
      snack: userProfile.snack,
      toxicHabit: userProfile.toxicHabit,
      musicVibe: userProfile.musicVibe,
      shipVsPolish: userProfile.shipVsPolish,
      tagline: userProfile.bio || `${userProfile.preferredRole} ready to build!`,
      compatibilityScore: 100,
      archetype: userArchetype,
      onboardingComplete: true,
      github: userProfile.github || '',
      twitter: userProfile.twitter || '',
      linkedin: userProfile.linkedin || '',
      projectInterests: userProfile.projectInterests || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistically update the UI instantly to ensure a fast transition!
    setIsOnboarded(true);

    // Save profile to database asynchronously in the background
    setDoc(doc(db, 'users', myUid), fullProfile).catch(err => {
      console.warn("Error during background profile save, will retry:", err);
    });
  };

  const updateProfile = async (data: Partial<OnboardingData & UserProfile>) => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      ...data,
      preferredRole: data.preferredRole || data.role || (userProfile as any).preferredRole || userProfile.role,
      skills: data.skills ? normalizeSkillBag(data) : userProfile.skills,
      techStack: data.skills ? normalizeSkillBag(data) : (data.techStack || userProfile.techStack),
    };
    setUserProfileState(updated as any);
    
    const archetype = calcArchetype(updated as any);
    setUserArchetype(archetype);
    
    if (auth.currentUser) {
      const myUid = auth.currentUser.uid;
      const firestoreUpdate: any = {
        ...data,
        archetype,
        updatedAt: new Date().toISOString()
      };
      if (data.preferredRole) firestoreUpdate.role = data.preferredRole;
      if (data.skills) {
        firestoreUpdate.skills = normalizeSkillBag(data);
        firestoreUpdate.techStack = normalizeSkillBag(data);
      }
      
      await updateDoc(doc(db, 'users', myUid), firestoreUpdate).catch((err) => {
        console.error("Firestore profile update failed:", err);
      });
    }
  };

  const advanceProfile = () => {
    setCurrentProfileIndex(i => Math.min(i + 1, discoverProfiles.length - 1));
  };

  const addMatch = async (profile: UserProfile) => {
    if (!auth.currentUser) {
      // Offline Local Mode Fallback Matching
      setMatchedProfiles(prev => prev.find(p => p.id === profile.id) ? prev : [...prev, profile]);
      setActiveMatch(profile);

      setChatMessages([
        {
          id: 'system_icebreaker',
          senderId: 'system',
          text: `Synq Icebreaker: You both love ${profile.musicVibe || 'Tech House'}. How do you stay focused at 3AM?`,
          timestamp: new Date(),
          isSystem: true,
        },
        {
          id: 'teammate_opener',
          senderId: profile.id,
          text: `Hey! Our ${profile.compatibilityScore}% compatibility score is absolute fire. What hackathon track are you thinking of submitting to?`,
          timestamp: new Date(),
        },
      ]);
      return;
    }
    const myUid = auth.currentUser.uid;
    const theirUid = profile.id;

    await setDoc(doc(db, 'users', myUid, 'swipes', theirUid), {
      type: 'like',
      timestamp: serverTimestamp()
    });

    const theirSwipeSnap = await getDoc(doc(db, 'users', theirUid, 'swipes', myUid));
    if (theirSwipeSnap.exists() && theirSwipeSnap.data()?.type === 'like') {
      const matchId = [myUid, theirUid].sort().join('_');
      await setDoc(doc(db, 'matches', matchId), {
        id: matchId,
        users: [myUid, theirUid],
        createdAt: serverTimestamp(),
        lastMessage: {
          text: "It's a Synq! Start chatting and build together.",
          senderId: 'system',
          timestamp: new Date()
        },
        typing: {
          [myUid]: false,
          [theirUid]: false
        }
      });

      const msgCol = collection(db, 'matches', matchId, 'messages');
      await addDoc(msgCol, {
        senderId: 'system',
        text: `Synq Icebreaker: You both love ${profile.musicVibe}. How do you stay focused at 3AM?`,
        timestamp: serverTimestamp(),
        isSystem: true
      });

      setActiveMatch(profile);
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!auth.currentUser) {
      // Offline Local Mode Fallback Messaging
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: 'me',
        text,
        timestamp: new Date()
      }]);

      if (activeMatch) {
        setIsTeammateTyping(true);
        setTimeout(() => {
          setIsTeammateTyping(false);
          const reply = text.toLowerCase().includes('sprint')
            ? "Yes! Let's fire up the Compatibility Sprint right now. I'd love to solve one of those fast-paced challenges with you!"
            : text.toLowerCase().includes('hi') || text.toLowerCase().includes('hey')
              ? `Hey! Awesome to connect. That ${activeMatch.compatibilityScore}% match score is huge! Tap the phone icon in the top right so we can start our 10-minute Sprint room! 🚀`
              : "That's super interesting! Let's jump into a quick Compatibility Sprint so we can test our workflow dynamic live!";
          
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            senderId: activeMatch.id,
            text: reply,
            timestamp: new Date()
          }]);
        }, 1500);
      }
      return;
    }
    if (!activeMatch) return;
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');

    const msgCol = collection(db, 'matches', matchId, 'messages');
    await addDoc(msgCol, {
      senderId: myUid,
      text,
      timestamp: serverTimestamp()
    });

    await updateDoc(doc(db, 'matches', matchId), {
      lastMessage: {
        text,
        senderId: myUid,
        timestamp: new Date()
      }
    });
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!auth.currentUser || !activeMatch) return;
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    await updateDoc(doc(db, 'matches', matchId), {
      [`typing.${myUid}`]: isTyping
    }).catch(() => {});
  };

  const updateVoiceStatus = async (muted: boolean, speaking: boolean) => {
    if (!auth.currentUser || !activeMatch) return;
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    const roomRef = doc(db, 'voiceRooms', matchId);
    
    await updateDoc(roomRef, {
      [`members.${myUid}.muted`]: muted,
      [`members.${myUid}.speaking`]: speaking
    }).catch(() => {});
  };

  const sendSprintChatNote = async (text: string) => {
    if (!auth.currentUser || !voiceRoomState) {
      // Local fallback mode note posting
      setSprintChatNotes(prev => [...prev, {
        id: Date.now().toString(),
        senderId: 'me',
        text,
        timestamp: new Date()
      }]);
      return;
    }
    if (!activeMatch) return;
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    const roomRef = doc(db, 'voiceRooms', matchId);

    const updatedNotes = [...(voiceRoomState.chatNotes || []), {
      senderId: myUid,
      text,
      timestamp: new Date()
    }];

    await updateDoc(roomRef, {
      chatNotes: updatedNotes
    });
  };

  const startSprint = async () => {
    const challenge = SPRINT_CHALLENGES[Math.floor(Math.random() * SPRINT_CHALLENGES.length)];
    setCurrentSprintChallenge(challenge);
    setSprintChatNotes([{
      id: 'sprint_sys',
      senderId: 'system',
      text: 'Sprint Active! Unmute and discuss the challenge below.',
      timestamp: new Date(),
      isSystem: true
    }]);
    setIsSprintActive(true);
    setSprintTimer(600);

    if (!auth.currentUser || !activeMatch) {
      // Local fallback mode timer interval
      if (sprintIntervalRef.current) clearInterval(sprintIntervalRef.current);
      sprintIntervalRef.current = setInterval(() => {
        setSprintTimer(prev => {
          if (prev <= 1) {
            clearInterval(sprintIntervalRef.current!);
            endSprint();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Local mock teammate speaking/notes ticking
      let tick = 0;
      const tickInterval = setInterval(() => {
        tick++;
        if (tick % 8 === 0) {
          setIsTeammateSpeaking(true);
          setTimeout(() => setIsTeammateSpeaking(false), 3000);
        }
        if (activeMatch) {
          if (tick === 10) {
            setSprintChatNotes(prev => [...prev, {
              id: `note_${tick}`,
              senderId: activeMatch.id,
              text: `For the MVP challenge "${challenge.title}", I think we should prioritize rapid frontend mockups first!`,
              timestamp: new Date()
            }]);
          }
          if (tick === 24) {
            setSprintChatNotes(prev => [...prev, {
              id: `note_${tick}`,
              senderId: activeMatch.id,
              text: 'Monetization: premium campus tier integrations!',
              timestamp: new Date()
            }]);
          }
        }
      }, 1000);

      (sprintIntervalRef as any).tickInterval = tickInterval;
      return;
    }

    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');
    const sprintEndAt = Date.now() + 600 * 1000;

    await setDoc(doc(db, 'voiceRooms', matchId), {
      id: matchId,
      active: true,
      challenge,
      sprintEndAt,
      chatNotes: [{
        senderId: 'system',
        text: 'Sprint Active! Discuss the challenge below.',
        isSystem: true
      }],
      members: {
        [myUid]: { speaking: false, muted: voiceMuted, joinedAt: new Date() }
      }
    });
  };

  const endSprint = async () => {
    setIsSprintActive(false);
    if (sprintIntervalRef.current) {
      clearInterval(sprintIntervalRef.current);
      if ((sprintIntervalRef as any).tickInterval) {
        clearInterval((sprintIntervalRef as any).tickInterval);
      }
    }

    if (activeMatch && userProfile && userArchetype) {
      const score = Math.round((activeMatch.compatibilityScore + 85) / 2);
      const concerns: string[] = [];
      let leadership: 'Balanced' | 'Too Many Chiefs' | 'No clear leader' = 'Balanced';
      if (userProfile.preferredRole === 'Pitch Wizard' && activeMatch.role === 'Pitch Wizard') {
        leadership = 'Too Many Chiefs';
        concerns.push('Multiple presentation leaders — decide who speaks to judges early.');
      }
      if (userProfile.shipVsPolish !== activeMatch.shipVsPolish)
        concerns.push(`Pacing mismatch: you prefer "${userProfile.shipVsPolish}" vs "${activeMatch.shipVsPolish}".`);
      if (!concerns.length) concerns.push('Minor schedule offset — establish overlapping hours.');

      setTeamDynamicReport({
        communicationBalance: 78,
        ideationStrength: 86,
        executionCompatibility: 91,
        leadershipBalance: leadership,
        pacingDifferences: userProfile.shipVsPolish === activeMatch.shipVsPolish ? 'Synced Pacing' : 'Minor Speed Gap',
        strengths: ['Excellent cognitive diversity: complementary roles.', 'High execution speed with shared delivery focus.', 'Visual polish + rapid features — the winning combo.'],
        concerns,
        confidenceScore: score,
      });
    }

    if (!auth.currentUser || !activeMatch) return;
    const myUid = auth.currentUser.uid;
    const matchId = [myUid, activeMatch.id].sort().join('_');

    await updateDoc(doc(db, 'voiceRooms', matchId), {
      active: false
    }).catch(() => {});
  };

  const approveTeamSelection = (status: 'APPROVE' | 'MAYBE' | 'DECLINE', nav?: any) => {
    if (status === 'APPROVE' && activeMatch && userProfile) {
      setTeamLobbyData({
        teamName: `Team ${userProfile.name.split(' ')[0]} × ${activeMatch.name.split(' ')[0]}`,
        members: [userProfile.name, activeMatch.name],
        vibe: `${userArchetype?.name} meets ${activeMatch.archetype.name}`,
        countdown: '23h 59m',
      });
      nav?.navigate('TeamLobby');
    } else {
      advanceProfile();
      setActiveMatch(null);
      nav?.navigate('MatchesList');
    }
  };

  const redFlagsForProfile = (profile: UserProfile): string[] => {
    if (!userProfile) return [];
    const flags: string[] = [];
    if (userProfile.preferredRole === profile.role && profile.role === 'Pitch Wizard')
      flags.push('Both love to pitch — only one can present to judges.');
    if ((userProfile.schedule === 'Early Bird' && profile.schedule === 'Late Night') ||
        (userProfile.schedule === 'Late Night' && profile.schedule === 'Early Bird'))
      flags.push('Opposite schedules — one sleeping while the other peaks.');
    if ((userProfile.shipVsPolish === 'Ship Fast' && profile.shipVsPolish === 'Polish to Perfection') ||
        (userProfile.shipVsPolish === 'Polish to Perfection' && profile.shipVsPolish === 'Ship Fast'))
      flags.push('Shipping speed conflict — quick hack vs. pixel-perfect pushes.');
    return flags;
  };

  const voteHotTake = (index: number, vote: 'agree' | 'disagree') => {
    setHotTakes(prev => {
      if (prev[index].userVote) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], userVote: vote, [vote]: updated[index][vote] + 1 };
      return updated;
    });
  };

  const voteWouldYouRather = (index: number, vote: 1 | 2) => {
    setWouldYouRathers(prev => {
      if (prev[index].userVote) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], userVote: vote, [`opt${vote}Votes`]: updated[index][`opt${vote}Votes` as keyof WouldYouRather] as number + 1 };
      return updated;
    });
  };

  const resetApp = async () => {
    setIsOnboarded(false);
    setUserProfileState(null);
    setUserArchetype(null);
    setCurrentProfileIndex(0);
    setActiveMatch(null);
    setMatchedProfiles([]);
    setChatMessages([]);
    setIsSprintActive(false);
    setSprintChatNotes([]);
    setTeamDynamicReport(null);
    setTeamLobbyData(null);
    await auth.signOut();
  };

  const signOut = async () => {
    setIsAuthLoading(true);
    try {
      await firebaseSignOut(auth);
      
      // Clear GitHub data from secure storage
      await SecureStore.deleteItemAsync('github_access_token').catch(() => {});
      await SecureStore.deleteItemAsync('github_profile').catch(() => {});
      
      setIsOnboarded(false);
      setUserProfileState(null);
      setUserArchetype(null);
      setCurrentProfileIndex(0);
      setActiveMatch(null);
      setMatchedProfiles([]);
      setChatMessages([]);
      setIsSprintActive(false);
      setSprintChatNotes([]);
      setTeamDynamicReport(null);
      setTeamLobbyData(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
    setIsAuthLoading(false);
  };

  return (
    <AppContext.Provider value={{
      isOnboarded,
      isAuthenticated,
      isAuthLoading,
      userProfile,
      userArchetype,
      completeOnboarding,
      finishOnboarding,
      updateProfile,
      resetApp,
      signOut,
      profiles: discoverProfiles,
      currentProfileIndex,
      advanceProfile,
      activeMatch,
      setActiveMatch,
      redFlagsForProfile,
      matchedProfiles,
      addMatch,
      chatMessages,
      sendChatMessage,
      isTeammateTyping,
      updateTypingStatus,
      sprintTimer,
      isSprintActive,
      startSprint,
      endSprint,
      currentSprintChallenge,
      sprintChatNotes,
      sendSprintChatNote,
      voiceMuted,
      setVoiceMuted,
      isTeammateSpeaking,
      isTeammateMuted,
      seedDemoBuilders,
      teamDynamicReport,
      approveTeamSelection,
      teamLobbyData,
      hotTakes,
      voteHotTake,
      wouldYouRathers,
      voteWouldYouRather,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

// Export goToDiscover helper so ArchetypeScreen can call it
export { AppContext };

