import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react'

function App() {
  const [lockers, setLockers] = useState(Array(100).fill(false)) // false = closed, true = open
  const [currentStudent, setCurrentStudent] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false) // New state for auto-advance mode
  const [speed, setSpeed] = useState(5) // speed scale 1-10
  const [studentPosition, setStudentPosition] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentAction, setCurrentAction] = useState('')
  const [studentFinished, setStudentFinished] = useState(false) // Track if current student finished

  // Hook to get responsive grid sizing
  const [gridSize, setGridSize] = useState({ lockerSize: 50, gap: 8, offset: 30 })
  
  useEffect(() => {
    const updateGridSize = () => {
      const width = window.innerWidth
      if (width <= 480) {
        setGridSize({ lockerSize: 24, gap: 3, offset: 12 })
      } else if (width <= 768) {
        setGridSize({ lockerSize: 28, gap: 4, offset: 14 })
      } else {
        setGridSize({ lockerSize: 50, gap: 8, offset: 30 })
      }
    }
    
    updateGridSize()
    window.addEventListener('resize', updateGridSize)
    return () => window.removeEventListener('resize', updateGridSize)
  }, [])

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setLockers(Array(100).fill(false))
    setCurrentStudent(0)
    setStudentPosition(0)
    setIsRunning(false)
    setAutoAdvance(false)
    setIsComplete(false)
    setCurrentAction('')
    setStudentFinished(false)
  }, [])

  // Toggle a specific locker
  const toggleLocker = useCallback((index) => {
    setLockers(prev => {
      const newLockers = [...prev]
      newLockers[index] = !newLockers[index]
      return newLockers
    })
  }, [])

  // Animation logic
  useEffect(() => {
    if (!isRunning || isComplete) return

    // Convert speed scale (1-10) to milliseconds (2000ms to 200ms)
    const milliseconds = 2200 - (speed * 200)

    const timer = setTimeout(() => {
      if (currentStudent >= 100) {
        setIsComplete(true)
        setIsRunning(false)
        setCurrentAction('Simulation complete!')
        return
      }

      const studentNumber = currentStudent + 1
      const lockersToToggle = []
      
      // Calculate which lockers this student will toggle
      for (let i = studentNumber - 1; i < 100; i += studentNumber) {
        lockersToToggle.push(i)
      }

      // Reset student finished state when starting a new student
      setStudentFinished(false)

      // Animate through each locker this student toggles
      let stepIndex = 0
      const stepTimer = setInterval(() => {
        if (stepIndex >= lockersToToggle.length) {
          clearInterval(stepTimer)
          setStudentPosition(0)
          setStudentFinished(true)
          
          // Stop after each student unless auto-advance is enabled
          if (!autoAdvance) {
            setIsRunning(false)
            setCurrentAction(`Student ${studentNumber} finished. Click to continue with Student ${studentNumber + 1}.`)
          } else {
            setCurrentStudent(prev => prev + 1)
          }
          return
        }

        const lockerIndex = lockersToToggle[stepIndex]
        setStudentPosition(lockerIndex)
        
        // Determine if locker is being opened or closed
        const isCurrentlyOpen = lockers[lockerIndex]
        const action = isCurrentlyOpen ? <ChevronDown size={16} color="#f44336" /> : <ChevronUp size={16} color="#4CAF50" />
        const actionText = isCurrentlyOpen ? 'closing' : 'opening'
        
        setCurrentAction(
          <span>
            Student {studentNumber} is {actionText} locker {lockerIndex + 1} {action}
          </span>
        )
        toggleLocker(lockerIndex)
        stepIndex++
      }, milliseconds / 4)

      return () => clearInterval(stepTimer)
    }, milliseconds)

    return () => clearTimeout(timer)
  }, [currentStudent, isRunning, speed, toggleLocker, isComplete, autoAdvance, lockers])

  // Function to advance to next student manually
  const nextStudent = useCallback(() => {
    if (currentStudent < 100) {
      setCurrentAction('')
      setIsRunning(true)
      // Don't increment here - let the useEffect handle the student logic
    }
  }, [currentStudent])

  const openCount = lockers.filter(Boolean).length

  return (
    <div className="app">
      <div className="header">
        <h1>The Lockers Puzzle</h1>
        <p>Be amazed as 100 students open and close lockers!</p>
      </div>

      <div className="controls">
        <button 
          onClick={() => {
            if (!isRunning && currentStudent < 100) {
              if (studentFinished) {
                // If current student finished, advance to next student
                setCurrentStudent(prev => prev + 1)
                setStudentFinished(false)
              }
              setIsRunning(true)
            } else {
              // If running, pause
              setIsRunning(!isRunning)
            }
          }} 
          disabled={isComplete}
          className={isRunning ? 'pause' : 'play'}
        >
          {isRunning ? (
            <>
              <Pause size={16} /> Pause
            </>
          ) : currentStudent === 0 ? (
            <>
              <Play size={16} /> Start
            </>
          ) : (
            <>
              <Play size={16} /> Next Student
            </>
          )}
        </button>
        
        <button onClick={resetSimulation} className="reset">
          <RotateCcw size={16} /> Reset
        </button>

        <div className="auto-advance">
          <label>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
            />
            Auto-advance students
          </label>
        </div>

        <div className="speed-control">
          <label>Speed: </label>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}/10</span>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <strong>Current Student:</strong> {currentStudent + 1}/100
        </div>
        <div className="stat">
          <strong>Open Lockers:</strong> {openCount}
        </div>
        <div className="stat">
          <strong>Progress:</strong> {Math.round((currentStudent / 100) * 100)}%
        </div>
      </div>

      <div className="action-display">
        {currentAction}
      </div>

      <div className="hallway">
        <div className="lockers-grid">
          {lockers.map((isOpen, index) => (
            <motion.div
              key={index}
              className={`locker ${isOpen ? 'open' : 'closed'}`}
              initial={{ scale: 1 }}
              animate={{ 
                scale: studentPosition === index ? 1.1 : 1,
                backgroundColor: isOpen ? '#4CAF50' : '#f44336'
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="locker-number">{index + 1}</div>
              <motion.div 
                className="locker-door"
                animate={{ 
                  rotateY: isOpen ? -90 : 0 
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {!isComplete && (
            <motion.div
              className="student"
              initial={{ x: -50 }}
              animate={{
                x: `${(studentPosition % 10) * (gridSize.lockerSize + gridSize.gap) + gridSize.offset}px`,
                y: `${Math.floor(studentPosition / 10) * (gridSize.lockerSize + gridSize.gap) + gridSize.offset}px`
              }}
              exit={{ x: 650 }}
              transition={{ duration: 0.3 }}
            >
              🚶‍♂️
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isComplete && (
        <div className="completion-message-container">
          <motion.div 
            className="completion-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>🎉 Puzzle Complete!</h2>
            <p>After all 100 students have finished, <strong>{openCount}</strong> lockers remain open.</p>
            <p>Open lockers: {
              lockers.map((isOpen, index) => isOpen ? index + 1 : null)
                .filter(Boolean)
                .join(', ')
            }</p>
            <button onClick={resetSimulation} className="reset-button">
              <RotateCcw size={16} /> Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App
