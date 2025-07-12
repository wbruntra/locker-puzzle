// test-react-reducer.js

// Import the actual generator
function* lockerPuzzle(totalStudents = 100) {
  for (let s = 1; s <= totalStudents; s++) {
    for (let l = s - 1; l < 100; l += s) {
      yield { student: s, locker: l, done: false };
    }
    yield { student: s, locker: -1, done: true };
  }
}

// Simulate the exact React reducer logic
function simulateReactReducer() {
  let state = {
    lockers: Array(100).fill(false),
    currentStep: null,
    generator: lockerPuzzle(),
    running: false,
    autoAdvance: false,
    speed: 5,
    isComplete: false,
  };

  console.log('=== Simulating React Reducer ===');
  
  // Simulate advancing through the first student
  console.log('Student 1 steps:');
  for (let i = 0; i < 105; i++) { // 100 steps + 1 done step, plus a few extra to see student 2
    const { value, done } = state.generator.next();
    if (done || !value) {
      console.log('Generator completed');
      break;
    }
    
    // Apply the exact same logic as our reducer
    const newLockers = [...state.lockers];
    if (value.locker !== -1) {
      newLockers[value.locker] = !newLockers[value.locker];
    }
    
    state = {
      ...state,
      lockers: newLockers,
      currentStep: value,
    };
    
    if (value.locker !== -1) {
      const action = state.lockers[value.locker] ? 'opened' : 'closed';
      console.log(`  Step ${i + 1}: Student ${value.student} ${action} locker ${value.locker + 1}`);
    } else {
      console.log(`  Student ${value.student} finished`);
      const openCount = state.lockers.filter(Boolean).length;
      console.log(`  Open lockers: ${openCount}`);
      
      if (value.student === 1) {
        // Check if all lockers are open after student 1
        const allOpen = state.lockers.every(Boolean);
        console.log(`  All lockers open after student 1: ${allOpen}\n`);
      }
      
      if (value.student === 2) {
        // Show first 10 locker states after student 2
        console.log(`  First 10 locker states: [${state.lockers.slice(0, 10).map(x => x ? 'O' : 'C').join(', ')}]`);
        break;
      }
    }
  }
}

simulateReactReducer();
