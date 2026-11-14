
const registerForm = document.getElementById("register-form");
const message = document.getElementById("message");
const registerButton = document.getElementById("register-button");

registerForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  registerButton.disabled = true;
  registerButton.textContent = "Creating account...";
  message.textContent = "";

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Registration failed.";
      return;
    }

    message.textContent =
      "Account created successfully! Redirecting to login...";

    registerForm.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);

  } catch (error) {
    message.textContent =
      "Cannot connect to EcoSlate server. Please try again.";
  } finally {
    registerButton.disabled = false;
    registerButton.textContent = "Create Account";
  }
});
