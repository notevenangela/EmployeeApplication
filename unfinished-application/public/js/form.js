// public/js/form.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("FORM JS LOADED");

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");

  let currentStepIndex = 0;

  // Helper function to highlight field errors
  function highlightFieldError(field) {
    // Clear any existing error highlighting first
    clearFieldError(field);
    
    if (field.type === 'radio') {
      // For radio buttons, highlight just the radio group div, not the entire fieldset
      const radioGroupDiv = field.closest('.radio-group');
      if (radioGroupDiv) {
        radioGroupDiv.classList.add('field-error');
      } else {
        // Fallback: add error class to all radio buttons in the group
        const radioButtons = document.querySelectorAll(`input[name="${field.name}"]`);
        radioButtons.forEach(radio => {
          radio.classList.add('field-error');
        });
      }
    } else if (field.type === 'checkbox') {
      // For checkboxes, highlight the checkbox and its container
      field.classList.add('field-error');
      field.closest('.checkbox-group')?.classList.add('field-error');
    } else {
      // For regular input fields
      field.classList.add('field-error', 'field-error-shake');
      
      // Remove shake animation after it completes
      setTimeout(() => {
        field.classList.remove('field-error-shake');
      }, 500);
    }
  }

  // Helper function to clear field errors
  function clearFieldError(field) {
    if (field.type === 'radio') {
      const radioGroupDiv = field.closest('.radio-group');
      if (radioGroupDiv) {
        radioGroupDiv.classList.remove('field-error');
      } else {
        const radioButtons = document.querySelectorAll(`input[name="${field.name}"]`);
        radioButtons.forEach(radio => {
          radio.classList.remove('field-error');
        });
      }
    } else if (field.type === 'checkbox') {
      field.classList.remove('field-error');
      field.closest('.checkbox-group')?.classList.remove('field-error');
    } else {
      field.classList.remove('field-error', 'field-error-shake');
    }
  }

  // Helper function to clear all field errors in current step
  function clearAllFieldErrors() {
    const allErrorFields = document.querySelectorAll('.field-error');
    allErrorFields.forEach(element => {
      element.classList.remove('field-error');
    });
  }

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

  // Function to check if current step has unfilled required fields
  function getCurrentStepRequiredFields() {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return [];

    const requiredFields = currentStep.querySelectorAll('[required]');
    const emptyFields = [];

    requiredFields.forEach(field => {
      let isEmpty = false;
      
      if (field.type === 'radio') {
        // For radio buttons, check if any in the group is selected
        const radioGroup = currentStep.querySelectorAll(`[name="${field.name}"]`);
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
        const label = document.querySelector(`label[for="${field.id}"]`);
        const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
        emptyFields.push({ name: field.name, label: fieldName, element: field });
      }
    });

    return emptyFields;
  }

  // Function to create and show custom modal
  function createModal(title, message, emptyFields, onConfirm, onCancel) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
        </div>
        <div class="modal-body">
          <p>${message}</p>
          <div class="missing-fields">
            <div class="missing-fields-title">Missing Required Fields:</div>
            <ul class="missing-fields-list">
              ${emptyFields.map(field => `<li>${field.label}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn secondary" data-action="cancel">
            Stay and Complete Fields
          </button>
          <button class="modal-btn primary" data-action="confirm">
            Continue Anyway
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      closeModal();
      onConfirm();
    });

    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      closeModal();
      onCancel();
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        onCancel();
      }
    });

    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        onCancel();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    function closeModal() {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }

    // Add to DOM and show
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  }

  // Function to show warning and ask for confirmation
  function showNavigationWarning(emptyFields) {
    return new Promise((resolve) => {
      createModal(
        'Incomplete Required Fields',
        'You have some required fields that haven\'t been filled out yet. Would you like to complete them first, or continue to the next section?',
        emptyFields,
        () => resolve(true),  // Continue anyway
        () => resolve(false)  // Stay and complete
      );
    });
  }

  // Function to show success modal
  function showSuccessModal(message, details = '') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title success">Application Submitted Successfully!</h2>
          </div>
          <div class="modal-body">
            <div class="success-content">
              <h3>Thank you for applying!</h3>
              <p>${message}</p>
              ${details ? `<p><strong>Position Applied For:</strong> ${details}</p>` : ''}
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-btn success" data-action="confirm">
              Submit Another Application
            </button>
          </div>
        </div>
      `;

      // Add event listeners
      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        closeModal();
        resolve();
      });

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
          resolve();
        }
      });

      // Close on escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          resolve();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      }

      // Add to DOM and show
      document.body.appendChild(modal);
      
      // Trigger animation
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
    });
  }

  // Function to show error modal for form submission
  function showErrorModal(emptyFields) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title error">Application Incomplete</h2>
          </div>
          <div class="modal-body">
            <p>Please complete all required fields before submitting your application.</p>
            <div class="error-content">
              <h3>Required Fields Missing:</h3>
              <ul class="missing-fields-list">
                ${emptyFields.map(field => `<li>${field.label}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-btn primary" data-action="confirm">
              Go to First Missing Field
            </button>
          </div>
        </div>
      `;

      // Add event listeners
      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        closeModal();
        resolve();
      });

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
          resolve();
        }
      });

      // Close on escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          resolve();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      }

      // Add to DOM and show
      document.body.appendChild(modal);
      
      // Trigger animation
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
    });
  }

  // Function to safely navigate to a step with validation
  async function navigateToStep(targetIndex, forceNavigation = false) {
    // Don't check validation when going backwards or if forced
    if (targetIndex <= currentStepIndex || forceNavigation) {
      clearAllFieldErrors(); // Clear errors when navigating
      showStep(targetIndex);
      return true;
    }

    // Check for unfilled required fields in current step
    const emptyFields = getCurrentStepRequiredFields();
    
    if (emptyFields.length > 0) {
      // Highlight all empty fields
      emptyFields.forEach(field => {
        if (field.element) {
          highlightFieldError(field.element);
        }
      });

      const confirmed = await showNavigationWarning(emptyFields);
      if (!confirmed) {
        // Focus on first empty field
        if (emptyFields[0].element) {
          emptyFields[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emptyFields[0].element.focus();
        }
        return false;
      } else {
        // User chose to continue anyway, clear the error highlighting
        clearAllFieldErrors();
      }
    }

    showStep(targetIndex);
    return true;
  }

  // Next buttons
  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToStep(currentStepIndex + 1);
    });
  });

  // Back buttons
  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToStep(currentStepIndex - 1);
    });
  });

  // Clickable progress pills
  progressSteps.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetIndex = parseInt(pill.dataset.step, 10);
      if (!Number.isNaN(targetIndex)) {
        navigateToStep(targetIndex);
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

  // Add event listeners to clear error highlighting when users interact with fields
  document.addEventListener('input', (e) => {
    if (e.target.matches('input, select, textarea')) {
      clearFieldError(e.target);
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type="radio"], input[type="checkbox"]')) {
      clearFieldError(e.target);
    }
  });

  // Check for success message on page load
  const successData = document.getElementById('success-data');
  console.log('Success data element:', successData);
  
  if (successData) {
    const message = successData.dataset.message;
    const position = successData.dataset.position;
    console.log('Success message:', message, 'Position:', position);
    
    setTimeout(() => {
      console.log('Showing success modal...');
      showSuccessModal(message, position).then(() => {
        console.log('Success modal closed, redirecting...');
        // Redirect to home page for new application
        window.location.href = '/';
      });
    }, 500);
  } else {
    console.log('No success data found on page load');
  }

  // Form submission validation
  const applicationForm = document.querySelector('form');
  if (applicationForm) {
    applicationForm.addEventListener('submit', async (e) => {
      // Clear any existing error highlighting
      clearAllFieldErrors();
      
      // Get all required fields across all steps
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
          const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
          emptyFields.push({ name: field.name, label: fieldName, element: field });
        }
      });

      // If there are empty required fields, prevent submission and show modal
      if (emptyFields.length > 0) {
        e.preventDefault();
        
        // Highlight all empty fields
        emptyFields.forEach(field => {
          if (field.element) {
            highlightFieldError(field.element);
          }
        });
        
        await showErrorModal(emptyFields);
        
        // Scroll to first empty field
        if (emptyFields[0].element) {
          emptyFields[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emptyFields[0].element.focus();
        }
      }
    });
  }
});
