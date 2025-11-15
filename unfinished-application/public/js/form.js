// public/js/form.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("FORM JS LOADED");

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");

  let currentStepIndex = 0;

  function showStep(index) {
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

  // Next buttons
  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(currentStepIndex + 1);
    });
  });

  // Back buttons
  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(currentStepIndex - 1);
    });
  });

  // Clickable progress pills
  progressSteps.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetIndex = parseInt(pill.dataset.step, 10);
      if (!Number.isNaN(targetIndex)) {
        showStep(targetIndex);
      }
    });
  });

  // Add More Education
  const eduSection = document.getElementById("education-section");
  const addEduBtn = document.getElementById("addEducation");

  if (eduSection && addEduBtn) {
    addEduBtn.addEventListener("click", () => {
      const firstEntry = eduSection.querySelector(".education-entry");
      if (!firstEntry) return;

      const clone = firstEntry.cloneNode(true);
      clone.querySelectorAll("input, select, textarea").forEach((el) => {
        el.value = "";
      });

      eduSection.insertBefore(clone, addEduBtn);
    });
  }

  // Add More Work Experience
  const workSection = document.getElementById("work-section");
  const addWorkBtn = document.getElementById("addWorkExperience");

  if (workSection && addWorkBtn) {
    addWorkBtn.addEventListener("click", () => {
      const firstEntry = workSection.querySelector(".work-entry");
      if (!firstEntry) return;

      const clone = firstEntry.cloneNode(true);
      clone.querySelectorAll("input, textarea, select").forEach((el) => {
        el.value = "";
      });

      workSection.insertBefore(clone, addWorkBtn);
    });
  }

  // Add More References
  const refSection = document.getElementById("references-section");
  const addRefBtn = document.getElementById("addReference");

  if (refSection && addRefBtn) {
    addRefBtn.addEventListener("click", () => {
      const firstEntry = refSection.querySelector(".reference-entry");
      if (!firstEntry) return;

      const clone = firstEntry.cloneNode(true);
      clone.querySelectorAll("input, textarea, select").forEach((el) => {
        el.value = "";
      });

      refSection.insertBefore(clone, addRefBtn);
    });
  }

  // Select All Days (Availability)
  const selectAllBtn = document.getElementById("selectAllDays");
  const daysContainer = document.getElementById("availableDaysGroup");

  if (selectAllBtn && daysContainer) {
    selectAllBtn.addEventListener("click", () => {
      const boxes = daysContainer.querySelectorAll("input[type='checkbox']");
      if (!boxes.length) return;

      const allChecked = Array.from(boxes).every((b) => b.checked);
      boxes.forEach((b) => {
        b.checked = !allChecked;
      });
    });
  }

  // Start on first step
  showStep(0);
});
