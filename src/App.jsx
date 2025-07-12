import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react'
import { usePuzzle } from './usePuzzle'

function App() {
  const { state, dispatch } = usePuzzle()
  const { lockers, currentStep, running, autoAdvance, speed, isComplete } = state

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

  const openCount = lockers.filter(Boolean).length
  const student = currentStep?.student ?? 1
  const studentPosition = currentStep?.locker ?? -1
  const isDone = currentStep?.done ?? false

  // Generate current action message
  const getCurrentAction = () => {
    if (isComplete) return 'Simulation complete!'
    if (!currentStep) return 'Click Start to begin'
    if (isDone) return `Student ${student} finished. ${autoAdvance ? 'Auto-advancing...' : 'Click to continue with next student.'}`
    if (studentPosition === -1) return 'Click Start to begin'
    
    const lockerWasOpen = studentPosition >= 0 ? !lockers[studentPosition] : false
    const action = lockerWasOpen ? <ChevronDown size={16} color="#f44336" /> : <ChevronUp size={16} color="#4CAF50" />
    const actionText = lockerWasOpen ? 'closing' : 'opening'
    
    return (
      <span>
        Student {student} is {actionText} locker {studentPosition + 1} {action}
      </span>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>The Locker Puzzle</h1>
        <p>Be amazed as 100 students open and close lockers!</p>
      </div>

      <div className="controls">
        <button 
          onClick={() => dispatch({ type: running ? 'PAUSE' : 'PLAY' })}
          disabled={isComplete}
          className={running ? 'pause' : 'play'}
        >
          {running ? (
            <>
              <Pause size={16} /> Pause
            </>
          ) : student === 1 && studentPosition === -1 ? (
            <>
              <Play size={16} /> Start
            </>
          ) : (
            <>
              <Play size={16} /> Continue
            </>
          )}
        </button>
        
        <button onClick={() => dispatch({ type: 'RESET' })} className="reset">
          <RotateCcw size={16} /> Reset
        </button>

        <div className="auto-advance">
          <label>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={() => dispatch({ type: 'TOGGLE_AUTO' })}
            />
            Auto-advance students
          </label>
        </div>

        <div className="speed-control">
          <label>Speed: </label>
          <button 
            onClick={() => dispatch({ type: 'SET_SPEED', speed: Math.max(1, speed - 1) })}
            className="speed-button"
            disabled={speed <= 1}
          >
            −
          </button>
          <span className="speed-display">{speed.toString().padStart(2, ' ')}</span>
          <button 
            onClick={() => dispatch({ type: 'SET_SPEED', speed: Math.min(10, speed + 1) })}
            className="speed-button"
            disabled={speed >= 10}
          >
            +
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <strong>Current Student:</strong> {student}/100
        </div>
        <div className="stat">
          <strong>Open Lockers:</strong> {openCount}
        </div>
        <div className="stat">
          <strong>Progress:</strong> {Math.round(((student - 1) / 100) * 100)}%
        </div>
      </div>

      <div className="action-display">
        {getCurrentAction()}
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
          {!isComplete && studentPosition >= 0 && (
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
            <button onClick={() => dispatch({ type: 'RESET' })} className="reset-button">
              <RotateCcw size={16} /> Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App
