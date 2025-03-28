// Chatbot functionality for popup assistant
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const chatbotClose = document.getElementById('chatbot-close');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const speakBtn = document.getElementById('speak-btn');
    const muteBtn = document.getElementById('mute-btn');
    const speakingIndicator = document.getElementById('speaking-indicator');

    // Variables for 3D and speech
    let scene, camera, renderer, robot, mixer, clock, controls;
    let isSpeaking = false;
    let speech = null;
    
    // Predefined assistant responses
    const assistantResponses = [
        "Welcome to the Skill Gap Analyzer! I can help you identify missing skills for your desired job role and suggest personalized learning paths.",
        "Our analyzer uses AI to compare your current skills with industry requirements. Just paste your resume and enter your target job role to get started!",
        "The skill gap analysis will show you exactly what skills you need to develop for your dream job, along with personalized learning recommendations.",
        "Ready to analyze your skills? Click on 'Analyze My Skills' in the main page to begin!",
        "I can help you find learning resources for any skill you want to develop. Just ask me about a specific skill!",
        "If you're not sure which career path to choose, I can suggest options based on your current skills. Would you like me to help with that?",
        "You can upload your resume and I'll extract your skills automatically. Would you like to try that?",
        "Need help understanding what skills are in demand? I can show you the top trending skills in various industries."
    ];
    
    // Initialize
    initChatbot();
    initSpeech();
    
    function initChatbot() {
        // Set up event listeners
        chatbotButton.addEventListener('click', toggleChatbot);
        chatbotClose.addEventListener('click', closeChatbot);
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Initialize speech controls
        speakBtn.addEventListener('click', () => {
            speakCurrentMessage();
            speakBtn.style.display = 'none';
            muteBtn.style.display = 'flex';
        });
        
        muteBtn.addEventListener('click', () => {
            stopSpeaking();
            muteBtn.style.display = 'none';
            speakBtn.style.display = 'flex';
        });
        
        // Initialize robot model when chatbot is first opened
        let modelInitialized = false;
        
        function toggleChatbot() {
            if (chatbotPopup.style.display === 'flex') {
                closeChatbot();
            } else {
                openChatbot();
                
                // Initialize 3D model only on first open
                if (!modelInitialized) {
                    initRobotModel();
                    modelInitialized = true;
                }
            }
        }
        
        function openChatbot() {
            chatbotPopup.style.display = 'flex';
            chatbotPopup.classList.add('slide-in');
            chatbotPopup.classList.remove('slide-out');
        }
        
        function closeChatbot() {
            chatbotPopup.classList.remove('slide-in');
            chatbotPopup.classList.add('slide-out');
            setTimeout(() => {
                chatbotPopup.style.display = 'none';
            }, 300);
            
            // Stop speaking when closing
            stopSpeaking();
        }
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Stop any current speech
        stopSpeaking();
        
        // Process the message and respond
        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response, 'assistant');
            
            // Auto-speak the response
            setTimeout(() => {
                speakCurrentMessage();
            }, 500);
        }, 500);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        const messagePara = document.createElement('p');
        messagePara.textContent = text;
        
        messageDiv.appendChild(messagePara);
        chatMessages.appendChild(messageDiv);
        
        // Update the assistant-text element for speech functionality
        if (sender === 'assistant') {
            document.getElementById('assistant-text').textContent = text;
        }
        
        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function getResponse(message) {
        // Simple response logic - could be replaced with actual API call
        message = message.toLowerCase();
        
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! How can I help you with your skills analysis today?";
        } 
        else if (message.includes('skill') && (message.includes('analyze') || message.includes('assess'))) {
            return "To analyze your skills, I'll need your resume text and your target job role. Would you like to proceed with the analysis?";
        }
        else if (message.includes('resume')) {
            return "You can paste your resume text in our analyzer tool. Click on 'Analyze My Skills' on the main page to get started.";
        }
        else if (message.includes('job') || message.includes('career')) {
            return "I can help you find suitable job roles based on your current skills or identify skills needed for specific roles. What kind of job are you interested in?";
        }
        else if (message.includes('learn') || message.includes('course') || message.includes('tutorial')) {
            return "I can recommend personalized learning paths based on your skill gaps. What specific skills are you looking to develop?";
        }
        else {
            // Return a random pre-defined response
            return assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
        }
    }
    
    // Initialize the 3D robot model
    function initRobotModel() {
        // Create scene
        scene = new THREE.Scene();
        
        // Create camera with updated aspect ratio for new container size
        camera = new THREE.PerspectiveCamera(75, 350 / 250, 0.1, 1000); // Updated aspect ratio for 350x250 container
        camera.position.z = 7; // Moved camera farther back to accommodate larger robot
        
        // Create renderer
        const canvas = document.getElementById('robot-canvas');
        renderer = new THREE.WebGLRenderer({ 
            canvas,
            alpha: true, 
            antialias: true 
        });
        renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
        renderer.setClearColor(0x000000, 0);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0x6c63ff, 1);
        backLight.position.set(0, 2, -5);
        scene.add(backLight);
        
        // Add orbit controls if available
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false;
        }
        
        // Create clock for animations
        clock = new THREE.Clock();
        
        // Load robot model if GLTFLoader is available
        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            const modelPath = './robo.glb'; // Adjust this path as needed
            
            loader.load(modelPath, function(gltf) {
                robot = gltf.scene;
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(robot);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Center the model
                robot.position.x = -center.x;
                robot.position.y = -center.y;
                robot.position.z = -center.z;
                
                // Scale the model and increase its size
                const maxDim = Math.max(size.x, size.y, size.z);
                const baseScale = 2 / maxDim;
                const scale = baseScale * 1.5; // Increase size by 50%
                robot.scale.set(scale, scale, scale);
                
                // Set robot color to white (from previous change)
                robot.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material.isMeshStandardMaterial) {
                            child.material.color.set(0xffffff);
                            child.material.metalness = 0.3;
                            child.material.roughness = 0.5;
                        } else {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0xffffff,
                                metalness: 0.3,
                                roughness: 0.5
                            });
                        }
                    }
                });
                
                // Handle animations if available
                if (gltf.animations && gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(robot);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }
                
                scene.add(robot);
                
                // Hide loading indicator
                document.getElementById('model-loading').style.display = 'none';
                
                // Start animation loop
                animate();
            }, 
            undefined, 
            function(error) {
                console.error('Error loading model:', error);
                createFallbackModel();
            });
        } else {
            // If GLTFLoader isn't available, create a fallback
            createFallbackModel();
        }
        
        // Set a timeout in case model loading takes too long
        setTimeout(() => {
            if (document.getElementById('model-loading').style.display !== 'none') {
                createFallbackModel();
            }
        }, 8000);
    }
    
    function createFallbackModel() {
        document.getElementById('model-loading').style.display = 'none';
        
        // Create a simple robot head as fallback
        const head = new THREE.Group();
        
        // Head cube
        const headGeometry = new THREE.BoxGeometry(2, 2, 2);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const headMesh = new THREE.Mesh(headGeometry, headMaterial);
        head.add(headMesh);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.5, 0.3, 1.1);
        head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 0.3, 1.1);
        head.add(rightEye);
        
        // Antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, 1.5, 0);
        head.add(antenna);
        
        // Antenna ball
        const antennaBallGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const antennaBallMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
        const antennaBall = new THREE.Mesh(antennaBallGeometry, antennaBallMaterial);
        antennaBall.position.set(0, 2.0, 0);
        head.add(antennaBall);
        
        // Scale up the fallback model
        head.scale.set(1.5, 1.5, 1.5); // Increase size by 50%
        
        // Add to scene
        scene.add(head);
        robot = head;
        
        // Start animation
        animate();
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update controls if available
        if (controls) controls.update();
        
        // Update mixer for animations
        if (mixer) {
            mixer.update(clock.getDelta());
        }
        
        // Make robot "talk" by adding slight movement when speaking
        if (isSpeaking && robot) {
            // Small random movement to simulate talking
            robot.rotation.y += Math.sin(Date.now() * 0.005) * 0.01;
        } else if (robot) {
            // Regular idle rotation
            robot.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera);
    }
    
    // Initialize speech synthesis
    function initSpeech() {
        // Check if Web Speech API is supported
        if ('speechSynthesis' in window) {
            speech = window.speechSynthesis;
            
            // Try to use a voice with 'Google' in the name if available
            speech.onvoiceschanged = function() {
                const voices = speech.getVoices();
                if (voices.length) {
                    speech.voice = voices.find(voice => voice.name.includes('Google')) || voices[0];
                }
            };
        }
    }
    
    // Speak the current message
    function speakCurrentMessage() {
        const text = document.getElementById('assistant-text').textContent;
        
        if (!speech) {
            console.error('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        stopSpeaking();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if available (more robotic voice preferred)
        const voices = speech.getVoices();
        if (voices.length) {
            utterance.voice = voices.find(voice => voice.name.includes('Google')) || voices[0];
        }
        
        // Set pitch and rate to sound more robotic
        utterance.pitch = 0.9;
        utterance.rate = 1.1;
        
        // Set event handlers
        utterance.onstart = function() {
            isSpeaking = true;
            speakingIndicator.style.display = 'inline-block';
        };
        
        utterance.onend = function() {
            isSpeaking = false;
            speakingIndicator.style.display = 'none';
            muteBtn.style.display = 'none';
            speakBtn.style.display = 'flex';
        };
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            isSpeaking = false;
            speakingIndicator.style.display = 'none';
            muteBtn.style.display = 'none';
            speakBtn.style.display = 'flex';
        };
        
        // Speak the text
        speech.speak(utterance);
    }
    
    // Stop speaking
    function stopSpeaking() {
        if (speech) {
            speech.cancel();
            isSpeaking = false;
            speakingIndicator.style.display = 'none';
        }
    }
    
    // Handle window resize for the 3D canvas
    window.addEventListener('resize', function() {
        if (camera && renderer && document.getElementById('robot-canvas')) {
            const canvas = document.getElementById('robot-canvas');
            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    });
});