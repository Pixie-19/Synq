import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Compass, Users, Zap, HelpCircle, User } from 'lucide-react-native';

import { useApp } from '../context/AppContext';

// Auth flow
import { SplashScreen }    from '../screens/SplashScreen';
import { AuthScreen }      from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ArchetypeScreen }  from '../screens/ArchetypeScreen';

// Main tab screens
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { SprintRoomsScreen } from '../screens/SprintRoomsScreen';
import { SocialArenaScreen } from '../screens/SocialArenaScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Drill-down / modal screens
import { MatchScreen }           from '../screens/MatchScreen';
import { ChatScreen }            from '../screens/ChatScreen';
import { SprintScreen }          from '../screens/SprintScreen';
import { DynamicAnalysisScreen } from '../screens/DynamicAnalysisScreen';
import { TeamLobbyScreen }       from '../screens/TeamLobbyScreen';
import { EmergencyBuilderScreen } from '../screens/EmergencyBuilderScreen';

const Tab          = createBottomTabNavigator();
const RootStack    = createStackNavigator();
const AuthStack    = createStackNavigator();
const DiscoverStack = createStackNavigator();
const MatchesStack  = createStackNavigator();
const SprintStack   = createStackNavigator();

const SynqTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#06050C',
    card: '#0C0A1A',
    text: '#FFFFFF',
    border: 'rgba(255,255,255,0.05)',
    primary: '#00F0FF',
    notification: '#8A2BE2',
  },
};

// ─── Nested stack navigators ───────────────────────────────────────────────

function DiscoverStackNav() {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="DiscoverMain"     component={DiscoverScreen} />
      <DiscoverStack.Screen name="EmergencyBuilder" component={EmergencyBuilderScreen} />
      <DiscoverStack.Screen name="Match"            component={MatchScreen} />
    </DiscoverStack.Navigator>
  );
}

function MatchesStackNav() {
  return (
    <MatchesStack.Navigator screenOptions={{ headerShown: false }}>
      <MatchesStack.Screen name="MatchesList"     component={MatchesScreen} />
      <MatchesStack.Screen name="Chat"            component={ChatScreen} />
      <MatchesStack.Screen name="SprintRoom"      component={SprintScreen} />
      <MatchesStack.Screen name="DynamicAnalysis" component={DynamicAnalysisScreen} />
      <MatchesStack.Screen name="TeamLobby"       component={TeamLobbyScreen} />
    </MatchesStack.Navigator>
  );
}

function SprintStackNav() {
  return (
    <SprintStack.Navigator screenOptions={{ headerShown: false }}>
      <SprintStack.Screen name="SprintRoomsList" component={SprintRoomsScreen} />
      <SprintStack.Screen name="SprintRoom"      component={SprintScreen} />
      <SprintStack.Screen name="DynamicAnalysis" component={DynamicAnalysisScreen} />
      <SprintStack.Screen name="TeamLobby"       component={TeamLobbyScreen} />
    </SprintStack.Navigator>
  );
}

// ─── Main bottom-tab navigator ─────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00F0FF',
        tabBarInactiveTintColor: '#3D3C52',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const s = focused ? 22 : 20;
          switch (route.name) {
            case 'Discover': return <Compass    color={color} size={s} />;
            case 'Matches':  return <Users      color={color} size={s} />;
            case 'Sprint':   return <Zap        color={color} size={s} />;
            case 'Arena':    return <HelpCircle color={color} size={s} />;
            case 'Profile':  return <User       color={color} size={s} />;
            default:         return null;
          }
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverStackNav} />
      <Tab.Screen name="Matches"  component={MatchesStackNav} />
      <Tab.Screen name="Sprint"   component={SprintStackNav} />
      <Tab.Screen name="Arena"    component={SocialArenaScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Auth stack ─────────────────────────────────────────────────────────────

function AuthStackNav() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash"      component={SplashScreen} />
      <AuthStack.Screen name="Auth"        component={AuthScreen} />
      <AuthStack.Screen name="Onboarding"  component={OnboardingScreen} />
      <AuthStack.Screen name="Archetype"   component={ArchetypeScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root — switches between auth flow and main app ────────────────────────

function RootNavigator() {
  const { isOnboarded } = useApp();
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isOnboarded ? (
        <RootStack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <RootStack.Screen name="AuthFlow" component={AuthStackNav} />
      )}
    </RootStack.Navigator>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────

export const AppNavigator: React.FC = () => (
  <NavigationContainer theme={SynqTheme}>
    <RootNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0C0A1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 82 : 62,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
