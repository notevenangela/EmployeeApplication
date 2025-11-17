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

  // Function to check if any field in a section has been filled
  function isSectionStarted(sectionElement) {
    // Define the key fields that indicate a section has been started
    const keyFields = {
      education: ['schoolName', 'educationLevel'],
      work: ['employerName', 'jobTitle'], 
      reference: ['refName', 'refCompany']
    };
    
    // Determine section type based on class
    let sectionType = '';
    if (sectionElement.classList.contains('education-entry')) {
      sectionType = 'education';
    } else if (sectionElement.classList.contains('work-entry')) {
      sectionType = 'work';
    } else if (sectionElement.classList.contains('reference-entry')) {
      sectionType = 'reference';
    }
    
    if (!sectionType || !keyFields[sectionType]) {
      return false; // Unknown section type
    }
    
    // Check if any of the key fields for this section type have been filled
    return keyFields[sectionType].some(fieldName => {
      const field = sectionElement.querySelector(`[name="${fieldName}"]`);
      if (!field) return false;
      
      if (field.type === 'radio' || field.type === 'checkbox') {
        return field.checked;
      }
      return field.value && field.value.trim() !== '';
    });
  }

  // Function to get required fields for a section if it's been started
  function getSectionRequiredFields(sectionElement, sectionType) {
    if (!isSectionStarted(sectionElement)) {
      return []; // Section not started, no validation needed
    }

    const requiredFieldNames = {
      education: ['schoolName', 'schoolCity', 'schoolState', 'educationLevel'],
      work: ['employerName', 'jobTitle', 'workStartDate', 'workEndDate'],
      reference: ['refName', 'refCompany', 'refPhone']
    };

    const requiredNames = requiredFieldNames[sectionType] || [];
    const emptyFields = [];

    requiredNames.forEach(fieldName => {
      const field = sectionElement.querySelector(`[name="${fieldName}"]`);
      if (field) {
        let isEmpty = false;
        
        if (field.type === 'radio') {
          const radioGroup = sectionElement.querySelectorAll(`[name="${fieldName}"]`);
          const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
          isEmpty = !isGroupChecked;
        } else if (field.type === 'checkbox') {
          isEmpty = !field.checked;
        } else {
          isEmpty = !field.value || field.value.trim() === '';
        }

        if (isEmpty) {
          const label = document.querySelector(`label[for="${field.id}"]`);
          const fieldLabel = label ? label.textContent.replace(/\*/g, '').trim() : fieldName;
          emptyFields.push({ name: fieldName, label: fieldLabel, element: field });
        }
      }
    });

    return emptyFields;
  }

  // Function to check if current step has unfilled required fields
  function getCurrentStepRequiredFields() {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return [];

    let emptyFields = [];

    // Check standard required fields first
    const requiredFields = currentStep.querySelectorAll('[required]');
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

    // Check for invalid email formats in current step (both required and optional emails)
    const emailFields = currentStep.querySelectorAll('input[name="email"], input[name="refEmail"]');
    emailFields.forEach(field => {
      if (field.value && !isValidEmail(field.value)) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
        emptyFields.push({ 
          name: field.name, 
          label: `${fieldName} (invalid format)`, 
          element: field 
        });
      }
    });

    // Check for invalid phone formats in current step (both required and optional phones)
    const phoneFields = currentStep.querySelectorAll('input[name="phone"], input[name="refPhone"]');
    phoneFields.forEach(field => {
      if (field.value && !isValidPhoneNumber(field.value)) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
        emptyFields.push({ 
          name: field.name, 
          label: `${fieldName} (invalid format)`, 
          element: field 
        });
      }
    });

    // Check section-specific validation (all-or-nothing)
    const educationSections = currentStep.querySelectorAll('.education-entry');
    educationSections.forEach(section => {
      const sectionFields = getSectionRequiredFields(section, 'education');
      emptyFields = emptyFields.concat(sectionFields);
    });

    const workSections = currentStep.querySelectorAll('.work-entry');
    workSections.forEach(section => {
      const sectionFields = getSectionRequiredFields(section, 'work');
      emptyFields = emptyFields.concat(sectionFields);
    });

    const referenceSections = currentStep.querySelectorAll('.reference-entry');
    referenceSections.forEach(section => {
      const sectionFields = getSectionRequiredFields(section, 'reference');
      emptyFields = emptyFields.concat(sectionFields);
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
              Close
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
        el.disabled = false; // Re-enable any disabled inputs
      });

      // Reset any "still working" buttons in the cloned entry
      clone.querySelectorAll(".still-working-btn").forEach(btn => {
        btn.classList.remove('active');
        btn.textContent = 'Currently still working here';
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

  // Handle "still working here" buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('still-working-btn')) {
      const targetInputId = e.target.dataset.target;
      const targetInput = document.getElementById(targetInputId);
      const button = e.target;
      
      if (targetInput) {
        if (button.classList.contains('active')) {
          // Deactivate - enable the date input and clear it
          button.classList.remove('active');
          button.textContent = 'Currently still working here';
          targetInput.disabled = false;
          targetInput.value = '';
        } else {
          // Activate - disable the date input and set text to "Present"
          button.classList.add('active');
          button.textContent = 'Still working here ✓';
          targetInput.disabled = true;
          targetInput.value = 'Present'; // This will be handled specially on server
        }
      }
    }
  });

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

  // Phone number formatting and validation
  function formatPhoneNumber(value) {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  }

  function isValidPhoneNumber(value) {
    // Remove all non-numeric characters and check if exactly 10 digits
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.length === 10;
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Add phone formatting to main phone field and reference phone fields
  document.addEventListener('input', (e) => {
    if (e.target.matches('input[name="phone"], input[name="refPhone"]')) {
      const cursorPosition = e.target.selectionStart;
      const oldLength = e.target.value.length;
      
      // Format the phone number
      e.target.value = formatPhoneNumber(e.target.value);
      
      // Adjust cursor position after formatting
      const newLength = e.target.value.length;
      const lengthDiff = newLength - oldLength;
      e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
      
      // Clear any existing errors if the phone number becomes valid
      if (isValidPhoneNumber(e.target.value)) {
        clearFieldError(e.target);
      }
    }
    
    // Email validation on input
    if (e.target.matches('input[name="email"], input[name="refEmail"]')) {
      // Clear errors if email becomes valid
      if (isValidEmail(e.target.value)) {
        clearFieldError(e.target);
      }
    }
  });

  // Validate phone numbers and emails on blur
  document.addEventListener('blur', (e) => {
    if (e.target.matches('input[name="phone"], input[name="refPhone"]')) {
      if (e.target.value && !isValidPhoneNumber(e.target.value)) {
        highlightFieldError(e.target);
      }
    }
    
    if (e.target.matches('input[name="email"], input[name="refEmail"]')) {
      if (e.target.value && !isValidEmail(e.target.value)) {
        highlightFieldError(e.target);
      }
    }
  }, true);

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
        console.log('Success modal closed');
        // Stay on the current page instead of redirecting
        // User can manually navigate away if they want to submit another application
      });
    }, 500);
  } else {
    console.log('No success data found on page load');
  }

  // Form submission validation
  const applicationForm = document.querySelector('form');
  if (applicationForm) {
    const handleFormSubmit = async (e) => {
      console.log('Form submission started');
      
      // IMMEDIATELY prevent any form submission
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Clear any existing error highlighting
      clearAllFieldErrors();
      
      let emptyFields = [];

      // Check standard required fields first
      const requiredFields = applicationForm.querySelectorAll('[required]');
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

      // Check for invalid email formats (both required and optional emails)
      const emailFields = applicationForm.querySelectorAll('input[name="email"], input[name="refEmail"]');
      emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
          const label = applicationForm.querySelector(`label[for="${field.id}"]`);
          const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
          emptyFields.push({ 
            name: field.name, 
            label: `${fieldName} (invalid format)`, 
            element: field 
          });
        }
      });

      // Check for invalid phone formats (both required and optional phones)
      const phoneFields = applicationForm.querySelectorAll('input[name="phone"], input[name="refPhone"]');
      phoneFields.forEach(field => {
        if (field.value && !isValidPhoneNumber(field.value)) {
          const label = applicationForm.querySelector(`label[for="${field.id}"]`);
          const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
          emptyFields.push({ 
            name: field.name, 
            label: `${fieldName} (invalid format)`, 
            element: field 
          });
        }
      });

      // Check section-specific validation (all-or-nothing) for all sections
      const educationSections = applicationForm.querySelectorAll('.education-entry');
      educationSections.forEach(section => {
        const sectionFields = getSectionRequiredFields(section, 'education');
        emptyFields = emptyFields.concat(sectionFields);
      });

      const workSections = applicationForm.querySelectorAll('.work-entry');
      workSections.forEach(section => {
        const sectionFields = getSectionRequiredFields(section, 'work');
        emptyFields = emptyFields.concat(sectionFields);
      });

      const referenceSections = applicationForm.querySelectorAll('.reference-entry');
      referenceSections.forEach(section => {
        const sectionFields = getSectionRequiredFields(section, 'reference');
        emptyFields = emptyFields.concat(sectionFields);
      });

      // If there are empty required fields, prevent submission and show modal
      if (emptyFields.length > 0) {
        console.log('Validation failed, staying on page');
        
        // Force navigation to the last step and ensure it's set
        const finalStepIndex = steps.length - 1;
        showStep(finalStepIndex);
        currentStepIndex = finalStepIndex;
        
        // Wait a moment for the step to render before highlighting fields
        setTimeout(() => {
          // Highlight all empty fields
          emptyFields.forEach(field => {
            if (field.element) {
              highlightFieldError(field.element);
            }
          });
        }, 100);
        
        await showErrorModal(emptyFields);
        
        // Find the first empty field that's in the current visible step (final step)
        const currentStep = steps[finalStepIndex];
        const currentStepFields = emptyFields.filter(field => {
          return currentStep && currentStep.contains(field.element);
        });
        
        // If there's a field in the final step, scroll to it, otherwise scroll to the first field
        const targetField = currentStepFields.length > 0 ? currentStepFields[0] : emptyFields[0];
        if (targetField && targetField.element) {
          targetField.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetField.element.focus();
        }
        
        return false; // Explicitly return false to prevent any further form processing
      } else {
        // If all validation passes, manually submit the form
        console.log('Validation passed, submitting form');
        
        // Remove this event listener to avoid infinite loop
        applicationForm.removeEventListener('submit', handleFormSubmit);
        
        // Create a new form submission
        applicationForm.submit();
      }
    };

    applicationForm.addEventListener('submit', handleFormSubmit);
  }
});
