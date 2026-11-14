
// ========================================
// ECOSLATE - MAIN DASHBOARD JAVASCRIPT
// ========================================

// Current logged-in user
let currentUser = null;

// Local demo data
let approvedSites = JSON.parse(
  localStorage.getItem("ecoApproved") || '["ncert.nic.in","khanacademy.org","wikipedia.org"]'
);

let websiteRequests = JSON.parse(
  localStorage.getItem("ecoRequests") || "[]"
);

let textbooks = [];

// Save website data
function saveAccess() {
  localStorage.setItem("ecoApproved", JSON.stringify(approvedSites));
  localStorage.setItem("ecoRequests", JSON.stringify(websiteRequests));
}

// ========================================
// LOGIN AND ROLE CHECK
// ========================================

async function checkLogin() {
  try {
    const response = await fetch("/api/me", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      window.location.href = "login.html";
      return;
    }

    const result = await response.json();
    currentUser = result.user || result;

    if (!currentUser || !currentUser.role) {
      window.location.href = "login.html";
      return;
    }

    // Personalise dashboard
    const welcome = document.getElementById("welcome-message");
    const email = document.getElementById("student-email");

    if (welcome) {
      welcome.textContent = "Welcome, " + currentUser.name + "!";
    }

    if (email) {
      email.textContent = currentUser.email;
    }

    // Profile information
    setText("profile-name", currentUser.name);
    setText("profile-email", currentUser.email);
    setText("profile-id", currentUser.id);
    setText("profile-role", currentUser.role);

    // Hide teacher portal from students
    document.querySelectorAll('[data-page="teacher"]').forEach(item => {
      item.style.display =
        currentUser.role === "teacher" ? "" : "none";
    });

  } catch (error) {
    console.error("Login check failed:", error);
    alert("Could not connect to EcoSlate. Please restart the server.");
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? "";
  }
}

// ========================================
// LOGOUT
// ========================================

async function logoutStudent() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin"
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  sessionStorage.removeItem("ecoslateUser");
  window.location.href = "login.html";
}

// ========================================
// PAGE NAVIGATION
// ========================================

function showPage(pageId) {
  if (pageId === "teacher" && currentUser?.role !== "teacher") {
    alert("Access denied! Teacher account required.");
    return;
  }

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  if (pageId === "teacher") {
    renderTeacher();
  }

  if (pageId === "notebook") {
    renderNotes();
  }

  if (pageId === "library") {
    renderTextbooks();
  }
}

// ========================================
// SUBJECTS
// ========================================

function openSubject(subject) {
  setText(
    "subject-message",
    subject + " selected! Your learning resources will appear here."
  );
}

// ========================================
// DIGITAL NOTEBOOK
// ========================================

function saveNote() {
  const titleInput = document.getElementById("note-title");
  const textInput = document.getElementById("note-text");

  if (!titleInput || !textInput) return;

  const title = titleInput.value.trim();
  const content = textInput.value.trim();

  if (!title || !content) {
    alert("Please enter a title and your note.");
    return;
  }

  const notes = JSON.parse(
    localStorage.getItem("ecoNotes") || "[]"
  );

  notes.push({
    title,
    content,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("ecoNotes", JSON.stringify(notes));

  titleInput.value = "";
  textInput.value = "";

  renderNotes();
  alert("Your note has been saved!");
}

function renderNotes() {
  const container = document.getElementById("notes");

  if (!container) return;

  const notes = JSON.parse(
    localStorage.getItem("ecoNotes") || "[]"
  );

  container.innerHTML = "";

  if (notes.length === 0) {
    container.textContent = "No notes saved yet.";
    return;
  }

  notes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";

    const heading = document.createElement("h3");
    heading.textContent = note.title;

    const content = document.createElement("p");
    content.textContent = note.content;

    const date = document.createElement("small");
    date.textContent = note.date;

    card.append(heading, content, date);
    container.appendChild(card);
  });
}

// ========================================
// LEARNING WEB
// ========================================

function domainFromInput(value) {
  try {
    let url = value.trim();

    if (!url) return null;

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isApprovedDomain(domain) {
  return approvedSites.some(site =>
    domain === site || domain.endsWith("." + site)
  );
}

function checkWebsite() {
  const input = document.getElementById("website");
  const result = document.getElementById("website-result");

  if (!input || !result) return;

  const domain = domainFromInput(input.value);

  if (!domain) {
    result.textContent = "Please enter a valid website.";
    return;
  }

  if (isApprovedDomain(domain)) {
    result.textContent = "Approved educational website: " + domain;

    let url = input.value.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    result.textContent =
      "This website is not approved. You can request teacher approval.";

    websiteRequests.push(domain);
    websiteRequests = [...new Set(websiteRequests)];

    saveAccess();
  }
}

// ========================================
// TEACHER PORTAL
// ========================================

async function renderTeacher() {
  if (currentUser?.role !== "teacher") {
    alert("Only teachers can access this portal.");
    showPage("dashboard");
    return;
  }

  try {
    const response = await fetch("/api/teacher/access", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      alert("Teacher access could not be verified.");
      showPage("dashboard");
      return;
    }

    renderTeacherSites();
  } catch (error) {
    console.error("Teacher access error:", error);
    alert("Could not connect to the teacher service.");
  }
}

function renderTeacherSites() {
  const requestContainer = document.getElementById("requests");
  const approvedContainer = document.getElementById("approved-sites");

  if (requestContainer) {
    requestContainer.innerHTML = "";

    if (websiteRequests.length === 0) {
      requestContainer.textContent = "No pending website requests.";
    }

    websiteRequests.forEach((site, index) => {
      const row = document.createElement("div");

      const name = document.createElement("span");
      name.textContent = site + " ";

      const approve = document.createElement("button");
      approve.textContent = "Approve";
      approve.onclick = () => approveSite(index);

      const reject = document.createElement("button");
      reject.textContent = "Reject";
      reject.onclick = () => rejectSite(index);

      row.append(name, approve, reject);
      requestContainer.appendChild(row);
    });
  }

  if (approvedContainer) {
    approvedContainer.innerHTML = "";

    approvedSites.forEach((site, index) => {
      const row = document.createElement("div");

      const name = document.createElement("span");
      name.textContent = site + " ";

      const revoke = document.createElement("button");
      revoke.textContent = "Revoke";
      revoke.onclick = () => revokeSite(index);

      row.append(name, revoke);
      approvedContainer.appendChild(row);
    });
  }
}

function approveSite(index) {
  if (currentUser?.role !== "teacher") return;

  const site = websiteRequests[index];

  if (!site) return;

  if (!approvedSites.includes(site)) {
    approvedSites.push(site);
  }

  websiteRequests.splice(index, 1);

  saveAccess();
  renderTeacherSites();
}

function rejectSite(index) {
  if (currentUser?.role !== "teacher") return;

  websiteRequests.splice(index, 1);

  saveAccess();
  renderTeacherSites();
}

function revokeSite(index) {
  if (currentUser?.role !== "teacher") return;

  approvedSites.splice(index, 1);

  saveAccess();
  renderTeacherSites();
}

// ========================================
// TEACHER ADDS AN EDUCATIONAL WEBSITE
// ========================================

function teacherAddSite() {
  if (currentUser?.role !== "teacher") {
    alert("Teacher access required.");
    return;
  }

  const input = document.getElementById("teacher-new-site");
  const message = document.getElementById("teacher-site-message");

  if (!input || !message) return;

  const domain = domainFromInput(input.value);

  if (!domain) {
    message.textContent = "Enter a valid website.";
    return;
  }

  if (approvedSites.includes(domain)) {
    message.textContent = "This website is already approved.";
    return;
  }

  approvedSites.push(domain);

  saveAccess();
  input.value = "";

  message.textContent = domain + " has been approved.";

  renderTeacherSites();
}

// ========================================
// DIGITAL TEXTBOOK LIBRARY
// ========================================

function addTextbook() {
  const subjectInput = document.getElementById("book-subject");
  const fileInput = document.getElementById("textbook-file");
  const message = document.getElementById("book-message");

  if (!subjectInput || !fileInput || !message) return;

  const file = fileInput.files[0];
  const subject = subjectInput.value.trim();

  if (!file || !subject) {
    message.textContent = "Choose a subject and PDF file.";
    return;
  }

  if (file.type !== "application/pdf") {
    message.textContent = "Please select a PDF file.";
    return;
  }

  const url = URL.createObjectURL(file);

  textbooks.push({
    subject,
    name: file.name,
    url
  });

  fileInput.value = "";

  message.textContent = "Textbook added successfully!";
  renderTextbooks();
}

function renderTextbooks() {
  const container = document.getElementById("textbook-list");

  if (!container) return;

  container.innerHTML = "";

  textbooks.forEach((book, index) => {
    const button = document.createElement("button");

    button.textContent = book.subject + " - " + book.name;
    button.onclick = () => openTextbook(index);

    container.appendChild(button);
  });
}

function openTextbook(index) {
  const book = textbooks[index];

  if (!book) return;

  setText("reader-title", book.name);

  const frame = document.getElementById("pdf-frame");

  if (frame) {
    frame.src = book.url;
  }
}

// ========================================
// START DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  await checkLogin();

  if (currentUser) {
    renderNotes();
    renderTextbooks();
  }
});
