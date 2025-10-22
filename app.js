document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & Constants ---
    const DEFAULT_SETTINGS = {
        pomodoro: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4,
        autoStartBreaks: false, autoStartPomodoros: false,
        soundPomodoro: 'squeak_1_som.mp3',     // Som padrão para Pomodoro
        soundShortBreak: 'vai_um_golinho_som.mp3',  // Som padrão para Pausa Curta
        soundLongBreak: 'aceita_cafe_som.mp3',     // Som padrão para Pausa Longa
        alarmVolume: 0.5,
        browserNotifications: false
    };
    const MODES = { POMODORO: 'pomodoro', SHORT_BREAK: 'shortBreak', LONG_BREAK: 'longBreak' };
    const MODE_NAMES = { pomodoro: 'Pomodoro', shortBreak: 'Pausa Curta', longBreak: 'Pausa Longa' };
    const IMAGES = {
        play: 'play_rat.png',
        playActive: 'play_rat_turquesa.png', // Image shown when timer IS running
        pause: 'pause_rat.png',
        pauseActive: 'pause_rat_turquesa.png', // Image shown when timer IS paused
        next: 'avancar_rat.png',
        stop: 'stop_rat.png',
        stopActive: 'stop_rat_red.png', // Image shown when timer IS stopped
        ratInactive: 'mouse_white_1.png',
        ratActive: 'mouse_yellow_1.png',
        checkmarkEmpty: `<svg class="w-6 h-6 text-gray-400 mr-2 flex-shrink-0 cursor-pointer checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        checkmarkChecked: `<svg class="w-6 h-6 text-teal-500 mr-2 flex-shrink-0 cursor-pointer checkmark" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`,
        studyRat: 'study_rat_1.png',
        breakRat: 'relax_rat_1.png'
    };
   // SONS DISPONÍVEIS
    const SOUNDS = {
        'Som 1 (MP3)': 'squeak_1_som.mp3',
        'Som 2 (MP3)': 'squeak_2_som.mp3',
        'Som 3 (MP3)': 'vai_um_golinho_som.mp3',
        'Som 4 (MP3)': 'aceita_cafe_som.mp3',
        'Sino (Sintetizado)': 'Bell',
        'Padrão (Sintetizado)': 'C5',
        'Tom Alto (Sintetizado)': 'E5',
        'Tom Baixo (Sintetizado)': 'G4',
        'Nenhum': 'none'
    };
    // --- FUNÇÃO AUXILIAR PARA POPULAR OS SELETORES DE SOM ---
const populateSoundSelects = () => {
    const selects = [
        dom.settingSoundPomodoroSelect,
        dom.settingSoundShortBreakSelect,
        dom.settingSoundLongBreakSelect
    ];
    
    let optionsHTML = '';
    // Itera sobre a constante SOUNDS que criamos
    for (const [name, path] of Object.entries(SOUNDS)) {
        // Usamos o 'path' (ex: 'sounds/som1.mp3' ou 'Bell') como o 'value'
        optionsHTML += `<option value="${path}">${name}</option>`;
    }

    selects.forEach(select => {
        if (select) {
            select.innerHTML = optionsHTML;
        }
    });
};
    // NOVAS CONSTANTES PARA OS FORMULÁRIOS
const ENERGIA_OPTIONS = ["Não consegui identificar", "Sinto que ganhei energia", "Sinto que perdi energia"];
const MEGAFOCO_OPTIONS = ["Não consegui identificar", "Sim", "Não"];

    // --- State ---
    let state = {
        settings: { ...DEFAULT_SETTINGS },
        currentMode: MODES.POMODORO,
        pomodoroCount: 0,
        timeLeft: 0,
        timerInterval: null,
        isRunning: false,
        tasks: [],
        sessions: [],
        currentTaskId: null,
    };

    // --- DOM Elements ---
    const dom = {
        timerDisplay: document.getElementById('timer'),
        startBtn: document.getElementById('start-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        stopBtn: document.getElementById('stop-btn'),
        nextBtn: document.getElementById('next-btn'),
        modeButtons: {
            pomodoro: document.getElementById('pomodoro-mode'),
            shortBreak: document.getElementById('short-break-mode'),
            longBreak: document.getElementById('long-break-mode'),
        },
        cycleIconsContainer: document.getElementById('cycle-icons'),
        reportBtn: document.getElementById('report-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        modalContainer: document.getElementById('modal-container'),
        taskList: document.getElementById('task-list'),
        currentTaskDisplay: document.getElementById('current-task'),
        showAddTaskFormBtn: document.getElementById('show-add-task-form-btn'),
        addTaskForm: document.getElementById('add-task-form'),
        taskNameInput: document.getElementById('task-name-input'),
        taskEstInput: document.getElementById('task-est-input'),
        taskNotesInput: document.getElementById('task-notes-input'),
        taskHumorInput: document.getElementById('task-humor-input'),
    taskEnergiaInput: document.getElementById('task-energia-input'),
    taskMegafocoInput: document.getElementById('task-megafoco-input'),
    taskCriseInput: document.getElementById('task-crise-input'),
        taskProjectInput: document.getElementById('task-project-input'),
        projectListAddDatalist: document.getElementById('project-list-add'),
        cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
        saveTaskBtn: document.getElementById('save-task-btn'),
        pageTitle: document.querySelector('title'),
        displayImage: document.getElementById('display-image'),
        progressBar: document.getElementById('progress-bar'),
        taskMenuBtn: document.getElementById('task-menu-btn'),
        taskMenuDropdown: document.getElementById('task-menu-dropdown'),
        clearFinishedTasksBtn: document.getElementById('clear-finished-tasks-btn'),
        clearAllTasksBtn: document.getElementById('clear-all-tasks-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'),
        settingPomodoroInput: document.getElementById('setting-pomodoro'),
        settingShortBreakInput: document.getElementById('setting-shortBreak'),
        settingLongBreakInput: document.getElementById('setting-longBreak'),
        settingAutoStartBreaksToggle: document.getElementById('setting-autoStartBreaks'),
        settingAutoStartPomodorosToggle: document.getElementById('setting-autoStartPomodoros'),
        settingLongBreakIntervalInput: document.getElementById('setting-longBreakInterval'),
        settingSoundPomodoroSelect: document.getElementById('setting-sound-pomodoro'),
settingSoundShortBreakSelect: document.getElementById('setting-sound-shortBreak'),
settingSoundLongBreakSelect: document.getElementById('setting-sound-longBreak'),
        settingAlarmVolumeSlider: document.getElementById('setting-alarmVolume'),
        settingBrowserNotificationsToggle: document.getElementById('setting-browserNotifications'),
        notificationPermissionStatus: document.getElementById('notification-permission-status'),
        saveSettingsBtn: document.getElementById('save-settings-btn'),
        reportModal: document.getElementById('report-modal'),
        closeReportModalBtn: document.getElementById('close-report-modal-btn'),
        reportTotalPomodoros: document.getElementById('report-total-pomodoros'),
        reportTotalTime: document.getElementById('report-total-time'),
        reportDaysAccessed: document.getElementById('report-days-accessed'),
        reportDayStreak: document.getElementById('report-day-streak'),
        focusChartCanvas: document.getElementById('focus-chart'),
        reportProjectSummary: document.getElementById('report-project-summary'),
        reportSessionList: document.getElementById('report-session-list'),
        okReportBtn: document.getElementById('ok-report-btn'),
        downloadCsvBtn: document.getElementById('download-csv-btn'),
        addManualSessionBtn: document.getElementById('add-manual-session-btn'),
        manualSessionModal: document.getElementById('manual-session-modal'),
        manualSessionForm: document.getElementById('manual-session-form'),
        closeManualSessionModalBtn: document.getElementById('close-manual-session-modal-btn'),
        cancelManualSessionBtn: document.getElementById('cancel-manual-session-btn'),
        manualSessionModalTitle: document.getElementById('manual-session-modal-title'),
        manualSessionIdInput: document.getElementById('manual-session-id'),
        manualDateInput: document.getElementById('manual-date'),
        manualDurationInput: document.getElementById('manual-duration'),
        manualTaskNameInput: document.getElementById('manual-taskName'),
        manualProjectNameInput: document.getElementById('manual-projectName'),
        manualHumorInput: document.getElementById('manual-humor'),
        manualCriseInput: document.getElementById('manual-crise'),
        manualEnergiaInput: document.getElementById('manual-energia'),
        manualMegafocoInput: document.getElementById('manual-megafoco'),
        manualNotesInput: document.getElementById('manual-notes'),
    };
let myPomoChart = null; // Variável global para guardar a instância do gráfico
   // --- Audio Synthesis ---
// Nó de volume global. Todos os sons se conectarão a ele.
const volNode = new Tone.Volume(0).toDestination();
// Cache para os players de MP3, para não recarregar
let audioPlayers = {}; 

// Esta função carrega um som e o toca
const playSoundForMode = (mode) => {
    if (!Tone) return;

    // 1. Descobrir qual identificador de som usar (o caminho do mp3 ou nome do synth)
    let soundIdentifier;
    switch (mode) {
        case MODES.POMODORO:
            soundIdentifier = state.settings.soundPomodoro;
            break;
        case MODES.SHORT_BREAK:
            soundIdentifier = state.settings.soundShortBreak;
            break;
        case MODES.LONG_BREAK:
            soundIdentifier = state.settings.soundLongBreak;
            break;
        default:
            soundIdentifier = 'none'; // Fallback
    }

    if (soundIdentifier === 'none') return;

    // 2. Definir o volume (com base no slider)
    const volumeDB = state.settings.alarmVolume <= 0 ? -Infinity : Math.log10(state.settings.alarmVolume) * 20;
    volNode.volume.value = volumeDB;



    // 3. Tocar o som
    try {
        // CASO A: É um som sintetizado (o 'Bell')
        if (soundIdentifier === 'Bell') {
            const bellSynth = new Tone.MetalSynth({
                frequency: 300,
                envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
                harmonicity: 5.1,
                modulationIndex: 12,
                resonance: 4000,
                octaves: 1.5
            }).connect(volNode); // Conecta ao nosso nó de volume

            const now = Tone.now();
            bellSynth.triggerAttackRelease("C4", "8n", now);
            bellSynth.triggerAttackRelease("E4", "8n", now + 0.15);
            bellSynth.triggerAttackRelease("G4", "4n", now + 0.3);
            // Limpa o synth depois de tocar
            setTimeout(() => bellSynth.dispose(), 1000);
        } 
        // CASO B: É um arquivo MP3
        else if (soundIdentifier.endsWith('.mp3')) {
            // Verifica se o player já está carregado no cache
            if (audioPlayers[soundIdentifier]) {
                audioPlayers[soundIdentifier].start(); // Toca
            } else {
                // Cria um novo player, conecta ao volume e toca
                const player = new Tone.Player(soundIdentifier, () => {
                    // Callback 'onload' - toca assim que carregar
                    player.start();
                }).connect(volNode);

                // Guarda no cache para uso futuro
                audioPlayers[soundIdentifier] = player;
            }
        }
        // CASO C: É um synth simples (C5, E5, G4)
        else if (['C5', 'E5', 'G4'].includes(soundIdentifier)) {
            const simpleSynth = new Tone.Synth().connect(volNode); // Conecta ao volNode
            simpleSynth.triggerAttackRelease(soundIdentifier, "8n", Tone.now());
            // Limpa o synth depois de tocar
            setTimeout(() => simpleSynth.dispose(), 500);
        }

    } catch (error) {
        console.error("Error playing sound:", error);
    }
};

    // --- Local Storage ---
    const saveData = () => {
        try {
            const dataToSave = {
                settings: state.settings,
                tasks: state.tasks,
                sessions: state.sessions,
                currentTaskId: state.currentTaskId,
                pomodoroCount: state.pomodoroCount,
            };
            localStorage.setItem('pomoRatoData_v2', JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
        }
    };

    const loadData = () => {
        try {
            const loadedData = JSON.parse(localStorage.getItem('pomoRatoData_v2'));
            if (loadedData) {
                state.settings = { ...DEFAULT_SETTINGS, ...(loadedData.settings || {}) };
                state.tasks = loadedData.tasks || [];
                // ... dentro da função loadData
            state.tasks = loadedData.tasks || [];
            // GARANTE QUE TODAS AS SESSÕES TENHAM UM ID
            state.sessions = (loadedData.sessions || []).map((session, index) => ({
                ...session,
                id: session.id || Date.now() + index 
            }));
            state.currentTaskId = loadedData.currentTaskId || null;
// ...
                state.currentTaskId = loadedData.currentTaskId || null;
                state.pomodoroCount = loadedData.pomodoroCount || 0;
               state.tasks = state.tasks.map(task => ({
                id: task.id,
                name: task.name || 'Tarefa sem nome',
                act: task.act || 0,
                est: task.est || 1,
                notes: task.notes || '',
                project: task.project || 'Sem Projeto',
                isEditing: false,
                isComplete: task.isComplete || false,
                // ADICIONA OS NOVOS CAMPOS COM VALORES PADRÃO
                humor: task.humor || 'Estável',
                energia: task.energia || 'Não consegui identificar',
                megafoco: task.megafoco || 'Não consegui identificar',
                crise: task.crise || 'Não'
            }));
                if (state.currentTaskId && !state.tasks.some(t => t.id === state.currentTaskId)) {
                    state.currentTaskId = state.tasks.find(t => !t.isComplete)?.id || null;
                }
            } else {
                state.settings = { ...DEFAULT_SETTINGS };
            }
            resetTimer(true); // Reset timer without rendering UI yet
        } catch (error) {
            console.error("Failed to load data from localStorage:", error);
            state = { ...state, settings: { ...DEFAULT_SETTINGS }, tasks: [], sessions: [], currentTaskId: null, pomodoroCount: 0 };
            resetTimer(true);
        }
    };

    // --- Timer Logic ---
    const displayTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        dom.timerDisplay.textContent = timeString;
        dom.pageTitle.textContent = `(${timeString}) ${MODE_NAMES[state.currentMode]} - PomoRato`;
    };

    const updateProgressBar = () => {
        const totalSeconds = state.settings[state.currentMode] * 60;
        if (totalSeconds <= 0) {
            dom.progressBar.style.width = '0%';
            return;
        }
        const percentage = Math.max(0, (totalSeconds - state.timeLeft) / totalSeconds * 100);
        dom.progressBar.style.width = `${percentage}%`;
    };

    const updateTimer = () => {
        if (state.timeLeft > 0) {
            state.timeLeft--;
            displayTime(state.timeLeft);
            updateProgressBar();
        } else {
            timerFinished();
        }
    };

    const startTimer = () => {
        Tone.start();
        if (state.isRunning) return;
        if (state.currentMode === MODES.POMODORO && !state.currentTaskId) {
            alert("Por favor, selecione ou adicione uma tarefa para iniciar o foco.");
            renderUI(); // Reset button visuals if start fails
            return;
        }
        const currentTask = state.tasks.find(t => t.id === state.currentTaskId);
        if (state.currentMode === MODES.POMODORO && currentTask?.isComplete) {
            alert("A tarefa selecionada já está concluída. Selecione outra tarefa.");
            renderUI();
            return;
        }

        state.isRunning = true;
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.timerInterval = setInterval(updateTimer, 1000);
        renderUI();
        displayTime(state.timeLeft);
        updateProgressBar();
    };

    const pauseTimer = () => {
        if (!state.isRunning) return;
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.isRunning = false;
        renderUI();
    };

    const resetTimer = (skipRender = false) => {
        pauseTimer();
        state.timeLeft = state.settings[state.currentMode] * 60;
        if (!skipRender) {
            renderUI();
        }
        displayTime(state.timeLeft);
        updateProgressBar();
    };

    const timerFinished = () => {
        const previousMode = state.currentMode;
        pauseTimer();
      playSoundForMode(previousMode);
        sendNotification(`${MODE_NAMES[previousMode]} concluído!`);

      // Salva a sessão PARA QUALQUER MODO (Pomodoro, Pausa Curta ou Longa)
saveSession(previousMode);

if (previousMode === MODES.POMODORO) {
    state.pomodoroCount++;
    // A linha saveSession() foi movida para cima
}

        let nextMode;
        if (previousMode === MODES.POMODORO) {
            if (state.pomodoroCount > 0 && state.pomodoroCount % state.settings.longBreakInterval === 0) {
                nextMode = MODES.LONG_BREAK;
            } else {
                nextMode = MODES.SHORT_BREAK;
            }
        } else {
            nextMode = MODES.POMODORO;
        }

        switchToMode(nextMode, true); // true indicates auto-switch

        const shouldAutoStart = (state.currentMode === MODES.POMODORO && state.settings.autoStartPomodoros) ||
                                (state.currentMode.includes('Break') && state.settings.autoStartBreaks);

        if (shouldAutoStart) {
            startTimer();
        }
    };

    const switchToMode = (mode, isAutoSwitch = false) => {
        if (state.isRunning && !isAutoSwitch && !confirm("O timer está rodando. Deseja parar e trocar de modo?")) {
            return;
        }
        pauseTimer();
        state.currentMode = mode;

        if (!isAutoSwitch && (mode === MODES.POMODORO || state.currentMode === MODES.LONG_BREAK)) {
            state.pomodoroCount = 0;
        }

        resetTimer();
        renderUI();
        saveData();
    };

    const skipToNextMode = () => {
        if (state.isRunning && !confirm("O timer está rodando. Deseja pular para a próxima etapa?")) return;

        let nextMode;
        if (state.currentMode === MODES.POMODORO) {
            if ((state.pomodoroCount +1) % state.settings.longBreakInterval === 0) {
                nextMode = MODES.LONG_BREAK;
            } else {
                nextMode = MODES.SHORT_BREAK;
            }
        } else {
            nextMode = MODES.POMODORO;
        }

        if (state.currentMode === MODES.POMODORO) {
            state.pomodoroCount++;
        }

        switchToMode(nextMode, false);
    };

    // --- Task Logic ---
   const addTask = (name, est = 1, notes = '', project = 'Sem Projeto') => {
    // Pega os valores dos novos campos
    const humor = dom.taskHumorInput.value.trim() || 'Estável';
    const energia = dom.taskEnergiaInput.value;
    const megafoco = dom.taskMegafocoInput.value;
    const crise = dom.taskCriseInput.value.trim() || 'Não';

    const newTask = {
        id: Date.now(),
        name,
        act: 0,
        est: parseInt(est, 10) || 1,
        notes,
        project: project.trim() || 'Sem Projeto',
        isEditing: false,
        isComplete: false,
        // Adiciona os novos campos ao objeto da tarefa
        humor,
        energia,
        megafoco,
        crise
    };

    state.tasks.push(newTask);
    if (!state.currentTaskId || state.tasks.filter(t => !t.isComplete).length === 1) {
        state.currentTaskId = newTask.id;
    }
    saveData();
    renderTasks();
    updateProjectDatalist();
};

    const toggleTaskComplete = (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.isComplete = !task.isComplete;
            if (task.isComplete && state.currentTaskId === taskId && state.isRunning && state.currentMode === MODES.POMODORO) { pauseTimer(); alert("Timer pausado pois a tarefa atual foi marcada como concluída."); }
            if (task.isComplete && state.currentTaskId === taskId) { const nextTask = state.tasks.find(t => !t.isComplete && t.id !== taskId); state.currentTaskId = nextTask ? nextTask.id : null; }
            else if (!task.isComplete && !state.currentTaskId) { state.currentTaskId = taskId; }
            saveData(); renderTasks(); renderUI();
        }
    };

    const selectTask = (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (state.isRunning && state.currentMode === MODES.POMODORO && state.currentTaskId !== taskId) {
            if (confirm("O timer está rodando em outra tarefa. Deseja parar o timer e trocar para esta tarefa?")) { pauseTimer(); state.currentTaskId = taskId; resetTimer(); } else { return; }
        } else { state.currentTaskId = taskId; }
        state.tasks.forEach(t => t.isEditing = false); saveData(); renderUI();
    };

    const toggleEditTask = (taskId) => { state.tasks.forEach(task => { task.isEditing = (task.id === taskId) ? !task.isEditing : false; }); renderTasks(); };

   const saveTaskEdit = (taskId, formElement) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.name = formElement.querySelector('.task-edit-name').value.trim() || 'Tarefa sem nome';
        task.est = parseInt(formElement.querySelector('.task-edit-est').value, 10) || 1;
        task.notes = formElement.querySelector('.task-edit-notes').value;
        task.project = formElement.querySelector('.task-edit-project').value.trim() || 'Sem Projeto';

        // SALVA OS NOVOS CAMPOS
        task.humor = formElement.querySelector('.task-edit-humor').value.trim() || 'Estável';
        task.energia = formElement.querySelector('.task-edit-energia').value;
        task.megafoco = formElement.querySelector('.task-edit-megafoco').value;
        task.crise = formElement.querySelector('.task-edit-crise').value.trim() || 'Não';

        task.isEditing = false;
        saveData();
        renderTasks();
        updateProjectDatalist();
        if(task.id === state.currentTaskId) renderUI();
    }
};

    const deleteTask = (taskId) => {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            const wasCurrent = state.currentTaskId === taskId; state.tasks = state.tasks.filter(t => t.id !== taskId);
            if (wasCurrent) { if (state.isRunning && state.currentMode === MODES.POMODORO) { pauseTimer(); resetTimer(); } const nextTask = state.tasks.find(t => !t.isComplete); state.currentTaskId = nextTask ? nextTask.id : null; }
            saveData(); renderTasks(); renderUI(); updateProjectDatalist();
        }
    };

    const clearFinishedTasks = () => {
        if (confirm('Tem certeza que deseja remover todas as tarefas concluídas?')) {
            const completedIds = state.tasks.filter(t => t.isComplete).map(t => t.id);
            if (completedIds.includes(state.currentTaskId)) { if (state.isRunning && state.currentMode === MODES.POMODORO) { pauseTimer(); resetTimer(); } state.currentTaskId = null; }
            state.tasks = state.tasks.filter(t => !t.isComplete); if (!state.currentTaskId && state.tasks.length > 0) { state.currentTaskId = state.tasks[0].id; }
            saveData(); renderTasks(); renderUI(); updateProjectDatalist();
        }
    };

    const clearAllTasks = () => {
        if (confirm('Tem certeza que deseja remover TODAS as tarefas?')) { if (state.isRunning) { pauseTimer(); resetTimer(); } state.tasks = []; state.currentTaskId = null; saveData(); renderTasks(); renderUI(); updateProjectDatalist(); }
    };

    // --- Session & Reporting Logic ---
 const saveSession = (finishedMode, durationOverride = null) => {
    // Pega o nome do timer, ex: "Pomodoro", "Pausa Curta"
    const timerTypeName = MODE_NAMES[finishedMode]; 

    const sessionData = {
        id: Date.now(),
        endTime: new Date().toISOString(),
        duration: durationOverride !== null ? durationOverride : state.settings[finishedMode], // Pega a duração correta
        timerType: timerTypeName, // Salva o tipo de timer

        // --- Valores Padrão ---
        taskId: null,
        taskName: timerTypeName, // Ex: "Pausa Curta"
        projectName: "Descanso", // O padrão agora é sempre "Descanso"
        humor: "N/A",
        energia: "N/A",
        megafoco: "N/A",
        crise: "N/A",
        notes: ""
    };

    // --- Lógica Unificada ---
    // Puxa os dados da tarefa ATUAL, não importa o modo (Pomodoro ou Pausa)
    const currentTask = state.tasks.find(t => t.id === state.currentTaskId);

    if (currentTask) {
        // Sobrescreve os valores padrão com os dados da tarefa selecionada
        sessionData.taskId = state.currentTaskId;
        sessionData.taskName = currentTask.name; 
        
        // --- LÓGICA DO PROJETO (Sua nova regra) ---
        if (finishedMode === MODES.POMODORO) {
            // Se for Pomodoro, usa o projeto da tarefa
            sessionData.projectName = currentTask.project; 
        } else {
            // Se for Pausa Curta ou Longa, força o projeto "Descanso"
            sessionData.projectName = "Descanso"; 
        }
        // --- FIM DA LÓGICA DO PROJETO ---

        // O restante dos dados (humor, energia, etc.) são pegos da tarefa atual
        sessionData.humor = currentTask.humor;
        sessionData.energia = currentTask.energia;
        sessionData.megafoco = currentTask.megafoco;
        sessionData.crise = currentTask.crise;
        sessionData.notes = currentTask.notes;

    } else {
        // Se não houver tarefa selecionada...
        if (finishedMode === MODES.POMODORO) {
             sessionData.taskName = "Pomodoro (sem tarefa)";
             sessionData.projectName = "Sem Projeto"; // Pomodoro sem tarefa fica "Sem Projeto"
        }
        // (Se for pausa sem tarefa, os padrões "Pausa Curta" / "Descanso" são mantidos)
    }

    // Adiciona a nova sessão (seja Pomodoro ou Pausa) ao histórico
    state.sessions.push(sessionData);
    saveData();

    // --- Lógica Específica do Pomodoro ---
    if (finishedMode === MODES.POMODORO) {
        if (currentTask) {
            // Incrementa o contador da tarefa
            currentTask.act = (currentTask.act || 0) + 1;
        }
        
        // Re-renderiza a lista de tarefas para atualizar o contador (ex: 1/3)
        renderTasks(); 
    }
};
// --- NOVAS FUNÇÕES PARA GERENCIAR SESSÕES MANUALMENTE ---

const openManualSessionModal = (sessionToEdit = null) => {
    // Popula os dropdowns de energia e megafoco
    dom.manualEnergiaInput.innerHTML = ENERGIA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    dom.manualMegafocoInput.innerHTML = MEGAFOCO_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('');

    dom.manualSessionForm.reset(); // Limpa o formulário

    if (sessionToEdit) {
        // MODO EDIÇÃO
        dom.manualSessionModalTitle.textContent = "Editar Registro";
        dom.manualSessionIdInput.value = sessionToEdit.id;
        // O formato da data do input é YYYY-MM-DD
        dom.manualDateInput.value = new Date(sessionToEdit.endTime).toISOString().split('T')[0];
        dom.manualDurationInput.value = sessionToEdit.duration;
        dom.manualTaskNameInput.value = sessionToEdit.taskName;
        dom.manualProjectNameInput.value = sessionToEdit.projectName === 'Sem Projeto' ? '' : sessionToEdit.projectName;
        dom.manualHumorInput.value = sessionToEdit.humor || '';
        dom.manualCriseInput.value = sessionToEdit.crise || '';
        dom.manualEnergiaInput.value = sessionToEdit.energia || ENERGIA_OPTIONS[0];
        dom.manualMegafocoInput.value = sessionToEdit.megafoco || MEGAFOCO_OPTIONS[0];
        dom.manualNotesInput.value = sessionToEdit.notes || '';
    } else {
        // MODO ADIÇÃO
        dom.manualSessionModalTitle.textContent = "Adicionar Registro Manual";
        dom.manualSessionIdInput.value = ''; // Garante que o ID está limpo
        dom.manualDateInput.valueAsDate = new Date(); // Padrão para hoje
    }

    dom.manualSessionModal.classList.remove('hidden');
};

const saveManualSession = (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const sessionId = parseInt(dom.manualSessionIdInput.value);
    const dateValue = dom.manualDateInput.value; // "YYYY-MM-DD"
    // Pega a hora atual para manter a consistência
    const timeValue = new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"
    const endTimeISO = new Date(`${dateValue}T${timeValue}`).toISOString();

    const sessionData = {
        id: sessionId || Date.now(),
        duration: parseInt(dom.manualDurationInput.value),
        taskName: dom.manualTaskNameInput.value.trim() || "Tarefa Manual",
        projectName: dom.manualProjectNameInput.value.trim() || "Sem Projeto",
        endTime: endTimeISO,
        timerType: "Pomodoro",
        humor: dom.manualHumorInput.value.trim() || "Estável",
        crise: dom.manualCriseInput.value.trim() || "Não",
        energia: dom.manualEnergiaInput.value,
        megafoco: dom.manualMegafocoInput.value,
        notes: dom.manualNotesInput.value.trim()
    };

    if (sessionId) {
        // Atualiza a sessão existente
        const index = state.sessions.findIndex(s => s.id === sessionId);
        if (index > -1) {
            state.sessions[index] = sessionData;
        }
    } else {
        // Adiciona nova sessão
        state.sessions.push(sessionData);
    }

    saveData();
    renderReport(); // Atualiza a lista na tela
    dom.manualSessionModal.classList.add('hidden');
};

const deleteSession = (sessionId) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        saveData();
        renderReport(); // Re-renderiza o diário
    }
};
// --- FIM DAS NOVAS FUNÇÕES ---
    
    // FUNÇÃO AJUDANTE: formatar minutos para H:M
    const formatMinutesToHours = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60); 
        const minutes = totalMinutes % 60; 
        return `${hours}h ${minutes}m`;
    };

    // FUNÇÃO AJUDANTE: Pegar data no formato YYYY-MM-DD
    const getUTCDateString = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
    };

    // NOVA FUNÇÃO: Calcula o Resumo da Atividade (Stats)
    const calculateActivitySummary = (sessions) => {
        const totalPomodoros = sessions.length;
        const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);

        const uniqueDays = new Set(sessions.map(s => getUTCDateString(new Date(s.endTime))));
        const daysAccessed = uniqueDays.size;

        // Cálculo da Sequência (Streak)
        let dayStreak = 0;
        if (daysAccessed > 0) {
            const sortedDays = [...uniqueDays].sort().reverse(); // Mais recente primeiro
            let today = new Date();
            let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Se não houver registro hoje, comece a checar de ontem
            if (!uniqueDays.has(getUTCDateString(checkDate))) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            // Loop para contar a sequência
            while (uniqueDays.has(getUTCDateString(checkDate))) {
                dayStreak++;
                checkDate.setDate(checkDate.getDate() - 1); // Vai para o dia anterior
            }
        }

        // Atualiza o DOM
        dom.reportTotalPomodoros.textContent = totalPomodoros;
        dom.reportTotalTime.textContent = formatMinutesToHours(totalMinutes);
        dom.reportDaysAccessed.textContent = daysAccessed;
        dom.reportDayStreak.textContent = dayStreak;
    };

    // NOVA FUNÇÃO: Renderiza o Resumo por Projeto
    const renderProjectSummary = (sessions) => {
        if (sessions.length === 0) {
            dom.reportProjectSummary.innerHTML = `<p class="text-gray-500 text-sm italic">Nenhum projeto registrado.</p>`;
            return;
        }

        const projectTotals = sessions.reduce((acc, session) => {
            const projectName = session.projectName || 'Sem Projeto';
            acc[projectName] = (acc[projectName] || 0) + session.duration;
            return acc;
        }, {});

        const sortedProjects = Object.entries(projectTotals).sort(([, timeA], [, timeB]) => timeB - timeA);

        dom.reportProjectSummary.innerHTML = sortedProjects.map(([name, time]) => `
            <div class="project-summary-item">
                <span class="project-name">${name}</span>
                <span class="project-time">${formatMinutesToHours(time)}</span>
            </div>
        `).join('');
    };

    // NOVA FUNÇÃO: Renderiza o Gráfico de Foco
    const renderFocusChart = (sessions) => {
        // Prepara os dados dos últimos 7 dias
        const labels = [];
        const data = Array(7).fill(0);
        const today = new Date();
        
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
            labels.push(dayNames[date.getDay()]); // Adiciona 'Seg', 'Ter', etc.
            
            const dateString = getUTCDateString(date);

            // Soma as sessões daquele dia
            sessions.forEach(session => {
                if (getUTCDateString(new Date(session.endTime)) === dateString) {
                    data[6-i] += session.duration; // Adiciona duração em minutos
                }
            });
        }
        
        // Converte minutos para horas
        const dataInHours = data.map(minutes => (minutes / 60).toFixed(2));

        // Destrói o gráfico antigo, se existir (evita bugs)
        if (myPomoChart) {
            myPomoChart.destroy();
        }

        // Cria o novo gráfico
        const ctx = dom.focusChartCanvas.getContext('2d');
        myPomoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Horas Focadas',
                    data: dataInHours,
                    backgroundColor: 'rgba(251, 191, 36, 0.6)', // Amarelo PomoRato (com transparência)
                    borderColor: 'rgba(251, 191, 36, 1)', // Amarelo PomoRato
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Horas'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Mostra em minutos se for menos de 1h
                                    const totalMinutes = data[context.dataIndex]; // Pega o valor original em minutos
                                    label += formatMinutesToHours(totalMinutes);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    };

    // FUNÇÃO PRINCIPAL: `renderReport` (Atualizada)
    // Esta função agora chama as outras
    const renderReport = () => {
        // 1. Calcula e mostra os Stats (Pomodoros, Tempo, Dias, Sequência)
        calculateActivitySummary(state.sessions);
        
        // 2. Renderiza o gráfico de barras
        renderFocusChart(state.sessions);

        // 3. Renderiza o resumo por projeto
        renderProjectSummary(state.sessions);

       // 4. Renderiza o histórico (como já fazia)
    if (state.sessions.length === 0) { 
        dom.reportSessionList.innerHTML = `<p class="text-gray-500 text-sm italic">Nenhuma sessão registrada ainda.</p>`; 
    } else { 
        // Ordena as sessões pela data de término, da mais recente para a mais antiga
        const sortedSessions = state.sessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

        dom.reportSessionList.innerHTML = sortedSessions.map(session => { 
            const endTime = new Date(session.endTime); 
            const formattedTime = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); 
            const formattedDate = endTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); 

            // Note o 'data-session-id' nos botões
            return `
            <div class="session-item flex items-center justify-between p-2 border-b last:border-b-0 text-sm hover:bg-gray-100">
                <div class="flex-grow">
                    <span class="font-semibold">${session.taskName}</span> 
                    ${session.projectName && session.projectName !== 'Sem Projeto' ? `<span class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-1">${session.projectName}</span>` : ''}
                    <div class="text-xs text-gray-500">${formattedDate} ${formattedTime} (${session.duration}m)</div>
                </div>
                <div class="session-actions flex-shrink-0">
                    <button class="btn-session-action edit" data-session-id="${session.id}" title="Editar">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                    </button>
                    <button class="btn-session-action delete" data-session-id="${session.id}" title="Excluir">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            </div>`; 
        }).join(''); 
    }
};

    // --- CSV Export ---
    const escapeCsvCell = (cellData) => {
        if (cellData === null || cellData === undefined) { return ''; }
        const stringData = String(cellData);
        if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
            const escapedData = stringData.replace(/"/g, '""');
            return `"${escapedData}"`;
        }
        return stringData;
    };

   const exportSessionsToCSV = () => {
    if (state.sessions.length === 0) {
        alert("Não há sessões para exportar.");
        return;
    }

    // NOVOS CABEÇALHOS (Headers) - Adicionei "Notas"
    const headers = ["Data", "Hora Fim", "Tipo de Timer", "Projeto", "Tarefa", "Duracao (min)", "Humor", "Energia", "Megafoco", "Crise", "Notas"];

    const rows = state.sessions.map(session => {
        const endTime = new Date(session.endTime);
        const formattedDate = endTime.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit'});
        const formattedTime = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

        // CRIA A LINHA COM OS NOVOS DADOS
        return [
            formattedDate,
            formattedTime,
            escapeCsvCell(session.timerType || 'Pomodoro'),
            escapeCsvCell(session.projectName),
            escapeCsvCell(session.taskName),
            session.duration,
            escapeCsvCell(session.humor),
            escapeCsvCell(session.energia),
            escapeCsvCell(session.megafoco),
            escapeCsvCell(session.crise),
            escapeCsvCell(session.notes) // Adiciona as notas na linha
        ].join(',');
    });

    const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.join('\n'); // Add BOM for Excel UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `pomorato_historico_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

    // --- Notifications ---
    const requestNotificationPermission = () => { if (!('Notification' in window)) { dom.notificationPermissionStatus.textContent = "Navegador não suporta notificações."; return; } Notification.requestPermission().then(permission => { updateNotificationStatus(permission); state.settings.browserNotifications = (permission === 'granted'); saveData(); dom.settingBrowserNotificationsToggle.checked = state.settings.browserNotifications; }); };

    const updateNotificationStatus = (permission = Notification.permission) => { if (!('Notification' in window)) return; permission = permission || Notification.permission; if (permission === 'granted') { dom.notificationPermissionStatus.textContent = "Permissão concedida."; dom.settingBrowserNotificationsToggle.checked = state.settings.browserNotifications; } else if (permission === 'denied') { dom.notificationPermissionStatus.textContent = "Permissão negada."; dom.settingBrowserNotificationsToggle.checked = false; dom.settingBrowserNotificationsToggle.disabled = true; } else { dom.notificationPermissionStatus.textContent = "Permissão pendente."; dom.settingBrowserNotificationsToggle.checked = false; } };

    const sendNotification = (message) => { if (state.settings.browserNotifications && Notification.permission === 'granted') { new Notification("PomoRato", { body: message, icon: 'Assets - Imagens/logo_pomorato.png' }); } };

    // --- UI Rendering ---
    const renderCycleIcons = () => {
        dom.cycleIconsContainer.innerHTML = ''; const interval = Math.max(1, state.settings.longBreakInterval); for (let i = 0; i < interval; i++) { const iconDiv = document.createElement('div'); iconDiv.classList.add('rato-icon', 'w-10', 'h-10'); const img = document.createElement('img'); const isActive = state.currentMode === MODES.POMODORO && (i === state.pomodoroCount % interval); img.src = isActive ? IMAGES.ratActive : IMAGES.ratInactive; img.alt = `Ícone de ciclo ${i + 1}`; iconDiv.appendChild(img); dom.cycleIconsContainer.appendChild(iconDiv); }
    };

    const updateProjectDatalist = () => {
        const uniqueProjects = [...new Set(state.tasks.map(t => t.project).filter(p => p && p !== 'Sem Projeto'))].sort(); dom.projectListAddDatalist.innerHTML = uniqueProjects.map(p => `<option value="${p}"></option>`).join('');
    };

    const renderTasks = () => {
    dom.taskList.innerHTML = '';
    const projects = ['Sem Projeto', ...new Set(state.tasks.filter(t => t.project !== 'Sem Projeto').map(t => t.project))].sort((a,b) => a === 'Sem Projeto' ? -1 : b === 'Sem Projeto' ? 1 : a.localeCompare(b));

    projects.forEach(project => {
        const projectTasks = state.tasks.filter(t => (t.project || 'Sem Projeto') === project);
        if (projectTasks.length === 0) return;

        const projectContainer = document.createElement('div');
        if (project !== 'Sem Projeto') {
            projectContainer.innerHTML = `<h3 class="font-bold mt-4 mb-2 text-gray-500 text-sm uppercase">${project}</h3>`;
        }

        projectTasks.forEach(task => {
            const taskWrapper = document.createElement('div');
            taskWrapper.classList.add('task-item-wrapper', 'mb-2');
            const isSelected = task.id === state.currentTaskId;

            let taskHTML = `<div class="task-item bg-gray-50 p-3 rounded-md border-l-4 ${isSelected ? 'selected' : 'border-transparent'} ${task.isComplete ? 'completed opacity-70' : ''}"><div class="flex items-center justify-between"><div class="flex items-center flex-grow min-w-0">${task.isComplete ? IMAGES.checkmarkChecked : IMAGES.checkmarkEmpty}<span class="font-semibold truncate cursor-pointer select-task flex-grow" data-task-id="${task.id}">${task.name}</span></div><div class="flex items-center flex-shrink-0 ml-2"><span class="text-gray-500 text-sm font-bold mr-2">${task.act} <span class="font-normal text-gray-400">/ ${task.est}</span></span><button class="edit-task-btn p-1 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-yellow-100 transition" data-task-id="${task.id}"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg></button></div></div>`;

            if (task.isEditing) {
                const uniqueProjectsForDatalist = [...new Set(state.tasks.map(t => t.project).filter(p => p && p !== 'Sem Projeto'))];
                let projectDatalistHTML = '<datalist id="project-list-edit-' + task.id + '">';
                uniqueProjectsForDatalist.forEach(p => { projectDatalistHTML += `<option value="${p}"></option>`; });
                projectDatalistHTML += '</datalist>';

                // --- HTML para os novos <select> ---
                const energiaSelectHTML = ENERGIA_OPTIONS.map(opt =>
                    `<option value="${opt}" ${task.energia === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                const megafocoSelectHTML = MEGAFOCO_OPTIONS.map(opt =>
                    `<option value="${opt}" ${task.megafoco === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');
                // --- Fim do HTML para <select> ---

                // *** INÍCIO DA STRING HTML LONGA (Edit Form) ***
                taskHTML += `<div class="edit-form mt-4 pt-4 border-t border-gray-200 bg-white p-3 rounded-b-md -mx-3 -mb-3">
                    <input type="text" class="task-edit-name w-full p-2 border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-400" value="${task.name}">
                    <div class="flex items-center mb-2">
                        <label class="text-sm font-medium text-gray-600 mr-2">Estimados:</label>
                        <input type="number" class="task-edit-est w-16 p-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-yellow-400" value="${task.est}" min="1">
                    </div>

                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 my-3">
                        <div>
                            <label class="text-sm font-medium text-gray-600">Humor:</label>
                            <input type="text" class="task-edit-humor w-full bg-white p-1.5 rounded-md text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400" value="${task.humor === 'Estável' ? '' : task.humor}" placeholder="Estável">
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600">Crise:</label>
                            <input type="text" class="task-edit-crise w-full bg-white p-1.5 rounded-md text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400" value="${task.crise === 'Não' ? '' : task.crise}" placeholder="Não">
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600">Energia:</label>
                            <select class="task-edit-energia w-full bg-white p-1.5 rounded-md text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400">
                                ${energiaSelectHTML}
                            </select>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600">Megafoco:</label>
                            <select class="task-edit-megafoco w-full bg-white p-1.5 rounded-md text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400">
                                ${megafocoSelectHTML}
                            </select>
                        </div>
                    </div>
                    <textarea class="task-edit-notes w-full p-2 border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-400" placeholder="Notas...">${task.notes || ''}</textarea>
                    <input type="text" list="project-list-edit-${task.id}" class="task-edit-project w-full p-2 border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-400" value="${task.project && task.project !== 'Sem Projeto' ? task.project : ''}" placeholder="Nome do Projeto">
                   ${projectDatalistHTML}

                    <div class="flex justify-between items-center mt-3">
                        <div><button class="delete-task-btn text-red-600 hover:text-red-800 font-semibold text-sm" data-task-id="${task.id}">Deletar</button></div>
                        <div>
                            <button class="cancel-edit-btn text-gray-600 font-semibold px-3 py-1 text-sm mr-2 hover:bg-gray-200 rounded">Cancelar</button>
                            <button class="save-edit-btn bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 text-sm font-bold">Salvar</button>
                        </div>
                    </div>
                </div>`; // <--- *** CORREÇÃO CRUCIAL: Adicionado o ` aqui ***
            } // Fim do if(task.isEditing)

            taskHTML += `</div>`;
            taskWrapper.innerHTML = taskHTML;
            projectContainer.appendChild(taskWrapper);
        });
        dom.taskList.appendChild(projectContainer);
    });

    const currentTask = state.tasks.find(t => t.id === state.currentTaskId);
    dom.currentTaskDisplay.textContent = currentTask ? currentTask.name : 'Nenhuma tarefa selecionada';
    if (currentTask && currentTask.isComplete) {
        dom.currentTaskDisplay.classList.add('line-through', 'text-gray-400');
    } else {
        dom.currentTaskDisplay.classList.remove('line-through', 'text-gray-400');
    }
    addTasksEventListeners();
};

   const renderUI = () => {
        Object.values(dom.modeButtons).forEach(btn => btn.classList.remove('active'));
        if (dom.modeButtons[state.currentMode]) {
            dom.modeButtons[state.currentMode].classList.add('active');
        }
        dom.displayImage.src = state.currentMode === MODES.POMODORO ? IMAGES.studyRat : IMAGES.breakRat;
        displayTime(state.timeLeft);
        updateProgressBar();

        if (state.isRunning) {
            dom.startBtn.querySelector('.img-state').src = IMAGES.playActive; // ATUALIZADO
            dom.pauseBtn.querySelector('.img-state').src = IMAGES.pause; // ATUALIZADO
            dom.startBtn.classList.add('disabled');
            dom.pauseBtn.classList.remove('disabled');

            // LÓGICA ATUALIZADA DO BOTÃO STOP
            dom.stopBtn.classList.remove('disabled'); 
            dom.stopBtn.querySelector('.img-state').src = IMAGES.stopActive; // ATUALIZADO

        } else {
            dom.startBtn.querySelector('.img-state').src = IMAGES.play; // ATUALIZADO
            dom.pauseBtn.querySelector('.img-state').src = IMAGES.pauseActive; // ATUALIZADO
            dom.startBtn.classList.remove('disabled');
            dom.pauseBtn.classList.add('disabled');

            // LÓGICA ATUALIZADA DO BOTÃO STOP
            dom.stopBtn.classList.add('disabled'); 
            dom.stopBtn.querySelector('.img-state').src = IMAGES.stop; // ATUALIZADO
        }
        renderCycleIcons();
        renderTasks();
    };

    // --- Event Listeners Setup ---
    const addTasksEventListeners = () => {
        dom.taskList.querySelectorAll('.checkmark').forEach(el => { el.addEventListener('click', (e) => { const taskId = parseInt(e.currentTarget.closest('.task-item').querySelector('[data-task-id]').dataset.taskId); toggleTaskComplete(taskId); }); });
        dom.taskList.querySelectorAll('.select-task').forEach(el => { el.addEventListener('click', (e) => { const taskId = parseInt(e.currentTarget.dataset.taskId); selectTask(taskId); }); });
        dom.taskList.querySelectorAll('.edit-task-btn').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const taskId = parseInt(e.currentTarget.dataset.taskId); toggleEditTask(taskId); }); });
        dom.taskList.querySelectorAll('.edit-form').forEach(form => { const taskId = parseInt(form.closest('.task-item').querySelector('.edit-task-btn').dataset.taskId); form.querySelector('.cancel-edit-btn').addEventListener('click', () => { const task = state.tasks.find(t => t.id === taskId); if(task) task.isEditing = false; renderTasks(); }); form.querySelector('.save-edit-btn').addEventListener('click', () => { saveTaskEdit(taskId, form); }); form.querySelector('.delete-task-btn').addEventListener('click', () => { deleteTask(taskId); }); });
    };
const stopTimer = () => {
        if (!state.isRunning) return; // Só funciona se o timer estiver rodando

        if (!confirm('Tem certeza que deseja encerrar este timer? O tempo parcial será registrado.')) {
            return;
        }
    
        const totalSeconds = state.settings[state.currentMode] * 60;
        const elapsedSeconds = totalSeconds - state.timeLeft;
        const finishedMode = state.currentMode; // Salva o modo atual

        // Se o tempo for muito curto (ex: < 30s), apenas pare e resete, não salve.
        if (elapsedSeconds < 30) {
            pauseTimer();
            resetTimer();
            sendNotification(`${MODE_NAMES[finishedMode]} interrompido.`);
            return; 
        }

        // Arredonda para o minuto mais próximo
        const elapsedMinutes = Math.round(elapsedSeconds / 60);
        
        // Garante que salve no mínimo 1 minuto se arredondar para 0
        const finalDuration = Math.max(1, elapsedMinutes); 

        pauseTimer(); // Para o intervalo, define isRunning = false
    
        // Chama saveSession com a duração customizada (finalDuration)
        saveSession(finishedMode, finalDuration);
    
        playSoundForMode(finishedMode);
        sendNotification(`${MODE_NAMES[finishedMode]} encerrado com ${finalDuration} min.`);
    
        // Reseta o timer para o modo atual (ex: 25:00)
        resetTimer(); 
    };
    const initTimerControls = () => {
        dom.stopBtn.addEventListener('click', stopTimer); dom.startBtn.addEventListener('click', startTimer); dom.pauseBtn.addEventListener('click', pauseTimer); dom.nextBtn.addEventListener('click', skipToNextMode);
        dom.modeButtons.pomodoro.addEventListener('click', () => switchToMode(MODES.POMODORO)); dom.modeButtons.shortBreak.addEventListener('click', () => switchToMode(MODES.SHORT_BREAK)); dom.modeButtons.longBreak.addEventListener('click', () => switchToMode(MODES.LONG_BREAK));
    };

    const initTaskControls = () => {
        // --- POPULA OS DROPDOWNS DO FORMULÁRIO "ADICIONAR TAREFA" ---
        dom.taskEnergiaInput.innerHTML = ENERGIA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        dom.taskMegafocoInput.innerHTML = MEGAFOCO_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        // --- FIM DO NOVO BLOCO ---

        dom.showAddTaskFormBtn.addEventListener('click', () => { dom.addTaskForm.classList.remove('hidden'); dom.showAddTaskFormBtn.classList.add('hidden'); dom.taskNameInput.focus(); });

        const cancelAddTask = () => {
            dom.addTaskForm.classList.add('hidden');
            dom.showAddTaskFormBtn.classList.remove('hidden');
            dom.taskNameInput.value = '';
            dom.taskEstInput.value = '1';
            dom.taskNotesInput.value = '';
            dom.taskProjectInput.value = '';
            // ADICIONA A LIMPEZA DOS NOVOS CAMPOS
            dom.taskHumorInput.value = '';
            dom.taskEnergiaInput.value = 'Não consegui identificar'; // Reseta para o padrão
            dom.taskMegafocoInput.value = 'Não consegui identificar'; // Reseta para o padrão
            dom.taskCriseInput.value = '';
        };

        dom.cancelAddTaskBtn.addEventListener('click', cancelAddTask);

        dom.saveTaskBtn.addEventListener('click', () => {
            const name = dom.taskNameInput.value.trim();
            const est = dom.taskEstInput.value;
            const notes = dom.taskNotesInput.value.trim();
            const project = dom.taskProjectInput.value.trim();
            if (name) {
                addTask(name, est, notes, project); // A função addTask já lê os novos campos
                cancelAddTask();
            } else {
                alert("Por favor, dê um nome para a tarefa.");
                dom.taskNameInput.focus();
            }
        });

        // --- RESTANTE DA FUNÇÃO ORIGINAL ---
        dom.taskMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); dom.taskMenuDropdown.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!dom.taskMenuBtn.contains(e.target) && !dom.taskMenuDropdown.contains(e.target)) { dom.taskMenuDropdown.classList.add('hidden'); } });
        dom.clearFinishedTasksBtn.addEventListener('click', (e) => { e.preventDefault(); clearFinishedTasks(); dom.taskMenuDropdown.classList.add('hidden'); });
        dom.clearAllTasksBtn.addEventListener('click', (e) => { e.preventDefault(); clearAllTasks(); dom.taskMenuDropdown.classList.add('hidden'); });
        // --- FIM DO RESTANTE ---
    };

    const initModals = () => {
        dom.settingsBtn.addEventListener('click', (e) => { e.preventDefault(); dom.settingPomodoroInput.value = state.settings.pomodoro; dom.settingShortBreakInput.value = state.settings.shortBreak; dom.settingLongBreakInput.value = state.settings.longBreak; dom.settingAutoStartBreaksToggle.checked = state.settings.autoStartBreaks; dom.settingAutoStartPomodorosToggle.checked = state.settings.autoStartPomodoros; dom.settingLongBreakIntervalInput.value = state.settings.longBreakInterval; dom.settingSoundPomodoroSelect.value = state.settings.soundPomodoro;
dom.settingSoundShortBreakSelect.value = state.settings.soundShortBreak;
dom.settingSoundLongBreakSelect.value = state.settings.soundLongBreak;  dom.settingAlarmVolumeSlider.value = state.settings.alarmVolume; dom.settingBrowserNotificationsToggle.checked = state.settings.browserNotifications; updateNotificationStatus(); dom.settingBrowserNotificationsToggle.disabled = (Notification.permission === 'denied'); dom.settingsModal.classList.remove('hidden'); });
        dom.closeSettingsModalBtn.addEventListener('click', () => dom.settingsModal.classList.add('hidden'));
        dom.saveSettingsBtn.addEventListener('click', () => {
            state.settings.pomodoro = parseInt(dom.settingPomodoroInput.value) || DEFAULT_SETTINGS.pomodoro; state.settings.shortBreak = parseInt(dom.settingShortBreakInput.value) || DEFAULT_SETTINGS.shortBreak; state.settings.longBreak = parseInt(dom.settingLongBreakInput.value) || DEFAULT_SETTINGS.longBreak; state.settings.autoStartBreaks = dom.settingAutoStartBreaksToggle.checked; state.settings.autoStartPomodoros = dom.settingAutoStartPomodorosToggle.checked; state.settings.longBreakInterval = parseInt(dom.settingLongBreakIntervalInput.value) || DEFAULT_SETTINGS.longBreakInterval; state.settings.soundPomodoro = dom.settingSoundPomodoroSelect.value;
state.settings.soundShortBreak = dom.settingSoundShortBreakSelect.value;
state.settings.soundLongBreak = dom.settingSoundLongBreakSelect.value; state.settings.alarmVolume = parseFloat(dom.settingAlarmVolumeSlider.value); state.settings.browserNotifications = dom.settingBrowserNotificationsToggle.checked;
            saveData();
            if (!state.isRunning) {
                resetTimer();
            } else {
                renderCycleIcons();
            }
            dom.settingsModal.classList.add('hidden');
            if (state.settings.browserNotifications && Notification.permission !== 'granted' && Notification.permission !== 'denied') { requestNotificationPermission(); }
        });
        dom.settingBrowserNotificationsToggle.addEventListener('change', (e) => { if (e.target.checked) { if (Notification.permission === 'granted') { state.settings.browserNotifications = true; } else if (Notification.permission !== 'denied') { requestNotificationPermission(); } else { e.target.checked = false; alert("A permissão para notificações foi negada anteriormente."); } } else { state.settings.browserNotifications = false; } });

        dom.reportBtn.addEventListener('click', (e) => { e.preventDefault(); renderReport(); dom.reportModal.classList.remove('hidden'); });
        dom.closeReportModalBtn.addEventListener('click', () => dom.reportModal.classList.add('hidden'));
        dom.okReportBtn.addEventListener('click', () => dom.reportModal.classList.add('hidden'));
        dom.downloadCsvBtn.addEventListener('click', exportSessionsToCSV);
        dom.addManualSessionBtn.addEventListener('click', () => openManualSessionModal());
    dom.closeManualSessionModalBtn.addEventListener('click', () => dom.manualSessionModal.classList.add('hidden'));
    dom.cancelManualSessionBtn.addEventListener('click', () => dom.manualSessionModal.classList.add('hidden'));
    dom.manualSessionForm.addEventListener('submit', saveManualSession);

    // Usa 'event delegation' pois os botões de editar/excluir são criados dinamicamente
    dom.reportSessionList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-session-action.edit');
        const deleteButton = e.target.closest('.btn-session-action.delete');

        if (editButton) {
            const sessionId = parseInt(editButton.dataset.sessionId);
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) openManualSessionModal(session);
        }

        if (deleteButton) {
            const sessionId = parseInt(deleteButton.dataset.sessionId);
            deleteSession(sessionId);
        }
    });

       [dom.settingsModal, dom.reportModal, dom.manualSessionModal].forEach(modal => { 
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) { 
                modal.classList.add('hidden'); 
            } 
        }); 
    });
};

    // --- Initialization ---
    const init = () => {
        loadData(); populateSoundSelects(); initTimerControls(); initTaskControls(); initModals(); renderUI(); updateProjectDatalist(); if ('Notification' in window && Notification.permission !== 'default') { updateNotificationStatus(); }
    };

    init();
});