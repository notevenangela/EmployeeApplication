
document.addEventListener("DOMContentLoaded", () => {
  console.log("FORM JS LOADED");

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");

  let currentStepIndex = 0;

  function highlightFieldError(field) {
    clearFieldError(field);
    
    if (field.type === 'radio') {
      const radioGroupDiv = field.closest('.radio-group');
      if (radioGroupDiv) {
        radioGroupDiv.classList.add('field-error');
      } else {
        const radioButtons = document.querySelectorAll(`input[name="${field.name}"]`);
        radioButtons.forEach(radio => {
          radio.classList.add('field-error');
        });
      }
    } else if (field.type === 'checkbox') {
      field.classList.add('field-error');
      field.closest('.checkbox-group')?.classList.add('field-error');
    } else {
      field.classList.add('field-error', 'field-error-shake');
      
      setTimeout(() => {
        field.classList.remove('field-error-shake');
      }, 500);
    }
  }

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

  function isSectionStarted(sectionElement) {
    const keyFields = {
      education: ['schoolName', 'educationLevel'],
      work: ['employerName', 'jobTitle'], 
      reference: ['refName', 'refCompany']
    };
    
    let sectionType = '';
    if (sectionElement.classList.contains('education-entry')) {
      sectionType = 'education';
    } else if (sectionElement.classList.contains('work-entry')) {
      sectionType = 'work';
    } else if (sectionElement.classList.contains('reference-entry')) {
      sectionType = 'reference';
    }
    
    if (!sectionType || !keyFields[sectionType]) {
      return false; 
    }
    
    return keyFields[sectionType].some(fieldName => {
      const field = sectionElement.querySelector(`[name="${fieldName}"]`);
      if (!field) return false;
      
      if (field.type === 'radio' || field.type === 'checkbox') {
        return field.checked;
      }
      return field.value && field.value.trim() !== '';
    });
  }

  function getSectionRequiredFields(sectionElement, sectionType) {
    if (!isSectionStarted(sectionElement)) {
      return []; 
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

  function getCurrentStepRequiredFields() {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return [];

    let emptyFields = [];

    const requiredFields = currentStep.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      let isEmpty = false;
      
      if (field.type === 'radio') {
        const radioGroup = currentStep.querySelectorAll(`[name="${field.name}"]`);
        const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
        if (!isGroupChecked) {
          if (!emptyFields.some(item => item.name === field.name)) {
            isEmpty = true;
          }
        }
      } else if (field.type === 'checkbox') {
        if (!field.checked) {
          isEmpty = true;
        }
      } else {
        if (!field.value || field.value.trim() === '') {
          isEmpty = true;
        }
      }

      if (isEmpty) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
        emptyFields.push({ name: field.name, label: fieldName, element: field });
      }
    });

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

  function createModal(title, message, emptyFields, onConfirm, onCancel) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

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

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      closeModal();
      onConfirm();
    });

    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      closeModal();
      onCancel();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        onCancel();
      }
    });

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

    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  }

  function showNavigationWarning(emptyFields) {
    return new Promise((resolve) => {
      createModal(
        'Incomplete Required Fields',
        'You have some required fields that haven\'t been filled out yet. Would you like to complete them first, or continue to the next section?',
        emptyFields,
        () => resolve(true),  
        () => resolve(false)  
      );
    });
  }

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

      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        closeModal();
        resolve();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
          resolve();
        }
      });

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

      document.body.appendChild(modal);
      
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
    });
  }

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

      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        closeModal();
        resolve();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
          resolve();
        }
      });

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

      document.body.appendChild(modal);
      
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
    });
  }

  async function navigateToStep(targetIndex, forceNavigation = false) {
    if (targetIndex <= currentStepIndex || forceNavigation) {
      clearAllFieldErrors(); 
      showStep(targetIndex);
      return true;
    }

    const emptyFields = getCurrentStepRequiredFields();
    
    if (emptyFields.length > 0) {
      emptyFields.forEach(field => {
        if (field.element) {
          highlightFieldError(field.element);
        }
      });

      const confirmed = await showNavigationWarning(emptyFields);
      if (!confirmed) {
        if (emptyFields[0].element) {
          emptyFields[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emptyFields[0].element.focus();
        }
        return false;
      } else {
        clearAllFieldErrors();
      }
    }

    showStep(targetIndex);
    return true;
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToStep(currentStepIndex + 1);
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToStep(currentStepIndex - 1);
    });
  });

  progressSteps.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetIndex = parseInt(pill.dataset.step, 10);
      if (!Number.isNaN(targetIndex)) {
        navigateToStep(targetIndex);
      }
    });
  });

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

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        const allEntries = eduSection.querySelectorAll(".education-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
      eduSection.insertBefore(clone, addEduBtn);
    });
  }

  const workSection = document.getElementById("work-section");
  const addWorkBtn = document.getElementById("addWorkExperience");

  if (workSection && addWorkBtn) {
    addWorkBtn.addEventListener("click", () => {
      const firstEntry = workSection.querySelector(".work-entry");
      if (!firstEntry) return;

      const clone = firstEntry.cloneNode(true);
      clone.querySelectorAll("input, textarea, select").forEach((el) => {
        el.value = "";
        el.disabled = false; 
      });

      clone.querySelectorAll(".still-working-btn").forEach(btn => {
        btn.classList.remove('active');
        btn.textContent = 'Currently still working here';
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        const allEntries = workSection.querySelectorAll(".work-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
      workSection.insertBefore(clone, addWorkBtn);
    });
  }

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

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        const allEntries = refSection.querySelectorAll(".reference-entry");
        if (allEntries.length > 1) {
          clone.remove();
        }
      });

      clone.appendChild(deleteBtn);
      refSection.insertBefore(clone, addRefBtn);
    });
  }

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

  showStep(0);

  let formModified = false;

  function hasFormData() {
    const form = document.querySelector('form');
    if (!form) return false;

    const inputs = form.querySelectorAll('input, select, textarea');
    return Array.from(inputs).some(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        return input.checked;
      }
      if (input.type === 'date') {
        return input.value && input.value.trim() !== '';
      }
      return input.value && input.value.trim() !== '';
    });
  }

  document.addEventListener('input', (e) => {
    if (e.target.matches('form input, form select, form textarea')) {
      formModified = true;
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('form input, form select, form textarea')) {
      formModified = true;
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (formModified && hasFormData()) {
      const message = 'You have unsaved changes in your application form. If you refresh or leave this page, all your progress will be lost. Are you sure you want to continue?';
      e.preventDefault();
      e.returnValue = message; 
      return message;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.matches('form')) {
      formModified = false;
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('still-working-btn')) {
      const targetInputId = e.target.dataset.target;
      const targetInput = document.getElementById(targetInputId);
      const button = e.target;
      
      if (targetInput) {
        if (button.classList.contains('active')) {
          button.classList.remove('active');
          button.textContent = 'Currently still working here';
          targetInput.disabled = false;
          targetInput.value = '';
        } else {
          button.classList.add('active');
          button.textContent = 'Still working here ✓';
          targetInput.disabled = true;
          targetInput.value = 'Present'; 
        }
      }
    }
  });

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

  function formatPhoneNumber(value) {
    const phoneNumber = value.replace(/\D/g, '');
    
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
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.length === 10;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  document.addEventListener('input', (e) => {
    if (e.target.matches('input[name="phone"], input[name="refPhone"]')) {
      const cursorPosition = e.target.selectionStart;
      const oldLength = e.target.value.length;
      
      e.target.value = formatPhoneNumber(e.target.value);
      
      const newLength = e.target.value.length;
      const lengthDiff = newLength - oldLength;
      e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
      
      if (isValidPhoneNumber(e.target.value)) {
        clearFieldError(e.target);
      }
    }
    
    if (e.target.matches('input[name="email"], input[name="refEmail"]')) {
      if (isValidEmail(e.target.value)) {
        clearFieldError(e.target);
      }
    }
  });

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
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }, 500);
  } else {
    console.log('No success data found on page load');
  }

  const applicationForm = document.querySelector('form');
  if (applicationForm) {
    const handleFormSubmit = async (e) => {
      console.log('Form submission started');
      
      formModified = false;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      clearAllFieldErrors();
      
      let emptyFields = [];

      const requiredFields = applicationForm.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        let isEmpty = false;
        
        if (field.type === 'radio') {
          const radioGroup = applicationForm.querySelectorAll(`[name="${field.name}"]`);
          const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
          if (!isGroupChecked) {
            if (!emptyFields.some(item => item.name === field.name)) {
              isEmpty = true;
            }
          }
        } else if (field.type === 'checkbox') {
          if (!field.checked) {
            isEmpty = true;
          }
        } else {
          if (!field.value || field.value.trim() === '') {
            isEmpty = true;
          }
        }

        if (isEmpty) {
          const label = applicationForm.querySelector(`label[for="${field.id}"]`);
          const fieldName = label ? label.textContent.replace(/\*/g, '').trim() : field.name;
          emptyFields.push({ name: field.name, label: fieldName, element: field });
        }
      });

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

      if (emptyFields.length > 0) {
        console.log('Validation failed, staying on page');
        
        const finalStepIndex = steps.length - 1;
        showStep(finalStepIndex);
        currentStepIndex = finalStepIndex;
        
        setTimeout(() => {
          emptyFields.forEach(field => {
            if (field.element) {
              highlightFieldError(field.element);
            }
          });
        }, 100);
        
        await showErrorModal(emptyFields);
        
        const currentStep = steps[finalStepIndex];
        const currentStepFields = emptyFields.filter(field => {
          return currentStep && currentStep.contains(field.element);
        });
        
        const targetField = currentStepFields.length > 0 ? currentStepFields[0] : emptyFields[0];
        if (targetField && targetField.element) {
          targetField.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetField.element.focus();
        }
        
        return false; 
      } else {
        console.log('Validation passed, submitting form');
        
        applicationForm.removeEventListener('submit', handleFormSubmit);
        
        applicationForm.submit();
      }
    };

    applicationForm.addEventListener('submit', handleFormSubmit);
  }
});
