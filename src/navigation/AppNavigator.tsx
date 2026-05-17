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
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9F6F0',
    card: '#FFFFFF',
    text: '#2C2C2C',
    border: '#E0E0E0',
    primary: '#800020',
    notification: '#D03B5B',
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
        tabBarActiveTintColor: '#800020',
        tabBarInactiveTintColor: '#767676',
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

const OnboardingStack = createStackNavigator();

function AuthStackNav() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash"      component={SplashScreen} />
      <AuthStack.Screen name="Auth"        component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingStackNav() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Onboarding"  component={OnboardingScreen} />
      <OnboardingStack.Screen name="Archetype"   component={ArchetypeScreen} />
    </OnboardingStack.Navigator>
  );
}

// ─── Root — switches between auth flow and main app ────────────────────────

function RootNavigator() {
  const { isOnboarded, isAuthLoading, isAuthenticated } = useApp();

  if (isAuthLoading) {
    return <SplashScreen navigation={null as any} route={null as any} />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && isOnboarded ? (
        <RootStack.Screen name="MainApp" component={MainTabs} />
      ) : isAuthenticated && !isOnboarded ? (
        <RootStack.Screen name="OnboardingFlow" component={OnboardingStackNav} />
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderStyle: 'dotted',
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
    fontFamily: 'serif',
  },
});
