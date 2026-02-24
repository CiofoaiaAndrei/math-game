// ============================================
// VARIABILE GLOBALE
// ============================================
let currentUser = null;
let selectedTime = 10;
let selectedFormat = 'inline';
let gameMode = 'normal';
let timerInterval = null;
let currentAnswer = 0;
let mode = "add";
let maxLimit = 100;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let totalQuestions = 10;
let currentQuestion = 0;
let streak = 0;
let currentA = 0;
let currentB = 0;
let step1Answer = 0;
let step2Answer = 0;
let calculationType = 'all';
let digitType = 'auto';

// Variabile noi pentru gamification
let soundEnabled = true;
let currentTheme = 'default';
let hintsRemaining = 3;
let userBadges = { 'Ema': [], 'Rareș': [] };
let dailyStreak = { 'Ema': 0, 'Rareș': 0 };
let lastLoginDate = { 'Ema': null, 'Rareș': null };

// Variabile pentru Test Fulger
let testQuestions = [];
let testAnswers = [];

// ============================================
// BADGES SYSTEM
// ============================================
const BADGES = {
    'first_correct': { name: 'Primul Pas', emoji: '👣', desc: 'Prima întrebare corectă', color: '#10b981' },
    'streak_3': { name: 'Trei la Rând', emoji: '🔥', desc: '3 răspunsuri corecte consecutive', color: '#f59e0b' },
    'streak_5': { name: 'Cinci la Rând', emoji: '⚡', desc: '5 răspunsuri corecte consecutive', color: '#ef4444' },
    'streak_10': { name: 'Perfect 10', emoji: '💯', desc: '10 răspunsuri corecte consecutive', color: '#8b5cf6' },
    'perfect_test': { name: 'Test Perfect', emoji: '🏆', desc: 'Test 100% corect', color: '#fbbf24' },
    'fast_solver': { name: 'Fulger', emoji: '⚡', desc: 'Răspuns corect în <3 secunde', color: '#3b82f6' },
    'practice_10': { name: 'Antrenament', emoji: '🎯', desc: '10 jocuri completate', color: '#10b981' },
    'math_master': { name: 'Maestru', emoji: '🎓', desc: 'Peste 1000 puncte totale', color: '#667eea' },
    'daily_warrior': { name: 'Războinic', emoji: '🗡️', desc: '7 zile consecutive', color: '#dc2626' },
    'speed_demon': { name: 'Demon de Viteză', emoji: '🏃', desc: '10 răspunsuri corecte <5 sec', color: '#f59e0b' }
};

function checkAndAwardBadges() {
    const user = currentUser;
    const badges = getUserBadges(user);
    const stats = getUserStats(user);

    // Prima întrebare corectă
    if (correctCount === 1 && !badges.includes('first_correct')) {
        awardBadge(user, 'first_correct');
    }

    // Streak badges
    if (streak === 3 && !badges.includes('streak_3')) {
        awardBadge(user, 'streak_3');
    }
    if (streak === 5 && !badges.includes('streak_5')) {
        awardBadge(user, 'streak_5');
    }
    if (streak === 10 && !badges.includes('streak_10')) {
        awardBadge(user, 'streak_10');
    }

    // Practice badge
    const gamesPlayed = stats.totalGames;
    if (gamesPlayed >= 10 && !badges.includes('practice_10')) {
        awardBadge(user, 'practice_10');
    }

    // Math Master badge
    const totalScore = stats.totalScore;
    if (totalScore >= 1000 && !badges.includes('math_master')) {
        awardBadge(user, 'math_master');
    }
}

function awardBadge(user, badgeId) {
    const badges = getUserBadges(user);
    if (!badges.includes(badgeId)) {
        badges.push(badgeId);
        saveBadges(user, badges);
        showBadgeNotification(badgeId);
        playSound('badge');
    }
}

function getUserBadges(user) {
    const stored = localStorage.getItem(`badges_${user}`);
    return stored ? JSON.parse(stored) : [];
}

function saveBadges(user, badges) {
    localStorage.setItem(`badges_${user}`, JSON.stringify(badges));
}

function showBadgeNotification(badgeId) {
    const badge = BADGES[badgeId];
    const notification = document.getElementById('badgeNotification');

    document.getElementById('badgeName').textContent = badge.name;
    document.getElementById('badgeDesc').textContent = badge.desc;

    notification.style.display = 'block';
    notification.style.transform = 'translate(-50%, -50%) scale(1)';

    setTimeout(() => {
        notification.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}

// ============================================
// SOUND SYSTEM
// ============================================
const sounds = {
    correct: () => playTone(523.25, 0.15, 'sine'), // C5
    wrong: () => playTone(196.00, 0.3, 'sawtooth'), // G3
    badge: () => {
        playTone(659.25, 0.1, 'sine'); // E5
        setTimeout(() => playTone(783.99, 0.1, 'sine'), 100); // G5
        setTimeout(() => playTone(1046.50, 0.2, 'sine'), 200); // C6
    },
    click: () => playTone(440, 0.05, 'sine'), // A4
    timer: () => playTone(880, 0.1, 'triangle') // A5
};

function playTone(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName]();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    const toggle = document.querySelector('.sound-toggle');

    if (soundEnabled) {
        icon.textContent = '🔊';
        toggle.classList.remove('muted');
    } else {
        icon.textContent = '🔇';
        toggle.classList.add('muted');
    }

    localStorage.setItem('soundEnabled', soundEnabled);
    playSound('click');
}

// ============================================
// THEME SYSTEM
// ============================================
function setTheme(theme) {
    // Setează atributul data-theme pe body
    document.body.setAttribute('data-theme', theme);
    
    // Actualizează butoanele active
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
    
    // Salvează preferința în localStorage
    localStorage.setItem('mathGameTheme', theme);
}

// La încărcarea paginii, încarcă tema salvată
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('mathGameTheme') || 'day';
    setTheme(savedTheme);
});

// ============================================
// MASCOT SYSTEM
// ============================================
function showMascotMessage(message, duration = 3000) {
    const mascotSpeech = document.getElementById('mascotSpeech');
    const mascotText = document.getElementById('mascotText');

    mascotText.textContent = message;
    mascotSpeech.style.display = 'block';

    setTimeout(() => {
        mascotSpeech.style.display = 'none';
    }, duration);
}

function initMascot() {
    const mascot = document.getElementById('mascot');

    mascot.addEventListener('click', () => {
        const messages = [
            'Continuă tot așa! 🌟',
            'Ești grozav la matematică! 🎯',
            'Hai să rezolvăm împreună! 💪',
            'Nu te grăbi, gândește bine! 🧠',
            'Încredere în tine! ✨'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        showMascotMessage(randomMessage);
        playSound('click');
    });
}

// ============================================
// HINT SYSTEM
// ============================================
function showHint() {
    if (hintsRemaining <= 0) {
        showMascotMessage('Nu mai ai hints disponibile! 😅');
        return;
    }

    hintsRemaining--;
    updateHintsDisplay();

    const hintPanel = document.getElementById('hintPanel');
    const hintContent = document.getElementById('hintContent');

    hintContent.innerHTML = generateHint();
    hintPanel.classList.add('active');

    playSound('click');
    showMascotMessage('Iată un indiciu! 💡', 2000);
}

function closeHintPanel() {
    document.getElementById('hintPanel').classList.remove('active');
    playSound('click');
}

function generateHint() {
    const operator = mode === 'add' ? '+' : mode === 'sub' ? '-' : mode === 'mul' ? '×' : '÷';

    if (mode === 'add') {
        const halfway = Math.floor(currentB / 2);
        return `
            <h3>💡 Sfat pentru Adunare:</h3>
            <p>Încearcă să împarți numărul în părți mai mici:</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                <strong>${currentA} + ${halfway} = ${currentA + halfway}</strong><br>
                Apoi adaugă restul: <strong>+ ${currentB - halfway} = ?</strong>
            </div>
            <p>Acum poți calcula mai ușor! 🎯</p>
        `;
    } else if (mode === 'sub') {
        return `
            <h3>💡 Sfat pentru Scădere:</h3>
            <p>Gândește-te: "De la ${currentB}, câte trebuie să adun ca să ajung la ${currentA}?"</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                <strong>${currentB} + ? = ${currentA}</strong>
            </div>
        `;
    } else if (mode === 'mul') {
        if (currentB <= 10) {
            const groups = Array(currentB).fill(currentA).join(' + ');
            return `
                <h3>💡 Sfat pentru Înmulțire:</h3>
                <p>${currentB} grupuri de câte ${currentA}:</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0; font-size: 0.9em;">
                    ${groups}
                </div>
                <p>Adună-le toate împreună! 🧮</p>
            `;
        }
        return `
            <h3>💡 Sfat pentru Înmulțire:</h3>
            <p>Descompune numărul:</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                Încearcă să înmulțești cifră cu cifră!
            </div>
        `;
    } else {
        return `
            <h3>💡 Sfat pentru Împărțire:</h3>
            <p>Gândește-te: "${currentB} × ? = ${currentA}"</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                Câte grupuri de ${currentB} sunt în ${currentA}?
            </div>
        `;
    }
}

function updateHintsDisplay() {
    const hintsDisplay = document.getElementById('hintsRemaining');
    if (hintsDisplay) {
        hintsDisplay.textContent = `Hints rămase: ${hintsRemaining}`;
    }
}

// ============================================
// DAILY REWARD SYSTEM - FIX COMPLET
// ============================================

function checkDailyReward() {
    loadProfiles();
    
    if (!profileData[currentUser]) {
        console.warn('Profil inexistent pentru daily reward');
        return;
    }
    
    const now = Date.now();
    const lastClaimTime = profileData[currentUser].lastDailyReward || 0;
    const timeSinceLastClaim = now - lastClaimTime;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 ore în milisecunde
    
    console.log(`⏰ Verificare Daily Reward pentru ${currentUser}:`);
    console.log(`   Ultima recompensă: ${lastClaimTime > 0 ? new Date(lastClaimTime).toLocaleString('ro-RO') : 'Niciodată'}`);
    console.log(`   Timp trecut: ${Math.floor(timeSinceLastClaim / 1000 / 60 / 60)} ore`);
    
    // Verifică dacă au trecut mai mult de 24 ore
    if (timeSinceLastClaim >= TWENTY_FOUR_HOURS) {
        console.log('✅ Eligibil pentru Daily Reward!');
        
        // Calculează streak
        const yesterday = now - TWENTY_FOUR_HOURS;
        const twoDaysAgo = now - (2 * TWENTY_FOUR_HOURS);
        
        if (lastClaimTime >= yesterday && lastClaimTime < now) {
            // Login consecutiv - crește streak-ul
            profileData[currentUser].dailyStreak = (profileData[currentUser].dailyStreak || 0) + 1;
            console.log(`🔥 Streak crescut la: ${profileData[currentUser].dailyStreak}`);
        } else if (lastClaimTime < twoDaysAgo) {
            // Streak rupt - resetează
            profileData[currentUser].dailyStreak = 1;
            console.log('📉 Streak resetat la 1');
        }
        
        // Marchează timestamp-ul claim-ului
        profileData[currentUser].lastDailyReward = now;
        saveProfiles();
        
        // Afișează recompensa
        showDailyReward();
        
        // Verifică badge pentru 7 zile consecutive
        if (profileData[currentUser].dailyStreak >= 7 && !getUserBadges(currentUser).includes('daily_warrior')) {
            setTimeout(() => awardBadge(currentUser, 'daily_warrior'), 2000);
        }
    } else {
        const hoursRemaining = Math.ceil((TWENTY_FOUR_HOURS - timeSinceLastClaim) / 1000 / 60 / 60);
        console.log(`⏳ Daily Reward disponibil în ${hoursRemaining} ore`);
    }
}

function showDailyReward() {
    loadProfiles();
    
    const streak = profileData[currentUser].dailyStreak || 1;
    const baseXP = 50;
    const streakBonus = Math.min(streak * 10, 100); // Max +100 XP bonus
    const totalXP = baseXP + streakBonus;
    
    // Adaugă XP direct în profil
    profileData[currentUser].xp += totalXP;
    
    // Verifică level up
    let leveledUp = false;
    while (profileData[currentUser].xp >= profileData[currentUser].xpMax) {
        profileData[currentUser].xp -= profileData[currentUser].xpMax;
        profileData[currentUser].level++;
        profileData[currentUser].xpMax = Math.floor(profileData[currentUser].xpMax * 1.5);
        leveledUp = true;
    }
    
    saveProfiles();
    
    // Adaugă realizare
    addAchievementToUser(currentUser, '🎁', `Recompensă zilnică +${totalXP} XP (Streak: ${streak} zile)`);
    
    // Afișează modal
    const modal = document.getElementById('dailyRewardModal');
    const rewardText = document.querySelector('.reward-text');
    
    rewardText.innerHTML = `
        <strong>🎁 Recompensă Zilnică!</strong><br>
        <span style="font-size: 1.5em; color: #10b981;">+${totalXP} XP</span><br>
        <span style="font-size: 0.9em; color: #666;">
            ${streak > 1 ? `🔥 Streak: ${streak} zile (+${streakBonus} XP bonus!)` : ''}
        </span>
        ${leveledUp ? '<br><br><strong style="color: #f59e0b;">🎉 LEVEL UP!</strong>' : ''}
    `;
    
    modal.style.display = 'flex';
    playSound('badge');
    
    if (leveledUp) {
        setTimeout(() => {
            createEnhancedConfetti();
            showMascotMessage(`🎉 Felicitări! Acum ești nivel ${profileData[currentUser].level}!`, 3000);
        }, 500);
    }
    
    console.log(`✅ ${currentUser} a primit ${totalXP} XP (Daily Reward)`);
}

function closeDailyReward() {
    document.getElementById('dailyRewardModal').style.display = 'none';
    playSound('click');
}

// ============================================
// ENHANCED ANIMATIONS
// ============================================
function addCorrectAnimation(element) {
    element.classList.add('correct-animation');
    setTimeout(() => element.classList.remove('correct-animation'), 500);
}

function addWrongAnimation(element) {
    element.classList.add('wrong-animation');
    setTimeout(() => element.classList.remove('wrong-animation'), 500);
}

function createEnhancedConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#10b981', '#fbbf24'];
    const emojis = ['⭐', '✨', '💫', '🌟', '⚡', '🎉'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';

        if (Math.random() > 0.5) {
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        } else {
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.background = 'transparent';
            confetti.style.fontSize = '20px';
        }

        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

// ============================================
// USER STATS
// ============================================
function getUserStats(user) {
    const ranking = loadRanking();
    const userEntries = ranking.filter(r => r.user === user);

    return {
        totalGames: userEntries.filter(r => r.mode === 'Joc Normal').length,
        totalTests: userEntries.filter(r => r.mode === 'Test Fulger').length,
        totalScore: userEntries.reduce((sum, r) => sum + r.score, 0),
        totalCorrect: userEntries.reduce((sum, r) => sum + (r.correct || 0), 0),
        avgScore: userEntries.length > 0 ? Math.round(userEntries.reduce((sum, r) => sum + r.score, 0) / userEntries.length) : 0
    };
}

// ============================================
// LOCAL STORAGE - RANKING
// ============================================
function loadRanking() {
    const ranking = localStorage.getItem('mathRanking');
    return ranking ? JSON.parse(ranking) : [];
}

function saveScore(user, score, correctCount, totalQuestions, isTest = false) {
    let ranking = loadRanking();
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    let grade = getGrade(percentage);

    ranking.push({
        user: user,
        score: score,
        correct: correctCount,
        total: totalQuestions,
        percentage: percentage,
        grade: grade,
        mode: isTest ? 'Test Fulger' : 'Joc Normal',
        date: new Date().toISOString(),
        timestamp: Date.now()
    });
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 100);
    localStorage.setItem('mathRanking', JSON.stringify(ranking));
    updateBestScores();

    checkAndAwardBadges();
    
    // ✅ ADAUGĂ XP ȘI REALIZĂRI
    addXPToUser(user, score, correctCount, totalQuestions, isTest);
}

// ============================================
// SISTEM XP COMPLET
// ============================================

// ============================================
// SISTEM XP AVANSAT - CALCUL COMPLEX
// ============================================

function addXPToUser(user, score, correctCount, totalQuestions, isTest = false) {
    loadProfiles();
    
    if (!profileData[user]) {
        console.warn(`⚠️ Profil inexistent pentru ${user}`);
        return;
    }
    
    const profile = profileData[user];
    
    // ============================================
    // CALCUL XP COMPLEX
    // ============================================
    
    let xpGained = 0;
    
    // 1️⃣ XP Bazic din Scor
    const scoreXP = Math.floor(score / 10);
    xpGained += scoreXP;
    
    // 2️⃣ XP per Răspuns Corect
    const correctXP = correctCount * 5;
    xpGained += correctXP;
    
    // 3️⃣ Bonus Acuratețe
    const accuracy = (correctCount / totalQuestions) * 100;
    let accuracyBonus = 0;
    
    if (accuracy === 100) {
        accuracyBonus = 50; // Perfect!
    } else if (accuracy >= 90) {
        accuracyBonus = 30; // Excelent
    } else if (accuracy >= 80) {
        accuracyBonus = 20; // Foarte bine
    } else if (accuracy >= 70) {
        accuracyBonus = 10; // Bine
    }
    
    xpGained += accuracyBonus;
    
    // 4️⃣ Bonus Test vs Joc Normal
    const modeBonus = isTest ? 20 : 0; // +20 XP pentru teste
    xpGained += modeBonus;
    
    // 5️⃣ Multiplicator Nivel
    const levelMultiplier = 1 + (profile.level * 0.02); // +2% per nivel
    xpGained = Math.floor(xpGained * levelMultiplier);
    
    // 6️⃣ Bonus Streak (dacă există)
    if (profile.currentStreak && profile.currentStreak >= 3) {
        const streakBonus = Math.min(profile.currentStreak * 5, 50);
        xpGained += streakBonus;
    }
    
    // ============================================
    // APLICARE XP ȘI LEVEL UP
    // ============================================
    
    profile.xp += xpGained;
    profile.totalXPEarned = (profile.totalXPEarned || 0) + xpGained;
    
    console.log(`💰 ${user} - Breakdown XP:`);
    console.log(`   📊 Scor: +${scoreXP} XP`);
    console.log(`   ✅ Corecte: +${correctXP} XP`);
    console.log(`   🎯 Acuratețe (${Math.round(accuracy)}%): +${accuracyBonus} XP`);
    console.log(`   ${isTest ? '📝' : '🎮'} Mod: +${modeBonus} XP`);
    console.log(`   📈 Multiplicator Nivel x${levelMultiplier.toFixed(2)}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━`);
    console.log(`   🏆 TOTAL: +${xpGained} XP`);
    
    // Verifică level up
    let leveledUp = false;
    let levelsGained = 0;
    
    while (profile.xp >= profile.xpMax) {
        profile.xp -= profile.xpMax;
        profile.level++;
        levelsGained++;
        profile.xpMax = Math.floor(profile.xpMax * 1.5); // Crește cu 50%
        leveledUp = true;
    }
    
    if (leveledUp) {
        console.log(`🎉 ${user} a urcat ${levelsGained} ${levelsGained === 1 ? 'nivel' : 'nivele'}! Acum: Nivel ${profile.level}`);
    }
    
    // Salvează modificările
    saveProfiles();
    
    // ============================================
    // REALIZĂRI AUTOMATE
    // ============================================
    
    // Scor mare
    if (score > 500) {
        addAchievementToUser(user, '🏆', `Scor impresionant: ${score} puncte în ${isTest ? 'Test Fulger' : 'Joc Normal'}`);
    }
    
    // Perfect
    if (correctCount === totalQuestions) {
        addAchievementToUser(user, '💯', `Perfect! ${totalQuestions}/${totalQuestions} corecte! (+${accuracyBonus} XP bonus)`);
    }
    
    // Level up
    if (leveledUp) {
        addAchievementToUser(user, '⬆️', `Level Up! Acum nivel ${profile.level}! (XP Max: ${profile.xpMax})`);
    }
    
    // First time achievements
    if (profile.totalXPEarned === xpGained) {
        addAchievementToUser(user, '🌟', `Primii ${xpGained} XP câștigați! Începutul călătoriei!`);
    }
    
    // Milestones XP
    const milestones = [100, 500, 1000, 5000, 10000];
    milestones.forEach(milestone => {
        if (profile.totalXPEarned >= milestone && (profile.totalXPEarned - xpGained) < milestone) {
            addAchievementToUser(user, '🎖️', `Milestone atins: ${milestone} XP total câștigat!`);
        }
    });
    
    // Afișează notificare doar pentru utilizatorul activ
    if (currentUser === user && leveledUp) {
        showMascotMessage(`🎉 Felicitări! Ai urcat la nivel ${profile.level}! (+${levelsGained} ${levelsGained === 1 ? 'nivel' : 'nivele'})`, 4000);
        createEnhancedConfetti();
        playSound('badge');
    }
    
    // Return pentru tracking extern
    return {
        xpGained,
        leveledUp,
        levelsGained,
        newLevel: profile.level,
        totalXP: profile.totalXPEarned
    };
}

function addAchievementToUser(user, icon, text) {
    loadProfiles();
    
    if (!profileData[user]) return;
    
    const profile = profileData[user];
    profile.achievements.push({
        icon: icon,
        text: text,
        date: new Date().toISOString()
    });
    
    saveProfiles();
    console.log(`✨ Realizare adăugată pentru ${user}: ${text}`);
}

function getGrade(percentage) {
    if (percentage >= 90) return { text: 'Foarte Bine', emoji: '🏆', color: '#10b981' };
    if (percentage >= 75) return { text: 'Bine', emoji: '🌟', color: '#3b82f6' };
    if (percentage >= 50) return { text: 'Suficient', emoji: '👍', color: '#f59e0b' };
    return { text: 'Insuficient', emoji: '💪', color: '#ef4444' };
}

function updateBestScores() {
    const ranking = loadRanking();
    const emaBest = ranking.filter(r => r.user === 'Ema')[0]?.score || 0;
    const raresBest = ranking.filter(r => r.user === 'Rareș')[0]?.score || 0;
    document.getElementById('emaBest').textContent = emaBest;
    document.getElementById('raresBest').textContent = raresBest;
}

// ============================================
// PARTICULE DE FUNDAL
// ============================================
function createParticles() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 30 + 10 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animation = `float ${Math.random() * 3 + 2}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.opacity = '0.3';
        document.body.appendChild(particle);
    }
}

// ============================================
// USER SELECTION & SETTINGS
// ============================================
function selectUser(user) {
    currentUser = user;

    localStorage.setItem('lastActiveUser', user);

    const avatar = user === 'Ema' ? '👧' : '👦';
    const defaultTime = user === 'Ema' ? 10 : 20;

    selectedTime = defaultTime;

    // ✅ ÎNCARCĂ TEMA UTILIZATORULUI
    loadProfiles();
    if (profileData[user] && profileData[user].theme) {
        applyUserTheme(profileData[user].theme);
    }

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'block';
    document.getElementById('selectedUserName').textContent = user;
    document.getElementById('selectedUserAvatar').textContent = avatar;

    document.querySelectorAll('.time-selector .time-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick && btn.onclick.toString().includes('selectTime') &&
            parseInt(btn.textContent) === defaultTime) {
            btn.classList.add('active');
        }
    });

    playSound('click');
    showMascotMessage(`Salut, ${user}! Să începem? 🚀`, 2000);

    // Check daily reward
    setTimeout(() => checkDailyReward(), 1000);
}

function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('#timeSettings .time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    playSound('click');
}

function selectGameMode(mode) {
    gameMode = mode;

    document.querySelectorAll('.format-selector .format-card').forEach(card => {
        if (card.onclick && card.onclick.toString().includes('selectGameMode')) {
            card.classList.remove('active');
        }
    });
    event.target.closest('.format-card').classList.add('active');

    const timeSettings = document.getElementById('timeSettings');
    const calcTypeSettings = document.getElementById('calculationTypeSettings');

    if (mode === 'normal') {
        timeSettings.classList.remove('hidden');
        calcTypeSettings.classList.add('hidden');
    } else {
        timeSettings.classList.add('hidden');
        calcTypeSettings.classList.remove('hidden');
    }

    playSound('click');
}

function selectCalculationType(type) {
    calculationType = type;
    document.querySelectorAll('#calculationTypeSettings .time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    playSound('click');
}

function selectFormat(format) {
    selectedFormat = format;
    document.querySelectorAll('.format-selector .format-card').forEach(card => {
        if (card.onclick && card.onclick.toString().includes('selectFormat')) {
            card.classList.remove('active');
        }
    });
    event.target.closest('.format-card').classList.add('active');
    playSound('click');
}

function selectMaxLimit(limit) {
    maxLimit = limit;
    document.querySelectorAll('.time-selector .time-btn').forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes('selectMaxLimit')) {
            btn.classList.remove('active');
        }
    });
    event.target.classList.add('active');
    playSound('click');
}

function selectDigitType(type) {
    digitType = type;
    document.querySelectorAll('#digitSettings .time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    updateDigitExplanation();
    playSound('click');
}

function updateDigitExplanation() {
    const explanations = {
        'auto': 'Numerele vor fi alese automat în funcție de limita maximă.',
        'single': 'Ambele numere vor avea o singură cifră (1-9). Exemplu: 7 × 8 = 56',
        'double': 'Cel puțin un număr va avea două cifre (10-99). Exemplu: 23 × 4 = 92',
        'mixed': 'Combinație de numere cu una sau două cifre. Exemplu: 45 × 8 = 360'
    };

    const exampleDiv = document.getElementById('digitExplanationText');
    if (exampleDiv) {
        exampleDiv.textContent = explanations[digitType];
    }
}

function generateNumberByDigitType(min, max, digitPreference) {
    if (digitPreference === 'single') {
        return Math.floor(Math.random() * 9) + 1;
    } else if (digitPreference === 'double') {
        const lowerBound = Math.max(min, 10);
        const upperBound = Math.min(max, 99);
        return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    } else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

function startGame() {
    document.getElementById('settingsScreen').style.display = 'none';

    if (gameMode === 'test') {
        startTestMode();
    } else {
        document.getElementById('gameScreen').style.display = 'block';

        const avatar = currentUser === 'Ema' ? '👧' : '👦';

        const digitLabels = {
            'auto': 'Auto',
            'single': '1 cifră',
            'double': '2 cifre',
            'mixed': 'Mixt'
        };

        document.getElementById('playerInfo').innerHTML = `
            <div class="player-avatar">${avatar}</div>
            <div class="player-details">
                <h2>${currentUser}</h2>
                <p>⏱️ ${selectedTime} sec | ${selectedFormat === 'inline' ? '➡️ În linie' : '⬇️ Vertical'}</p>
                <p>🎯 Max: ${maxLimit} | 🔢 ${digitLabels[digitType]}</p>
            </div>
        `;

        hintsRemaining = 3;
        updateHintsDisplay();
        resetGame();

        playSound('click');
        showMascotMessage('Mult succes! 🌟', 2000);
    }
}

// ============================================
// JOC NORMAL - FUNCȚII PRINCIPALE
// ============================================

function resetGame() {
    // Resetează variabilele
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    currentQuestion = 0;
    streak = 0;
    
    // Resetează UI-ul
    updateScore();
    updateProgress();
    
    // Ascunde feedback-ul
    document.getElementById('feedback').innerHTML = '';
    
    // Generează prima întrebare
    generateQuestion();
    
    console.log('✅ Joc resetat cu succes!');
}

function generateQuestion() {
    if (currentQuestion >= totalQuestions) {
        endGame();
        return;
    }
    
    // Oprește timer-ul anterior
    stopTimer();
    
    // Generează numere bazate pe setări
    let a, b;
    
    if (mode === 'add') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit - 10), 'double');
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            a = useDouble ? generateNumberByDigitType(10, Math.min(99, maxLimit / 2), 'double') : Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        } else {
            a = Math.floor(Math.random() * (maxLimit / 2)) + 1;
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        }
        currentAnswer = a + b;
    } else if (mode === 'sub') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * a) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit), 'double');
            b = Math.floor(Math.random() * a) + 1;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            a = useDouble ? generateNumberByDigitType(10, Math.min(99, maxLimit), 'double') : Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * a) + 1;
        } else {
            a = Math.floor(Math.random() * maxLimit) + 1;
            b = Math.floor(Math.random() * a) + 1;
        }
        currentAnswer = a - b;
    } else if (mode === 'mul') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit / 2), 'double');
            const maxB = Math.floor(maxLimit / a);
            b = Math.floor(Math.random() * Math.min(maxB, 99)) + 1;
        } else if (digitType === 'mixed') {
            const useDoubleForA = Math.random() > 0.5;
            if (useDoubleForA) {
                a = generateNumberByDigitType(10, Math.min(99, maxLimit / 2), 'double');
                const maxB = Math.floor(maxLimit / a);
                b = Math.floor(Math.random() * Math.min(maxB, 9)) + 1;
            } else {
                a = Math.floor(Math.random() * 9) + 1;
                const maxB = Math.floor(maxLimit / a);
                b = generateNumberByDigitType(10, Math.min(99, maxB), 'double');
            }
        } else {
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
        }
        currentAnswer = a * b;
    } else if (mode === 'div') {
        if (digitType === 'single') {
            b = Math.floor(Math.random() * 9) + 1;
            currentAnswer = Math.floor(Math.random() * 9) + 1;
            a = b * currentAnswer;
        } else if (digitType === 'double') {
            b = generateNumberByDigitType(10, Math.min(20, 99), 'double');
            const maxQuotient = Math.floor(maxLimit / b);
            currentAnswer = Math.floor(Math.random() * maxQuotient) + 1;
            a = b * currentAnswer;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            b = useDouble ? generateNumberByDigitType(10, Math.min(20, 99), 'double') : Math.floor(Math.random() * 9) + 1;
            const maxQuotient = Math.floor(maxLimit / b);
            currentAnswer = Math.floor(Math.random() * maxQuotient) + 1;
            a = b * currentAnswer;
        } else {
            b = Math.floor(Math.random() * 12) + 1;
            currentAnswer = Math.floor(Math.random() * 12) + 1;
            a = b * currentAnswer;
        }
    }
    
    // Salvează valorile pentru hints
    currentA = a;
    currentB = b;
    
    // Afișează întrebarea bazat pe format
    displayQuestion(a, b);
    
    // Start timer
    startTimer();
    
    console.log(`🎯 Întrebare generată: ${a} ${getOperatorSymbol()} ${b} = ${currentAnswer}`);
}

function getOperatorSymbol() {
    if (mode === 'add') return '+';
    if (mode === 'sub') return '-';
    if (mode === 'mul') return '×';
    if (mode === 'div') return '÷';
    return '+';
}

function displayQuestion(a, b) {
    const operator = getOperatorSymbol();
    
    // Resetează toate containerele
    document.getElementById('question').style.display = 'none';
    document.getElementById('questionStackedContainer').style.display = 'none';
    document.getElementById('multiInputContainer').style.display = 'none';
    document.getElementById('singleInputContainer').style.display = 'flex';
    
    if (selectedFormat === 'inline') {
        // Format în linie
        document.getElementById('question').textContent = `${a} ${operator} ${b} = ?`;
        document.getElementById('question').style.display = 'flex';
    } else {
        // Format vertical
        const stackedContainer = document.getElementById('questionStacked');
        stackedContainer.innerHTML = `
            <div class="stacked-line">
                <span class="stacked-number">${a}</span>
            </div>
            <div class="stacked-line">
                <span class="stacked-operator">${operator}</span>
                <span class="stacked-number">${b}</span>
            </div>
            <div class="stacked-underline"></div>
            <div class="stacked-line stacked-result">?</div>
        `;
        document.getElementById('questionStackedContainer').style.display = 'flex';
    }
    
    // Focus pe input
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
}

function startTimer() {
    let timeLeft = selectedTime;
    document.getElementById('timerValue').textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerValue').textContent = timeLeft;
        
        // Warning la 5 secunde
        if (timeLeft <= 5) {
            document.querySelector('.timer-container').classList.add('timer-warning');
            playSound('timer');
        } else {
            document.querySelector('.timer-container').classList.remove('timer-warning');
        }
        
        // Time's up!
        if (timeLeft <= 0) {
            stopTimer();
            handleWrongAnswer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.querySelector('.timer-container').classList.remove('timer-warning');
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    
    if (isNaN(userAnswer)) {
        showMascotMessage('❌ Introdu un număr valid!', 1500);
        return;
    }
    
    stopTimer();
    
    if (userAnswer === currentAnswer) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    correctCount++;
    streak++;
    score += Math.floor(50 * (1 + streak * 0.1)); // Bonus pentru streak
    
    // ✅ UPDATE STREAK ÎN PROFIL
    loadProfiles();
    if (profileData[currentUser]) {
        profileData[currentUser].currentStreak = streak;
        
        // Update best streak
        if (streak > (profileData[currentUser].bestStreak || 0)) {
            profileData[currentUser].bestStreak = streak;
            
            // Achievement pentru best streak
            if (streak >= 10) {
                addAchievementToUser(currentUser, '🔥', `Nou record: ${streak} răspunsuri corecte consecutive!`);
            }
        }
        
        saveProfiles();
    }
    
    // Update UI
    updateScore();
    updateStreak();
    
    // Feedback vizual
    const feedback = document.getElementById('feedback');
    feedback.className = 'correct';
    feedback.innerHTML = `✅ <strong>Corect!</strong> Răspuns: ${currentAnswer}`;
    
    // Animații și sunete
    playSound('correct');
    addCorrectAnimation(feedback);
    
    // Next question
    currentQuestion++;
    updateProgress();
    
    setTimeout(() => {
        feedback.innerHTML = '';
        if (currentQuestion < totalQuestions) {
            generateQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

function handleWrongAnswer() {
    wrongCount++;
    streak = 0;
    
    // Update UI
    updateScore();
    updateStreak();
    
    // Feedback vizual
    const feedback = document.getElementById('feedback');
    feedback.className = 'wrong';
    feedback.innerHTML = `❌ <strong>Greșit!</strong> Răspunsul corect era: ${currentAnswer}`;
    
    // Animații și sunete
    playSound('wrong');
    addWrongAnimation(feedback);
    
    // Next question
    currentQuestion++;
    updateProgress();
    
    setTimeout(() => {
        feedback.innerHTML = '';
        if (currentQuestion < totalQuestions) {
            generateQuestion();
        } else {
            endGame();
        }
    }, 2000);
}

function skipQuestion() {
    if (confirm('Sigur vrei să sari peste această întrebare?')) {
        wrongCount++;
        streak = 0;
        currentQuestion++;
        
        updateScore();
        updateStreak();
        updateProgress();
        
        if (currentQuestion < totalQuestions) {
            generateQuestion();
        } else {
            endGame();
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('correct').textContent = correctCount;
    document.getElementById('wrong').textContent = wrongCount;
}

function updateStreak() {
    const streakDisplay = document.getElementById('streak');
    if (streak >= 3) {
        streakDisplay.style.display = 'block';
        document.getElementById('streakCount').textContent = streak;
    } else {
        streakDisplay.style.display = 'none';
    }
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function endGame() {
    stopTimer();
  
        // ✅ INCREMENT GAMES COMPLETED
    loadProfiles();
    if (profileData[currentUser]) {
        profileData[currentUser].gamesCompleted = (profileData[currentUser].gamesCompleted || 0) + 1;
        saveProfiles();
    }

    // Salvează scorul
    saveScore(currentUser, score, correctCount, totalQuestions, false);
    
    // Afișează rezultatul
    const feedback = document.getElementById('feedback');
    feedback.className = '';
    feedback.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 20px; color: white; margin-top: 30px; text-align: center;">
            <h2 style="font-size: 2.5em; margin-bottom: 20px;">🎉 Joc Terminat!</h2>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="font-size: 1.5em; margin: 10px 0;">Scor Final: <strong>${score}</strong> puncte</p>
                <p style="font-size: 1.2em; margin: 10px 0;">✅ Corecte: ${correctCount}/${totalQuestions}</p>
                <p style="font-size: 1.2em; margin: 10px 0;">❌ Greșite: ${wrongCount}</p>
                <p style="font-size: 1.2em; margin: 10px 0;">Acuratețe: ${Math.round((correctCount/totalQuestions)*100)}%</p>
            </div>
            <button class="btn btn-primary" onclick="resetGame()" style="margin: 10px; font-size: 1.2em;">🔄 Încercă din nou</button>
            <button class="btn btn-secondary" onclick="logout()" style="margin: 10px; font-size: 1.2em;">← Înapoi</button>
        </div>
    `;
    
    // Confetti dacă rezultat bun
    if (correctCount >= totalQuestions * 0.8) {
        createEnhancedConfetti();
        playSound('badge');
    }
    
    console.log(`🏁 Joc terminat! Scor: ${score}, Corecte: ${correctCount}/${totalQuestions}`);
}

function setMode(newMode) {
    mode = newMode;
    
    // Actualizează butoanele
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(newMode + 'Tab').classList.add('active');
    
    // Generează întrebare nouă
    generateQuestion();
    
    playSound('click');
}

// Support pentru Enter key
document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
});

function backToLoginFromSettings() {
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    currentUser = null;
    playSound('click');
}

function logout() {
    if (confirm('Sigur vrei să ieși? Progresul va fi pierdut!')) {
        stopTimer();
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
        currentUser = null;
        playSound('click');
    }
}

// ============================================
// TEST FULGER MODE
// ============================================
function startTestMode() {
    document.getElementById('testScreen').style.display = 'block';
    document.getElementById('testStudentName').textContent = currentUser;
    document.getElementById('testMaxLimit').textContent = maxLimit;

    const typeLabels = {
        'all': 'Toate operațiile',
        'add': 'Doar adunări',
        'sub': 'Doar scăderi',
        'mul': 'Doar înmulțiri',
        'div': 'Doar împărțiri'
    };

    const digitLabels = {
        'auto': 'numere automate',
        'single': 'numere cu 1 cifră',
        'double': 'numere cu 2 cifre',
        'mixed': 'numere mixte'
    };

    document.getElementById('testCalculationType').textContent =
        `${typeLabels[calculationType]} (${digitLabels[digitType]})`;

    testQuestions = [];
    testAnswers = [];

    const testPaper = document.getElementById('testPaper');
    testPaper.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'test-paper-header';
    headerDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div><strong>Nume:</strong> ${currentUser}</div>
            <div><strong>Data:</strong> ${new Date().toLocaleDateString('ro-RO')}</div>
            <div><strong>Nota:</strong> _____</div>
        </div>
    `;
    testPaper.appendChild(headerDiv);

    const instructionsDiv = document.createElement('div');
    instructionsDiv.className = 'test-instructions';
    instructionsDiv.innerHTML = `
        <p style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
            📋 <strong>Instrucțiuni:</strong> Rezolvă toate cele 20 de calcule ${typeLabels[calculationType].toLowerCase()}. 
            Rezultatele nu trebuie să depășească ${maxLimit}. Mult succes!
        </p>
    `;
    testPaper.appendChild(instructionsDiv);

    const gridDiv = document.createElement('div');
    gridDiv.className = 'test-questions-grid';
    gridDiv.style.display = 'grid';
    gridDiv.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
    gridDiv.style.maxWidth = '1200px';
    gridDiv.style.margin = '0 auto';
    gridDiv.style.gap = '20px';
    gridDiv.style.marginTop = '20px';

    for (let i = 0; i < 20; i++) {
        const question = generateTestQuestion(i + 1);
        testQuestions.push(question);

        const questionDiv = document.createElement('div');
        questionDiv.className = 'test-question-item';
        questionDiv.innerHTML = `
            <div style="background: white; padding: 15px; border: 2px solid #ddd; border-radius: 8px;">
                <div style="font-weight: bold; color: #667eea; margin-bottom: 10px;">${i + 1}.</div>
                <div style="font-size: 1.2em; margin-bottom: 10px;">${question.display}</div>
                <input type="number" 
                       class="test-answer-input" 
                       id="testAnswer${i}" 
                       placeholder="Răspuns..." 
                       style="width: 100%; padding: 10px; font-size: 1.1em; border: 2px solid #ddd; border-radius: 4px;">
            </div>
        `;
        gridDiv.appendChild(questionDiv);
    }

    testPaper.appendChild(gridDiv);
}

function generateTestQuestion(number) {
    let operations = [];

    if (calculationType === 'all') {
        operations = ['add', 'sub', 'mul', 'div'];
    } else {
        operations = [calculationType];
    }

    const operation = operations[Math.floor(Math.random() * operations.length)];

    let a, b, answer, display;

    if (operation === 'add') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit - 10), 'double');
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            a = useDouble ? generateNumberByDigitType(10, Math.min(99, maxLimit - 10), 'double') : Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        } else {
            a = Math.floor(Math.random() * (maxLimit - 1)) + 1;
            b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        }
        answer = a + b;
        display = `${a} + ${b} = ?`;

    } else if (operation === 'sub') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * a) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit), 'double');
            b = Math.floor(Math.random() * a) + 1;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            a = useDouble ? generateNumberByDigitType(10, Math.min(99, maxLimit), 'double') : Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * a) + 1;
        } else {
            a = Math.floor(Math.random() * maxLimit) + 1;
            b = Math.floor(Math.random() * a) + 1;
        }
        answer = a - b;
        display = `${a} - ${b} = ?`;

    } else if (operation === 'mul') {
        if (digitType === 'single') {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
        } else if (digitType === 'double') {
            a = generateNumberByDigitType(10, Math.min(99, maxLimit / 2), 'double');
            const maxB = Math.floor(maxLimit / a);
            b = Math.floor(Math.random() * Math.min(maxB, 99)) + 1;
        } else if (digitType === 'mixed') {
            const useDoubleForA = Math.random() > 0.5;
            if (useDoubleForA) {
                a = generateNumberByDigitType(10, Math.min(99, maxLimit / 2), 'double');
                const maxB = Math.floor(maxLimit / a);
                b = Math.floor(Math.random() * Math.min(maxB, 9)) + 1;
            } else {
                a = Math.floor(Math.random() * 9) + 1;
                const maxB = Math.floor(maxLimit / a);
                b = generateNumberByDigitType(10, Math.min(99, maxB), 'double');
            }
        } else {
            const maxA = Math.min(Math.floor(Math.sqrt(maxLimit)), maxLimit);
            a = Math.floor(Math.random() * maxA) + 1;
            const maxB = Math.floor(maxLimit / a);
            b = Math.floor(Math.random() * maxB) + 1;
        }
        answer = a * b;
        display = `${a} × ${b} = ?`;

    } else {
        if (digitType === 'single') {
            b = Math.floor(Math.random() * 9) + 1;
            const quotient = Math.floor(Math.random() * 9) + 1;
            a = b * quotient;
            answer = quotient;
        } else if (digitType === 'double') {
            b = generateNumberByDigitType(10, Math.min(20, 99), 'double');
            const maxQuotient = Math.floor(maxLimit / b);
            answer = Math.floor(Math.random() * maxQuotient) + 1;
            a = b * answer;
        } else if (digitType === 'mixed') {
            const useDouble = Math.random() > 0.5;
            b = useDouble ? generateNumberByDigitType(10, Math.min(20, 99), 'double') : Math.floor(Math.random() * 9) + 1;
            const maxQuotient = Math.floor(maxLimit / b);
            answer = Math.floor(Math.random() * maxQuotient) + 1;
            a = b * answer;
        } else {
            b = Math.floor(Math.random() * Math.min(20, maxLimit)) + 2;
            const maxQuotient = Math.floor(maxLimit / b);
            answer = Math.floor(Math.random() * maxQuotient) + 1;
            a = b * answer;
        }
        display = `${a} ÷ ${b} = ?`;
    }

    return { a, b, operation, answer, display };
}

function submitTest() {
    testAnswers = [];
    for (let i = 0; i < 20; i++) {
        const input = document.getElementById(`testAnswer${i}`);
        testAnswers.push(parseInt(input.value) || null);
    }

    const unanswered = testAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
        if (!confirm(`Ai ${unanswered} calcule necompletate. Sigur vrei să predai testul?`)) {
            return;
        }
    }

    document.getElementById('testScreen').style.display = 'none';
    gradeTest();
}

function gradeTest() {
    document.getElementById('testResultScreen').style.display = 'block';

    let correctCount = 0;
    let totalScore = 0;

    const gradedPaper = document.getElementById('testPaperGraded');
    gradedPaper.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'test-paper-header';
    headerDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div><strong>Nume:</strong> ${currentUser}</div>
            <div><strong>Data:</strong> ${new Date().toLocaleDateString('ro-RO')}</div>
            <div id="finalGradeDisplay"><strong>Nota:</strong> Se calculează...</div>
        </div>
    `;
    gradedPaper.appendChild(headerDiv);

    const gridDiv = document.createElement('div');
    gridDiv.style.display = 'grid';
    gridDiv.style.gridTemplateColumns = '1fr 1fr';
    gridDiv.style.gap = '20px';
    gridDiv.style.marginTop = '20px';

    testQuestions.forEach((q, i) => {
        const userAnswer = testAnswers[i];
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) {
            correctCount++;
            totalScore += Math.ceil(maxLimit / 10);
        }

        const questionDiv = document.createElement('div');
        questionDiv.style.background = 'white';
        questionDiv.style.padding = '15px';
        questionDiv.style.border = `3px solid ${isCorrect ? '#10b981' : '#ef4444'}`;
        questionDiv.style.borderRadius = '8px';
        questionDiv.style.position = 'relative';

        questionDiv.innerHTML = `
      <div style="position: absolute; top: 10px; right: 10px; font-size: 1.5em;">
                ${isCorrect ? '✓' : '✗'}
            </div>
            <div style="font-weight: bold; color: #667eea; margin-bottom: 10px;">${i + 1}.</div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">${q.display}</div>
            <div style="font-size: 1em; color: ${isCorrect ? '#10b981' : '#ef4444'};">
                <strong>Răspunsul tău:</strong> ${userAnswer !== null ? userAnswer : '(nerăspuns)'}
            </div>
            ${!isCorrect ? `<div style="font-size: 1em; color: #10b981; margin-top: 5px;">
                <strong>Răspuns corect:</strong> ${q.answer}
            </div>` : ''}
        `;

        gridDiv.appendChild(questionDiv);
    });

    gradedPaper.appendChild(gridDiv);

    const percentage = Math.round((correctCount / 20) * 100);
    const grade = getGrade(percentage);

    document.getElementById('finalGradeDisplay').innerHTML = `
        <strong>Nota:</strong> <span style="color: ${grade.color}; font-size: 1.2em;">${grade.emoji} ${grade.text}</span>
    `;

    const teacherDiv = document.getElementById('teacherFeedback');
    teacherDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 30px; border-radius: 15px; color: white; margin-top: 30px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div style="font-size: 3em; text-align: center; margin-bottom: 15px;">
                👨‍🏫
            </div>
            <h2 style="text-align: center; margin-bottom: 20px;">Feedback Profesor Virtual</h2>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <p style="font-size: 1.2em; margin: 10px 0;">
                    <strong>Calificativ:</strong> ${grade.emoji} <span style="font-size: 1.3em;">${grade.text}</span>
                </p>
                <p style="font-size: 1.1em; margin: 10px 0;">
                    <strong>Rezultat:</strong> ${correctCount}/20 corecte (${percentage}%)
                </p>
                <p style="font-size: 1.1em; margin: 10px 0;">
                    <strong>Scor:</strong> ${totalScore} puncte
                </p>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; line-height: 1.6%">
                ${getTeacherComment(percentage)}
            </div>
        </div>
    `;

    // Salvează testul cu întrebări și răspunsuri
    saveScore(currentUser, totalScore, correctCount, 20, true);
    
    // Salvează detaliile testului în ultima intrare
    const ranking = loadRanking();
    if (ranking.length > 0) {
        const lastEntry = ranking[ranking.length - 1];
        if (lastEntry.mode === 'Test Fulger') {
            lastEntry.questions = testQuestions;
            lastEntry.answers = testAnswers;
            localStorage.setItem('mathRanking', JSON.stringify(ranking));
        }
    }
}

// ============================================
// BADGES DISPLAY
// ============================================
function displayAllBadges() {
    const container = document.getElementById('allBadgesDisplay');
    container.innerHTML = '';

    const emaBadges = getUserBadges('Ema');
    const raresBadges = getUserBadges('Rareș');

    const userSection = (user, badges) => {
        const avatar = user === 'Ema' ? '👧' : '👦';
        const div = document.createElement('div');
        div.style.marginBottom = '30px';

        let html = `
            <h4 style="color: #667eea; margin-bottom: 15px;">
                ${avatar} ${user} - ${badges.length} Badge-uri
            </h4>
            <div class="badges-display">
        `;

        if (badges.length === 0) {
            html += '<p style="color: #666;">Încă nu are badge-uri. 😊</p>';
        } else {
            badges.forEach(badgeId => {
                const badge = BADGES[badgeId];
                if (badge) {
                    html += `
                        <div class="badge-item" style="border-color: ${badge.color};">
                            <div class="badge-emoji">${badge.emoji}</div>
                            <div class="badge-info">
                                <div class="badge-name">${badge.name}</div>
                                <div class="badge-desc">${badge.desc}</div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        html += '</div>';
        div.innerHTML = html;
        container.appendChild(div);
    };

    userSection('Ema', emaBadges);
    userSection('Rareș', raresBadges);
}

// ============================================
// COMPARISON CHART
// ============================================
function displayComparisonChart() {
    const container = document.getElementById('comparisonChart');
    container.innerHTML = '';

    const emaStats = getUserStats('Ema');
    const raresStats = getUserStats('Rareș');

    const createUserComparison = (user, stats, avatar) => {
        return `
            <div class="comparison-user">
                <div class="comparison-avatar">${avatar}</div>
                <h3 style="text-align: center; color: #667eea; margin-bottom: 20px;">${user}</h3>
                <div class="comparison-stats">
                    <div class="comparison-stat-row">
                        <span class="comparison-stat-label">Total Jocuri</span>
                        <span class="comparison-stat-value">${stats.totalGames + stats.totalTests}</span>
                    </div>
                    <div class="comparison-stat-row">
                        <span class="comparison-stat-label">Răspunsuri Corecte</span>
                        <span class="comparison-stat-value">${stats.totalCorrect}</span>
                    </div>
                    <div class="comparison-stat-row">
                        <span class="comparison-stat-label">Scor Total</span>
                        <span class="comparison-stat-value">${stats.totalScore}</span>
                    </div>
                    <div class="comparison-stat-row">
                        <span class="comparison-stat-label">Scor Mediu</span>
                        <span class="comparison-stat-value">${stats.avgScore}</span>
                    </div>
                    <div class="comparison-stat-row">
                        <span class="comparison-stat-label">Badge-uri</span>
                        <span class="comparison-stat-value">${getUserBadges(user).length}</span>
                    </div>
                </div>
            </div>
        `;
    };

    container.innerHTML =
        createUserComparison('Ema', emaStats, '👧') +
        createUserComparison('Rareș', raresStats, '👦');
}

// ============================================
// WEEKLY CALENDAR
// ============================================
function displayWeeklyCalendar() {
    const container = document.getElementById('weeklyCalendar');
    container.innerHTML = '';

    const ranking = loadRanking();
    const today = new Date();
    const weekDays = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dayActivities = ranking.filter(r => {
            const entryDate = new Date(r.date);
            return entryDate.toDateString() === date.toDateString();
        });

        const cell = document.createElement('div');
        cell.className = `day-cell ${dayActivities.length > 0 ? 'active' : ''}`;
        cell.innerHTML = `
            <div class="day-name">${weekDays[date.getDay()]}</div>
            <div class="day-date">${date.getDate()}</div>
            <div class="day-activity">${dayActivities.length} ${dayActivities.length === 1 ? 'joc' : 'jocuri'}</div>
        `;
        container.appendChild(cell);
    }
}

// ============================================
// PROGRESS BAR CHART
// ============================================
function displayProgressChart() {
    const container = document.getElementById('progressBarChart');
    container.innerHTML = '';

    const ranking = loadRanking();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const dayScores = ranking.filter(r => {
            const entryDate = new Date(r.date);
            return entryDate.toDateString() === date.toDateString();
        });

        const totalScore = dayScores.reduce((sum, r) => sum + r.score, 0);
        const avgScore = dayScores.length > 0 ? Math.round(totalScore / dayScores.length) : 0;

        last7Days.push({
            date: date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
            score: avgScore
        });
    }

    const maxScore = Math.max(...last7Days.map(d => d.score), 100);

    last7Days.forEach(day => {
        const barHeight = (day.score / maxScore) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar-item';
        bar.style.height = `${barHeight}%`;
        bar.innerHTML = `
            <div class="bar-value">${day.score}</div>
            <div class="bar-label">${day.date}</div>
        `;
        container.appendChild(bar);
    });
}

// ============================================
// DETAILED TEST HISTORY
// ============================================
function loadDetailedTestHistory() {
    const container = document.getElementById('detailedTestHistory');
    const ranking = loadRanking();
    const tests = ranking.filter(r => r.mode === 'Test Fulger').slice(0, 10);

    if (tests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nu există teste încă.</p>';
        return;
    }

    container.innerHTML = '';

    tests.forEach((test, index) => {
        const div = document.createElement('div');
        div.className = 'result-row';
        div.style.cursor = 'pointer';
        div.style.transition = 'all 0.3s ease';

        div.innerHTML = `
            <div>${test.user === 'Ema' ? '👧' : '👦'} <strong>${test.user}</strong></div>
            <div>${new Date(test.date).toLocaleDateString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</div>
            <div>${test.correct}/${test.total} (${test.percentage}%)</div>
            <div><strong>${test.score}</strong> puncte</div>
            <div style="color: ${test.grade.color}">${test.grade.emoji} ${test.grade.text}</div>
            <div><button class="btn btn-secondary" style="padding: 5px 15px; font-size: 0.9em;" data-tooltip="Vezi detalii test">
                👁️ Vezi Detalii
            </button></div>
        `;

        div.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            if (test.questions && test.answers) {
                showTestDetails(test);
            } else {
                alert('⚠️ Detaliile testului nu sunt disponibile. Acestea se salvează doar pentru testele noi.');
            }
        });

        div.addEventListener('mouseenter', () => {
            div.style.background = '#e0f2fe';
            div.style.transform = 'scale(1.02)';
        });

        div.addEventListener('mouseleave', () => {
            div.style.background = '#f8f9fa';
            div.style.transform = 'scale(1)';
        });

        container.appendChild(div);
    });
}

// ============================================
// EXPORT DETAILED REPORT
// ============================================
function exportDetailedReport() {
    const ranking = loadRanking();
    const emaData = ranking.filter(r => r.user === 'Ema');
    const raresData = ranking.filter(r => r.user === 'Rareș');

    let report = '═══════════════════════════════════════════════════════\n';
    report += '       RAPORT DETALIAT - MATEMATICĂ DISTRACTIVĂ\n';
    report += ` Generat: ${new Date().toLocaleString('ro-RO')}\n`;
    report += '═══════════════════════════════════════════════════════\n\n';

    const generateUserReport = (user, data) => {
     const stats = getUserStats(user);
  const badges = getUserBadges(user);

        let text = `\n📊 ${user} - Raport Complet\n`;
   text += '─────────────────────────────────────────────────────\n';
        text += `Total Jocuri Normale: ${stats.totalGames}\n`;
        text += `Total Teste Fulger: ${stats.totalTests}\n`;
        text += `Răspunsuri Corecte: ${stats.totalCorrect}\n`;
        text += `Scor Total: ${stats.totalScore}\n`;
    text += `Scor Mediu: ${stats.avgScore}\n`;
  text += `Badge-uri Obținute: ${badges.length}\n\n`;

        text += `🏅 Badge-uri:\n`;
        badges.forEach(badgeId => {
            const badge = BADGES[badgeId];
            if (badge) {
 text += `   ${badge.emoji} ${badge.name} - ${badge.desc}\n`;
            }
 });

        text += `\n📝 Ultimele 5 Rezultate:\n`;
   data.slice(0, 5).forEach((entry, i) => {
            text += `   ${i + 1}. ${entry.mode} - ${entry.correct}/${entry.total} (${entry.percentage}%) - ${entry.score} puncte\n`;
            text += `      Data: ${new Date(entry.date).toLocaleString('ro-RO')}\n`;
        });

 return text;
    };

    report += generateUserReport('Ema', emaData);
    report += '\n\n';
    report += generateUserReport('Rareș', raresData);

    report += '\n\n═══════════════════════════════════════════════════════\n';
    report += '          SFÂRȘIT RAPORT\n';
    report += '═══════════════════════════════════════════════════════\n';

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raport_matematic_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();

    alert('✅ Raportul detaliat a fost descărcat!');
    playSound('badge');
}

// ============================================
// ADMIN PANEL
// ============================================
const ADMIN_PASSWORD_KEY = 'mathAppAdminPassword';
const DEFAULT_ADMIN_PASSWORD = 'adrian2024';
let isAdminLoggedIn = false;

function initializeAdminPassword() {
    if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
        localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
    }
}

function showAdminLogin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLoginScreen').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginError').style.display = 'none';
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);

    if (password === storedPassword) {
        isAdminLoggedIn = true;
        document.getElementById('adminLoginScreen').style.display = 'none';
        document.getElementById('adminScreen').style.display = 'block';
        loadAdminDashboard();
    } else {
        const errorDiv = document.getElementById('adminLoginError');
        errorDiv.textContent = '❌ Parolă incorectă!';
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

function logoutAdmin() {
    if (confirm('Sigur vrei să ieși din panoul admin?')) {
        isAdminLoggedIn = false;
        document.getElementById('adminScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
    }
}

function loadAdminDashboard() {
    const ranking = loadRanking();

    const totalGames = ranking.filter(r => r.mode === 'Joc Normal').length;
    const totalTests = ranking.filter(r => r.mode === 'Test Fulger').length;
    const totalCorrect = ranking.reduce((sum, r) => sum + (r.correct || 0), 0);
    const avgScore = ranking.length > 0
        ? Math.round(ranking.reduce((sum, r) => sum + r.score, 0) / ranking.length)
        : 0;

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('totalCorrect').textContent = totalCorrect;
    document.getElementById('avgScore').textContent = avgScore;

    loadUserStatistics();
    loadRecentResults();
}

function loadUserStatistics() {
    const ranking = loadRanking();

    const emaData = ranking.filter(r => r.user === 'Ema');
    const raresData = ranking.filter(r => r.user === 'Rareș');

    document.getElementById('emaGames').textContent = emaData.filter(r => r.mode === 'Joc Normal').length;
    document.getElementById('emaTests').textContent = emaData.filter(r => r.mode === 'Test Fulger').length;
    document.getElementById('emaCorrect').textContent = emaData.reduce((sum, r) => sum + (r.correct || 0), 0);
    document.getElementById('emaBestAdmin').textContent = emaData[0]?.score || 0;

    document.getElementById('raresGames').textContent = raresData.filter(r => r.mode === 'Joc Normal').length;
    document.getElementById('raresTests').textContent = raresData.filter(r => r.mode === 'Test Fulger').length;
    document.getElementById('raresCorrect').textContent = raresData.reduce((sum, r) => sum + (r.correct || 0), 0);
    document.getElementById('raresBestAdmin').textContent = raresData[0]?.score || 0;
}

function loadRecentResults() {
    // ✅ Încarcă profilurile
    loadProfiles();
    
    const ranking = loadRanking();
    const recent = ranking.slice(0, 10);

    const container = document.getElementById('recentResults');
    container.innerHTML = '';

    if (recent.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nu există rezultate încă.</p>';
        return;
    }

    recent.forEach(entry => {
        // ✅ Folosește avatar-ul din profil
        const avatar = profileData[entry.user] ? profileData[entry.user].avatar : (entry.user === 'Ema' ? '👧' : '👦');
        const date = new Date(entry.date).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const div = document.createElement('div');
        div.className = 'result-row';
        div.innerHTML = `
            <div>${avatar} <strong>${entry.user}</strong></div>
            <div>${entry.mode}</div>
            <div>${entry.correct}/${entry.total} (${entry.percentage}%)</div>
            <div><strong>${entry.score}</strong> puncte</div>
            <div style="color: ${entry.grade.color}">${entry.grade.emoji} ${entry.grade.text}</div>
            <div style="font-size: 0.9em; color: #666;">${date}</div>
        `;
        container.appendChild(div);
    });
}

function showAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('adminTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');

    if (tabName === 'custom') {
        loadCustomExercises();
    }
    
    // Încarcă statisticile avansate când se deschide tab-ul Stats
    if (tabName === 'stats') {
 displayAllBadges();
        displayComparisonChart();
    displayWeeklyCalendar();
  displayProgressChart();
        loadDetailedTestHistory();
    }
}

function viewUserDetails(user) {
    const ranking = loadRanking();
    const userData = ranking.filter(r => r.user === user);

    const totalCorrect = userData.reduce((sum, r) => sum + (r.correct || 0), 0);
    const totalScore = userData.reduce((sum, r) => sum + r.score, 0);
    const avgScore = userData.length > 0 ? Math.round(totalScore / userData.length) : 0;

    alert(`📊 Detalii ${user}:\n\n` +
        `Total jocuri: ${userData.length}\n` +
        `Corecte totale: ${totalCorrect}\n` +
        `Scor total: ${totalScore}\n` +
        `Scor mediu: ${avgScore}\n` +
        `Best score: ${userData[0]?.score || 0}`
    );
}

function resetUserStats(user) {
    if (confirm(`⚠️ Sigur vrei să resetezi toate statisticile pentru ${user}?\n\nAceastă acțiune este ireversibilă!`)) {
        let ranking = loadRanking();
        ranking = ranking.filter(r => r.user !== user);
        localStorage.setItem('mathRanking', JSON.stringify(ranking));
        loadAdminDashboard();
        updateBestScores();
        alert(`✅ Statisticile pentru ${user} au fost resetate!`);
    }
}

function exportStatistics() {
    const ranking = loadRanking();

    let csv = 'Utilizator,Mod,Data,Scor,Corecte,Total,Procent,Calificativ\n';

    ranking.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString('ro-RO');
        csv += `${entry.user},${entry.mode},${date},${entry.score},${entry.correct},${entry.total},${entry.percentage}%,${entry.grade.text}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistici_matematica_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    alert('✅ Statisticile au fost exportate în format CSV!');
}

function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword').value;

    if (newPassword.length < 4) {
        alert('⚠️ Parola trebuie să aibă minim 4 caractere!');
        return;
    }

    if (confirm('Sigur vrei să schimbi parola de admin?')) {
        localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
        document.getElementById('newAdminPassword').value = '';
        alert(`✅ Parola a fost schimbată cu succes!\n\nNoua parolă: ${newPassword}\n\nNotează-o!`);
    }
}

function clearAllData() {
    if (confirm('⚠️⚠️⚠️ ATENȚIE!\n\nVrei să ștergi TOATE datele?\n\nAceastă acțiune va șterge:\n- Toate scorurile\n- Toate statisticile\n\nEști ABSOLUT sigur?')) {
        if (confirm('Ultima verificare! Ștergi TOATE datele?')) {
            localStorage.removeItem('mathRanking');
            loadAdminDashboard();
            updateBestScores();
            alert('✅ Toate datele au fost șterse!');
        }
    }
}

// Exerciții custom
let customExercises = [];

function loadCustomExercises() {
    const stored = localStorage.getItem('customExercises');
    customExercises = stored ? JSON.parse(stored) : [];
    displayCustomExercises();
}

function addCustomExercise() {
    const operation = document.getElementById('customOperation').value;
    const num1 = parseInt(document.getElementById('customNum1').value);
    const num2 = parseInt(document.getElementById('customNum2').value);

    if (isNaN(num1) || isNaN(num2)) {
        alert('⚠️ Introdu numere valide!');
        return;
    }

    let answer;
    const operators = { add: '+', sub: '-', mul: '×', div: '÷' };

    if (operation === 'add') answer = num1 + num2;
    else if (operation === 'sub') answer = num1 - num2;
    else if (operation === 'mul') answer = num1 * num2;
    else if (operation === 'div') answer = Math.floor(num1 / num2);

    const display = `${num1} ${operators[operation]} ${num2} = ?`;

    customExercises.push({ operation, num1, num2, answer, display });
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
    displayCustomExercises();

    document.getElementById('customNum1').value = '';
    document.getElementById('customNum2').value = '';

    alert('✅ Exercițiu adăugat!');
}

function displayCustomExercises() {
    const container = document.getElementById('customExercisesList');
    container.innerHTML = '';

    if (customExercises.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nu există exerciții custom.</p>';
        return;
    }

    customExercises.forEach((ex, index) => {
        const div = document.createElement('div');
        div.className = 'custom-exercise-item';
        div.innerHTML = `
            <span style="flex: 1;">${index + 1}. ${ex.display}</span>
            <span style="color: #667eea; font-weight: bold;">Răspuns: ${ex.answer}</span>
            <button class="btn btn-logout" onclick="deleteCustomExercise(${index})" 
                    style="padding: 5px 10px; font-size: 0.9em; margin-left: 15px;">
                🗑️
            </button>
        `;
        container.appendChild(div);
    });
}

function deleteCustomExercise(index) {
    if (confirm('Ștergi acest exercițiu?')) {
        customExercises.splice(index, 1);
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
        displayCustomExercises();
    }
}

function exportCustomExercises() {
    if (customExercises.length === 0) {
        alert('⚠️ Nu există exerciții de exportat!');
        return;
    }

    let text = `EXERCIȚII PERSONALIZATE - ${new Date().toLocaleDateString('ro-RO')}\n`;
    text += `Creat pentru: Ema & Rareș\n`;
    text += `═══════════════════════════════════════\n\n`;

    customExercises.forEach((ex, i) => {
        text += `${i + 1}. ${ex.display}\n`;
        text += `   Răspuns: ${ex.answer}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exercitii_custom_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();

    alert('✅ Exercițiile au fost exportate!');
}

// ============================================
// ADMIN - DETALII TEST
// ============================================
function showTestDetails(testEntry) {
    const modal = document.getElementById('testDetailsModal');
    modal.style.display = 'block';

    document.getElementById('testDetailsTitle').textContent =
        `📝 Test ${testEntry.user} - ${new Date(testEntry.date).toLocaleDateString('ro-RO')}`;

    document.getElementById('detailScore').textContent = testEntry.score;
    document.getElementById('detailCorrect').textContent = `${testEntry.correct}/${testEntry.total}`;
    document.getElementById('detailPercentage').textContent = `${testEntry.percentage}%`;

    // Afișează întrebările (dacă sunt salvate)
    if (testEntry.questions && testEntry.answers) {
        displayQuestionsReview(testEntry.questions, testEntry.answers);
    } else {
        document.getElementById('questionsReview').innerHTML =
            '<p style="text-align: center; color: #666; padding: 40px;">Detaliile întrebului nu sunt disponibile pentru acest test vechi.</p>';
    }

    playSound('click');
}

function displayQuestionsReview(questions, answers) {
    const container = document.getElementById('questionsReview');
    container.innerHTML = '';

    questions.forEach((q, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === q.answer;

        const div = document.createElement('div');
        div.className = `question-review-item ${isCorrect ? 'correct' : 'wrong'}`;
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <strong style="color: #667eea;">Întrebarea ${index + 1}</strong>
                <span style="font-size: 1.5em;">${isCorrect ? '✓' : '✗'}</span>
            </div>
            <div style="font-size: 1.1em; margin: 10px 0; font-weight: 600;">
                ${q.display}
            </div>
            <div style="margin: 10px 0;">
                <strong style="color: ${isCorrect ? '#10b981' : '#ef4444'};">
                    Răspuns elev:
                </strong> 
                ${userAnswer !== null ? userAnswer : '(nerăspuns)'}
            </div>
            ${!isCorrect ? `<div style="margin: 10px 0;">
                    <strong style="color: #10b981;">Răspuns corect:</strong> ${q.answer}
                </div>
                <div style="margin-top: 10px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; font-size: 0.9em;">
                    💡 <strong>Explicație:</strong> ${generateQuickExplanation(q)}
                </div>` : ''}
        `;

        container.appendChild(div);
    });
}

function generateQuickExplanation(question) {
    const { a, b, operation, answer } = question;

    if (operation === 'add') {
        return `${a} + ${b} = ${answer}. Adunăm cele două numere.`;
    } else if (operation === 'sub') {
        return `${a} - ${b} = ${answer}. Scădem ${b} din ${a}.`;
    } else if (operation === 'mul') {
        return `${a} × ${b} = ${answer}. Înmulțim ${a} cu ${b}.`;
    } else {
        return `${a} ÷ ${b} = ${answer}. Împărțim ${a} la ${b}.`;
    }
}

function closeTestDetails() {
    document.getElementById('testDetailsModal').style.display = 'none';
    playSound('click');
}

// ============================================
// TEST FUNCTIONS - NAVIGATION
// ============================================
function getTeacherComment(percentage) {
    if (percentage === 100) {
        return `<p>🌟 <strong>Excepțional!</strong> Ai rezolvat perfect toate calculele! Ești un adevărat campion la matematică!</p>`;
    } else if (percentage >= 90) {
        return `<p>🏆 <strong>Foarte bine!</strong> Ai făcut o treabă excelentă! Continuă tot așa și vei deveni un expert!</p>`;
    } else if (percentage >= 75) {
        return `<p>🌟 <strong>Bine!</strong> Ai avut un rezultat bun! Cu puțină exersare vei fi și mai bun!</p>`;
    } else if (percentage >= 50) {
        return `<p>👍 <strong>Suficient!</strong> Ai trecut testul! Încearcă să exersezi mai mult pentru a obține rezultate mai bune!</p>`;
    } else {
        return `<p>💪 <strong>Nu te descuraja!</strong> Matematica cere exersare. Încearcă din nou și vei vedea că vei reuși mai bine!</p>`;
    }
}

function retakeTest() {
    document.getElementById('testResultScreen').style.display = 'none';

    // Resetează variabilele testului
    testQuestions = [];
    testAnswers = [];

    // Pornește un test nou
    startTestMode();

    playSound('click');
    showMascotMessage('Hai să facem alt test! 📝', 2000);
}

function backToLoginFromTest() {
    document.getElementById('testResultScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';

    // Resetează toate variabilele
    currentUser = null;
    testQuestions = [];
    testAnswers = [];

    playSound('click');
}

function cancelTest() {
    if (confirm('Sigur vrei să renunți la test? Progresul va fi pierdut!')) {
        document.getElementById('testScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'block';

        // Resetează testul
        testQuestions = [];
        testAnswers = [];

        playSound('click');
    }
}

// ============================================
// RANKING FUNCTIONS
// ============================================
function showRanking() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('rankingScreen').style.display = 'block';

    // ✅ Încarcă profilurile pentru avatar-uri
    loadProfiles();

    const ranking = loadRanking();
    const rankingTable = document.getElementById('rankingTable');
    rankingTable.innerHTML = '';

    if (ranking.length === 0) {
        rankingTable.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nu există rezultate încă. Fii primul! 🎯</p>';
        return;
    }

    ranking.slice(0, 20).forEach((entry, index) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';

        // ✅ Folosește avatar-ul din profil
        const avatar = profileData[entry.user] ? profileData[entry.user].avatar : (entry.user === 'Ema' ? '👧' : '👦');
        const position = index + 1;
        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';

        row.innerHTML = `
            <div class="ranking-position">${medal || position}</div>
            <div class="ranking-player">
                <div class="ranking-avatar">${avatar}</div>
                <div>
                    <div class="ranking-name">${entry.user}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${entry.mode} - ${entry.correct}/${entry.total} (${entry.percentage}%)
                    </div>
                    <div style="font-size: 0.85em; color: #999;">
                        ${new Date(entry.date).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
                    </div>
                </div>
            </div>
            <div class="ranking-score">${entry.score} 🏆</div>
        `;

        rankingTable.appendChild(row);
    });

    playSound('click');
}

function backToLogin() {
    document.getElementById('rankingScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    playSound('click');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Inițializează parola admin
    initializeAdminPassword();

    // Actualizează best scores
    updateBestScores();

    // Creează particule
    createParticles();

    // Inițializează mascota
    initMascot();

    // Încarcă tema salvată
    const savedTheme = localStorage.getItem('currentTheme') || 'default';
    setTheme(savedTheme);

    // Încarcă starea sunetului
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        const icon = document.getElementById('soundIcon');
        const toggle = document.querySelector('.sound-toggle');
        if (!soundEnabled) {
            icon.textContent = '🔇';
            toggle.classList.add('muted');
        }
    }

    // Suport Enter pentru Duel
    const emaInput = document.getElementById('duelAnswerEmaSecure');
    const raresInput = document.getElementById('duelAnswerRaresSecure');
    
    if (emaInput) {
        emaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitEmaAnswer();
        });
    }
    
    if (raresInput) {
        raresInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitRaresAnswer();
        });
    }

    console.log('✅ Aplicația a fost inițializată cu succes!');
});

// ============================================
// VARIABILE PENTRU MODURI NOI
// ============================================
let raceQuestions = [];
let raceCurrentIndex = 0;
let raceStartTime = null;
let raceTimerInterval = null;

let randomQuestions = [];
let randomCurrentIndex = 0;
let randomOperationCounts = { add: 0, sub: 0, mul: 0, div: 0 };

let puzzleQuestions = [];
let puzzleCurrentIndex = 0;
let puzzleUnlockedPieces = [];
let puzzleImages = [
    '🦁', '🐯', '🐻', '🦊', '🐼', '🦄', '🦋', '🐨',
    '🐘', '🦒', '🦓', '🦘', '🦜', '🦩', '🦚', '🦔'
];

let duelQuestions = [];
let duelCurrentRound = 0;
let duelScores = { Ema: 0, Rareș: 0 };
let duelAnswers = { Ema: null, Rareș: null };
let currentGameMode = 'normal';

// ============================================
// MOD CURSĂ - 20 CALCULE CÂT MAI REPEDE
// ============================================
function startRaceMode() {
    currentGameMode = 'race';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('raceScreen').style.display = 'block';

    document.getElementById('racePlayer').textContent = `👤 ${currentUser}`;
    
    // Generează 20 întrebări
    raceQuestions = [];
    for (let i = 0; i < 20; i++) {
        raceQuestions.push(generateRandomQuestion());
    }
    
    raceCurrentIndex = 0;
    raceStartTime = Date.now();
    
    updateRaceUI();
    startRaceTimer();
    
    showRaceQuestion();
    
    // Enter pentru submit
    document.getElementById('raceAnswer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkRaceAnswer();
    });
    
    playSound('click');
    showMascotMessage('🏃 Alergă către victorie!', 2000);
}

function showRaceQuestion() {
    const q = raceQuestions[raceCurrentIndex];
    document.getElementById('raceQuestion').textContent = q.display;
    document.getElementById('raceAnswer').value = '';
    document.getElementById('raceAnswer').focus();
}

function checkRaceAnswer() {
    const userAnswer = parseInt(document.getElementById('raceAnswer').value);
    const q = raceQuestions[raceCurrentIndex];
    
    if (userAnswer === q.answer) {
        correctCount++;
        streak++;
        playSound('correct');
        
        // Actualizează poziția pe pistă
        const progress = ((raceCurrentIndex + 1) / 20) * 100;
        document.getElementById('raceRunner').style.left = `${progress}%`;
        
    } else {
        wrongCount++;
        streak = 0;
        playSound('wrong');
    }
    
    raceCurrentIndex++;
    updateRaceUI();
    
    if (raceCurrentIndex >= 20) {
        finishRace();
    } else {
        showRaceQuestion();
    }
}

function updateRaceUI() {
    document.getElementById('raceProgress').textContent = `${raceCurrentIndex}/20`;
    document.getElementById('raceCorrect').textContent = correctCount;
    document.getElementById('raceWrong').textContent = wrongCount;
    document.getElementById('raceStreak').textContent = streak;
}

function startRaceTimer() {
    raceTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - raceStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('raceTimer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function finishRace() {
    clearInterval(raceTimerInterval);
    const totalTime = Math.floor((Date.now() - raceStartTime) / 1000);
    const finalScore = Math.max(0, 1000 - (totalTime * 5) + (correctCount * 50) - (wrongCount * 20));
    
    // Salvează scorul
    saveScore(currentUser, finalScore, correctCount, 20, false);
    
    // Verifică badge pentru viteză
    if (totalTime < 60 && correctCount >= 15) {
        awardBadge(currentUser, 'speed_demon');
    }
    
    showModeResult('race', {
        time: totalTime,
        correct: correctCount,
        wrong: wrongCount,
        score: finalScore
    });
    
    document.getElementById('raceScreen').style.display = 'none';
}

function quitRace() {
    if (confirm('Sigur vrei să renunți la cursă?')) {
        clearInterval(raceTimerInterval);
        document.getElementById('raceScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'block';
        resetGameVars();
    }
}

// ============================================
// MOD ALEATORIU - OPERAȚII MIXTE SURPRIZĂ
// ============================================
function startRandomMode() {
    currentGameMode = 'random';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('randomScreen').style.display = 'block';

    document.getElementById('randomPlayer').textContent = currentUser;
    
    // Generează 15 întrebări cu operații random
    randomQuestions = [];
    randomOperationCounts = { add: 0, sub: 0, mul: 0, div: 0 };
    
    for (let i = 0; i < 15; i++) {
        const operations = ['add', 'sub', 'mul', 'div'];
        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        randomQuestions.push(generateQuestionByType(randomOp));
        randomOperationCounts[randomOp]++;
    }
    
    randomCurrentIndex = 0;
    updateRandomUI();
    showRandomQuestion();
    
    playSound('click');
    showMascotMessage('🎲 Pregătește-te pentru surprize!', 2000);
}

function showRandomQuestion() {
    // Animație mystery box
    const mysteryBox = document.getElementById('randomMysteryBox');
    mysteryBox.style.display = 'flex';
    
    setTimeout(() => {
        mysteryBox.style.display = 'none';
        const q = randomQuestions[randomCurrentIndex];
        document.getElementById('randomQuestion').textContent = q.display;
        document.getElementById('randomAnswer').value = '';
        document.getElementById('randomAnswer').focus();
    }, 1000);
}

function checkRandomAnswer() {
    const userAnswer = parseInt(document.getElementById('randomAnswer').value);
    const q = randomQuestions[randomCurrentIndex];
    
    if (userAnswer === q.answer) {
        correctCount++;
        score += 50;
        playSound('correct');
    } else {
        wrongCount++;
        playSound('wrong');
    }
    
    randomCurrentIndex++;
    updateRandomUI();
    
    if (randomCurrentIndex >= 15) {
        finishRandom();
    } else {
        showRandomQuestion();
    }
}

function updateRandomUI() {
    document.getElementById('randomProgress').textContent = `${randomCurrentIndex + 1}/15`;
    document.getElementById('addCount').textContent = randomOperationCounts.add;
    document.getElementById('subCount').textContent = randomOperationCounts.sub;
    document.getElementById('mulCount').textContent = randomOperationCounts.mul;
    document.getElementById('divCount').textContent = randomOperationCounts.div;
}

function finishRandom() {
    saveScore(currentUser, score, correctCount, 15, false);
    showModeResult('random', {
        correct: correctCount,
        wrong: wrongCount,
        score: score
    });
    document.getElementById('randomScreen').style.display = 'none';
}

function quitRandom() {
    if (confirm('Sigur vrei să ieși?')) {
        document.getElementById('randomScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'block';
        resetGameVars();
    }
}

// ============================================
// MOD PUZZLE - DEBLOCHEAZĂ IMAGINEA
// ============================================
function startPuzzleMode() {
    currentGameMode = 'puzzle';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('puzzleScreen').style.display = 'block';

    document.getElementById('puzzlePlayer').textContent = currentUser;
    
    // Generează puzzle grid 4x4
    const puzzleGrid = document.getElementById('puzzleGrid');
    puzzleGrid.innerHTML = '';
    puzzleUnlockedPieces = [];
    
    for (let i = 0; i < 16; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece locked';
        piece.id = `piece${i}`;
        piece.textContent = '🔒';
        puzzleGrid.appendChild(piece);
    }
    
    // Generează întrebări
    puzzleQuestions = [];
    for (let i = 0; i < 16; i++) {
        puzzleQuestions.push(generateRandomQuestion());
    }
    
    puzzleCurrentIndex = 0;
    showPuzzleQuestion();
    
    playSound('click');
    showMascotMessage('🧩 Deblochează toate piesele!', 2000);
}

function showPuzzleQuestion() {
    const q = puzzleQuestions[puzzleCurrentIndex];
    document.getElementById('puzzleQuestion').textContent = q.display;
    document.getElementById('puzzleAnswer').value = '';
    document.getElementById('puzzleAnswer').focus();
}

function checkPuzzleAnswer() {
    const userAnswer = parseInt(document.getElementById('puzzleAnswer').value);
    const q = puzzleQuestions[puzzleCurrentIndex];
    
    if (userAnswer === q.answer) {
        correctCount++;
        score += 100;
        playSound('correct');
        
        // Deblochează o piesă
        const piece = document.getElementById(`piece${puzzleCurrentIndex}`);
        piece.classList.remove('locked');
        piece.classList.add('unlocked');
        piece.textContent = puzzleImages[puzzleCurrentIndex];
        
        puzzleUnlockedPieces.push(puzzleCurrentIndex);
        document.getElementById('puzzlePieces').textContent = `${puzzleUnlockedPieces.length}/16`;
        
        puzzleCurrentIndex++;
        
        if (puzzleCurrentIndex >= 16) {
            finishPuzzle();
        } else {
            showPuzzleQuestion();
        }
    } else {
        wrongCount++;
        playSound('wrong');
        showMascotMessage('❌ Încearcă din nou!', 1500);
    }
}

function finishPuzzle() {
    createEnhancedConfetti();
    saveScore(currentUser, score, correctCount, 16, false);
    
    setTimeout(() => {
        showModeResult('puzzle', {
            correct: correctCount,
            wrong: wrongCount,
            score: score
        });
        document.getElementById('puzzleScreen').style.display = 'none';
    }, 2000);
}

function quitPuzzle() {
    if (confirm('Sigur vrei să ieși? Progresul va fi pierdut!')) {
        document.getElementById('puzzleScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'block';
        resetGameVars();
    }
}

// ============================================
// MOD DUEL - EMA VS RAREȘ
// ============================================
function startDuelMode() {
    currentGameMode = 'duel';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('duelScreen').style.display = 'block';

    // Generează 10 întrebări
    duelQuestions = [];
    for (let i = 0; i < 10; i++) {
        duelQuestions.push(generateRandomQuestion());
    }
    
    duelCurrentRound = 0;
    duelScores = { Ema: 0, Rareș: 0 };
    duelAnswers = { Ema: null, Rareș: null };
    
    updateDuelUI();
    startDuelRound();
    
    playSound('click');
    showMascotMessage('⚔️ Să înceapă duelul! Fiecare jucător va răspunde pe rând!', 3000);
}

function submitEmaAnswer() {
    const answer = parseInt(document.getElementById('duelAnswerEmaSecure').value);
    
    if (isNaN(answer)) {
        showMascotMessage('❌ Introduceți un număr valid!', 2000);
        return;
    }
    
    duelAnswers.Ema = answer;
    
    // Ascunde faza Ema
    document.getElementById('duelPhaseEma').style.display = 'none';
    document.getElementById('duelStatusEma').textContent = '✅ Răspuns trimis!';
    document.getElementById('duelStatusRares').textContent = 'Pregătește-te...';
    
    playSound('correct');
    
    // Start faza Rareș după 1 secundă
    setTimeout(() => {
        document.getElementById('duelPhaseRares').style.display = 'block';
        document.getElementById('duelAnswerRaresSecure').focus();
        playSound('click');
    }, 1000);
}

function submitRaresAnswer() {
    const answer = parseInt(document.getElementById('duelAnswerRaresSecure').value);
    
    if (isNaN(answer)) {
        showMascotMessage('❌ Introduceți un număr valid!', 2000);
        return;
    }
    
    duelAnswers.Rareș = answer;
    
    // Ascunde faza Rareș
    document.getElementById('duelPhaseRares').style.display = 'none';
    document.getElementById('duelStatusRares').textContent = '✅ Răspuns trimis!';
    
    playSound('correct');
    
    // Arată mesajul de așteptare
    document.getElementById('duelPhaseWait').style.display = 'block';
    
    // Verifică răspunsurile după 2 secunde
    setTimeout(() => {
        checkDuelRoundResults();
    }, 2000);
}

function checkDuelRoundResults() {
    const q = duelQuestions[duelCurrentRound];
    const correctAnswer = q.answer;
    
    // Verifică răspunsurile
    const emaCorrect = duelAnswers.Ema === correctAnswer;
    const raresCorrect = duelAnswers.Rareș === correctAnswer;
    
    let resultMessage = '';
    
    if (emaCorrect && !raresCorrect) {
        duelScores.Ema += 10;
        document.getElementById('duelStatusEma').textContent = '✅ Corect! +10 puncte';
        document.getElementById('duelStatusRares').textContent = `❌ Greșit (Răspuns: ${correctAnswer})`;
        resultMessage = '👧 Ema câștigă această rundă!';
        playSound('correct');
    } else if (raresCorrect && !emaCorrect) {
        duelScores.Rareș += 10;
        document.getElementById('duelStatusEma').textContent = `❌ Greșit (Răspuns: ${correctAnswer})`;
        document.getElementById('duelStatusRares').textContent = '✅ Corect! +10 puncte';
        resultMessage = '👦 Rareș câștigă această rundă!';
        playSound('correct');
    } else if (emaCorrect && raresCorrect) {
        duelScores.Ema += 5;
        duelScores.Rareș += 5;
        document.getElementById('duelStatusEma').textContent = '✅ Corect! +5 puncte';
        document.getElementById('duelStatusRares').textContent = '✅ Corect! +5 puncte';
        resultMessage = '🤝 Egalitate! Ambii primesc puncte!';
        playSound('badge');
    } else {
        document.getElementById('duelStatusEma').textContent = `❌ Greșit (Răspuns: ${correctAnswer})`;
        document.getElementById('duelStatusRares').textContent = `❌ Greșit (Răspuns: ${correctAnswer})`;
        resultMessage = '😅 Ambii au greșit!';
        playSound('wrong');
    }
    
    // Ascunde faza de așteptare
    document.getElementById('duelPhaseWait').style.display = 'none';
    
    // Actualizează scorurile
    updateDuelUI();
    
    // Arată mesajul rezultat
    showMascotMessage(resultMessage, 3000);
    
    // Trece la următoarea rundă sau finalizează
    duelCurrentRound++;
    
    if (duelCurrentRound >= 10) {
        setTimeout(() => finishDuel(), 3000);
    } else {
        setTimeout(() => startDuelRound(), 3500);
    }
}

function startDuelRound() {
    const q = duelQuestions[duelCurrentRound];
    document.getElementById('duelQuestion').textContent = q.display;
    document.getElementById('duelRound').textContent = duelCurrentRound + 1;
    
    // Resetează răspunsurile
    duelAnswers = { Ema: null, Rareș: null };
    document.getElementById('duelAnswerEmaSecure').value = '';
    document.getElementById('duelAnswerRaresSecure').value = '';
    
    // Ascunde toate fazele
    document.getElementById('duelPhaseEma').style.display = 'none';
    document.getElementById('duelPhaseRares').style.display = 'none';
    document.getElementById('duelPhaseWait').style.display = 'none';
    
    // Actualizează status
    document.getElementById('duelStatusEma').textContent = 'Pregătește-te...';
    document.getElementById('duelStatusRares').textContent = 'Așteaptă...';
    
    // Start cu faza Ema după 1 secundă
    setTimeout(() => {
        document.getElementById('duelPhaseEma').style.display = 'block';
        document.getElementById('duelAnswerEmaSecure').focus();
        playSound('click');
    }, 1000);
}

function showDuelQuestion() {
    const q = duelQuestions[duelCurrentRound];
    document.getElementById('duelQuestion').textContent = q.display;
    document.getElementById('duelRound').textContent = duelCurrentRound + 1;
    
    document.getElementById('duelAnswerEma').value = '';
    document.getElementById('duelAnswerRares').value = '';
    document.getElementById('duelAnswerEma').focus();
}

function checkDuelAnswers() {
    const q = duelQuestions[duelCurrentRound];
    const answerEma = parseInt(document.getElementById('duelAnswerEma').value);
    const answerRares = parseInt(document.getElementById('duelAnswerRares').value);
    
    let winner = null;
    
    // Verifică răspunsurile
    if (answerEma === q.answer && answerRares !== q.answer) {
        duelScores.Ema += 10;
        winner = 'Ema';
        document.getElementById('duelStatusEma').textContent = '✅ Corect!';
        document.getElementById('duelStatusRares').textContent = '❌ Greșit';
    } else if (answerRares === q.answer && answerEma !== q.answer) {
        duelScores.Rareș += 10;
        winner = 'Rareș';
        document.getElementById('duelStatusEma').textContent = '❌ Greșit';
        document.getElementById('duelStatusRares').textContent = '✅ Corect!';
    } else if (answerEma === q.answer && answerRares === q.answer) {
        duelScores.Ema += 5;
        duelScores.Rareș += 5;
        document.getElementById('duelStatusEma').textContent = '🤝 Egalitate';
        document.getElementById('duelStatusRares').textContent = '🤝 Egalitate';
    } else {
        document.getElementById('duelStatusEma').textContent = '❌ Ambii greșit';
        document.getElementById('duelStatusRares').textContent = '❌ Ambii greșit';
    }
    
    playSound(winner ? 'correct' : 'wrong');
    
    duelCurrentRound++;
    updateDuelUI();
    
    setTimeout(() => {
        if (duelCurrentRound >= 10) {
            finishDuel();
        } else {
            document.getElementById('duelStatusEma').textContent = 'Pregătește-te...';
            document.getElementById('duelStatusRares').textContent = 'Pregătește-te...';
            showDuelQuestion();
        }
    }, 2000);
}

function updateDuelUI() {
    document.getElementById('duelScoreEma').textContent = duelScores.Ema;
    document.getElementById('duelScoreRares').textContent = duelScores.Rareș;
}

function finishDuel() {
    let winner = duelScores.Ema > duelScores.Rareș ? 'Ema' : 
                 duelScores.Rareș > duelScores.Ema ? 'Rareș' : 'Egalitate';
    
    // Salvează scorurile
    saveScore('Ema', duelScores.Ema, 0, 10, false);
    saveScore('Rareș', duelScores.Rareș, 0, 10, false);
    
    showModeResult('duel', {
        winner: winner,
        emaScore: duelScores.Ema,
        raresScore: duelScores.Rareș
    });
    
    document.getElementById('duelScreen').style.display = 'none';
}

function quitDuel() {
    if (confirm('Sigur vrei să ieși din duel?')) {
        document.getElementById('duelScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'block';
        resetGameVars();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateRandomQuestion() {
    const operations = ['add', 'sub', 'mul', 'div'];
    const randomOp = operations[Math.floor(Math.random() * operations.length)];
    return generateQuestionByType(randomOp);
}

function generateQuestionByType(type) {
    let a, b, answer, display;
    
    if (type === 'add') {
        a = Math.floor(Math.random() * (maxLimit / 2)) + 1;
        b = Math.floor(Math.random() * (maxLimit - a)) + 1;
        answer = a + b;
        display = `${a} + ${b} = ?`;
    } else if (type === 'sub') {
        a = Math.floor(Math.random() * maxLimit) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        display = `${a} - ${b} = ?`;
    } else if (type === 'mul') {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        display = `${a} × ${b} = ?`;
    } else {
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        display = `${a} ÷ ${b} = ?`;
    }
    
    return { a, b, answer, display, type };
}

function showModeResult(mode, data) {
    document.getElementById('modeResultScreen').style.display = 'block';
    
    let title, emoji, stats, message;
    
    if (mode === 'race') {
        const minutes = Math.floor(data.time / 60);
        const seconds = data.time % 60;
        title = '🏃 CURSĂ FINALIZATĂ!';
        emoji = data.correct >= 15 ? '🏆' : '🥉';
        stats = `
            <div class="result-stat">⏱️ Timp: ${minutes}:${String(seconds).padStart(2, '0')}</div>
            <div class="result-stat">✅ Corecte: ${data.correct}/20</div>
            <div class="result-stat">❌ Greșite: ${data.wrong}</div>
            <div class="result-stat">🏆 Scor: ${data.score}</div>
        `;
        message = data.time < 60 ? 'Incredibil de rapid! ⚡' : 'Bun timp! Poți mai bine! 💪';
    } else if (mode === 'random') {
        title = '🎲 MOD ALEATORIU FINALIZAT!';
        emoji = data.correct >= 12 ? '🌟' : '👍';
        stats = `
            <div class="result-stat">✅ Corecte: ${data.correct}/15</div>
            <div class="result-stat">❌ Greșite: ${data.wrong}</div>
            <div class="result-stat">🏆 Scor: ${data.score}</div>
        `;
        message = 'Te-ai descurcat grozav cu surprizele! 🎉';
    } else if (mode === 'puzzle') {
        title = '🧩 PUZZLE COMPLETAT!';
        emoji = '🎨';
        stats = `
            <div class="result-stat">🧩 Piese: 16/16</div>
            <div class="result-stat">✅ Corecte: ${data.correct}</div>
            <div class="result-stat">🏆 Scor: ${data.score}</div>
        `;
        message = 'Imaginea este completă! Superb! 🌟';
    } else if (mode === 'duel') {
        title = '⚔️ DUEL FINALIZAT!';
        emoji = data.winner === 'Egalitate' ? '🤝' : '👑';
        stats = `
            <div class="result-stat">👧 Ema: ${data.emaScore}</div>
            <div class="result-stat">👦 Rareș: ${data.raresScore}</div>
            <div class="result-stat">🏆 Câștigător: ${data.winner}</div>
        `;
        message = data.winner === 'Egalitate' ? 
            'Egalitate perfectă! Ambii sunteți campioni! 🤝' :
            `Felicitări ${data.winner}! Campion! 👑`;
    }
    
    document.getElementById('modeResultTitle').textContent = title;
    document.getElementById('modeResultEmoji').textContent = emoji;
    document.getElementById('modeResultStats').innerHTML = stats;
    document.getElementById('modeResultMessage').textContent = message;
    
    createEnhancedConfetti();
    playSound('badge');
}

function retryMode() {
    document.getElementById('modeResultScreen').style.display = 'none';
    
    if (currentGameMode === 'race') startRaceMode();
    else if (currentGameMode === 'random') startRandomMode();
    else if (currentGameMode === 'puzzle') startPuzzleMode();
    else if (currentGameMode === 'duel') startDuelMode();
}

function backToSettings() {
    document.getElementById('modeResultScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'block';
    resetGameVars();
}

function resetGameVars() {
    correctCount = 0;
    wrongCount = 0;
    score = 0;
    streak = 0;
    currentQuestion = 0;
}

// Actualizează funcția startGame() existentă
function startGame() {
    document.getElementById('settingsScreen').style.display = 'none';

    if (gameMode === 'test') {
        startTestMode();
    } else if (gameMode === 'race') {
        startRaceMode();
    } else if (gameMode === 'random') {
        startRandomMode();
    } else if (gameMode === 'puzzle') {
        startPuzzleMode();
    } else if (gameMode === 'duel') {
        startDuelMode();
    } else {
        // Joc normal existent
        document.getElementById('gameScreen').style.display = 'block';
        const avatar = currentUser === 'Ema' ? '👧' : '👦';
        const digitLabels = {
            'auto': 'Auto',
            'single': '1 cifră',
            'double': '2 cifre',
            'mixed': 'Mixt'
        };

        document.getElementById('playerInfo').innerHTML = `
            <div class="player-avatar">${avatar}</div>
            <div class="player-details">
                <h2>${currentUser}</h2>
                <p>⏱️ ${selectedTime} sec | ${selectedFormat === 'inline' ? '➡️ În linie' : '⬇️ Vertical'}</p>
                <p>🎯 Max: ${maxLimit} | 🔢 ${digitLabels[digitType]}</p>
            </div>
        `;

        hintsRemaining = 3;
        updateHintsDisplay();
        resetGame();

        playSound('click');
        showMascotMessage('Mult succes! 🌟', 2000);
    }
}

// ============================================
// SISTEM PROFILURI PERSONALIZABILE
// ============================================

let isEditMode = false;
let selectedAvatar = null;
let profileData = {
    'Ema': {
        avatar: '👧',
        level: 1,
        xp: 0,
        xpMax: 100,
        theme: 'purple',
        achievements: [],
        // ✅ NOI CÂMPURI PENTRU XP SYSTEM
        lastDailyReward: 0,           // Timestamp ultima recompensă zilnică
        dailyStreak: 0,                // Zile consecutive de login
        totalXPEarned: 0,              // Total XP câștigat vreodată
        currentStreak: 0,              // Streak-ul curent de răspunsuri corecte
        bestStreak: 0,                 // Cel mai bun streak
        gamesCompleted: 0,             // Număr total de jocuri completate
        currentTitle: 'beginner'       // Titlul activ
    },
    'Rareș': {
        avatar: '👦',
        level: 1,
        xp: 0,
        xpMax: 100,
        theme: 'blue',
        achievements: [],
        // ✅ NOI CÂMPURI PENTRU XP SYSTEM
        lastDailyReward: 0,
        dailyStreak: 0,
        totalXPEarned: 0,
        currentStreak: 0,
        bestStreak: 0,
        gamesCompleted: 0,
        currentTitle: 'beginner'
    }
};

// Avatar-uri disponibile
const AVATAR_CATEGORIES = {
    emoji: ['👧', '👦', '😊', '😎', '🤓', '😇', '🥳', '🤩', '🤗', '😺', '🦸', '🧙'],
    animals: ['🦁', '🐯', '🐻', '🦊', '🐼', '🦄', '🦋', '🐨', '🐘', '🦒', '🐧', '🦜'],
    space: ['🚀', '🛸', '👽', '🌟', '⭐', '💫', '🌙', '🪐', '🌍', '☄️', '🛰️', '🌌'],
    food: ['🍕', '🍔', '🌮', '🍦', '🍰', '🍪', '🍩', '🧁', '🍓', '🍌', '🍉', '🍇']
};

// Încarcă profile din localStorage
function loadProfiles() {
    const stored = localStorage.getItem('userProfiles');
    if (stored) {
        profileData = JSON.parse(stored);
    }
}

// Salvează profile în localStorage
function saveProfiles() {
    localStorage.setItem('userProfiles', JSON.stringify(profileData));
}

// Deschide ecranul de profil
function openProfile(user) {
    currentUser = user;
    loadProfiles();
    
    // Ascunde toate ecranele
    document.querySelectorAll('.login-screen, .settings-screen, .game-screen, .ranking-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Afișează ecranul de profil
    document.getElementById('profileScreen').style.display = 'block';
    
    // Actualizează UI-ul profilului
    updateProfileUI();
    playSound('click');
    
    // Scroll la top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizează interfața profilului
function updateProfileUI() {
    const profile = profileData[currentUser];
    const stats = getUserStats(currentUser);
    const badges = getUserBadges(currentUser);
    
    // Avatar și Nume
    document.getElementById('profileAvatarImg').textContent = profile.avatar;
    document.getElementById('profileName').textContent = currentUser;
    
    // Nivel și XP
    document.getElementById('profileLevel').textContent = profile.level;
    document.getElementById('profileXP').textContent = profile.xp;
    document.getElementById('profileXPMax').textContent = profile.xpMax;
    
    const xpPercent = (profile.xp / profile.xpMax) * 100;
    document.getElementById('profileLevelProgress').style.width = `${xpPercent}%`;
    
    // Statistici Rapide
    document.getElementById('profileTotalGames').textContent = stats.totalGames + stats.totalTests;
    document.getElementById('profileBestScore').textContent = loadRanking().filter(r => r.user === currentUser)[0]?.score || 0;
    document.getElementById('profileCorrectAnswers').textContent = stats.totalCorrect;
    
    const totalAnswers = stats.totalCorrect + stats.totalTests * 20;
    const accuracy = totalAnswers > 0 ? Math.round((stats.totalCorrect / totalAnswers) * 100) : 0;
    document.getElementById('profileAccuracy').textContent = `${accuracy}%`;
    
    // Badge-uri
    document.getElementById('profileBadgeCount').textContent = badges.length;
    document.getElementById('profileBadgeTotal').textContent = Object.keys(BADGES).length;
    displayProfileBadges(badges);
    
    // Tema selectată
    updateThemeSelection(profile.theme);
    
    // Realizări
    displayAchievements(profile.achievements);
}

// Afișează badge-urile în profil
function displayProfileBadges(userBadges) {
    const container = document.getElementById('profileBadgesGrid');
    container.innerHTML = '';
    
    Object.keys(BADGES).forEach(badgeId => {
        const badge = BADGES[badgeId];
        const isUnlocked = userBadges.includes(badgeId);
        
        const div = document.createElement('div');
        div.className = `profile-badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="badge-icon-large">${badge.emoji}</div>
            <div class="badge-name-large">${badge.name}</div>
            <div class="badge-desc-small">${badge.desc}</div>
            ${!isUnlocked ? '<div class="badge-locked-text">🔒 Blocat</div>' : ''}
        `;
        
        if (isUnlocked) {
            div.addEventListener('click', () => {
                showMascotMessage(`${badge.emoji} ${badge.name}: ${badge.desc}`, 3000);
            });
        }
        
        container.appendChild(div);
    });
}

// Actualizează selecția temei
function updateThemeSelection(selectedTheme) {
    document.querySelectorAll('.profile-themes-grid .theme-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-theme') === selectedTheme) {
            card.classList.add('active');
        }
    });
}

// Selectează temă de profil
function selectProfileTheme(theme) {
    // Salvează tema în profil
    profileData[currentUser].theme = theme;
    saveProfiles();
    
    // Actualizează UI-ul
    updateThemeSelection(theme);
    
    // ✅ APLICĂ TEMA PE BODY
    applyUserTheme(theme);
    
    playSound('click');
    showMascotMessage(`🎨 Tema ${theme} a fost selectată!`, 2000);
}

// ============================================
// APLICARE TEME PERSONALIZATE
// ============================================

function applyUserTheme(theme) {
    // Mapare teme profil -> clase CSS
    const themeMapping = {
        'purple': 'theme-purple',
        'blue': 'theme-blue',
        'green': 'theme-green',
        'pink': 'theme-pink',
        'orange': 'theme-orange',
        'rainbow': 'theme-rainbow'
    };
    
    // Șterge toate temele anterioare
    document.body.classList.remove('theme-purple', 'theme-blue', 'theme-green', 'theme-pink', 'theme-orange', 'theme-rainbow');
    
    // Aplică noua temă
    if (themeMapping[theme]) {
        document.body.classList.add(themeMapping[theme]);
        console.log(`✅ Tema aplicată: ${theme}`);
    }
    
    // Salvează tema globală
    localStorage.setItem('currentUserTheme', theme);
}

// Afișează realizările
function displayAchievements(achievements) {
    const container = document.getElementById('profileAchievements');
    container.innerHTML = '';
    
    if (achievements.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nicio realizare încă. Joacă pentru a debloca! 🎮</p>';
        return;
    }
    
    achievements.slice(0, 5).reverse().forEach(achievement => {
        const div = document.createElement('div');
        div.className = 'achievement-item';
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">${achievement.text}</div>
            <div class="achievement-date">${new Date(achievement.date).toLocaleDateString('ro-RO', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</div>
        `;
        container.appendChild(div);
    });
}

// Toggle Edit Mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.querySelector('.profile-edit-btn');
    const avatarBtn = document.getElementById('avatarChangeBtn');
    
    if (isEditMode) {
        btn.textContent = '✓ Salvează';
        avatarBtn.style.display = 'block';
        showMascotMessage('✏️ Mod editare activat!', 2000);
    } else {
        btn.textContent = '✏️ Editează';
        avatarBtn.style.display = 'none';
        saveProfiles();
        showMascotMessage('💾 Modificări salvate!', 2000);
    }
    
    playSound('click');
}

// Deschide selectorul de avatar
function openAvatarSelector() {
    document.getElementById('avatarSelectorModal').style.display = 'flex';
    showAvatarCategory('emoji');
    playSound('click');
}

// Închide selectorul de avatar
function closeAvatarSelector() {
    document.getElementById('avatarSelectorModal').style.display = 'none';
    selectedAvatar = null;
    playSound('click');
}

// Afișează categoria de avatar-uri
function showAvatarCategory(category) {
    // Actualizează butoanele
    document.querySelectorAll('.avatar-cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Afișează avatar-urile
    const container = document.getElementById('avatarGrid');
    container.innerHTML = '';
    
    AVATAR_CATEGORIES[category].forEach(avatar => {
        const div = document.createElement('div');
        div.className = 'avatar-option';
        div.textContent = avatar;
        div.onclick = () => selectAvatarOption(div, avatar);
        container.appendChild(div);
    });
}

// Selectează un avatar
function selectAvatarOption(element, avatar) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedAvatar = avatar;
    playSound('click');
}

// Salvează avatar-ul selectat
function saveAvatar() {
    if (!selectedAvatar) {
        showMascotMessage('❌ Selectează un avatar mai întâi!', 2000);
        return;
    }
    
    profileData[currentUser].avatar = selectedAvatar;
    saveProfiles();
    
    // ✅ Actualizează avatar-ul în profil
    document.getElementById('profileAvatarImg').textContent = selectedAvatar;
    
    // ✅ Actualizează avatar-ul în user card (login screen)
    refreshUserAvatars();
    
    // ✅ Actualizează avatar-ul în setări dacă e activ
    const avatarInSettings = document.getElementById('selectedUserAvatar');
    if (avatarInSettings && currentUser) {
        avatarInSettings.textContent = selectedAvatar;
    }
    
    closeAvatarSelector();
    showMascotMessage('✅ Avatar salvat cu succes!', 2000);
    playSound('badge');
    
    console.log(`✅ Avatar actualizat pentru ${currentUser}: ${selectedAvatar}`);
}

// Înapoi la login din profil
function backToLoginFromProfile() {
    // Ascunde profilul
    document.getElementById('profileScreen').style.display = 'none';
    
    // Afișează login
    document.getElementById('loginScreen').style.display = 'block';
    
    // Resetează variabilele
    currentUser = null;
    isEditMode = false;
    
    // Actualizează avatar-urile în carduri
    refreshUserAvatars();
    
    // Actualizează best scores
    updateBestScores();
    
    playSound('click');
    
    // Scroll la top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Adaugă XP și nivelează
function addXP(amount) {
    if (!currentUser) return;
    addXPToUser(currentUser, 0, Math.floor(amount / 5), 10, false);
}

// Adaugă realizare
function addAchievement(icon, text) {
    if (!currentUser) return;
    
    const profile = profileData[currentUser];
    profile.achievements.push({
        icon: icon,
        text: text,
        date: new Date().toISOString()
    });
    
    saveProfiles();
}

// Override la saveScore pentru a adăuga XP
const originalSaveScore = saveScore;
saveScore = function(user, score, correctCount, totalQuestions, isTest = false) {
    originalSaveScore(user, score, correctCount, totalQuestions, isTest);
    
    // Adaugă XP bazat pe performanță
    const xpGained = Math.floor(score / 10) + correctCount * 5;
    
    // Temporar setăm currentUser pentru addXP
    const tempUser = currentUser;
    currentUser = user;
    addXP(xpGained);
    
    // Adaugă realizare
    if (score > 500) {
        addAchievement('🏆', `Scor de ${score} puncte în ${isTest ? 'Test Fulger' : 'Joc Normal'}`);
    }
    if (correctCount === totalQuestions) {
        addAchievement('💯', `Perfect! ${totalQuestions}/${totalQuestions} corecte!`);
    }
    
    currentUser = tempUser;
};

// Actualizează avatar-urile la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    loadProfiles();
    
    // Actualizează avatar-urile în user cards
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        const userName = card.querySelector('.user-name').textContent;
        if (profileData[userName]) {
            card.querySelector('.user-avatar').textContent = profileData[userName].avatar;
        }
    });
});

// ============================================
// FIX: Actualizare User Cards cu Avatar-uri
// ============================================
function refreshUserAvatars() {
    loadProfiles();
    
    // Actualizează avatar-urile în cardurile de user
    document.querySelectorAll('.user-card').forEach(card => {
        const userName = card.querySelector('.user-name').textContent;
        if (profileData[userName]) {
            card.querySelector('.user-avatar').textContent = profileData[userName].avatar;
        }
    });
}

// Apelează la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    loadProfiles();
    refreshUserAvatars();
    
    // Inițializează restul aplicației
    initializeAdminPassword();
    updateBestScores();
    createParticles();
    initMascot();
    
    // ✅ ÎNCARCĂ TEMA UTILIZATORULUI CURENT
    const lastUser = localStorage.getItem('lastActiveUser');
    if (lastUser && profileData[lastUser] && profileData[lastUser].theme) {
        applyUserTheme(profileData[lastUser].theme);
    }
    
    const savedTheme = localStorage.getItem('mathGameTheme') || 'day';
    setTheme(savedTheme);
    
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        const icon = document.getElementById('soundIcon');
        const toggle = document.querySelector('.sound-toggle');
        if (!soundEnabled) {
            icon.textContent = '🔇';
            toggle.classList.add('muted');
        }
    }
    
    console.log('✅ Aplicația a fost inițializată cu succes!');
});


// ============================================
// PROFIL - FUNCȚII NOI
// ============================================

// Titluri disponibile
const TITLES = {
    'beginner': { name: 'Începător', emoji: '🏅', requirement: 'Start', level: 0 },
    'rookie': { name: 'Rookie', emoji: '🎯', requirement: '10 jocuri', level: 10 },
    'pro': { name: 'Pro', emoji: '⭐', requirement: '50 jocuri', level: 50 },
    'expert': { name: 'Expert', emoji: '💎', requirement: '100 jocuri', level: 100 },
    'master': { name: 'Maestru', emoji: '👑', requirement: '200 jocuri', level: 200 },
    'legend': { name: 'Legendă', emoji: '🔥', requirement: '500 jocuri', level: 500 },
    'champion': { name: 'Campion', emoji: '🏆', requirement: 'Scor > 800', special: true },
    'speedster': { name: 'Fulger', emoji: '⚡', requirement: 'Cursă < 60s', special: true },
    'perfect': { name: 'Perfect', emoji: '💯', requirement: 'Test 100%', special: true }
};

// Afișează titlurile
function displayTitles() {
    const container = document.getElementById('profileTitlesGrid');
    container.innerHTML = '';
    
    const stats = getUserStats(currentUser);
    const totalGames = stats.totalGames + stats.totalTests;
    const ranking = loadRanking();
    const userGames = ranking.filter(r => r.user === currentUser);
    
    // Verifică titlul curent
    loadProfiles();
    const currentTitle = profileData[currentUser].currentTitle || 'beginner';
    
    Object.keys(TITLES).forEach(titleId => {
        const title = TITLES[titleId];
        let isUnlocked = false;
        
        // Verifică dacă e deblocat
        if (title.special) {
            if (titleId === 'champion') {
                isUnlocked = userGames.some(g => g.score > 800);
            } else if (titleId === 'speedster') {
                // Verifică din ranking dacă are curse rapide
                isUnlocked = getUserBadges(currentUser).includes('speed_demon');
            } else if (titleId === 'perfect') {
                isUnlocked = userGames.some(g => g.percentage === 100);
            }
        } else {
            isUnlocked = totalGames >= title.level;
        }
        
        const div = document.createElement('div');
        div.className = `title-card ${isUnlocked ? 'unlocked' : 'locked'} ${titleId === currentTitle ? 'active' : ''}`;
        div.innerHTML = `
            <div class="title-icon">${title.emoji}</div>
            <div class="title-name">${title.name}</div>
            <div class="title-requirement">${title.requirement}</div>
        `;
        
        if (isUnlocked) {
            div.onclick = () => selectTitle(titleId);
        }
        
        container.appendChild(div);
    });
    
    // Actualizează titlul activ
    document.getElementById('currentTitleBadge').textContent = `${TITLES[currentTitle].emoji} ${TITLES[currentTitle].name}`;
}

function selectTitle(titleId) {
    loadProfiles();
    profileData[currentUser].currentTitle = titleId;
    saveProfiles();
    displayTitles();
    showMascotMessage(`✅ Titlu selectat: ${TITLES[titleId].emoji} ${TITLES[titleId].name}`, 2000);
    playSound('click');
}

// Obiective zilnice
function displayDailyQuests() {
    const container = document.getElementById('dailyQuestsGrid');
    container.innerHTML = '';
    
    const stats = getUserStats(currentUser);
    const ranking = loadRanking();
    const today = new Date().toDateString();
    const todayGames = ranking.filter(r => r.user === currentUser && new Date(r.date).toDateString() === today);
    
    const quests = [
        {
            id: 'daily_games',
            icon: '🎮',
            title: 'Joacă 3 jocuri',
            description: 'Completează 3 jocuri astăzi',
            current: todayGames.length,
            target: 3,
            reward: '+50 XP'
        },
        {
            id: 'daily_perfect',
            icon: '💯',
            title: 'Scor Perfect',
            description: 'Obține 100% într-un joc',
            current: todayGames.some(g => g.percentage === 100) ? 1 : 0,
            target: 1,
            reward: '+100 XP'
        },
        {
            id: 'daily_streak',
            icon: '🔥',
            title: 'Streak de 5',
            description: 'Obține un streak de 5',
            current: 0, // Ar trebui track-uit in timpul jocului
            target: 5,
            reward: '+75 XP'
        }
    ];
    
    quests.forEach(quest => {
        const progress = Math.min((quest.current / quest.target) * 100, 100);
        const isCompleted = quest.current >= quest.target;
        
        const div = document.createElement('div');
        div.className = `quest-card ${isCompleted ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="quest-icon">${quest.icon}</div>
            <div class="quest-info">
                <div class="quest-title">${quest.title} ${isCompleted ? '✓' : ''}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="quest-progress-text">${quest.current} / ${quest.target}</div>
            </div>
            <div class="quest-reward">${quest.reward}</div>
        `;
        container.appendChild(div);
    });
}

// Grafic de performanță
function displayPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const ranking = loadRanking();
    const userGames = ranking.filter(r => r.user === currentUser).slice(0, 10).reverse();
    
    if (userGames.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Joacă câteva jocuri pentru a vedea graficul!', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Setări
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const scores = userGames.map(g => g.score);
    const maxScore = Math.max(...scores, 100);
    const minScore = 0;
    
    // Desenează axele
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Desenează linia graficului
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    userGames.forEach((game, index) => {
        const x = padding + (index / (userGames.length - 1 || 1)) * chartWidth;
        const y = canvas.height - padding - ((game.score - minScore) / (maxScore - minScore)) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Desenează punctele
    userGames.forEach((game, index) => {
        const x = padding + (index / (userGames.length - 1 || 1)) * chartWidth;
        const y = canvas.height - padding - ((game.score - minScore) / (maxScore - minScore)) * chartHeight;
        
        ctx.fillStyle = game.percentage >= 80 ? '#10b981' : game.percentage >= 50 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    userGames.forEach((game, index) => {
        const x = padding + (index / (userGames.length - 1 || 1)) * chartWidth;
        ctx.fillText(`#${index + 1}`, x, canvas.height - padding + 20);
    });
}

// Progres per operație
function displayOperationProgress() {
    const container = document.getElementById('operationProgressGrid');
    container.innerHTML = '';
    
    const ranking = loadRanking();
    const userGames = ranking.filter(r => r.user === currentUser);
    
    const operations = {
        'add': { name: 'Adunări', emoji: '➕', color: '#10b981' },
        'sub': { name: 'Scăderi', emoji: '➖', color: '#3b82f6' },
        'mul': { name: 'Înmulțiri', emoji: '✖', color: '#f59e0b' },
        'div': { name: 'Împărțiri', emoji: '➗', color: '#ef4444' }
    };
    
    Object.keys(operations).forEach(op => {
        const opData = operations[op];
        
        // Calculează statistici (aproximativ, ar trebui track-uit mai detaliat)
        const totalQuestions = userGames.length * 10; // Aproximativ
        const correctAnswers = userGames.reduce((sum, g) => sum + g.correct, 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        const mastery = accuracy >= 90 ? 'Maestru' : accuracy >= 75 ? 'Avansat' : accuracy >= 50 ? 'Intermediar' : 'Începător';
        
        const div = document.createElement('div');
        div.className = 'operation-card';
        div.innerHTML = `
            <div class="operation-header">
                <div class="operation-name">
                    <span style="font-size: 1.5em;">${opData.emoji}</span>
                    ${opData.name}
                </div>
                <div class="operation-stats">
                    <div class="operation-accuracy">${accuracy}%</div>
                    <div class="operation-count">${userGames.length} jocuri</div>
                </div>
            </div>
            <div class="operation-progress">
                <div class="operation-progress-fill" style="width: ${accuracy}%; background: ${opData.color};"></div>
            </div>
            <div class="operation-mastery">Nivel: ${mastery}</div>
        `;
        container.appendChild(div);
    });
}

// Recorduri
function displayRecords() {
    const container = document.getElementById('recordsGrid');
    container.innerHTML = '';
    
    const ranking = loadRanking();
    const userGames = ranking.filter(r => r.user === currentUser);
    const stats = getUserStats(currentUser);
    
    const records = [
        { icon: '🏆', label: 'Best Score', value: userGames[0]?.score || 0 },
        { icon: '🎮', label: 'Total Jocuri', value: stats.totalGames + stats.totalTests },
        { icon: '✅', label: 'Total Corecte', value: stats.totalCorrect },
        { icon: '🔥', label: 'Best Streak', value: profileData[currentUser]?.bestStreak || 0 },
        { icon: '⚡', label: 'Jocuri Perfecte', value: userGames.filter(g => g.percentage === 100).length },
        { icon: '📈', label: 'Scor Mediu', value: stats.avgScore },
        // ✅ ADAUGĂ XP TOTAL
        { icon: '💰', label: 'Total XP Câștigat', value: profileData[currentUser]?.totalXPEarned || 0 }
    ];
    
    records.forEach(record => {
        const div = document.createElement('div');
        div.className = 'record-card';
        div.innerHTML = `
            <div class="record-icon">${record.icon}</div>
            <div class="record-value">${record.value}</div>
            <div class="record-label">${record.label}</div>
        `;
        container.appendChild(div);
    });
}

// Calendar activitate
function displayActivityCalendar() {
    const container = document.getElementById('activityCalendar');
    container.innerHTML = '';
    
    const ranking = loadRanking();
    const today = new Date();
    
    // Ultimele 28 de zile (4 săptămâni)
    for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayGames = ranking.filter(r => {
            const gameDate = new Date(r.date);
            return r.user === currentUser && gameDate.toDateString() === date.toDateString();
        });
        
        const count = dayGames.length;
        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
        
        const div = document.createElement('div');
        div.className = `activity-day level-${level}`;
        div.innerHTML = `
            <div class="activity-day-number">${date.getDate()}</div>
            ${count > 0 ? `<div class="activity-day-count">${count}</div>` : ''}
            <div class="activity-day-tooltip">
                ${date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}<br>
                ${count} ${count === 1 ? 'joc' : 'jocuri'}
            </div>
        `;
        container.appendChild(div);
    }
}

// Actualizează funcția updateProfileUI() pentru a include toate noile secțiuni
const originalUpdateProfileUI = updateProfileUI;
updateProfileUI = function() {
    originalUpdateProfileUI();
    
    // ✅ Adaugă noile secțiuni
    displayTitles();
    displayDailyQuests();
    displayPerformanceChart();
    displayOperationProgress();
    displayRecords();
    displayActivityCalendar();
};

// Track best streak în timpul jocului
const originalHandleCorrectAnswer = handleCorrectAnswer;
handleCorrectAnswer = function() {
    originalHandleCorrectAnswer();
    
    // Actualizează best streak
    loadProfiles();
    if (!profileData[currentUser].bestStreak || streak > profileData[currentUser].bestStreak) {
        profileData[currentUser].bestStreak = streak;
        saveProfiles();
    }
};