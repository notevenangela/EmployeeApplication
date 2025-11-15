document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
  const allDaysBtn = document.getElementById("selectAllDays");
  const availableDaysGroup = document.getElementById("availableDaysGroup");
  const globalMessages = document.getElementById("global-messages");

  let currentStepIndex = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
    progressSteps.forEach((p, i) => {
      p.classList.toggle("active", i === index);
    });
    currentStepIndex = index;
    if (globalMessages) {
      globalMessages.textContent = `Step ${index + 1} of ${steps.length}`;
    }
  }

  function validateCurrentStep() {
    const step = steps[currentStepIndex];
    const inputs = Array.from(step.querySelectorAll("input, select, textarea"));
    let valid = true;

    inputs.forEach((input) => {
      input.classList.remove("invalid");
      if (!input.checkValidity()) {
        valid = false;
        input.classList.add("invalid");
      }
    });

    if (!valid && globalMessages) {
      globalMessages.textContent = "Please fix the errors on this step before continuing.";
    }

    return valid;
  }

  form.addEventListener("click", (e) => {
    if (e.target.classList.contains("next-step")) {
      if (!validateCurrentStep()) return;
      if (currentStepIndex < steps.length - 1) {
        showStep(currentStepIndex + 1);
      }
    }

    if (e.target.classList.contains("prev-step")) {
      if (currentStepIndex > 0) {
        showStep(currentStepIndex - 1);
      }
    }
  });

  if (allDaysBtn && availableDaysGroup) {
    allDaysBtn.addEventListener("click", () => {
      const checkboxes = availableDaysGroup.querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
      checkboxes.forEach((cb) => {
        cb.checked = !allChecked;
      });
    });
  }

  // Real-time validation feedback
  form.addEventListener("input", (e) => {
    const target = e.target;
    if (!target.matches("input, select, textarea")) return;
    target.classList.remove("invalid");
    if (!target.checkValidity()) {
      target.classList.add("invalid");
    }
  });

  // Submit-level check for required validation beyond HTML5
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      // Try to jump to the first step with an invalid field
      const invalid = form.querySelector(".invalid, input:invalid, select:invalid, textarea:invalid");
      if (invalid) {
        const step = invalid.closest(".form-step");
        if (step) {
          const index = steps.indexOf(step);
          if (index >= 0) showStep(index);
        }
      }
      if (globalMessages) {
        globalMessages.textContent = "Please review the highlighted fields.";
      }
    }
  });

  // Initialize step 1
  showStep(0);
});
