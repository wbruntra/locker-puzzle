// test-locker-logic.js
// Pure function to calculate the next state given current state and student info

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

function runFullSimulation() {
  let lockers = Array(100).fill(false);
  
  console.log('Starting locker puzzle simulation...\n');
  
  for (let student = 1; student <= 100; student++) {
    console.log(`Student ${student}:`);
    let step = 0;
    
    while (true) {
      const result = getNextLockerState(lockers, student, step);
      
      if (!result.isValidStep) {
        break; // This student is done
      }
      
      lockers = result.lockers;
      const action = lockers[result.lockerIndex] ? 'opened' : 'closed';
      console.log(`  Step ${step + 1}: ${action} locker ${result.lockerIndex + 1}`);
      
      step++;
    }
    
    const openCount = lockers.filter(Boolean).length;
    console.log(`  Student ${student} finished. Open lockers: ${openCount}\n`);
    
    // For first few students, show which lockers are open
    if (student <= 3) {
      const openLockers = lockers.map((isOpen, index) => isOpen ? index + 1 : null)
        .filter(Boolean);
      console.log(`  Open lockers: [${openLockers.join(', ')}]\n`);
    }
  }
  
  const finalOpenCount = lockers.filter(Boolean).length;
  const openLockers = lockers.map((isOpen, index) => isOpen ? index + 1 : null)
    .filter(Boolean);
  
  console.log(`Final result: ${finalOpenCount} lockers are open`);
  console.log(`Open lockers: [${openLockers.join(', ')}]`);
}

// Test just the first student to verify logic
function testFirstStudent() {
  let lockers = Array(100).fill(false);
  
  console.log('Testing Student 1 (should open all 100 lockers):\n');
  
  for (let step = 0; step < 100; step++) {
    const result = getNextLockerState(lockers, 1, step);
    
    if (!result.isValidStep) {
      console.log(`Student 1 finished after ${step} steps`);
      break;
    }
    
    lockers = result.lockers;
    const action = lockers[result.lockerIndex] ? 'opened' : 'closed';
    console.log(`Step ${step + 1}: ${action} locker ${result.lockerIndex + 1}`);
  }
  
  const openCount = lockers.filter(Boolean).length;
  console.log(`\nStudent 1 result: ${openCount} lockers are open`);
  
  // Verify all lockers are open
  const allOpen = lockers.every(Boolean);
  console.log(`All lockers open: ${allOpen}`);
}

// Test just the second student
function testSecondStudent() {
  // Start with all lockers open (state after student 1)
  let lockers = Array(100).fill(true);
  
  console.log('Testing Student 2 (should close every 2nd locker):\n');
  
  for (let step = 0; step < 50; step++) {
    const result = getNextLockerState(lockers, 2, step);
    
    if (!result.isValidStep) {
      console.log(`Student 2 finished after ${step} steps`);
      break;
    }
    
    lockers = result.lockers;
    const action = lockers[result.lockerIndex] ? 'opened' : 'closed';
    console.log(`Step ${step + 1}: ${action} locker ${result.lockerIndex + 1}`);
  }
  
  const openCount = lockers.filter(Boolean).length;
  console.log(`\nStudent 2 result: ${openCount} lockers are open`);
  
  // Show which lockers are still open
  const openLockers = lockers.map((isOpen, index) => isOpen ? index + 1 : null)
    .filter(Boolean);
  console.log(`Open lockers: [${openLockers.slice(0, 20).join(', ')}...]`);
}

// Run the tests
console.log('=== Testing First Student ===');
testFirstStudent();

console.log('\n=== Testing Second Student ===');
testSecondStudent();

console.log('\n=== Running Full Simulation ===');
runFullSimulation();
