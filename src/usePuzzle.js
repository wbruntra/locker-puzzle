// usePuzzle.js
import { useReducer, useRef, useEffect } from 'react';

const initialState = {
  lockers: Array(100).fill(false),
  currentStudent: 1,
  currentStep: 0,
  currentLockerIndex: -1,
  running: false,
  autoAdvance: false,
  speed: 5,
  isComplete: false,
  studentFinished: false,
};

function getNextLockerState(currentLockers, studentNumber, studentStep) {
  // studentStep is 0-based index of which locker this student is currently at
  // For student N, they toggle lockers at positions: (N-1), (N-1)+N, (N-1)+2*N, etc.
  
  const newLockers = [...currentLockers];
  const lockerIndex = (studentNumber - 1) + (studentStep * studentNumber);
  
  // If this locker index is valid, toggle it
  if (lockerIndex < newLockers.length) {
    newLockers[lockerIndex] = !newLockers[lockerIndex];
    return {
      lockers: newLockers,
      lockerIndex: lockerIndex,
      isValidStep: true
    };
  }
  
  return {
    lockers: currentLockers,
    lockerIndex: -1,
    isValidStep: false
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return initialState;

    case 'PLAY':
      return { ...state, running: true };

    case 'PAUSE':
      return { ...state, running: false };

    case 'TOGGLE_AUTO':
      return { ...state, autoAdvance: !state.autoAdvance };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'ADVANCE': {
      if (state.isComplete) return state;
      
      // If current student is finished, move to next student AND start them
      if (state.studentFinished) {
        if (state.currentStudent >= 100) {
          return { ...state, isComplete: true, running: false };
        }
        
        const nextStudent = state.currentStudent + 1;
        
        // Immediately do the first action for the next student
        const result = getNextLockerState(state.lockers, nextStudent, 0);
        
        if (!result.isValidStep) {
          // Next student has no actions (shouldn't happen)
          return {
            ...state,
            currentStudent: nextStudent,
            currentStep: 0,
            studentFinished: true,
            currentLockerIndex: -1,
            running: false,
          };
        }
        
        // Successfully advanced to next student and did their first action
        return {
          ...state,
          currentStudent: nextStudent,
          currentStep: 1, // We already did step 0
          studentFinished: false,
          currentLockerIndex: result.lockerIndex,
          lockers: result.lockers,
          running: true, // Keep running since user clicked to start next student
        };
      }
      
      // Try to advance current student to next locker
      const result = getNextLockerState(state.lockers, state.currentStudent, state.currentStep);
      
      if (!result.isValidStep) {
        // Current student is finished
        return {
          ...state,
          studentFinished: true,
          currentLockerIndex: -1,
          running: state.autoAdvance ? state.running : false,
        };
      }
      
      // Student successfully toggled a locker
      return {
        ...state,
        lockers: result.lockers,
        currentStep: state.currentStep + 1,
        currentLockerIndex: result.lockerIndex,
        studentFinished: false,
      };
    }
    
    default:
      return state;
  }
}

export function usePuzzle() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Create a currentStep object for compatibility with existing UI
  const currentStep = state.studentFinished 
    ? { student: state.currentStudent, locker: -1, done: true }
    : { student: state.currentStudent, locker: state.currentLockerIndex, done: false };

  // run the clock
  const timerRef = useRef();
  useEffect(() => {
    if (!state.running) return undefined;
    const interval = 2200 - state.speed * 200;

    timerRef.current = setInterval(() => dispatch({ type: 'ADVANCE' }), interval / 4);

    return () => clearInterval(timerRef.current);
  }, [state.running, state.speed]);

  return { 
    state: {
      ...state,
      currentStep,
    }, 
    dispatch 
  };
}
