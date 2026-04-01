import {StyleSheet, Text, View} from 'react-native';

import { ThemedText } from '@/components/themed-text';
export default function FireBaseTest() {

	return (
		<view>
			<ThemedText> Hello world!</ThemedText>
		</view>

	);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
},
});
