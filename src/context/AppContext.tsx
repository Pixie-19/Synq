import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { UserProfile, OnboardingData, Message, SprintChallenge, TeamDynamicReport } from '../types';

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
  userProfile: OnboardingData | null;
  userArchetype: any | null;
  completeOnboarding: (data: OnboardingData) => void;
  finishOnboarding: () => void;
  updateProfile: (data: Partial<OnboardingData>) => void;
  resetApp: () => void;

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
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfileState] = useState<OnboardingData | null>(null);
  const [userArchetype, setUserArchetype] = useState<any | null>(null);

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
  const chatTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Archetype calculator ──────────────────────────────────────────────────

  const calcArchetype = (data: OnboardingData) => {
    let scores = {
      sleeplessBuilder: 0,
      uiPerfectionist: 0,
      pitchWizard: 0,
      silentDebugger: 0,
      chaosInnovator: 0,
    };

    // Evaluate Role & Skills
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
    if (data.techStack.some(s => ['React', 'Next.js', 'Framer', 'Tailwind CSS'].includes(s))) {
      scores.uiPerfectionist += 2;
      scores.chaosInnovator += 1;
    }
    if (data.techStack.some(s => ['Docker', 'Go', 'Rust', 'PostgreSQL', 'Kubernetes'].includes(s))) {
      scores.silentDebugger += 2;
    }
    if (data.techStack.some(s => ['OpenAI APIs', 'TensorFlow', 'PyTorch', 'LangChain'].includes(s))) {
      scores.sleeplessBuilder += 2;
      scores.chaosInnovator += 2;
    }

    // Evaluate Schedule & Work Energy
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
    
    // Evaluate Shipping Preference
    if (data.shipVsPolish === 'Ship Fast') {
      scores.sleeplessBuilder += 2;
      scores.chaosInnovator += 3;
    } else if (data.shipVsPolish === 'Polish to Perfection') {
      scores.uiPerfectionist += 4;
    }

    // Determine highest score
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

  // ── Onboarding ────────────────────────────────────────────────────────────

  const completeOnboarding = (data: OnboardingData) => {
    setUserProfileState(data);
    setUserArchetype(calcArchetype(data));
    // isOnboarded stays false until archetype screen triggers it
  };

  const finishArchetype = () => setIsOnboarded(true);
  const finishOnboarding = finishArchetype;

  const updateProfile = (data: Partial<OnboardingData>) => {
    setUserProfileState(prev => prev ? { ...prev, ...data } : prev);
    if (userProfile) setUserArchetype(calcArchetype({ ...userProfile, ...data }));
  };

  // Expose finishArchetype via a field the ArchetypeScreen can call
  // We patch it into context as `goToDiscover`
  const goToDiscover = finishArchetype;

  // ── Red flags ─────────────────────────────────────────────────────────────

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

  // ── Matches ───────────────────────────────────────────────────────────────

  const advanceProfile = () => setCurrentProfileIndex(i => Math.min(i + 1, PRE_MADE_PROFILES.length - 1));

  const addMatch = (profile: UserProfile) => {
    setMatchedProfiles(prev => prev.find(p => p.id === profile.id) ? prev : [...prev, profile]);
  };

  // ── Chat ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeMatch) return;
    setChatMessages([
      {
        id: 'system_icebreaker',
        senderId: 'system',
        text: `Synq Icebreaker: You both love ${activeMatch.musicVibe}. How do you stay focused at 3AM?`,
        timestamp: new Date(),
        isSystem: true,
      },
      {
        id: 'teammate_opener',
        senderId: activeMatch.id,
        text: `Hey! ${activeMatch.compatibilityScore}% match score is huge. What track are you leaning towards?`,
        timestamp: new Date(),
      },
    ]);
  }, [activeMatch]);

  const sendChatMessage = (text: string, senderId = 'me') => {
    setChatMessages(prev => [...prev, { id: Date.now().toString(), senderId, text, timestamp: new Date() }]);
    if (senderId === 'me' && activeMatch) {
      setIsTeammateTyping(true);
      if (chatTimeoutRef.current) clearTimeout(chatTimeoutRef.current);
      chatTimeoutRef.current = setTimeout(() => {
        setIsTeammateTyping(false);
        const reply = text.toLowerCase().includes('sprint')
          ? "Yes! Let's fire up the Compatibility Sprint. I want to see how we build together!"
          : text.toLowerCase().includes('hi') || text.toLowerCase().includes('hey')
            ? `Hey! So excited about our ${activeMatch.compatibilityScore}% match. Down for the 10-min Sprint?`
            : "That's so cool! Let's jump into the Compatibility Sprint and see our dynamic live!";
        setChatMessages(prev => [...prev, { id: Date.now().toString(), senderId: activeMatch.id, text: reply, timestamp: new Date() }]);
      }, 2000);
    }
  };

  // ── Sprint ────────────────────────────────────────────────────────────────

  const sendSprintChatNote = (text: string, senderId = 'me') => {
    setSprintChatNotes(prev => [...prev, { id: Date.now().toString(), senderId, text, timestamp: new Date() }]);
  };

  const startSprint = () => {
    setIsSprintActive(true);
    setSprintTimer(600);
    const challenge = SPRINT_CHALLENGES[Math.floor(Math.random() * SPRINT_CHALLENGES.length)];
    setCurrentSprintChallenge(challenge);
    setSprintChatNotes([{ id: 'sprint_sys', senderId: 'system', text: 'Sprint Active! Unmute and discuss the challenge below.', timestamp: new Date(), isSystem: true }]);

    if (sprintIntervalRef.current) clearInterval(sprintIntervalRef.current);
    sprintIntervalRef.current = setInterval(() => {
      setSprintTimer(prev => {
        if (prev <= 1) { clearInterval(sprintIntervalRef.current!); endSprint(); return 0; }
        return prev - 1;
      });
    }, 1000);

    let tick = 0;
    speakIntervalRef.current = setInterval(() => {
      tick++;
      if (tick % 8 === 0) { setIsTeammateSpeaking(true); setTimeout(() => setIsTeammateSpeaking(false), 3000); }
      if (activeMatch) {
        if (tick === 10) sendSprintChatNote('For the MVP, I think we should prioritize realtime matching!', activeMatch.id);
        if (tick === 24) sendSprintChatNote('Monetization: premium university hackathon SaaS tiers!', activeMatch.id);
        if (tick === 38) sendSprintChatNote("Let's polish the card animations and keep voice rooms low-pressure.", activeMatch.id);
      }
    }, 1000);
  };

  const endSprint = () => {
    setIsSprintActive(false);
    if (sprintIntervalRef.current) clearInterval(sprintIntervalRef.current);
    if (speakIntervalRef.current)  clearInterval(speakIntervalRef.current);

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
  };

  // ── Team approval ─────────────────────────────────────────────────────────

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

  // ── Social ────────────────────────────────────────────────────────────────

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

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetApp = () => {
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
  };

  useEffect(() => () => {
    if (sprintIntervalRef.current) clearInterval(sprintIntervalRef.current);
    if (chatTimeoutRef.current)    clearTimeout(chatTimeoutRef.current);
    if (speakIntervalRef.current)  clearInterval(speakIntervalRef.current);
  }, []);

  return (
    <AppContext.Provider value={{
      isOnboarded,
      userProfile,
      userArchetype,
      completeOnboarding,
      finishOnboarding,
      updateProfile,
      resetApp,
      profiles: PRE_MADE_PROFILES,
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

