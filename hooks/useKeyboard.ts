
import { useState, useEffect, useCallback } from 'react';
import { KeyboardState } from '../types';

export const useKeyboard = (): KeyboardState => {
  const [keys, setKeys] = useState<KeyboardState>({});

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeys(prevKeys => ({ ...prevKeys, [event.code]: true }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys(prevKeys => ({ ...prevKeys, [event.code]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
};
