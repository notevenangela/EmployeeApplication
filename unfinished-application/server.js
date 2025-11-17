const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helpers
function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function isoOneDayFromToday() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhone(phone) {
  if (!phone) return false;
  // Remove all non-digits and check if we have exactly 10 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

function isLettersOnly(str) {
  return /^[A-Za-z\s'-]*$/.test(str || "");
}

function isFutureDate(dateStr) {
  const today = todayISO();
  return dateStr && dateStr > today;
}

function inEmploymentRange(dateStr) {
  if (!dateStr) return false;
  return dateStr >= "1955-01-01" && dateStr <= todayISO();
}

// GET form
app.get("/", (req, res) => {
  res.render("application", {
    errors: {},
    data: {},
    todayISO: todayISO(),
    futureMinDate: isoOneDayFromToday(),
    success: null
  });
});

// POST submission
app.post("/submit", (req, res) => {
  console.log('Form submitted with data:', req.body);
  const data = req.body;
  const errors = {};

  // Application Date
  if (!data.applicationDate) {
    errors.applicationDate = "Application date is required.";
  }

  // Applicant Information
  if (!data.firstName || !isLettersOnly(data.firstName) || data.firstName.length > 64) {
    errors.firstName = "First name is required, letters only, max 64 characters.";
  }

  if (!data.lastName || !isLettersOnly(data.lastName) || data.lastName.length > 64) {
    errors.lastName = "Last name is required, letters only, max 64 characters.";
  }

  if (data.middleName && (!isLettersOnly(data.middleName) || data.middleName.length > 64)) {
    errors.middleName = "Middle name must be letters only, max 64 characters.";
  }

  if (data.address && data.address.length > 100) {
    errors.address = "Address cannot exceed 100 characters.";
  }

  if (data.city && (!isLettersOnly(data.city) || data.city.length > 50)) {
    errors.city = "City must be letters only, max 50 characters.";
  }

  if (data.state && (!/^[A-Z]{2}$/.test(data.state))) {
    errors.state = "Please select a valid state.";
  }

  if (data.zipCode && (!/^\d{5}(-\d{4})?$/.test(data.zipCode))) {
    errors.zipCode = "ZIP code must be 5 digits or 5-4 format (e.g., 12345 or 12345-6789).";
  }

  if (data.yearsAtAddress && (isNaN(data.yearsAtAddress) || data.yearsAtAddress < 0 || data.yearsAtAddress > 100)) {
    errors.yearsAtAddress = "Years at address must be a number between 0 and 100.";
  }

  if (!data.phone || !isPhone(data.phone)) {
    errors.phone = "Phone number is required and must be 10 digits.";
  }

  if (!data.email || !isValidEmail(data.email) || data.email.length > 64) {
    errors.email = "Please enter a valid email address (max 64 characters).";
  }

  // Age Verification
  if (!data.ageVerification) {
    errors.ageVerification = "Please confirm if you are at least 18 years old.";
  }

  if (data.desiredSalary && (isNaN(data.desiredSalary) || data.desiredSalary < 7.25 || data.desiredSalary > 100)) {
    errors.desiredSalary = "Desired salary must be between $7.25 and $100.00 per hour.";
  }

  if (!data.positionApplied) {
    errors.positionApplied = "Please select a position.";
  }

  // Work Authorization (CEO Question 11)
  if (!data.workAuthorized) {
    errors.workAuthorized = "Please indicate if you are authorized to work in the U.S.";
  }

  // Previous Employment (CEO Question 9)
  if (!data.previousEmployee) {
    errors.previousEmployee = "Please indicate if you have previously worked for or volunteered with this company.";
  }

  // Availability
  if (!data.employmentType) {
    errors.employmentType = "Please select employment type.";
  }

  if (!data.startDate || !isFutureDate(data.startDate)) {
    errors.startDate = "Start date must be in the future (not today).";
  }

  if (!data.availableDays) {
    errors.availableDays = "Please select at least one day you are available.";
  }

  // Education Section - All-or-nothing validation
  const educationFields = ['schoolName', 'schoolCity', 'schoolState', 'educationLevel'];
  const educationStarted = educationFields.some(field => data[field] && data[field].trim() !== '');
  
  if (educationStarted) {
    // If any education field is filled, require all core fields
    if (!data.schoolName || data.schoolName.trim() === '') {
      errors.schoolName = "School name is required when education section is started.";
    }
    if (!data.schoolCity || data.schoolCity.trim() === '') {
      errors.schoolCity = "School city is required when education section is started.";
    }
    if (!data.schoolState || data.schoolState.trim() === '') {
      errors.schoolState = "School state is required when education section is started.";
    }
    if (!data.educationLevel || data.educationLevel.trim() === '') {
      errors.educationLevel = "Education level is required when education section is started.";
    }
  }

  // Validate education field lengths
  if (data.schoolName && data.schoolName.length > 50) {
    errors.schoolName = "School name max 50 characters.";
  }
  if (data.schoolCity && data.schoolCity.length > 30) {
    errors.schoolCity = "School city max 30 characters.";
  }
  if (data.schoolState && data.schoolState.length > 20) {
    errors.schoolState = "School state max 20 characters.";
  }

  // Work Experience Section - All-or-nothing validation
  const workFields = ['employerName', 'jobTitle', 'workStartDate', 'workEndDate'];
  const workStarted = workFields.some(field => data[field] && data[field].trim() !== '');
  
  if (workStarted) {
    // If any work field is filled, require the core fields
    if (!data.employerName || data.employerName.trim() === '') {
      errors.employerName = "Employer name is required when work experience section is started.";
    }
    if (!data.jobTitle || data.jobTitle.trim() === '') {
      errors.jobTitle = "Job title is required when work experience section is started.";
    }
    if (!data.workStartDate || data.workStartDate.trim() === '') {
      errors.workStartDate = "Start date is required when work experience section is started.";
    }
    if (!data.workEndDate || data.workEndDate.trim() === '') {
      errors.workEndDate = "End date is required when work experience section is started.";
    }
  }

  // Validate work experience field lengths and dates
  if (data.employerName && data.employerName.length > 50) {
    errors.employerName = "Employer name max 50 characters.";
  }
  if (data.workAddress && data.workAddress.length > 100) {
    errors.workAddress = "Work address max 100 characters.";
  }
  if (data.jobTitle && data.jobTitle.length > 50) {
    errors.jobTitle = "Job title max 50 characters.";
  }
  if (data.jobDuties && data.jobDuties.length > 300) {
    errors.jobDuties = "Job duties max 300 characters.";
  }

  if (data.workStartDate && !inEmploymentRange(data.workStartDate)) {
    errors.workStartDate = "Start date must be between 01/01/1955 and today.";
  }
  if (data.workEndDate && data.workEndDate !== "Present" && !inEmploymentRange(data.workEndDate)) {
    errors.workEndDate = "End date must be between 01/01/1955 and today.";
  }
  if (data.workStartDate && data.workEndDate && data.workEndDate !== "Present" && data.workStartDate > data.workEndDate) {
    errors.workEndDate = "End date must be after start date.";
  }

  // References Section - All-or-nothing validation
  const referenceFields = ['refName', 'refCompany', 'refPhone'];
  const referenceStarted = referenceFields.some(field => data[field] && data[field].trim() !== '');
  
  if (referenceStarted) {
    // If any reference field is filled, require the core fields
    if (!data.refName || data.refName.trim() === '') {
      errors.refName = "Reference name is required when reference section is started.";
    }
    if (!data.refCompany || data.refCompany.trim() === '') {
      errors.refCompany = "Reference company is required when reference section is started.";
    }
    if (!data.refPhone || data.refPhone.trim() === '') {
      errors.refPhone = "Reference phone is required when reference section is started.";
    }
  }

  // Validate reference field lengths and formats
  if (data.refName && data.refName.length > 50) {
    errors.refName = "Reference name max 50 characters.";
  }
  if (data.refCompany && data.refCompany.length > 50) {
    errors.refCompany = "Company max 50 characters.";
  }
  if (data.refPhone && !isPhone(data.refPhone)) {
    errors.refPhone = "Reference phone number must be 10 digits.";
  }
  if (data.refEmail && !isValidEmail(data.refEmail)) {
    errors.refEmail = "Reference email must be valid.";
  }

  // Additional Skills
  if (data.skills && data.skills.length > 200) {
    errors.skills = "Skills and experience max 200 characters.";
  }

  // Acknowledgment
  if (!data.acknowledge) {
    errors.acknowledge = "You must acknowledge and sign the application.";
  }
  if (!data.signature || data.signature.trim().length === 0) {
    errors.signature = "Signature is required.";
  }
  if (!data.signatureDate) {
    errors.signatureDate = "Date is required.";
  }

  if (Object.keys(errors).length > 0) {
    console.log('Validation errors found:', errors);
    return res.status(400).render("application", {
      errors,
      data,
      todayISO: todayISO(),
      futureMinDate: isoOneDayFromToday(),
      success: null
    });
  }

  console.log('Form validation passed, showing success');
  // At this point you would save to a database; for the assignment we just show success.
  // Instead of rendering a new page, we'll redirect back with a success flag
  res.render("application", {
    errors: {},
    data: {},
    todayISO: todayISO(),
    futureMinDate: isoOneDayFromToday(),
    success: {
      message: "Your application has been successfully submitted!",
      position: data.positionApplied || 'N/A'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Application running at http://localhost:${PORT}`);
});
