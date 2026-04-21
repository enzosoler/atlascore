(function () {
  const defaultOnboardingState = {
    sex: 'male',
    age: 31,
    heightCm: 180,
    weightLb: 186.9,
    goal: 'rebuild',
    trainingDays: 3,
    equipment: 'full',
    sleepHours: 5.9,
    sleepStability: 'chaotic',
    stressLoad: 'high',
    proteinConsistency: 'inconsistent',
    appetiteStability: 'variable',
    trainingWindow: 'pm',
    travelVolatility: 'medium',
    movementConstraint: 'shoulder',
    avoidPatterns: ['overhead'],
    adherenceFailure: 'schedule',
    decisionBandwidth: 'medium',
    connectedSources: ['apple health', 'calendar'],
    correctionRate: 'moderate',
    correctionCadence: 'weekly',
  };

  function evaluateUser(state) {
    const sleepHours = state.sleepHours ?? 7;
    const trainingDays = state.trainingDays ?? 3;
    const stressLoad = state.stressLoad ?? 'moderate';
    const sleepStability = state.sleepStability ?? 'mostly';
    const proteinConsistency = state.proteinConsistency ?? 'inconsistent';
    const appetiteStability = state.appetiteStability ?? 'variable';
    const decisionBandwidth = state.decisionBandwidth ?? 'medium';
    const adherenceFailure = state.adherenceFailure ?? 'schedule';
    const movementConstraint = state.movementConstraint ?? 'none';
    const connectedSources = state.connectedSources ?? [];

    let recovery = 'high';
    if (sleepHours < 6 || stressLoad === 'high' || sleepStability === 'chaotic') recovery = 'low';
    else if (sleepHours < 7.5 || stressLoad === 'moderate') recovery = 'medium';

    let consistency = 'high';
    if (trainingDays < 3 || proteinConsistency === 'low') consistency = 'low';
    else if (trainingDays < 5 || proteinConsistency === 'inconsistent') consistency = 'medium';

    let intensityTolerance = 'high';
    if (recovery === 'low' || movementConstraint !== 'none') intensityTolerance = 'low';
    else if (recovery === 'medium') intensityTolerance = 'medium';

    let adherenceRisk = 'low';
    if (
      consistency === 'low' ||
      decisionBandwidth === 'low' ||
      adherenceFailure === 'complexity' ||
      appetiteStability === 'reactive'
    ) adherenceRisk = 'high';
    else if (consistency === 'medium' || adherenceFailure === 'schedule') adherenceRisk = 'medium';

    let limitingFactor = 'consistency';
    if (recovery === 'low') limitingFactor = 'recovery';
    else if (adherenceRisk === 'high') limitingFactor = 'adherence';
    else if (proteinConsistency !== 'locked') limitingFactor = 'nutrition';

    const telemetryCoverage = connectedSources.length >= 3 ? 'strong' : connectedSources.length >= 2 ? 'partial' : 'weak';

    return {
      recovery,
      consistency,
      intensityTolerance,
      adherenceRisk,
      limitingFactor,
      telemetryCoverage,
    };
  }

  function getSystemInsight(signals, state) {
    if (signals.adherenceRisk === 'high') {
      return "You're likely to drop off if we push too hard. The system should remove decisions before it adds ambition.";
    }
    if (signals.recovery === 'low') {
      return 'Your recovery is currently limiting your ability to improve performance. Progress should start by stabilizing sleep and stress exposure.';
    }
    if (signals.limitingFactor === 'nutrition') {
      return 'Training capacity is usable, but protein reliability is still capping progress quality.';
    }
    return `Your inputs support a stable ${state.goal} model. The system can push without creating unnecessary volatility.`;
  }

  function buildSystemState(signals, state) {
    const stateClass =
      signals.recovery === 'low' ? 'stabilize mode'
      : state.goal === 'build' ? 'growth mode'
      : state.goal === 'cut' ? 'cut mode'
      : 'rebuild mode';

    const readinessBaseline =
      signals.recovery === 'low' ? 61
      : signals.recovery === 'medium' ? 72
      : 83;

    const proteinFloor =
      state.goal === 'build' ? 205
      : state.goal === 'cut' ? 190
      : 185;

    return {
      stateClass,
      readinessBaseline,
      trainingCadence: `${state.trainingDays}d/wk`,
      proteinFloor,
      correctionLoop: state.correctionCadence,
      limitingFactor: signals.limitingFactor,
      explanation: getSystemInsight(signals, state),
    };
  }

  function buildTrajectory(signals, state) {
    if (signals.recovery === 'low') {
      return [
        'Week 1: stabilize recovery and reduce volatility',
        'Week 2: re-expand workload only if sleep normalizes',
        'Week 3: resume progression with conservative set growth',
      ];
    }
    if (signals.adherenceRisk === 'high') {
      return [
        'Week 1: simplify decisions and lock execution windows',
        'Week 2: repeat the minimum viable plan without adding complexity',
        'Week 3: add workload only after consistency holds',
      ];
    }
    if (state.goal === 'build') {
      return [
        'Week 1: establish surplus and baseline push performance',
        'Week 2: add progressive overload to main lifts',
        'Week 3: visible strength progression with stable recovery',
      ];
    }
    return [
      'Week 1: stabilize signals and confirm compliance',
      'Week 2: increase workload inside the recovery envelope',
      'Week 3: visible body-composition and performance progression',
    ];
  }

  function generateToday(signals, state) {
    if (signals.recovery === 'low') {
      return {
        workout: 'Light upper session',
        focus: 'Recovery + technique',
        nutrition: 'Increase protein + hydration',
        timing: state.trainingWindow === 'am' ? '07:30' : '18:00',
        duration: '42 minutes',
      };
    }
    if (signals.adherenceRisk === 'high') {
      return {
        workout: 'Compressed full-body session',
        focus: 'Minimum viable compliance',
        nutrition: 'Repeat one reliable high-protein meal twice',
        timing: state.trainingWindow === 'mid' ? '12:30' : '18:00',
        duration: '36 minutes',
      };
    }
    return {
      workout: 'Full session',
      focus: 'Progressive overload',
      nutrition: 'Maintain intake',
      timing: state.trainingWindow === 'am' ? '07:00' : '18:00',
      duration: '52 minutes',
    };
  }

  function getNextScreen(current, state) {
    const signals = evaluateUser(state);
    const defaultNext = {
      S90: 'S91',
      S91: 'S92',
      S92: 'S93',
      S93: 'S94',
      S94: 'S95',
      S95: 'S96',
      S96: 'S97',
      S97: 'S98',
      S98: 'S99',
      S99: 'S100',
      S100: 'S101',
      S101: 'S102',
      S102: 'S103',
      S103: 'S104',
      S104: 'S105',
    };

    if (current === 'S93' && signals.recovery === 'low') return 'S94_Recovery_DeepDive';
    if (current === 'S97' && signals.intensityTolerance === 'low') return 'S98_Adherence_Adjustment';
    if (current === 'S98' && signals.adherenceRisk === 'high') return 'S99_Simplified_Input_Set';
    return defaultNext[current] || 'S105';
  }

  window.OnboardingEngine = {
    defaultOnboardingState,
    evaluateUser,
    getSystemInsight,
    buildSystemState,
    buildTrajectory,
    generateToday,
    getNextScreen,
  };
})();
