const doors = []

for (let i = 0; i < 100; i++) {
  doors.push({
    id: i + 1,
    isOpen: false,
    flips: 0,
  })
}

for (let s = 1; s <= 100; s++) {
  console.log(`Pass ${s}`)
  for (let d = s - 1; d < doors.length; d += s) {
    doors[d].isOpen = !doors[d].isOpen
    doors[d].flips++
    if (doors[d].isOpen) {
      console.log(`Door ${doors[d].id} is now open`)
    }
  }
}

console.log(doors)