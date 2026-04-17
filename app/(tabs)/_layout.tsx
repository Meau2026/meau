import { Drawer } from 'expo-router/drawer';

import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DrawerLayout() {

  const colorScheme = useColorScheme();

  return <Drawer />;


}
