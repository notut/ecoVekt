import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';



export default function RootLayout() {

  return (
    <Tabs.Screen
      name='login'
      options={{
        title: "Log inn"
      }}
      />
  );
}
