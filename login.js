
const loginForm = document.getElementById("login-form");
const message = document.getElementById("message");
const loginButton = document.getElementById("login-button");

loginForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";
  message.textContent = "";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Login failed.";
      return;
    }

    message.textContent = "Welcome, " + data.user.name + "! Login successful!";

    // Demo only: not a secure authenticated session.
    sessionStorage.setItem("ecoslateUser", JSON.stringify(data.user));

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);

  } catch (error) {
    message.textContent = "Cannot connect to EcoSlate server.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});
