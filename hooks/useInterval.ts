import { useCallback, useEffect, useRef } from 'react';

type CallbackFunction = () => void;

interface UseIntervalOptions {
  cond?: boolean;
  onStart?: () => void;
  onStop?: () => void;
}

const setIntervalImmediate = (callback: CallbackFunction, interval: number): NodeJS.Timeout => {
  // Execute the callback immediately
  callback();

  // Continue executing the callback at the given interval
  return setInterval(callback, interval);
};

export function useInterval(
  callback: CallbackFunction,
  delay: number | undefined,
  { cond = true, onStart, onStop }: UseIntervalOptions = {},
): void {
  const callbackRef = useRef<CallbackFunction>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const onStartRef = useRef<() => void>();
  const onStopRef = useRef<() => void>();

  const start = useCallback(() => {
    if (!intervalRef.current && delay !== undefined) {
      if (onStartRef.current) onStartRef.current();
      intervalRef.current = setIntervalImmediate(() => {
        callbackRef.current!();
      }, delay);
    }
  }, [delay]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      if (onStopRef.current) onStopRef.current();
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  useEffect(() => {
    if (cond !== undefined) {
      if (cond) start();
      else stop();
    }

    return () => {
      stop();
    };
  }, [cond, start, stop]);
}
