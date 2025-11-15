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

      // Add delete button to cloned entry
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        // Don't allow removing if it's the only education entry
        const allEntries = eduSection.querySelectorAll(".education-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
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

      // Add delete button to cloned entry
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        // Don't allow removing if it's the only work entry
        const allEntries = workSection.querySelectorAll(".work-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
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

      // Add delete button to cloned entry
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        // Don't allow removing if it's the only reference entry
        const allEntries = refSection.querySelectorAll(".reference-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
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

  // Form submission validation
  const applicationForm = document.querySelector('form');
  if (applicationForm) {
    applicationForm.addEventListener('submit', (e) => {
      // Get all required fields
      const requiredFields = applicationForm.querySelectorAll('[required]');
      const emptyFields = [];

      // Check each required field
      requiredFields.forEach(field => {
        let isEmpty = false;
        
        if (field.type === 'radio') {
          // For radio buttons, check if any in the group is selected
          const radioGroup = applicationForm.querySelectorAll(`[name="${field.name}"]`);
          const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
          if (!isGroupChecked) {
            // Only add once per radio group
            if (!emptyFields.some(item => item.name === field.name)) {
              isEmpty = true;
            }
          }
        } else if (field.type === 'checkbox') {
          // For checkboxes, check if it's checked
          if (!field.checked) {
            isEmpty = true;
          }
        } else {
          // For text, email, date, select, etc.
          if (!field.value || field.value.trim() === '') {
            isEmpty = true;
          }
        }

        if (isEmpty) {
          // Get field label or name for better error message
          const label = applicationForm.querySelector(`label[for="${field.id}"]`);
          const fieldName = label ? label.textContent.replace('*', '').trim() : field.name;
          emptyFields.push({ name: field.name, label: fieldName });
        }
      });

      // If there are empty required fields, prevent submission and show alert
      if (emptyFields.length > 0) {
        e.preventDefault();
        
        let message = 'Please make sure all required fields are completed:\n\n';
        emptyFields.forEach(field => {
          message += `• ${field.label}\n`;
        });

        alert(message);
        
        // Scroll to first empty field
        const firstEmptyField = applicationForm.querySelector(`[name="${emptyFields[0].name}"]`);
        if (firstEmptyField) {
          firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstEmptyField.focus();
        }
      }
    });
  }
});
