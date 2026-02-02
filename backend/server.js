require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware - CORS configuration
const allowedOrigins = [
  'https://math-adventure-mu.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://192.168.10.22:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Unlockable avatars with requirements
const UNLOCKABLE_AVATARS = [
  { id: 'kid1', emoji: '🧒', name: 'Kid', requirement: null, unlocked: true },
  { id: 'girl1', emoji: '👧', name: 'Girl', requirement: null, unlocked: true },
  { id: 'boy1', emoji: '👦', name: 'Boy', requirement: null, unlocked: true },
  { id: 'superhero', emoji: '🦸', name: 'Superhero', requirement: { type: 'level', value: 3 }, desc: 'Reach Level 3' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', requirement: { type: 'level', value: 5 }, desc: 'Reach Level 5' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', requirement: { type: 'level', value: 10 }, desc: 'Reach Level 10' },
  { id: 'king', emoji: '🤴', name: 'King', requirement: { type: 'level', value: 15 }, desc: 'Reach Level 15' },
  { id: 'queen', emoji: '👸', name: 'Queen', requirement: { type: 'level', value: 15 }, desc: 'Reach Level 15' },
  { id: 'star', emoji: '⭐', name: 'Star', requirement: { type: 'correct', value: 50 }, desc: 'Get 50 correct answers' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', requirement: { type: 'correct', value: 100 }, desc: 'Get 100 correct answers' },
  { id: 'trophy', emoji: '🏆', name: 'Champion', requirement: { type: 'correct', value: 250 }, desc: 'Get 250 correct answers' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', requirement: { type: 'correct', value: 500 }, desc: 'Get 500 correct answers' },
  { id: 'fire', emoji: '🔥', name: 'Fire', requirement: { type: 'streak', value: 10 }, desc: 'Get a 10 streak' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', requirement: { type: 'streak', value: 20 }, desc: 'Get a 20 streak' },
  { id: 'comet', emoji: '☄️', name: 'Comet', requirement: { type: 'streak', value: 30 }, desc: 'Get a 30 streak' },
  { id: 'cat', emoji: '🐱', name: 'Cat', requirement: { type: 'daily', value: 3 }, desc: 'Complete 3 daily challenges' },
  { id: 'dog', emoji: '🐶', name: 'Dog', requirement: { type: 'daily', value: 5 }, desc: 'Complete 5 daily challenges' },
  { id: 'fox', emoji: '🦊', name: 'Fox', requirement: { type: 'daily', value: 10 }, desc: 'Complete 10 daily challenges' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', requirement: { type: 'daily', value: 20 }, desc: 'Complete 20 daily challenges' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', requirement: { type: 'daily', value: 30 }, desc: 'Complete 30 daily challenges' },
  { id: 'alien', emoji: '👽', name: 'Alien', requirement: { type: 'accuracy', value: 95 }, desc: 'Achieve 95% accuracy (min 50 problems)' },
  { id: 'robot', emoji: '🤖', name: 'Robot', requirement: { type: 'speed', value: 20 }, desc: 'Answer 20 problems under 2 seconds each' },
  { id: 'brain', emoji: '🧠', name: 'Brain', requirement: { type: 'xp', value: 5000 }, desc: 'Earn 5000 total XP' },
];

// Helper functions
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin.toString()).digest('hex');
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getDailyChallengeSeed(date) {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============ AUTH MIDDLEWARE ============

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, players(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.player = {
    id: session.player_id,
    username: session.players.username,
    avatar: session.players.avatar
  };
  req.sessionToken = token;
  next();
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    const { data: session } = await supabase
      .from('sessions')
      .select('*, players(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (session) {
      req.player = {
        id: session.player_id,
        username: session.players.username,
        avatar: session.players.avatar
      };
      req.sessionToken = token;
    }
  }
  next();
}

// ============ AUTH ENDPOINTS ============

app.get('/api/auth/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  const { data } = await supabase
    .from('players')
    .select('id')
    .ilike('username', username.trim())
    .single();
  
  res.json({ exists: !!data });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, avatar, pin } = req.body;
  
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!pin || pin.toString().length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username.trim())) {
    return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, underscore only)' });
  }

  // Check existing username
  const { data: existingUser } = await supabase
    .from('players')
    .select('id')
    .ilike('username', username.trim())
    .single();
  
  if (existingUser) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  // Check existing email
  const { data: existingEmail } = await supabase
    .from('players')
    .select('id')
    .ilike('email', email.trim())
    .single();
  
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const pinHash = hashPin(pin);
  
  // Create player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      avatar: avatar || '🧒',
      pin_hash: pinHash
    })
    .select()
    .single();
  
  if (playerError) {
    console.error('Player creation error:', playerError);
    return res.status(500).json({ error: 'Registration failed' });
  }

  // Create session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await supabase.from('sessions').insert({
    player_id: player.id,
    token,
    expires_at: expiresAt
  });

  res.json({
    player: { id: player.id, username: player.username, avatar: player.avatar },
    token,
    expiresAt
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, pin } = req.body;
  
  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN required' });
  }
  
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .ilike('username', username.trim())
    .single();
  
  if (error || !player) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (hashPin(pin) !== player.pin_hash) {
    return res.status(401).json({ error: 'Incorrect PIN' });
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await supabase.from('sessions').insert({
    player_id: player.id,
    token,
    expires_at: expiresAt
  });

  res.json({
    player: { id: player.id, username: player.username, avatar: player.avatar },
    token,
    expiresAt
  });
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  await supabase.from('sessions').delete().eq('token', req.sessionToken);
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ player: req.player });
});

app.get('/api/auth/validate', optionalAuth, (req, res) => {
  if (req.player) {
    res.json({ valid: true, player: req.player });
  } else {
    res.json({ valid: false });
  }
});

// ============ PLAYERS ============

app.get('/api/players', async (req, res) => {
  const { data: players } = await supabase
    .from('players')
    .select('id, username, avatar, created_at')
    .order('username');
  
  res.json(players || []);
});

app.get('/api/players/:id/stats', async (req, res) => {
  const { id } = req.params;
  
  const { data: player } = await supabase
    .from('players')
    .select('id, username, avatar')
    .eq('id', id)
    .single();
  
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('player_id', id);

  const { data: achievements } = await supabase
    .from('achievements')
    .select('achievement, unlocked_at')
    .eq('player_id', id);

  const { data: recentHistory } = await supabase
    .from('history')
    .select('*')
    .eq('player_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const totalXP = (progress || []).reduce((sum, p) => sum + (p.xp || 0), 0);
  const totalCorrect = (progress || []).reduce((sum, p) => sum + (p.correct || 0), 0);
  const totalProblems = (progress || []).reduce((sum, p) => sum + (p.total || 0), 0);

  res.json({
    player,
    progress: progress || [],
    achievements: achievements || [],
    recentHistory: recentHistory || [],
    summary: {
      totalXP,
      totalCorrect,
      totalProblems,
      accuracy: totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0,
      level: Math.floor(totalXP / 100) + 1
    }
  });
});

// ============ PROBLEMS ============

app.get('/api/problem', (req, res) => {
  const { type = 'addition', difficulty = 1 } = req.query;
  const diff = parseInt(difficulty);
  
  let problem, answer;
  const maxNum = diff * 10;
  
  switch (type) {
    case 'addition': {
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      problem = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case 'subtraction': {
      const a = Math.floor(Math.random() * maxNum) + diff;
      const b = Math.floor(Math.random() * Math.min(a, maxNum)) + 1;
      problem = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    case 'multiplication': {
      const maxMult = Math.min(diff + 2, 12);
      const a = Math.floor(Math.random() * maxMult) + 1;
      const b = Math.floor(Math.random() * maxMult) + 1;
      problem = `${a} × ${b}`;
      answer = a * b;
      break;
    }
    case 'division': {
      const maxDiv = Math.min(diff + 2, 12);
      const b = Math.floor(Math.random() * maxDiv) + 1;
      const answer_val = Math.floor(Math.random() * maxDiv) + 1;
      const a = b * answer_val;
      problem = `${a} ÷ ${b}`;
      answer = answer_val;
      break;
    }
    case 'mixed': {
      const types = ['addition', 'subtraction'];
      if (diff >= 2) types.push('multiplication');
      if (diff >= 3) types.push('division');
      const randomType = types[Math.floor(Math.random() * types.length)];
      return res.redirect(`/api/problem?type=${randomType}&difficulty=${difficulty}`);
    }
    default:
      return res.status(400).json({ error: 'Invalid problem type' });
  }
  
  res.json({ problem, answer: answer.toString(), type, difficulty: diff });
});

// Helper function to get player stats for avatar unlocking
async function getPlayerStats(playerId) {
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('player_id', playerId);

  const { data: dailyStats } = await supabase
    .from('daily_challenges')
    .select('id')
    .eq('player_id', playerId)
    .eq('completed', true);

  const { data: fastAnswersRow } = await supabase
    .from('fast_answers')
    .select('count')
    .eq('player_id', playerId)
    .single();

  const prg = progress || [];
  const totalXP = prg.reduce((sum, p) => sum + (p.xp || 0), 0);
  const totalCorrect = prg.reduce((sum, p) => sum + (p.correct || 0), 0);
  const totalProblems = prg.reduce((sum, p) => sum + (p.total || 0), 0);
  const bestStreak = Math.max(0, ...prg.map(p => p.best_streak || 0));

  return {
    level: Math.floor(totalXP / 100) + 1,
    totalXP,
    totalCorrect,
    totalProblems,
    accuracy: totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0,
    bestStreak,
    dailyChallengesCompleted: dailyStats?.length || 0,
    fastAnswers: fastAnswersRow?.count || 0
  };
}

// Check and unlock avatars
async function checkAndUnlockAvatars(playerId) {
  const stats = await getPlayerStats(playerId);
  const newlyUnlocked = [];

  const { data: unlockedIds } = await supabase
    .from('unlocked_avatars')
    .select('avatar_id')
    .eq('player_id', playerId);

  const existingIds = (unlockedIds || []).map(r => r.avatar_id);

  for (const avatar of UNLOCKABLE_AVATARS) {
    if (!avatar.requirement) continue;
    if (existingIds.includes(avatar.id)) continue;

    let shouldUnlock = false;
    switch (avatar.requirement.type) {
      case 'level': shouldUnlock = stats.level >= avatar.requirement.value; break;
      case 'correct': shouldUnlock = stats.totalCorrect >= avatar.requirement.value; break;
      case 'streak': shouldUnlock = stats.bestStreak >= avatar.requirement.value; break;
      case 'daily': shouldUnlock = stats.dailyChallengesCompleted >= avatar.requirement.value; break;
      case 'accuracy': shouldUnlock = stats.totalProblems >= 50 && stats.accuracy >= avatar.requirement.value; break;
      case 'xp': shouldUnlock = stats.totalXP >= avatar.requirement.value; break;
      case 'speed': shouldUnlock = stats.fastAnswers >= avatar.requirement.value; break;
    }

    if (shouldUnlock) {
      await supabase.from('unlocked_avatars').insert({ player_id: playerId, avatar_id: avatar.id });
      newlyUnlocked.push(avatar);
    }
  }

  return newlyUnlocked;
}

app.post('/api/submit', async (req, res) => {
  const { playerId, problem, correctAnswer, userAnswer, type, difficulty, timeMs } = req.body;
  
  if (!playerId) return res.status(400).json({ error: 'Player ID required' });
  
  const isCorrect = userAnswer.toString().trim() === correctAnswer.toString().trim();

  // Record history
  await supabase.from('history').insert({
    player_id: playerId,
    problem,
    answer: correctAnswer,
    user_answer: userAnswer,
    correct: isCorrect,
    time_ms: timeMs
  });

  // Track fast answers
  if (isCorrect && timeMs < 2000) {
    const { data: existing } = await supabase
      .from('fast_answers')
      .select('count')
      .eq('player_id', playerId)
      .single();

    if (existing) {
      await supabase
        .from('fast_answers')
        .update({ count: existing.count + 1 })
        .eq('player_id', playerId);
    } else {
      await supabase.from('fast_answers').insert({ player_id: playerId, count: 1 });
    }
  }

  // Get or create progress
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('player_id', playerId)
    .eq('problem_type', type)
    .single();

  let newStreak, bestStreak, xpGained = 0;

  if (existing) {
    newStreak = isCorrect ? existing.streak + 1 : 0;
    bestStreak = Math.max(existing.best_streak, newStreak);
    xpGained = isCorrect ? (10 + Math.floor(newStreak / 3) * 5) * difficulty : 0;

    await supabase
      .from('progress')
      .update({
        correct: existing.correct + (isCorrect ? 1 : 0),
        total: existing.total + 1,
        streak: newStreak,
        best_streak: bestStreak,
        xp: existing.xp + xpGained,
        difficulty,
        updated_at: new Date().toISOString()
      })
      .eq('player_id', playerId)
      .eq('problem_type', type);
  } else {
    newStreak = isCorrect ? 1 : 0;
    bestStreak = newStreak;
    xpGained = isCorrect ? 10 * difficulty : 0;

    await supabase.from('progress').insert({
      player_id: playerId,
      problem_type: type,
      correct: isCorrect ? 1 : 0,
      total: 1,
      streak: newStreak,
      best_streak: bestStreak,
      xp: xpGained,
      difficulty
    });
  }

  // Check avatar unlocks
  const newAvatars = await checkAndUnlockAvatars(playerId);

  // Check achievements
  const achievements = [];
  const { data: progressData } = await supabase
    .from('progress')
    .select('correct, xp')
    .eq('player_id', playerId);

  const totalCorrect = (progressData || []).reduce((sum, p) => sum + (p.correct || 0), 0);
  const totalXP = (progressData || []).reduce((sum, p) => sum + (p.xp || 0), 0);

  const achievementChecks = [
    { id: 'first_correct', condition: totalCorrect >= 1, name: '🌟 First Star', desc: 'Got your first correct answer!' },
    { id: 'ten_correct', condition: totalCorrect >= 10, name: '⭐ Rising Star', desc: 'Got 10 correct answers!' },
    { id: 'fifty_correct', condition: totalCorrect >= 50, name: '🌟 Super Star', desc: 'Got 50 correct answers!' },
    { id: 'hundred_correct', condition: totalCorrect >= 100, name: '💫 Math Wizard', desc: 'Got 100 correct answers!' },
    { id: 'streak_5', condition: newStreak >= 5, name: '🔥 On Fire', desc: '5 correct in a row!' },
    { id: 'streak_10', condition: newStreak >= 10, name: '🔥🔥 Unstoppable', desc: '10 correct in a row!' },
    { id: 'level_5', condition: Math.floor(totalXP / 100) + 1 >= 5, name: '🏆 Level 5', desc: 'Reached level 5!' },
    { id: 'level_10', condition: Math.floor(totalXP / 100) + 1 >= 10, name: '👑 Level 10', desc: 'Reached level 10!' },
    { id: 'speed_demon', condition: isCorrect && timeMs < 3000, name: '⚡ Speed Demon', desc: 'Answered correctly in under 3 seconds!' },
  ];

  for (const ach of achievementChecks) {
    if (ach.condition) {
      const { data: exists } = await supabase
        .from('achievements')
        .select('id')
        .eq('player_id', playerId)
        .eq('achievement', ach.id)
        .single();

      if (!exists) {
        await supabase.from('achievements').insert({ player_id: playerId, achievement: ach.id });
        achievements.push(ach);
      }
    }
  }

  res.json({
    correct: isCorrect,
    streak: newStreak,
    xpGained,
    newAchievements: achievements,
    newAvatars,
    totalXP,
    level: Math.floor(totalXP / 100) + 1
  });
});

// ============ DAILY CHALLENGES ============

app.get('/api/daily-challenge', authMiddleware, async (req, res) => {
  const playerId = req.player.id;
  const today = getTodayDate();

  let { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('player_id', playerId)
    .eq('challenge_date', today)
    .single();

  if (!challenge) {
    const { data: newChallenge } = await supabase
      .from('daily_challenges')
      .insert({ player_id: playerId, challenge_date: today, total_problems: 5 })
      .select()
      .single();
    challenge = newChallenge;
  }

  // Generate seeded problems
  const seed = getDailyChallengeSeed(today);
  const problems = [];
  const types = ['addition', 'subtraction', 'multiplication'];

  for (let i = 0; i < 5; i++) {
    const problemSeed = seed + i;
    const type = types[problemSeed % types.length];
    const difficulty = Math.min(5, Math.floor(i / 1) + 2);

    let a, b, problem, answer;
    const maxNum = difficulty * 10;
    const rand = (max) => ((problemSeed * (i + 1) * 9301 + 49297) % 233280) % max + 1;

    switch (type) {
      case 'addition':
        a = rand(maxNum); b = rand(maxNum);
        problem = `${a} + ${b}`; answer = a + b;
        break;
      case 'subtraction':
        a = rand(maxNum) + difficulty; b = rand(Math.min(a, maxNum));
        problem = `${a} - ${b}`; answer = a - b;
        break;
      case 'multiplication':
        a = rand(Math.min(difficulty + 3, 12)); b = rand(Math.min(difficulty + 3, 12));
        problem = `${a} × ${b}`; answer = a * b;
        break;
    }
    problems.push({ index: i, problem, answer: answer.toString(), type, difficulty });
  }

  res.json({
    date: today,
    problemsCompleted: challenge.problems_completed,
    totalProblems: challenge.total_problems,
    bonusXpEarned: challenge.bonus_xp_earned,
    completed: challenge.completed,
    problems: challenge.completed ? [] : problems.slice(challenge.problems_completed),
    currentProblem: challenge.completed ? null : problems[challenge.problems_completed]
  });
});

app.post('/api/daily-challenge/submit', authMiddleware, async (req, res) => {
  const playerId = req.player.id;
  const { answer } = req.body;
  const today = getTodayDate();

  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('player_id', playerId)
    .eq('challenge_date', today)
    .single();

  if (!challenge) return res.status(400).json({ error: 'No active daily challenge' });
  if (challenge.completed) return res.status(400).json({ error: 'Daily challenge already completed' });

  // Regenerate current problem
  const seed = getDailyChallengeSeed(today);
  const i = challenge.problems_completed;
  const types = ['addition', 'subtraction', 'multiplication'];
  const problemSeed = seed + i;
  const type = types[problemSeed % types.length];
  const difficulty = Math.min(5, Math.floor(i / 1) + 2);

  let a, b, correctAnswer;
  const maxNum = difficulty * 10;
  const rand = (max) => ((problemSeed * (i + 1) * 9301 + 49297) % 233280) % max + 1;

  switch (type) {
    case 'addition': a = rand(maxNum); b = rand(maxNum); correctAnswer = a + b; break;
    case 'subtraction': a = rand(maxNum) + difficulty; b = rand(Math.min(a, maxNum)); correctAnswer = a - b; break;
    case 'multiplication': a = rand(Math.min(difficulty + 3, 12)); b = rand(Math.min(difficulty + 3, 12)); correctAnswer = a * b; break;
  }

  const isCorrect = answer.toString().trim() === correctAnswer.toString();
  if (!isCorrect) {
    return res.json({ correct: false, correctAnswer, message: 'Try again tomorrow!' });
  }

  const newCompleted = challenge.problems_completed + 1;
  const bonusXp = 25 * difficulty;
  const isFullyComplete = newCompleted >= challenge.total_problems;

  await supabase
    .from('daily_challenges')
    .update({
      problems_completed: newCompleted,
      bonus_xp_earned: challenge.bonus_xp_earned + bonusXp + (isFullyComplete ? 100 : 0),
      completed: isFullyComplete
    })
    .eq('player_id', playerId)
    .eq('challenge_date', today);

  // Add XP to progress
  const { data: existing } = await supabase
    .from('progress')
    .select('xp')
    .eq('player_id', playerId)
    .eq('problem_type', type)
    .single();

  if (existing) {
    await supabase
      .from('progress')
      .update({ xp: existing.xp + bonusXp + (isFullyComplete ? 100 : 0) })
      .eq('player_id', playerId)
      .eq('problem_type', type);
  } else {
    await supabase.from('progress').insert({
      player_id: playerId,
      problem_type: type,
      xp: bonusXp + (isFullyComplete ? 100 : 0)
    });
  }

  const newAvatars = await checkAndUnlockAvatars(playerId);

  res.json({
    correct: true,
    bonusXp,
    problemsCompleted: newCompleted,
    totalProblems: challenge.total_problems,
    completed: isFullyComplete,
    completionBonus: isFullyComplete ? 100 : 0,
    newAvatars,
    message: isFullyComplete ? '🎉 Daily Challenge Complete! +100 bonus XP!' : `✨ +${bonusXp} XP!`
  });
});

app.get('/api/daily-challenge/stats', authMiddleware, async (req, res) => {
  const playerId = req.player.id;

  const { data: completed } = await supabase
    .from('daily_challenges')
    .select('id')
    .eq('player_id', playerId)
    .eq('completed', true);

  const { data: xpData } = await supabase
    .from('daily_challenges')
    .select('bonus_xp_earned')
    .eq('player_id', playerId);

  const totalBonusXp = (xpData || []).reduce((sum, d) => sum + (d.bonus_xp_earned || 0), 0);

  // Calculate streak
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const { data: dayComplete } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('player_id', playerId)
      .eq('challenge_date', dateStr)
      .eq('completed', true)
      .single();

    if (dayComplete) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  res.json({
    totalCompleted: completed?.length || 0,
    totalBonusXp,
    currentStreak: streak
  });
});

// ============ AVATARS ============

app.get('/api/avatars', authMiddleware, async (req, res) => {
  const playerId = req.player.id;
  const stats = await getPlayerStats(playerId);

  const { data: unlockedIds } = await supabase
    .from('unlocked_avatars')
    .select('avatar_id')
    .eq('player_id', playerId);

  const existingIds = (unlockedIds || []).map(r => r.avatar_id);

  const avatars = UNLOCKABLE_AVATARS.map(avatar => {
    const isUnlocked = !avatar.requirement || existingIds.includes(avatar.id);
    let progress = null;

    if (avatar.requirement && !isUnlocked) {
      switch (avatar.requirement.type) {
        case 'level': progress = { current: stats.level, required: avatar.requirement.value }; break;
        case 'correct': progress = { current: stats.totalCorrect, required: avatar.requirement.value }; break;
        case 'streak': progress = { current: stats.bestStreak, required: avatar.requirement.value }; break;
        case 'daily': progress = { current: stats.dailyChallengesCompleted, required: avatar.requirement.value }; break;
        case 'accuracy': progress = { current: stats.accuracy, required: avatar.requirement.value }; break;
        case 'xp': progress = { current: stats.totalXP, required: avatar.requirement.value }; break;
        case 'speed': progress = { current: stats.fastAnswers, required: avatar.requirement.value }; break;
      }
    }

    return { ...avatar, unlocked: isUnlocked, progress };
  });

  res.json(avatars);
});

app.post('/api/avatars/select', authMiddleware, async (req, res) => {
  const playerId = req.player.id;
  const { avatarId } = req.body;

  const avatar = UNLOCKABLE_AVATARS.find(a => a.id === avatarId);
  if (!avatar) return res.status(400).json({ error: 'Invalid avatar' });

  if (avatar.requirement) {
    const { data: unlocked } = await supabase
      .from('unlocked_avatars')
      .select('id')
      .eq('player_id', playerId)
      .eq('avatar_id', avatarId)
      .single();

    if (!unlocked) return res.status(400).json({ error: 'Avatar not unlocked' });
  }

  await supabase
    .from('players')
    .update({ avatar: avatar.emoji })
    .eq('id', playerId);

  res.json({ success: true, avatar: avatar.emoji });
});

// ============ LEADERBOARD ============

app.get('/api/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const { data: players } = await supabase
    .from('players')
    .select('id, username, avatar');

  const leaderboard = [];

  for (const player of players || []) {
    const { data: progress } = await supabase
      .from('progress')
      .select('xp, correct, total, best_streak')
      .eq('player_id', player.id);

    const prg = progress || [];
    const totalXP = prg.reduce((sum, p) => sum + (p.xp || 0), 0);
    if (totalXP === 0) continue;

    const totalCorrect = prg.reduce((sum, p) => sum + (p.correct || 0), 0);
    const totalProblems = prg.reduce((sum, p) => sum + (p.total || 0), 0);
    const bestStreak = Math.max(0, ...prg.map(p => p.best_streak || 0));

    leaderboard.push({
      id: player.id,
      username: player.username,
      avatar: player.avatar,
      totalXP,
      totalCorrect,
      totalProblems,
      accuracy: totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0,
      level: Math.floor(totalXP / 100) + 1,
      bestStreak
    });
  }

  leaderboard.sort((a, b) => b.totalXP - a.totalXP);
  const topN = leaderboard.slice(0, limit).map((p, i) => ({ ...p, rank: i + 1 }));

  res.json(topN);
});

// ============ SERVE FRONTEND ============

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Get local IP
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🧮 Math App Server Running! (Supabase Edition)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Local:   http://localhost:${PORT}
Network: http://${getLocalIP()}:${PORT}
Database: Supabase ☁️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
