let yesButtonScaleFactor = 1;
let noButtonScaleFactor = 1;

const noMessages = [
    "Not today, Cupid!",
    "Sorry, I'm allergic to commitment!",
    "My dog said no, sorry!",
    "I'd rather binge-watch Netflix!",
    "No, but you can buy me chocolate!",
    "I'm married to pizza, sorry!",
    "Let's keep it casual, okay?",
    "I'm married to my bed, can't cheat on it!",
    "I'd rather be single and fabulous!",
  ];
  

  function handleNo() {
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");
    
    const randomIndex = Math.floor(Math.random() * noMessages.length);
    const randomMessage = noMessages[randomIndex];
    
    yesButtonScaleFactor += 0.1; // Increase the scale factor for the "Yes" button
    noButtonScaleFactor -= 0.2; // Decrease the scale factor for the "No" button
    
    yesButton.style.transform = `scale(${yesButtonScaleFactor})`;
    noButton.style.transform = `scale(${noButtonScaleFactor})`;
    
    noButton.innerText = randomMessage;
  
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate random position within viewport bounds
    const minDistanceFromEdge = 50; // Minimum distance from viewport edge
    const maxX = viewportWidth - minDistanceFromEdge;
    const maxY = viewportHeight - minDistanceFromEdge;
    const newX = Math.max(minDistanceFromEdge, Math.floor(Math.random() * maxX));
    const newY = Math.max(minDistanceFromEdge, Math.floor(Math.random() * maxY));
    
    // Apply new position
    noButton.style.position = "absolute";
    noButton.style.left = newX + "px";
    noButton.style.top = newY + "px";
  }
  

function handleYes() {
    const messageContainer = document.getElementById("messageContainer");
    alert('Okay, Since its a YES!, read the message, I lavyu fr fr nc nc W')
    messageContainer.innerHTML = `
      <div class="message">
      <p>Hello Rae,</p>
        <p>I love you more than words can express. You mean everything to me, and I am grateful to have you in my life. Together, we've shared countless memories, laughter, and love. You are my rock, my confidant, and my best friend. I look forward to spending the rest of my life with you, cherishing each moment and creating new memories together, Koi bhi chhoti moti galti ho toh mujhe maaf krdena. Happy Valentine's Day, my love!</p>
        <p>-Yours Tuhi</p>
        </div>
    `;
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    const romanticMusic = document.getElementById("romanticMusic");
    
    // Function to play music
    function playMusic() {
      romanticMusic.play();
      document.removeEventListener("click", playMusic); // Remove the click event listener after playing music
    }
  
    // Event listener for any click on the document to play music
    document.addEventListener("click", playMusic);
    
    // Play the music if autoplay is allowed
    if (romanticMusic.autoplay) {
      romanticMusic.play();
    }
  
    // Function to reduce music volume and play voice.mp3
    function showAlertAndPlayVoice() {
      romanticMusic.volume = 0.2; // Set volume to 30% of original
      new Audio("voice.mp3").play(); // Play voice.mp3
    }
  
    // Example: Show alert and play voice.mp3 when "Yes" button is clicked
    document.getElementById("yesButton").addEventListener("click", function() {
      // Show alert
      showAlertAndPlayVoice();
      // You can add more code here to handle other actions after clicking "Yes"
    });
  });
  
  
  