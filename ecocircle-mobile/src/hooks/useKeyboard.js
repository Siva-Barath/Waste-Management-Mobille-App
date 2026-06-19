import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

/**
 * useKeyboard - Custom hook for keyboard height management
 * 
 * Tracks keyboard show/hide events and returns keyboard height
 * Used for adjusting layout when keyboard appears
 * 
 * Usage:
 * const keyboardHeight = useKeyboard();
 */

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible,
  };
}
