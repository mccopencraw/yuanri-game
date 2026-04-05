// 《元日》古詩學習遊戲 - 遊戲邏輯
// 資源路徑配置
const ASSETS_BASE_URL = 'https://shared-storage.hibye.day/yuanri-game';

// 遊戲數據
const poemLines = [
    "爆竹聲中一歲除",
    "春風送暖入屠蘇",
    "千門萬戶曈曈日",
    "總把新桃換舊符"
];

const poemMeanings = [
    "在爆竹聲中，舊的一年過去了",
    "春風吹來暖意，人們喝屠蘇酒慶祝",
    "初升的太陽照耀著千家萬戶",
    "大家都用新的桃符換掉舊的"
];

// 填充題數據
const fillQuestions = [
    {
        line: "爆竹聲中____除",
        answer: "一歲",
        options: ["一歲", "新年", "舊歲", "春天"]
    },
    {
        line: "春風送暖入____",
        answer: "屠蘇",
        options: ["屠蘇", "酒杯", "家門", "心裡"]
    },
    {
        line: "千門萬戶____日",
        answer: "曈曈",
        options: ["曈曈", "明亮", "溫暖", "喜慶"]
    },
    {
        line: "總把新桃換____",
        answer: "舊符",
        options: ["舊符", "春聯", "門神", "舊年"]
    }
];

// 測驗題數據
const quizQuestions = [
    {
        question: "哪個詞語告訴我們詩歌寫的是過新年時的情景？",
        options: ["爆竹", "一歲除", "春風", "屠蘇"],
        answer: 1,
        explanation: "「一歲除」表示一年過去了，新年到來"
    },
    {
        question: "詩中哪個詞語指「很多戶人家」？",
        options: ["千門萬戶", "曈曈日", "新桃", "舊符"],
        answer: 0,
        explanation: "「千門萬戶」形容房屋眾多，家家戶戶"
    },
    {
        question: "下列哪一項不是詩中提到古人過年時的習俗？",
        options: ["大掃除", "放爆竹", "喝屠蘇酒", "換桃符"],
        answer: 0,
        explanation: "詩中提到放爆竹、喝屠蘇酒、換桃符，沒有大掃除"
    },
    {
        question: "「屠蘇」是什麼意思？",
        options: ["一種食物", "一種酒", "一種遊戲", "一種裝飾"],
        answer: 1,
        explanation: "屠蘇是古代過年時喝的一種酒"
    }
];

// 遊戲狀態
let currentMode = '';
let currentFillIndex = 0;
let currentQuizIndex = 0;
let fillScore = 0;
let quizScore = 0;
let matchScore = 0;
let selectedMatchItem = null;
let matchedPairs = 0;

// 切換畫面
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 開始遊戲
function startGame() {
    showScreen('mode-screen');
}

// 顯示古詩
function showPoem() {
    showScreen('read-mode');
}

// 開始不同模式
function startMode(mode) {
    currentMode = mode;
    
    switch(mode) {
        case 'read':
            showScreen('read-mode');
            break;
        case 'fill':
            currentFillIndex = 0;
            fillScore = 0;
            showFillQuestion();
            showScreen('fill-mode');
            break;
        case 'quiz':
            currentQuizIndex = 0;
            quizScore = 0;
            showQuizQuestion();
            showScreen('quiz-mode');
            break;
        case 'match':
            initMatchGame();
            showScreen('match-mode');
            break;
    }
}

// 朗讀詩句
function speakLine(index) {
    const text = poemLines[index];
    
    // 使用 Web Speech API
    if ('speechSynthesis' in window) {
        // 取消之前的語音
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        
        // 嘗試找到中文語音
        const voices = speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh') && !v.lang.includes('HK') && !v.lang.includes('TW'));
        if (zhVoice) {
            utterance.voice = zhVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        alert('您的瀏覽器不支援語音功能');
    }
}

// 顯示填充題
function showFillQuestion() {
    const question = fillQuestions[currentFillIndex];
    const blankDiv = document.getElementById('poem-blank');
    const optionsDiv = document.getElementById('fill-options');
    const feedbackDiv = document.getElementById('fill-feedback');
    const nextBtn = document.getElementById('fill-next');
    
    // 更新進度
    document.getElementById('fill-current').textContent = currentFillIndex + 1;
    document.getElementById('fill-total').textContent = fillQuestions.length;
    document.getElementById('fill-progress').style.width = `${((currentFillIndex + 1) / fillQuestions.length) * 100}%`;
    
    // 顯示題目
    blankDiv.innerHTML = question.line.replace('____', '<span class="blank" id="current-blank">?</span>');
    
    // 顯示選項（隨機排序）
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    optionsDiv.innerHTML = shuffledOptions.map(option => 
        `<button class="option-btn" onclick="checkFillAnswer('${option}')">${option}</button>`
    ).join('');
    
    // 隱藏反饋和下一題按鈕
    feedbackDiv.classList.remove('show', 'correct', 'wrong');
    nextBtn.style.display = 'none';
}

// 檢查填充答案
function checkFillAnswer(answer) {
    const question = fillQuestions[currentFillIndex];
    const feedbackDiv = document.getElementById('fill-feedback');
    const nextBtn = document.getElementById('fill-next');
    const blank = document.getElementById('current-blank');
    const buttons = document.querySelectorAll('.option-btn');
    
    // 禁用所有按鈕
    buttons.forEach(btn => btn.disabled = true);
    
    if (answer === question.answer) {
        // 正確
        blank.textContent = answer;
        blank.style.color = '#4CAF50';
        feedbackDiv.textContent = '🎉 答對了！你真棒！';
        feedbackDiv.classList.add('show', 'correct');
        fillScore++;
        
        // 標記正確按鈕
        buttons.forEach(btn => {
            if (btn.textContent === answer) {
                btn.classList.add('correct');
            }
        });
        
        playSound('correct');
    } else {
        // 錯誤
        blank.textContent = question.answer;
        blank.style.color = '#4CAF50';
        feedbackDiv.textContent = `💪 答案是「${question.answer}」，繼續努力！`;
        feedbackDiv.classList.add('show', 'wrong');
        
        // 標記按鈕
        buttons.forEach(btn => {
            if (btn.textContent === answer) {
                btn.classList.add('wrong');
            } else if (btn.textContent === question.answer) {
                btn.classList.add('correct');
            }
        });
        
        playSound('wrong');
    }
    
    // 顯示下一題按鈕
    nextBtn.style.display = 'inline-block';
}

// 下一題填充
function nextFillQuestion() {
    currentFillIndex++;
    if (currentFillIndex < fillQuestions.length) {
        showFillQuestion();
    } else {
        showComplete(fillScore, fillQuestions.length);
    }
}

// 顯示測驗題
function showQuizQuestion() {
    const question = quizQuestions[currentQuizIndex];
    const textDiv = document.getElementById('quiz-text');
    const optionsDiv = document.getElementById('quiz-options');
    const feedbackDiv = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next');
    
    // 更新進度
    document.getElementById('quiz-current').textContent = currentQuizIndex + 1;
    document.getElementById('quiz-total').textContent = quizQuestions.length;
    document.getElementById('quiz-progress').style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
    
    // 顯示題目
    textDiv.textContent = question.question;
    
    // 顯示選項
    optionsDiv.innerHTML = question.options.map((option, index) => 
        `<button class="quiz-option" onclick="checkQuizAnswer(${index})">${String.fromCharCode(65 + index)}. ${option}</button>`
    ).join('');
    
    // 隱藏反饋和下一題按鈕
    feedbackDiv.classList.remove('show', 'correct', 'wrong');
    nextBtn.style.display = 'none';
}

// 檢查測驗答案
function checkQuizAnswer(index) {
    const question = quizQuestions[currentQuizIndex];
    const feedbackDiv = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next');
    const buttons = document.querySelectorAll('.quiz-option');
    
    // 禁用所有按鈕
    buttons.forEach(btn => btn.disabled = true);
    
    if (index === question.answer) {
        // 正確
        feedbackDiv.innerHTML = `🎉 答對了！<br><small>${question.explanation}</small>`;
        feedbackDiv.classList.add('show', 'correct');
        quizScore++;
        buttons[index].classList.add('correct');
        playSound('correct');
    } else {
        // 錯誤
        feedbackDiv.innerHTML = `💪 答案是 ${String.fromCharCode(65 + question.answer)}<br><small>${question.explanation}</small>`;
        feedbackDiv.classList.add('show', 'wrong');
        buttons[index].classList.add('wrong');
        buttons[question.answer].classList.add('correct');
        playSound('wrong');
    }
    
    // 顯示下一題按鈕
    nextBtn.style.display = 'inline-block';
}

// 下一題測驗
function nextQuizQuestion() {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
        showQuizQuestion();
    } else {
        showComplete(quizScore, quizQuestions.length);
    }
}

// 初始化配對遊戲
function initMatchGame() {
    matchScore = 0;
    matchedPairs = 0;
    selectedMatchItem = null;
    
    document.getElementById('match-score').textContent = '0';
    document.getElementById('match-restart').style.display = 'none';
    document.getElementById('match-feedback').classList.remove('show');
    
    const linesDiv = document.getElementById('match-lines');
    const meaningsDiv = document.getElementById('match-meanings');
    
    // 創建詩句項目（隨機排序）
    const lineIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    linesDiv.innerHTML = '<h3>詩句</h3>' + lineIndices.map(i => 
        `<div class="match-item" data-type="line" data-index="${i}" onclick="selectMatchItem(this)">${poemLines[i]}</div>`
    ).join('');
    
    // 創建解釋項目（隨機排序）
    const meaningIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    meaningsDiv.innerHTML = '<h3>解釋</h3>' + meaningIndices.map(i => 
        `<div class="match-item" data-type="meaning" data-index="${i}" onclick="selectMatchItem(this)">${poemMeanings[i]}</div>`
    ).join('');
}

// 選擇配對項目
function selectMatchItem(item) {
    if (item.classList.contains('matched')) return;
    
    const feedbackDiv = document.getElementById('match-feedback');
    
    if (!selectedMatchItem) {
        // 第一次選擇
        selectedMatchItem = item;
        item.classList.add('selected');
    } else {
        // 第二次選擇
        const firstItem = selectedMatchItem;
        const secondItem = item;
        
        // 檢查是否同類型
        if (firstItem.dataset.type === secondItem.dataset.type) {
            // 同類型，取消選擇
            firstItem.classList.remove('selected');
            if (firstItem !== secondItem) {
                secondItem.classList.add('selected');
                selectedMatchItem = secondItem;
            } else {
                selectedMatchItem = null;
            }
            return;
        }
        
        // 檢查是否配對成功
        const firstIndex = parseInt(firstItem.dataset.index);
        const secondIndex = parseInt(secondItem.dataset.index);
        
        if (firstIndex === secondIndex) {
            // 配對成功
            firstItem.classList.remove('selected');
            firstItem.classList.add('matched');
            secondItem.classList.add('matched');
            
            matchScore++;
            document.getElementById('match-score').textContent = matchScore;
            
            feedbackDiv.textContent = '🎉 配對成功！';
            feedbackDiv.classList.remove('wrong');
            feedbackDiv.classList.add('show', 'correct');
            
            matchedPairs++;
            
            if (matchedPairs === 4) {
                setTimeout(() => {
                    showComplete(matchScore, 4, true);
                }, 1000);
            }
            
            playSound('correct');
        } else {
            // 配對失敗
            firstItem.classList.remove('selected');
            
            feedbackDiv.textContent = '💪 再試一次！';
            feedbackDiv.classList.remove('correct');
            feedbackDiv.classList.add('show', 'wrong');
            
            playSound('wrong');
        }
        
        selectedMatchItem = null;
    }
}

// 顯示完成畫面
function showComplete(score, total, isMatch = false) {
    showScreen('complete-screen');
    
    const scoreDiv = document.getElementById('final-score');
    const messageDiv = document.getElementById('score-message');
    const badgeDiv = document.getElementById('reward-badge');
    
    scoreDiv.textContent = `${score}/${total}`;
    
    // 根據得分顯示不同訊息和獎勵
    const percentage = score / total;
    
    if (percentage === 1) {
        messageDiv.textContent = '太棒了！滿分！🌟';
        badgeDiv.textContent = '🏆 古詩大師';
        createConfetti();
    } else if (percentage >= 0.75) {
        messageDiv.textContent = '做得很好！繼續努力！⭐';
        badgeDiv.textContent = '🥇 古詩達人';
        createConfetti();
    } else if (percentage >= 0.5) {
        messageDiv.textContent = '不錯喔！還可以更好！👍';
        badgeDiv.textContent = '🥈 古詩學員';
    } else {
        messageDiv.textContent = '繼續加油！多練習會更好！💪';
        badgeDiv.textContent = '📚 古詩初學者';
    }
}

// 播放音效
function playSound(type) {
    const sound = document.getElementById(`sound-${type}`);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('音效播放失敗:', e));
    }
}

// 創建 Confetti 效果
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// 預加載語音
if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
}

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('《元日》古詩學習遊戲已載入');
});
