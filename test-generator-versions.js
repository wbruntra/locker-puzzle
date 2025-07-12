// test-generator-versions.js

// Original version from the generator
function* originalGenerator(totalStudents = 100) {
  for (let s = 1; s <= totalStudents; s++) {
    for (let l = s - 1; l < 100; l += s) {
      yield { student: s, locker: l, done: false };
    }
    yield { student: s, locker: -1, done: true };
  }
}

// New version based on the pure function
function* newGenerator(totalStudents = 100) {
  for (let student = 1; student <= totalStudents; student++) {
    let step = 0;
    
    while (true) {
      const lockerIndex = (student - 1) + (step * student);
      
      if (lockerIndex >= 100) {
        break;
      }
      
      yield { student, locker: lockerIndex, done: false };
      step++;
    }
    
    yield { student, locker: -1, done: true };
  }
}

console.log('=== Testing Original Generator for Student 1 ===');
const originalGen = originalGenerator();
for (let i = 0; i < 10; i++) {
  const result = originalGen.next();
  if (result.done) break;
  console.log(`Step ${i + 1}: locker ${result.value.locker + 1}`);
}

console.log('\n=== Testing New Generator for Student 1 ===');
const newGen = newGenerator();
for (let i = 0; i < 10; i++) {
  const result = newGen.next();
  if (result.done) break;
  console.log(`Step ${i + 1}: locker ${result.value.locker + 1}`);
}

console.log('\n=== Testing Original Generator for Student 2 ===');
const originalGen2 = originalGenerator();
// Skip student 1 and the done step
for (let i = 0; i < 101; i++) {
  originalGen2.next();
}
for (let i = 0; i < 10; i++) {
  const result = originalGen2.next();
  if (result.done) break;
  console.log(`Step ${i + 1}: locker ${result.value.locker + 1}`);
}

console.log('\n=== Testing New Generator for Student 2 ===');
const newGen2 = newGenerator();
// Skip student 1 and the done step
for (let i = 0; i < 101; i++) {
  newGen2.next();
}
for (let i = 0; i < 10; i++) {
  const result = newGen2.next();
  if (result.done) break;
  console.log(`Step ${i + 1}: locker ${result.value.locker + 1}`);
}
