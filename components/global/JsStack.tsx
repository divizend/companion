import { EventMapBase, NavigationState } from '@react-navigation/native';
import {
  // Import the types
  StackNavigationOptions, // Import the creation function
  createStackNavigator,
} from '@react-navigation/stack';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createStackNavigator();

// This can be used like `<JsStack />`
// The reason for using this can be found here https://github.com/expo/router/issues/640#issuecomment-1626767444
export const JsStack = withLayoutContext<StackNavigationOptions, typeof Navigator, NavigationState, EventMapBase>(
  Navigator,
);
