import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BackgroundDecorations } from './components/BackgroundIcons'

const API = import.meta.env.VITE_API_URL || '/api'
const AVATARS = ['🧒', '👧', '👦', '🧒🏽', '👧🏻', '👦🏾', '🦸', '🦹', '🧙', '🐱', '🐶', '🦊', '🐼', '🦄', '🐸']
// Animals for random popups
const ANIMALS = ['🐱', '🐶', '🦊', '🐼', '🦄', '🐸', '🐯', '🦁', '🐨', '🐻', '🐰', '🐹', '🐭', '🐷', '🐮', '🐴', '🦉', '🐤', '🐧', '🦆', '🐝', '🦋', '🐞', '🐢', '🐍', '🦎', '🐙', '🦑', '🐬', '🐳', '🦈', '🐊', '🦓', '🦒', '🐘', '🦏', '🦛', '🐪', '🐫', '🦘', '🦌', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🦅', '🦆', '🦢', '🦉', '🦚', '🦜', '🐦', '🐤', '🐧', '🦇', '🦝', '🦡', '🐾']
// Objects for counting mode
const COUNTING_OBJECTS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🥝', '🍒', '🍐', '🥭', '🍍', '⭐', '🌟', '💫', '✨', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍪', '🍩', '🍭', '🍬', '🍫', '🌺', '🌻', '🌷', '🌹', '🌸', '🌼', '🌿', '🍀', '🦋', '🐛', '🐝', '🐞', '🦗', '🕷️', '🦂', '🐜', '🦟', '🦠', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔳', '🔲', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜']
const PROBLEM_TYPES = [
  { id: 'addition', label: '➕ Add' },
  { id: 'subtraction', label: '➖ Sub' },
  { id: 'multiplication', label: '✖️ Mult' },
  { id: 'mixed', label: '🎲 Mix' },
]
const TIMED_DURATION = 60 // seconds
const DIFFICULTY_NAMES = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master']
const DIFFICULTY_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#9333ea']

// ============ SOUND EFFECTS ============
const AudioContext = window.AudioContext || window.webkitAudioContext
let audioCtx = null

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

const playSound = (type) => {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    switch (type) {
      case 'correct':
        // Happy ascending tone
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.4)
        break

      case 'wrong':
        // Sad descending tone
        oscillator.frequency.setValueAtTime(311.13, ctx.currentTime) // Eb4
        oscillator.frequency.setValueAtTime(261.63, ctx.currentTime + 0.15) // C4
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
        break

      case 'streak':
        // Exciting multi-tone
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime)
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08)
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16)
        oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24) // C6
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
        break

      case 'achievement':
        // Fanfare
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime)
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3)
        oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45)

        osc2.frequency.setValueAtTime(261.63, ctx.currentTime)
        osc2.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15)
        osc2.frequency.setValueAtTime(392.00, ctx.currentTime + 0.3)
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.45)

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
        gain2.gain.setValueAtTime(0.15, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.8)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.8)
        break

      case 'tick':
        // Quick tick for timer
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.05)
        break

      case 'timesup':
        // Game over sound
        oscillator.frequency.setValueAtTime(400, ctx.currentTime)
        oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.4)
        oscillator.type = 'square'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.6)
        break

      case 'start':
        // Start game sound
        oscillator.frequency.setValueAtTime(440, ctx.currentTime)
        oscillator.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.35)
        break

      case 'click':
        // UI click
        oscillator.frequency.setValueAtTime(800, ctx.currentTime)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.05)
        break

      case 'levelup':
        // Level up - triumphant ascending
        oscillator.frequency.setValueAtTime(392, ctx.currentTime) // G4
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1) // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3) // G5
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
        break

      case 'leveldown':
        // Level down - gentle descending
        oscillator.frequency.setValueAtTime(392, ctx.currentTime) // G4
        oscillator.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15) // E4
        oscillator.frequency.setValueAtTime(261.63, ctx.currentTime + 0.3) // C4
        oscillator.type = 'triangle'
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.45)
        break
    }
  } catch (e) {
    // Audio not supported, ignore
  }
}

// Auth helper functions
const getToken = () => localStorage.getItem('mathapp_token')
const setToken = (token) => localStorage.setItem('mathapp_token', token)
const clearToken = () => localStorage.removeItem('mathapp_token')
const getSoundEnabled = () => localStorage.getItem('mathapp_sound') !== 'false'
const setSoundEnabled = (enabled) => localStorage.setItem('mathapp_sound', enabled)
const getTheme = () => localStorage.getItem('mathapp_theme') || 'light'
const setThemeStorage = (theme) => localStorage.setItem('mathapp_theme', theme)

const authFetch = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }
  return fetch(url, { ...options, headers })
}

// PIN Input Component
function PinInput({ value, onChange, length = 4, autoFocus = true }) {
  const inputRefs = useRef([])

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return

    const newValue = value.split('')
    newValue[index] = digit.slice(-1)
    const newPin = newValue.join('').slice(0, length)
    onChange(newPin)

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(paste)
  }

  return (
    <div className="pin-input">
      {Array(length).fill(0).map((_, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && i === 0}
          className="pin-digit"
        />
      ))}
    </div>
  )
}

export default function App() {
  // Auth state
  const [authState, setAuthState] = useState('loading')
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [loginUsername, setLoginUsername] = useState('')
  const [pin, setPin] = useState('')
  const [authError, setAuthError] = useState('')
  const [toppers, setToppers] = useState([])
  const [loadingToppers, setLoadingToppers] = useState(false)

  // Registration state
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAvatar, setNewAvatar] = useState('🧒')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  // Game state
  const [stats, setStats] = useState(null)
  const [problemType, setProblemType] = useState('addition')
  const [problem, setProblem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [achievement, setAchievement] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const inputRef = useRef(null)

  // Auto-difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState(1)
  const [recentAnswers, setRecentAnswers] = useState([]) // Track last 5 answers
  const [difficultyChange, setDifficultyChange] = useState(null) // 'up', 'down', or null

  // Game mode state
  const [gameMode, setGameMode] = useState('practice') // practice, timed, daily, count, results
  const [timeLeft, setTimeLeft] = useState(TIMED_DURATION)
  const [timedScore, setTimedScore] = useState({ correct: 0, total: 0 })
  const timerRef = useRef(null)

  // Count mode state
  const [countProblem, setCountProblem] = useState(null) // { objects: [], answer: number }

  // Daily challenge state
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)

  // Avatar state
  const [avatars, setAvatars] = useState([])
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [newAvatarUnlock, setNewAvatarUnlock] = useState(null)

  // Sound state
  const [soundEnabled, setSoundState] = useState(getSoundEnabled())

  // Theme state
  const [theme, setTheme] = useState(getTheme())

  // Random animals popup state
  const [animals, setAnimals] = useState([])

  const sound = useCallback((type) => {
    if (soundEnabled) playSound(type)
  }, [soundEnabled])

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundState(newState)
    setSoundEnabled(newState)
    if (newState) playSound('click')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setThemeStorage(newTheme)
    sound('click')
  }

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken()
      if (!token) {
        setAuthState('login')
        return
      }

      try {
        const res = await authFetch(`${API}/auth/validate`)
        const data = await res.json()

        if (data.valid && data.player) {
          setCurrentPlayer(data.player)
          setAuthState('authenticated')
          const statsRes = await authFetch(`${API}/players/${data.player.id}/stats`)
          const statsData = await statsRes.json()
          setStats(statsData)
          // Initialize difficulty from saved progress
          const progress = statsData.progress?.find(p => p.problem_type === 'addition')
          setCurrentDifficulty(progress?.difficulty || 1)
        } else {
          clearToken()
          setAuthState('login')
        }
      } catch (e) {
        clearToken()
        setAuthState('login')
      }
    }

    checkAuth()
  }, [])

  // Fetch toppers for login/register screen
  useEffect(() => {
    if (authState === 'login' || authState === 'register') {
      setLoadingToppers(true)
      fetch(`${API}/leaderboard?limit=3`)
        .then(res => res.json())
        .then(data => {
          setToppers(data)
          setLoadingToppers(false)
        })
        .catch(() => {
          setToppers([])
          setLoadingToppers(false)
        })
    }
  }, [authState])

  // Timer effect for timed mode
  useEffect(() => {
    if (gameMode === 'timed' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            sound('timesup')
            setGameMode('results')
            return 0
          }
          if (prev <= 10) sound('tick')
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timerRef.current)
    }
  }, [gameMode, sound])

  // Load problem when type changes or after answer
  useEffect(() => {
    if (currentPlayer && !feedback && authState === 'authenticated' && gameMode !== 'results' && gameMode !== 'daily' && gameMode !== 'count') {
      loadProblem()
    }
  }, [currentPlayer, problemType, authState, gameMode])

  // Load daily challenge
  const loadDailyChallenge = async () => {
    try {
      const res = await authFetch(`${API}/daily-challenge`)
      const data = await res.json()
      setDailyChallenge(data)

      const statsRes = await authFetch(`${API}/daily-challenge/stats`)
      setDailyStats(await statsRes.json())
    } catch (err) {
      console.error('Failed to load daily challenge:', err)
    }
  }

  // Load avatars
  const loadAvatars = async () => {
    try {
      const res = await authFetch(`${API}/avatars`)
      setAvatars(await res.json())
    } catch (err) {
      console.error('Failed to load avatars:', err)
    }
  }

  // Load daily challenge and avatars when authenticated
  useEffect(() => {
    if (authState === 'authenticated' && currentPlayer) {
      loadDailyChallenge()
      loadAvatars()
    }
  }, [authState, currentPlayer])

  // Random animal popups - spawn animals randomly during gameplay
  useEffect(() => {
    if (authState !== 'authenticated' || gameMode === 'results') return

    let timeoutId = null

    const spawnAnimal = () => {
      // Random delay between 3-8 seconds
      const delay = Math.random() * 5000 + 3000

      timeoutId = setTimeout(() => {
        // Random animal
        const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]

        // Random position (strictly avoid center interaction area: 30-65% vertical, 15-85% horizontal)
        // Only show in top, bottom, and side areas
        let top, left
        let attempts = 0
        do {
          // Prefer edges: top 0-30%, bottom 65-100%, or sides
          const area = Math.random()
          if (area < 0.33) {
            // Top area
            top = Math.random() * 30
            left = Math.random() * 100
          } else if (area < 0.66) {
            // Bottom area
            top = 65 + Math.random() * 35
            left = Math.random() * 100
          } else {
            // Side areas (left or right)
            top = Math.random() * 100
            if (Math.random() < 0.5) {
              left = Math.random() * 15 // Left side
            } else {
              left = 85 + Math.random() * 15 // Right side
            }
          }
          attempts++
        } while (
          (top >= 30 && top <= 65 && left >= 15 && left <= 85) && attempts < 50 // Center area - avoid strictly
        )

        const id = Date.now() + Math.random()
        const newAnimal = { id, animal, top, left }

        setAnimals(prev => [...prev, newAnimal])

        // Remove animal after 3 seconds
        setTimeout(() => {
          setAnimals(prev => prev.filter(a => a.id !== id))
        }, 3000)

        // Schedule next animal
        spawnAnimal()
      }, delay)
    }

    spawnAnimal()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [authState, gameMode])

  const loadProblem = async () => {
    try {
      const difficulty = getDifficulty()
      const res = await authFetch(`${API}/problem?type=${problemType}&difficulty=${difficulty}&playerId=${currentPlayer.id}`)
      const data = await res.json()
      setProblem(data)
      setAnswer('')
      setFeedback(null)
      setStartTime(Date.now())
      // Focus the input after a brief delay to ensure DOM is updated
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.disabled = false
          inputRef.current.focus()
        }
      }, 50)
    } catch (err) {
      console.error('Failed to load problem:', err)
    }
  }

  // Smart difficulty calculation based on recent performance
  const calculateDifficulty = useCallback(() => {
    // If we have recent answers, use them for faster adjustment
    if (recentAnswers.length >= 3) {
      const recentCorrect = recentAnswers.filter(a => a).length
      const recentAccuracy = recentCorrect / recentAnswers.length

      // Got 4+ out of last 5 correct? Level up!
      if (recentAnswers.length >= 5 && recentCorrect >= 4 && currentDifficulty < 5) {
        return currentDifficulty + 1
      }
      // Got 3+ out of last 5 wrong? Level down
      if (recentAnswers.length >= 5 && recentCorrect <= 2 && currentDifficulty > 1) {
        return currentDifficulty - 1
      }
      // Got 3 in a row correct? Consider leveling up
      if (recentAnswers.slice(-3).every(a => a) && currentDifficulty < 5) {
        const progress = stats?.progress.find(p => p.problem_type === problemType)
        if (progress && progress.total >= 5) {
          return currentDifficulty + 1
        }
      }
      // Got 3 in a row wrong? Level down
      if (recentAnswers.slice(-3).every(a => !a) && currentDifficulty > 1) {
        return currentDifficulty - 1
      }
    }

    // Fall back to overall stats
    if (!stats) return currentDifficulty
    const progress = stats.progress.find(p => p.problem_type === problemType)
    if (!progress) return 1

    return progress.difficulty || 1
  }, [recentAnswers, currentDifficulty, stats, problemType])

  const getDifficulty = () => currentDifficulty

  // Update difficulty after each answer
  const updateDifficulty = useCallback((wasCorrect) => {
    const newAnswers = [...recentAnswers, wasCorrect].slice(-5) // Keep last 5
    setRecentAnswers(newAnswers)

    const newDifficulty = (() => {
      const recentCorrect = newAnswers.filter(a => a).length

      // Got 4+ out of last 5 correct? Level up!
      if (newAnswers.length >= 5 && recentCorrect >= 4 && currentDifficulty < 5) {
        return currentDifficulty + 1
      }
      // Got 3+ out of last 5 wrong? Level down
      if (newAnswers.length >= 5 && recentCorrect <= 2 && currentDifficulty > 1) {
        return currentDifficulty - 1
      }
      // Got 3 in a row correct at full recent history? Consider leveling up
      if (newAnswers.length >= 3 && newAnswers.slice(-3).every(a => a) && currentDifficulty < 5) {
        return currentDifficulty + 1
      }
      // Got 3 in a row wrong? Level down
      if (newAnswers.length >= 3 && newAnswers.slice(-3).every(a => !a) && currentDifficulty > 1) {
        return currentDifficulty - 1
      }
      return currentDifficulty
    })()

    if (newDifficulty !== currentDifficulty) {
      setCurrentDifficulty(newDifficulty)
      setDifficultyChange(newDifficulty > currentDifficulty ? 'up' : 'down')
      setTimeout(() => setDifficultyChange(null), 2000)
      return newDifficulty > currentDifficulty ? 'up' : 'down'
    }
    return null
  }, [recentAnswers, currentDifficulty])

  const startTimedMode = () => {
    sound('start')
    setGameMode('timed')
    setTimeLeft(TIMED_DURATION)
    setTimedScore({ correct: 0, total: 0 })
    setFeedback(null)
    loadProblem()
  }

  const exitTimedMode = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
    setFeedback(null)
    // Don't change gameMode here - let the calling function handle it
  }

  const startDailyChallenge = async () => {
    sound('start')
    await loadDailyChallenge()
    setGameMode('daily')
    setAnswer('')
    setFeedback(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const exitDailyChallenge = () => {
    setFeedback(null)
    // Don't change gameMode here - let the calling function handle it
  }

  // Generate counting problem
  const generateCountProblem = () => {
    // Difficulty determines how many objects (1-5: 3-15 objects)
    const minCount = 3 + (currentDifficulty - 1) * 2
    const maxCount = 5 + currentDifficulty * 2
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount

    // Select random object emoji
    const objectEmoji = COUNTING_OBJECTS[Math.floor(Math.random() * COUNTING_OBJECTS.length)]

    // Create array of objects (some randomization in arrangement)
    const objects = Array(count).fill(objectEmoji)

    // Shuffle positions slightly for visual interest
    const shuffled = [...objects].sort(() => Math.random() - 0.5)

    setCountProblem({
      objects: shuffled,
      answer: count,
      emoji: objectEmoji
    })
    setAnswer('')
    setFeedback(null)
    setStartTime(Date.now())
  }

  const startCountMode = () => {
    sound('start')
    setGameMode('count')
    setCurrentDifficulty(1)
    setRecentAnswers([])
    generateCountProblem()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const exitCountMode = () => {
    setCountProblem(null)
    setFeedback(null)
    // Don't set gameMode here - let the calling function handle mode switching
  }

  const submitDailyAnswer = async () => {
    if (!answer.trim() || !dailyChallenge?.currentProblem) return

    const res = await authFetch(`${API}/daily-challenge/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer, problemIndex: dailyChallenge.problemsCompleted })
    })

    const result = await res.json()

    if (result.correct) {
      sound(result.completed ? 'achievement' : 'correct')
      setFeedback({ correct: true, message: result.message, bonusXp: result.bonusXp })

      // Auto-dismiss feedback popup after 2.5 seconds
      setTimeout(() => {
        setFeedback(null)
      }, 2500)

      // Show new avatar unlocks
      if (result.newAvatars?.length > 0) {
        setNewAvatarUnlock(result.newAvatars[0])
        setTimeout(() => setNewAvatarUnlock(null), 4000)
        loadAvatars()
      }

      // Update stats
      const statsRes = await authFetch(`${API}/players/${currentPlayer.id}/stats`)
      setStats(await statsRes.json())

      // Reload daily challenge
      setTimeout(async () => {
        await loadDailyChallenge()
        setAnswer('')
        setFeedback(null)
        if (!result.completed) {
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      }, 1500)
    } else {
      sound('wrong')
      setFeedback({ correct: false, message: result.message, correctAnswer: result.correctAnswer })

      // Auto-dismiss feedback popup after 4.5 seconds for wrong answers
      // This gives players more time to see the correct answer
      setTimeout(() => {
        setFeedback(null)
      }, 4500)
    }
  }

  const selectAvatar = async (avatarId) => {
    const res = await authFetch(`${API}/avatars/select`, {
      method: 'POST',
      body: JSON.stringify({ avatarId })
    })

    const result = await res.json()
    if (result.success) {
      sound('click')
      setCurrentPlayer({ ...currentPlayer, avatar: result.avatar })
      setShowAvatarModal(false)
    }
  }

  const handleLogin = async () => {
    if (!loginUsername.trim()) {
      setAuthError('Please enter your player name')
      return
    }
    if (pin.length < 4) {
      setAuthError('Please enter your 4-digit PIN')
      return
    }

    setAuthError('')
    sound('click')

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), pin })
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Login failed')
        sound('wrong')
        setPin('')
        return
      }

      setToken(data.token)
      setCurrentPlayer(data.player)
      setAuthState('authenticated')
      setPin('')
      setLoginUsername('')
      sound('correct')

      const statsRes = await authFetch(`${API}/players/${data.player.id}/stats`)
      const statsData = await statsRes.json()
      setStats(statsData)
      const progress = statsData.progress?.find(p => p.problem_type === problemType)
      setCurrentDifficulty(progress?.difficulty || 1)
      setRecentAnswers([])
    } catch (e) {
      setAuthError('Login failed. Please try again.')
      setPin('')
    }
  }

  const handleRegister = async () => {
    if (!newUsername.trim()) {
      setAuthError('Please enter a player name')
      return
    }
    if (!newEmail.trim()) {
      setAuthError('Please enter your email')
      return
    }
    if (newPin.length < 4) {
      setAuthError('PIN must be at least 4 digits')
      return
    }
    if (newPin !== confirmPin) {
      setAuthError('PINs do not match')
      return
    }

    setAuthError('')
    sound('click')

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: newEmail.trim(),
          avatar: newAvatar,
          pin: newPin
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Registration failed')
        return
      }

      setToken(data.token)
      setCurrentPlayer(data.player)

      // Reset form
      setNewUsername('')
      setNewEmail('')
      setNewAvatar('🧒')
      setNewPin('')
      setConfirmPin('')

      // Load stats for new player
      try {
        const statsRes = await authFetch(`${API}/players/${data.player.id}/stats`)
        const statsData = await statsRes.json()
        setStats(statsData)
        setCurrentDifficulty(1) // New player starts at difficulty 1
        setRecentAnswers([])
      } catch (err) {
        // New player has no stats yet, that's ok
        setStats({ progress: [], achievements: [], summary: { totalXP: 0, totalCorrect: 0, totalProblems: 0, accuracy: 0, level: 1 } })
        setCurrentDifficulty(1)
        setRecentAnswers([])
      }

      setAuthState('authenticated')
      sound('achievement')
    } catch (e) {
      setAuthError('Registration failed. Please try again.')
    }
  }

  const handleLogout = async () => {
    sound('click')
    try {
      await authFetch(`${API}/auth/logout`, { method: 'POST' })
    } catch (e) { }

    clearToken()
    setCurrentPlayer(null)
    setStats(null)
    setProblem(null)
    setGameMode('practice')
    setLoginUsername('')
    setPin('')
    setAuthState('login')
  }

  const submitCountAnswer = async () => {
    if (!answer.trim() || !countProblem) return

    const timeMs = Date.now() - startTime
    const userAnswer = parseInt(answer.trim())
    const isCorrect = userAnswer === countProblem.answer

    // Update recent answers for difficulty tracking
    const newAnswers = [...recentAnswers, isCorrect].slice(-5)
    setRecentAnswers(newAnswers)

    // Create feedback result similar to math problems
    const result = {
      correct: isCorrect,
      message: isCorrect ? 'Correct!' : `The answer was ${countProblem.answer}`,
      xpGained: isCorrect ? 10 * currentDifficulty : 0,
      streak: isCorrect ? (newAnswers.filter(a => a).length) : 0
    }

    setFeedback(result)

    // Auto-dismiss feedback popup - longer delay for wrong answers
    const feedbackDuration = result.correct ? 2500 : 4500
    setTimeout(() => {
      setFeedback(null)
    }, feedbackDuration)

    // Update difficulty based on answer
    const diffChange = updateDifficulty(isCorrect)

    // Play sound
    if (diffChange === 'up') {
      sound('levelup')
    } else if (diffChange === 'down') {
      sound('leveldown')
    } else if (result.correct) {
      if (result.streak >= 5) {
        sound('streak')
      } else {
        sound('correct')
      }
    } else {
      sound('wrong')
    }

    // Update stats
    try {
      const statsRes = await authFetch(`${API}/players/${currentPlayer.id}/stats`)
      setStats(await statsRes.json())
    } catch (err) {
      console.error('Failed to load stats:', err)
    }

    // Next problem
    const delay = result.correct ? 1500 : 5000
    setTimeout(() => {
      if (gameMode === 'count') {
        setFeedback(null)
        generateCountProblem()
      }
    }, delay)
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !problem) return
    if (gameMode === 'results' || gameMode === 'count') return

    const timeMs = Date.now() - startTime
    const res = await authFetch(`${API}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: currentPlayer.id,
        problem: problem.problem,
        correctAnswer: problem.answer,
        userAnswer: answer,
        type: problem.type,
        difficulty: problem.difficulty,
        timeMs
      })
    })

    const result = await res.json()
    setFeedback(result)

    // Auto-dismiss feedback popup - longer delay for wrong answers so players can see the correct answer
    const feedbackDuration = result.correct ? 2500 : 4500 // 2.5s for correct, 4.5s for wrong
    setTimeout(() => {
      setFeedback(null)
    }, feedbackDuration)

    // Update timed mode score
    if (gameMode === 'timed') {
      setTimedScore(prev => ({
        correct: prev.correct + (result.correct ? 1 : 0),
        total: prev.total + 1
      }))
    }

    // Update difficulty based on answer
    const diffChange = updateDifficulty(result.correct)

    // Play sound
    if (diffChange === 'up') {
      sound('levelup')
    } else if (diffChange === 'down') {
      sound('leveldown')
    } else if (result.correct) {
      if (result.streak >= 5) {
        sound('streak')
      } else {
        sound('correct')
      }
    } else {
      sound('wrong')
    }

    // Update stats
    const statsRes = await authFetch(`${API}/players/${currentPlayer.id}/stats`)
    setStats(await statsRes.json())

    // Show achievement
    if (result.newAchievements?.length > 0) {
      sound('achievement')
      setAchievement(result.newAchievements[0])
      setTimeout(() => setAchievement(null), 3000)
    }

    // Show new avatar unlocks
    if (result.newAvatars?.length > 0) {
      setTimeout(() => {
        setNewAvatarUnlock(result.newAvatars[0])
        setTimeout(() => setNewAvatarUnlock(null), 4000)
      }, result.newAchievements?.length > 0 ? 3500 : 500)
      loadAvatars()
    }

    // Next problem
    // Longer delay for wrong answers so players can see the correct answer
    const delay = gameMode === 'timed'
      ? (result.correct ? 300 : 1000) // Timed mode: 300ms correct, 1000ms wrong
      : (result.correct ? 1500 : 5000) // Practice mode: 1.5s correct, 5s wrong
    setTimeout(() => {
      if (gameMode !== 'results') {
        setFeedback(null) // Reset feedback first to re-enable input
        loadProblem()
      }
    }, delay)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') submitAnswer()
  }


  // Loading Screen
  if (authState === 'loading') {
    return (
      <div className="app">
        <BackgroundDecorations />
        <div className="loading-screen">
          <div className="loading-emoji">🧮</div>
          <p>Loading...</p>
        </div>
        <footer className="copyright-footer">
          © {new Date().getFullYear()} Math Adventure. Made with ❤️ for young learners.
        </footer>
      </div>
    )
  }

  // Login Screen
  if (authState === 'login') {
    return (
      <div className="app">
        <BackgroundDecorations />
        {/* Loading Backdrop - Disables page interaction when loading leaderboard */}
        {loadingToppers && <div className="leaderboard-loading-backdrop" />}
        
        <div className="auth-screen">
          <h1>🧮 Math Adventure</h1>
          <p className="subtitle">Welcome back!</p>

          {/* Hide login form when loading leaderboard */}
          {!loadingToppers && (
            <div className="login-form">
              <div className="input-group">
                <label>Player Name</label>
                <input
                  type="text"
                  placeholder="Enter your player name"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>PIN</label>
                <PinInput value={pin} onChange={setPin} autoFocus={false} />
              </div>

              {authError && <p className="error">{authError}</p>}

              <button
                className="btn btn-primary"
                onClick={handleLogin}
                disabled={!loginUsername.trim() || pin.length < 4}
              >
                Let's Go! 🚀
              </button>

              <div className="auth-divider">
                <span>New here?</span>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => { setAuthState('register'); setAuthError(''); sound('click'); }}
              >
                Create New Player ➕
              </button>
            </div>
          )}

          {/* Toppers Showcase */}
          <div className="toppers-showcase">
            <h3>🏆 Top Players</h3>
            {loadingToppers ? (
              <div className="toppers-loading">
                <div className="loading-spinner">🧮</div>
                <p>Loading leaderboard...</p>
              </div>
            ) : toppers.length > 0 ? (
              <div className="toppers-list">
                {toppers.map((topper, index) => (
                  <div key={topper.id} className={`topper-card rank-${index + 1}`}>
                    <div className="topper-rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                    <div className="topper-avatar">{topper.avatar}</div>
                    <div className="topper-info">
                      <div className="topper-name">{topper.username}</div>
                      <div className="topper-stats">
                        <span>Lv.{topper.level}</span>
                        <span>•</span>
                        <span>{topper.totalXP} XP</span>
                        <span>•</span>
                        <span>{topper.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <footer className="copyright-footer">
          © {new Date().getFullYear()} Math Adventure. Made with ❤️ for young learners.
        </footer>
      </div>
    )
  }

  // Register Screen
  if (authState === 'register') {
    return (
      <div className="app">
        <BackgroundDecorations />
        <div className="auth-screen">
          <h1>🎮 Create Player</h1>

          <div className="register-form">
            <div className="avatar-picker">
              {AVATARS.map(a => (
                <span
                  key={a}
                  className={`avatar-option ${a === newAvatar ? 'selected' : ''}`}
                  onClick={() => { setNewAvatar(a); sound('click'); }}
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="input-group">
              <label>Player Name *</label>
              <input
                type="text"
                placeholder="Choose a player name"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                autoFocus
              />
              <small className="input-hint">3-20 characters, letters, numbers, underscore only</small>
            </div>

            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Create a PIN (4+ digits) *</label>
              <PinInput value={newPin} onChange={setNewPin} autoFocus={false} />
            </div>

            <div className="input-group">
              <label>Confirm PIN *</label>
              <PinInput value={confirmPin} onChange={setConfirmPin} autoFocus={false} />
            </div>

            {authError && <p className="error">{authError}</p>}

            <button className="btn btn-primary" onClick={handleRegister}>
              Create Player 🚀
            </button>
            <button className="btn btn-secondary" onClick={() => { setAuthState('login'); setAuthError(''); sound('click'); }}>
              ← Back to Login
            </button>
          </div>
        </div>

        <footer className="copyright-footer">
          © {new Date().getFullYear()} Math Adventure. Made with ❤️ for young learners.
        </footer>
      </div>
    )
  }

  // Timed Mode Results Screen
  if (gameMode === 'results') {
    const accuracy = timedScore.total > 0 ? Math.round((timedScore.correct / timedScore.total) * 100) : 0
    return (
      <div className="app">
        <BackgroundDecorations />
        <div className="results-screen">
          <h1>⏱️ Time's Up!</h1>

          <div className="results-card">
            <div className="results-score">
              <div className="big-number">{timedScore.correct}</div>
              <div className="score-label">Correct Answers</div>
            </div>

            <div className="results-stats">
              <div className="result-stat">
                <span className="stat-icon">📝</span>
                <span>{timedScore.total} attempted</span>
              </div>
              <div className="result-stat">
                <span className="stat-icon">🎯</span>
                <span>{accuracy}% accuracy</span>
              </div>
            </div>

            <div className="results-message">
              {timedScore.correct >= 15 ? '🌟 Amazing! You\'re a math superstar!' :
                timedScore.correct >= 10 ? '🎉 Great job! Keep practicing!' :
                  timedScore.correct >= 5 ? '👍 Good effort! You\'re improving!' :
                    '💪 Keep trying! Practice makes perfect!'}
            </div>

            <button className="btn btn-primary" onClick={startTimedMode}>
              🔄 Play Again
            </button>
            <button className="btn btn-secondary" onClick={() => { exitTimedMode(); setGameMode('practice'); loadProblem(); }}>
              ← Back to Practice
            </button>
          </div>
        </div>

        <footer className="copyright-footer">
          © {new Date().getFullYear()} Math Adventure. Made with ❤️ for young learners.
        </footer>
      </div>
    )
  }

  // Game Screen (authenticated)
  return (
    <div className={`app ${feedback ? 'feedback-active' : ''}`}>
      <BackgroundDecorations />

      {/* Random Animal Popups */}
      {animals.map(animal => (
        <div
          key={animal.id}
          className="random-animal"
          style={{
            top: `${animal.top}%`,
            left: `${animal.left}%`,
          }}
        >
          {animal.animal}
        </div>
      ))}
      {achievement && (
        <div className="achievement-popup">
          <h3>🏆 Achievement Unlocked!</h3>
          <div>{achievement.name}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{achievement.desc}</div>
        </div>
      )}

      {newAvatarUnlock && (
        <div className="avatar-unlock-popup">
          <h3>🎨 New Avatar Unlocked!</h3>
          <div className="unlock-emoji">{newAvatarUnlock.emoji}</div>
          <div>{newAvatarUnlock.name}</div>
        </div>
      )}

      {/* Feedback Backdrop - Dims background when feedback is shown */}
      {feedback && <div className="feedback-backdrop" />}

      {/* Feedback Popup - Shows answer result */}
      {feedback && (
        <div className={`feedback-popup ${feedback.correct ? 'correct' : 'incorrect'}`}>
          {feedback.correct ? (
            <>
              <div className="feedback-icon">✓</div>
              <div className="feedback-message">
                {gameMode === 'daily' ? feedback.message : '🎉 Great job!'}
                {feedback.streak > 1 && <div className="streak-display">🔥 {feedback.streak} in a row!</div>}
                {feedback.xpGained > 0 && <div className="xp-gain">+{feedback.xpGained} XP</div>}
                {feedback.bonusXp && <div className="xp-gain">+{feedback.bonusXp} Bonus XP!</div>}
              </div>
            </>
          ) : (
            <>
              <div className="feedback-icon">✗</div>
              <div className="feedback-message">
                {gameMode === 'daily' ? feedback.message : `The answer was ${problem?.answer || feedback.correctAnswer || 'N/A'}`}
                <div className="streak-display">Keep trying! 💪</div>
              </div>
            </>
          )}
        </div>
      )}

      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal" onClick={e => e.stopPropagation()}>
            <h2>🎨 Choose Your Avatar</h2>
            <p className="modal-subtitle">Unlock more by playing!</p>

            <div className="avatar-grid">
              {avatars.map(avatar => (
                <div
                  key={avatar.id}
                  className={`avatar-item ${avatar.unlocked ? 'unlocked' : 'locked'} ${currentPlayer.avatar === avatar.emoji ? 'current' : ''}`}
                  onClick={() => avatar.unlocked && selectAvatar(avatar.id)}
                >
                  <span className="avatar-emoji">{avatar.unlocked ? avatar.emoji : '🔒'}</span>
                  <span className="avatar-name">{avatar.name}</span>
                  {!avatar.unlocked && avatar.progress && (
                    <div className="avatar-progress">
                      <div className="avatar-progress-bar">
                        <div
                          className="avatar-progress-fill"
                          style={{ width: `${Math.min(100, (avatar.progress.current / avatar.progress.required) * 100)}%` }}
                        />
                      </div>
                      <span className="avatar-progress-text">{avatar.progress.current}/{avatar.progress.required}</span>
                    </div>
                  )}
                  {!avatar.unlocked && avatar.desc && (
                    <span className="avatar-requirement">{avatar.desc}</span>
                  )}
                  {currentPlayer.avatar === avatar.emoji && <span className="current-badge">✓</span>}
                </div>
              ))}
            </div>

            <button className="btn btn-secondary modal-close" onClick={() => setShowAvatarModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="game-screen">
        <div className="header">
          <div className="player-info" onClick={() => { setShowAvatarModal(true); sound('click'); }} title="Change Avatar">
            <span className="avatar clickable">{currentPlayer.avatar}</span>
            <span className="name">{currentPlayer.username}</span>
          </div>
          <div className="header-buttons">
            <button className="icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="icon-btn" onClick={toggleSound} title={soundEnabled ? 'Mute' : 'Unmute'}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${gameMode === 'practice' ? 'active' : ''}`}
            onClick={() => {
              if (gameMode !== 'practice') {
                if (gameMode === 'timed') exitTimedMode();
                if (gameMode === 'daily') exitDailyChallenge();
                if (gameMode === 'count') exitCountMode();
                setGameMode('practice');
                loadProblem();
              }
            }}
          >
            📚 Practice
          </button>
          <button
            className={`mode-btn ${gameMode === 'timed' ? 'active' : ''}`}
            onClick={() => {
              if (gameMode !== 'timed') {
                if (gameMode === 'daily') exitDailyChallenge();
                if (gameMode === 'count') exitCountMode();
                startTimedMode();
              }
            }}
          >
            ⏱️ Timed
          </button>
          <button
            className={`mode-btn daily ${gameMode === 'daily' ? 'active' : ''} ${dailyChallenge?.completed ? 'completed' : ''}`}
            onClick={() => {
              if (gameMode !== 'daily' && !dailyChallenge?.completed) {
                if (gameMode === 'timed') exitTimedMode();
                if (gameMode === 'count') exitCountMode();
                startDailyChallenge();
              }
            }}
            disabled={dailyChallenge?.completed}
          >
            🌟 Daily {dailyChallenge?.completed && '✓'}
          </button>
          <button
            className={`mode-btn ${gameMode === 'count' ? 'active' : ''}`}
            onClick={() => {
              if (gameMode !== 'count') {
                if (gameMode === 'timed') exitTimedMode();
                if (gameMode === 'daily') exitDailyChallenge();
                startCountMode();
              }
            }}
          >
            🔢 Count
          </button>
        </div>

        {/* Timer Display (Timed Mode) */}
        {gameMode === 'timed' && (
          <div className={`timer-display ${timeLeft <= 10 ? 'urgent' : ''}`}>
            <div className="timer-value" key={timeLeft}>{timeLeft}s</div>
            <div className="timer-score">Score: {timedScore.correct}/{timedScore.total}</div>
          </div>
        )}

        {/* Stats Bar (Practice Mode) */}
        {gameMode === 'practice' && stats && (
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-value">Lv.{stats.summary.level}</div>
              <div className="stat-label">Level</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats.summary.totalXP}</div>
              <div className="stat-label">XP</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats.summary.accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats.achievements.length}</div>
              <div className="stat-label">🏆</div>
            </div>
          </div>
        )}

        {/* Daily Challenge Progress (when in daily mode) */}
        {gameMode === 'daily' && dailyChallenge && (
          <div className="daily-progress">
            <div className="daily-header">
              <span className="daily-title">🌟 Daily Challenge</span>
              <span className="daily-count">{dailyChallenge.problemsCompleted}/{dailyChallenge.totalProblems}</span>
            </div>
            <div className="daily-progress-bar">
              <div
                className="daily-progress-fill"
                style={{ width: `${(dailyChallenge.problemsCompleted / dailyChallenge.totalProblems) * 100}%` }}
              />
            </div>
            {dailyStats && (
              <div className="daily-stats-mini">
                <span>🔥 {dailyStats.currentStreak} day streak</span>
                <span>✨ {dailyStats.totalBonusXp} bonus XP</span>
              </div>
            )}
          </div>
        )}

        {gameMode !== 'daily' && gameMode !== 'count' && (
          <div className="type-selector">
            {PROBLEM_TYPES.map(t => (
              <button
                key={t.id}
                className={`type-btn ${problemType === t.id ? 'active' : ''}`}
                onClick={() => {
                  setProblemType(t.id);
                  setFeedback(null);
                  setRecentAnswers([]); // Reset tracking for new type
                  const progress = stats?.progress.find(p => p.problem_type === t.id)
                  setCurrentDifficulty(progress?.difficulty || 1)
                  sound('click');
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Count Mode Problem */}
        {gameMode === 'count' && countProblem && (
          <div className="problem-card count-card">
            <div className={`difficulty-display ${difficultyChange ? `change-${difficultyChange}` : ''}`}>
              <div className="difficulty-bar">
                {[1, 2, 3, 4, 5].map(d => (
                  <div
                    key={d}
                    className={`difficulty-dot ${d <= currentDifficulty ? 'active' : ''}`}
                    style={d <= currentDifficulty ? { background: DIFFICULTY_COLORS[currentDifficulty] } : {}}
                  />
                ))}
              </div>
              <div className="difficulty-label" style={{ color: DIFFICULTY_COLORS[currentDifficulty] }}>
                {DIFFICULTY_NAMES[currentDifficulty]}
                {difficultyChange === 'up' && <span className="level-change up">⬆️ Level Up!</span>}
                {difficultyChange === 'down' && <span className="level-change down">⬇️ Easier</span>}
              </div>
            </div>

            <div className="count-instruction">Count the objects:</div>

            <div className="count-objects-grid">
              {countProblem.objects.map((obj, index) => (
                <span key={index} className="count-object">
                  {obj}
                </span>
              ))}
            </div>

            <input
              ref={inputRef}
              type="number"
              className={`answer-input ${feedback ? (feedback.correct ? 'correct' : 'incorrect') : ''}`}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && submitCountAnswer()}
              placeholder="?"
              disabled={!!feedback}
              autoFocus
            />

            <button className="submit-btn" onClick={submitCountAnswer} disabled={!answer.trim() || !!feedback}>
              {feedback ? (feedback.correct ? '✓ Correct!' : '✗ Wrong') : 'Check →'}
            </button>
          </div>
        )}

        {/* Daily Challenge Problem */}
        {gameMode === 'daily' && dailyChallenge && !dailyChallenge.completed && dailyChallenge.currentProblem && (
          <div className="problem-card daily-card">
            <div className="daily-badge">Daily Challenge #{dailyChallenge.problemsCompleted + 1}</div>

            <div className="problem-text">{dailyChallenge.currentProblem.problem} = ?</div>

            <input
              ref={inputRef}
              type="number"
              className={`answer-input ${feedback ? (feedback.correct ? 'correct' : 'incorrect') : ''}`}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && submitDailyAnswer()}
              placeholder="?"
              disabled={!!feedback}
              autoFocus
            />

            <button className="submit-btn daily-submit" onClick={submitDailyAnswer} disabled={!answer.trim() || !!feedback}>
              {feedback ? (feedback.correct ? '✓ Correct!' : '✗ Wrong') : 'Submit →'}
            </button>
          </div>
        )}

        {/* Daily Challenge Complete */}
        {gameMode === 'daily' && dailyChallenge?.completed && (
          <div className="daily-complete-card">
            <div className="complete-emoji">🎉</div>
            <h2>Daily Challenge Complete!</h2>
            <p>You earned <strong>{dailyChallenge.bonusXpEarned} bonus XP</strong> today!</p>
            {dailyStats && (
              <div className="complete-stats">
                <div className="complete-stat">
                  <span className="stat-value">{dailyStats.currentStreak}</span>
                  <span className="stat-label">Day Streak 🔥</span>
                </div>
                <div className="complete-stat">
                  <span className="stat-value">{dailyStats.totalCompleted}</span>
                  <span className="stat-label">Total Completed</span>
                </div>
              </div>
            )}
            <p className="come-back">Come back tomorrow for a new challenge!</p>
            <button className="btn btn-secondary" onClick={() => { exitDailyChallenge(); setGameMode('practice'); loadProblem(); }}>
              ← Back to Practice
            </button>
          </div>
        )}

        {gameMode !== 'daily' && gameMode !== 'count' && problem && (
          <div className="problem-card">
            <div className={`difficulty-display ${difficultyChange ? `change-${difficultyChange}` : ''}`}>
              <div className="difficulty-bar">
                {[1, 2, 3, 4, 5].map(d => (
                  <div
                    key={d}
                    className={`difficulty-dot ${d <= currentDifficulty ? 'active' : ''}`}
                    style={d <= currentDifficulty ? { background: DIFFICULTY_COLORS[currentDifficulty] } : {}}
                  />
                ))}
              </div>
              <div className="difficulty-label" style={{ color: DIFFICULTY_COLORS[currentDifficulty] }}>
                {DIFFICULTY_NAMES[currentDifficulty]}
                {difficultyChange === 'up' && <span className="level-change up">⬆️ Level Up!</span>}
                {difficultyChange === 'down' && <span className="level-change down">⬇️ Easier</span>}
              </div>
              <div className="recent-answers">
                {recentAnswers.slice(-5).map((correct, i) => (
                  <span key={i} className={`answer-dot ${correct ? 'correct' : 'wrong'}`}>
                    {correct ? '●' : '○'}
                  </span>
                ))}
              </div>
            </div>

            <div className="problem-text">{problem.problem} = ?</div>

            <input
              ref={inputRef}
              type="number"
              className={`answer-input ${feedback ? (feedback.correct ? 'correct' : 'incorrect') : ''}`}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="?"
              disabled={!!feedback}
              autoFocus
            />

            <button className="submit-btn" onClick={submitAnswer} disabled={!answer.trim() || !!feedback}>
              {feedback ? (feedback.correct ? '✓ Correct!' : '✗ Wrong') : 'Check →'}
            </button>
          </div>
        )}
      </div>

      <footer className="copyright-footer">
        © {new Date().getFullYear()} Math Adventure. Made with ❤️ for young learners.
      </footer>
    </div>
  )
}
