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
  return /^\(\d{3}\)\d{3}-\d{4}$/.test(phone);
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
    futureMinDate: isoOneDayFromToday()
  });
});

// POST submission
app.post("/submit", (req, res) => {
  const data = req.body;
  const errors = {};

  // Applicant Information
  if (!data.firstName || !isLettersOnly(data.firstName) || data.firstName.length > 64) {
    errors.firstName = "First name is required, letters only, max 64 characters.";
  }

  if (!data.lastName || !isLettersOnly(data.lastName) || data.lastName.length > 64) {
    errors.lastName = "Last name is required, letters only, max 64 characters.";
  }

  if (data.address && data.address.length > 100) {
    errors.address = "Address cannot exceed 100 characters.";
  }

  if (!data.phone || !isPhone(data.phone)) {
    errors.phone = "Phone must be in the format (###)###-####.";
  }

  if (!data.email || !isValidEmail(data.email) || data.email.length > 64) {
    errors.email = "Please enter a valid email address (max 64 characters).";
  }

  if (!data.positionApplied) {
    errors.positionApplied = "Please select a position.";
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

  // Education (at least one entry if any text entered)
  if (data.schoolName && data.schoolName.length > 50) {
    errors.schoolName = "School name max 50 characters.";
  }
  if (data.schoolCityState && data.schoolCityState.length > 50) {
    errors.schoolCityState = "City/State max 50 characters.";
  }

  // Work Experience (main block)
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
  if (data.workEndDate && !inEmploymentRange(data.workEndDate)) {
    errors.workEndDate = "End date must be between 01/01/1955 and today.";
  }
  if (data.workStartDate && data.workEndDate && data.workStartDate > data.workEndDate) {
    errors.workEndDate = "End date must be after start date.";
  }

  // References
  if (data.refName && data.refName.length > 50) {
    errors.refName = "Reference name max 50 characters.";
  }
  if (data.refCompany && data.refCompany.length > 50) {
    errors.refCompany = "Company max 50 characters.";
  }
  if (data.refPhone && !isPhone(data.refPhone)) {
    errors.refPhone = "Reference phone must be in the format (###)###-####.";
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
    return res.status(400).render("application", {
      errors,
      data,
      todayISO: todayISO(),
      futureMinDate: isoOneDayFromToday()
    });
  }

  // At this point you would save to a database; for the assignment we just show success.
  res.render("success", { data });
});

app.listen(PORT, () => {
  console.log(`Application running at http://localhost:${PORT}`);
});
