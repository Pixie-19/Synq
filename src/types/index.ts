export type RoleType = 'Frontend Developer' | 'Backend Developer' | 'Fullstack Developer' | 'UI/UX Designer' | 'Product Manager' | 'Pitch Wizard';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  college: string;
  role: RoleType;
  skills: string[];
  techStack: string[];
  schedule: 'Late Night' | 'Early Bird' | '24/7 Machine' | 'Flexible';
  commStyle: 'Direct & Fast' | 'Collaborative & Gentle' | 'Silent & Structured' | 'Enthusiastic & High Energy';
  teamSizePreference: 'Solo to Duo' | '3-4 members' | '5+ members';
  workEnergy: 'Chill & Steady' | 'High-Speed Sprint' | 'Deep Focus & Silos' | 'Chaotic Innovation';
  snack: string;
  toxicHabit: string;
  musicVibe: string;
  shipVsPolish: 'Ship Fast' | 'Polish to Perfection' | 'Healthy Balance';
  tagline: string;
  compatibilityScore: number;
  archetype: {
    name: string;
    description: string;
    glowColor: string;
    emoji: string;
    traits: string[];
    strengths: string[];
  };
}

export interface OnboardingData {
  name: string;
  college: string;
  skills: string[];
  preferredRole: RoleType;
  techStack: string[];
  schedule: 'Late Night' | 'Early Bird' | '24/7 Machine' | 'Flexible';
  commStyle: 'Direct & Fast' | 'Collaborative & Gentle' | 'Silent & Structured' | 'Enthusiastic & High Energy';
  teamSizePreference: 'Solo to Duo' | '3-4 members' | '5+ members';
  workEnergy: 'Chill & Steady' | 'High-Speed Sprint' | 'Deep Focus & Silos' | 'Chaotic Innovation';
  snack: string;
  toxicHabit: string;
  musicVibe: string;
  shipVsPolish: 'Ship Fast' | 'Polish to Perfection' | 'Healthy Balance';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface SprintChallenge {
  id: string;
  title: string;
  problem: string;
  mvpPoints: string[];
  users: string[];
  monetization: string[];
}

export interface TeamDynamicReport {
  communicationBalance: number; // 0 to 100
  ideationStrength: number; // 0 to 100
  executionCompatibility: number; // 0 to 100
  leadershipBalance: 'Balanced' | 'Too Many Chiefs' | 'No clear leader';
  pacingDifferences: 'Synced Pacing' | 'Minor Speed Gap' | 'Major Misalignment';
  strengths: string[];
  concerns: string[];
  confidenceScore: number;
}
