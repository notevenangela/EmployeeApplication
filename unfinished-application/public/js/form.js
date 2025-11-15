console.log("FORM JS IS LOADED");
document.addEventListener("DOMContentLoaded", () => {
  const steps = Array.from(document.querySelectorAll(".form-step"));
  const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");
  const allDaysBtn = document.getElementById("selectAllDays");
  const availableDaysGroup = document.getElementById("availableDaysGroup");

  let currentStepIndex = 0;

  function showStep(index) {
    // Clamp index just in case
    if (index < 0) index = 0;
    if (index >= steps.length) index = steps.length - 1;

    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });

    progressSteps.forEach((p, i) => {
      p.classList.toggle("active", i === index);
    });

    currentStepIndex = index;
  }

  // Move forward
  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(currentStepIndex + 1);
    });
  });

  // Move backward
  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(currentStepIndex - 1);
    });
  });

  // "All Days" button on Availability step
  if (allDaysBtn && availableDaysGroup) {
    allDaysBtn.addEventListener("click", () => {
      const checkboxes = availableDaysGroup.querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
      checkboxes.forEach((cb) => {
        cb.checked = !allChecked; // toggle all on or off
      });
    });
  }

  // Start on step 0
  showStep(0);
});
