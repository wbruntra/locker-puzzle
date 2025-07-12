// lockerEngine.js
export function* lockerPuzzle(totalStudents = 100) {
  for (let s = 1; s <= totalStudents; s++) {
    for (let l = s - 1; l < 100; l += s) {
      yield { student: s, locker: l, done: false };
    }
    // emit a "done" step so the UI can pause between students
    yield { student: s, locker: -1, done: true };
  }
}
