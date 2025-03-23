// ✅ Function to fetch real-time emotions every 3 seconds
function checkEmotion() {
    fetch("/check_emotion")
        .then(response => response.json())
        .then(data => {
            const emotionText = document.getElementById("emotion-text");
            const popup = document.getElementById("hr-popup");
            const alertMessage = document.getElementById("alert-message");

            // ✅ Update emotion display
            emotionText.innerText = data.emotion;

            // ✅ Trigger alert for stressed/tired employees
            if (data.emotion === "Sad" || data.emotion === "Fear" || data.emotion === "Angry") {
                alertMessage.innerText = `Employee looks ${data.emotion}. HR intervention may be needed.`;
                popup.style.display = "flex";
            }
        })
        .catch(error => console.error("Error fetching emotion:", error));
}

// ✅ Close Popup on Button Click
document.getElementById("close-popup").addEventListener("click", function () {
    document.getElementById("hr-popup").style.display = "none";
});

// ✅ Call function every 3 seconds
setInterval(checkEmotion, 3000);
