window.SCREENS = Object.keys(window)
  .filter((key) => /^S\d+_/.test(key) && typeof window[key] === 'function')
  .reduce((acc, key) => {
    acc[key] = window[key];
    return acc;
  }, {});

window.SCREEN_LIST = Object.entries(window.SCREENS)
  .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
  .map(([name, Comp]) => ({ name, Comp }));

window.MOBILE_SCREEN_LIST = window.SCREEN_LIST.filter(
  (screen) => !/^S8\d+_Admin_/.test(screen.name)
);

window.FLOWS = {
  onboarding: [
    'S7_Onboard_Identity',
    'S8_Onboard_Goal',
    'S9_Onboard_Activity',
    'S10_Onboard_Plan',
    'S11_Onboard_Permissions',
  ],
  onboardingAdaptive: [
    'S90_System_Calibration_Entry',
    'S91_System_Bio_Baseline',
    'S92_System_Direction',
    'S93_System_Load_Profile',
    'S94_System_Recovery_Window',
    'S95_System_Fuel_Signal',
    'S96_System_Schedule_Constraints',
    'S97_System_Movement_Constraints',
    'S98_System_Adherence_Risk',
    'S99_System_Data_Inputs',
    'S100_System_Reflection',
    'S101_System_Calibration_Plan',
    'S102_System_First_Week',
    'S103_System_State',
    'S104_System_Trajectory',
    'S105_System_Today',
  ],
};
