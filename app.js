// Wait until the DOM content is fully loaded to ensure the elements exist
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevents the browser from reloading the page

            // Visual feedback for the user
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;

            // These IDs must strictly match your EmailJS Dashboard setup
            const serviceID = "YOUR_SERVICE_ID_HERE";   // ⚠️ Replace with your Service ID
            const templateID = "YOUR_TEMPLATE_ID_HERE"; // ⚠️ Replace with your Template ID

            // emailjs.sendForm grabs all input fields via their 'name' attributes automatically
            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    submitBtn.textContent = "Message Sent Successfully!";
                    contactForm.reset(); // Clear the form fields
                })
                .catch((error) => {
                    console.error("EmailJS Error:", error);
                    submitBtn.textContent = "Failed to Send";
                    alert("Something went wrong. Please check the console or try again later.");
                })
                .finally(() => {
                    // Re-enable the button after 3 seconds so they can try again if needed
                    setTimeout(() => {
                        submitBtn.textContent = "Send Message";
                        submitBtn.disabled = false;
                    }, 3000);
                });
        });
    }
});
