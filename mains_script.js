// State management
const state = {
    selectedSkill: null,
    duration: null,
    proficiency: null,
    hoursPerWeek: 10,
    experience: null,
    roadmapData: null
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    const hoursPerWeekSlider = document.getElementById('hours-per-week');
    const hoursDisplay = document.getElementById('hours-display');
    const step1Next = document.getElementById('step1-next');
    const step2Next = document.getElementById('step2-next');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (hoursPerWeekSlider) {
        hoursPerWeekSlider.addEventListener('input', function() {
            state.hoursPerWeek = parseInt(this.value);
            hoursDisplay.textContent = this.value;
            checkStep2Complete();
        });
    }
    
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            filterSkills(this.dataset.category);
        });
    });
    
    filterSkills('all');
});

function filterSkills(category) {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        if (category === 'all' || tag.dataset.category === category) {
            tag.style.display = 'inline-block';
        } else {
            tag.style.display = 'none';
        }
    });
    
    document.querySelectorAll('.category-tag').forEach(cat => {
        if (cat.dataset.category === category) {
            cat.classList.add('bg-opacity-100');
        } else {
            cat.classList.remove('bg-opacity-100');
        }
    });
}

function selectSkill(element) {
    document.querySelectorAll('.skill-tag.selected').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    element.classList.add('selected');
    state.selectedSkill = element.textContent.trim();
    
    const step1Next = document.getElementById('step1-next');
    if (step1Next) step1Next.disabled = false;
}

function addCustomSkill() {
    const customSkillInput = document.getElementById('custom-skill');
    const skillName = customSkillInput.value.trim();
    
    if (skillName) {
        const skillsContainer = document.getElementById('skills-container');
        const newSkill = document.createElement('div');
        newSkill.className = 'skill-tag cursor-pointer';
        newSkill.dataset.category = 'custom';
        newSkill.textContent = skillName;
        newSkill.onclick = function() { selectSkill(this); };
        
        skillsContainer.appendChild(newSkill);
        selectSkill(newSkill);
        customSkillInput.value = '';
    }
}

function selectDuration(element) {
    document.querySelectorAll('.radio-option[data-value^="1-"], .radio-option[data-value^="3-"], .radio-option[data-value^="6-"], .radio-option[data-value="1-year"]').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    state.duration = element.dataset.value;
    checkStep2Complete();
}

function selectProficiency(element) {
    document.querySelectorAll('.radio-option[data-value="basic"], .radio-option[data-value="intermediate"], .radio-option[data-value="advanced"], .radio-option[data-value="expert"]').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    state.proficiency = element.dataset.value;
    checkStep2Complete();
}

function selectExperience(element) {
    document.querySelectorAll('.radio-option[data-value="none"], .radio-option[data-value="some"], .radio-option[data-value="moderate"], .radio-option[data-value="extensive"]').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    state.experience = element.dataset.value;
    checkStep2Complete();
}

function checkStep2Complete() {
    const step2Next = document.getElementById('step2-next');
    if (!step2Next) return;
    
    if (state.duration && state.proficiency && state.experience) {
        step2Next.disabled = false;
    } else {
        step2Next.disabled = true;
    }
}

function goToStep1() {
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    updateProgressIndicator(1);
}

function goToStep2() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    document.getElementById('selected-skill-display').textContent = state.selectedSkill;
    updateProgressIndicator(2);
}

function goToStep3() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
    document.getElementById('step4').classList.add('hidden');
    updateProgressIndicator(3);
}

function goToStep4() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.remove('hidden');
    updateProgressIndicator(4);
}

function updateProgressIndicator(step) {
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById(`step${i}-circle`);
        const label = document.getElementById(`step${i}-label`);
        
        if (!circle || !label) continue;
        
        circle.classList.remove('active', 'completed');
        label.classList.remove('active');
        
        if (i < step) {
            circle.classList.add('completed');
            circle.innerHTML = '<i class="fas fa-check"></i>';
        } else if (i === step) {
            circle.classList.add('active');
            circle.innerHTML = i;
            label.classList.add('active');
        } else {
            circle.innerHTML = i;
        }
    }
}
let mixer, raiseHandAction, idleAction;

function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('path/to/your/model.glb', (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Set up the animation mixer
        mixer = new THREE.AnimationMixer(model);

        // Access animations (assuming the model has "RaiseHand" and "Idle" animations)
        const animations = gltf.animations;
        raiseHandAction = mixer.clipAction(animations.find(anim => anim.name === 'RaiseHand'));
        idleAction = mixer.clipAction(animations.find(anim => anim.name === 'Idle'));

        // Configure animations
        raiseHandAction.setLoop(THREE.LoopOnce); // Play "RaiseHand" once
        raiseHandAction.clampWhenFinished = true; // Stop at the last frame
        idleAction.setLoop(THREE.LoopRepeat); // Loop the idle animation

        // Play idle animation by default
        idleAction.play();

        // Add an event to trigger the "RaiseHand" animation (e.g., on click)
        document.addEventListener('click', () => {
            idleAction.fadeOut(0.5); // Fade out idle
            raiseHandAction.reset().fadeIn(0.5).play(); // Play raise hand

            // Transition back to idle after the raise hand animation finishes
            raiseHandAction.getMixer().addEventListener('finished', () => {
                raiseHandAction.fadeOut(0.5);
                idleAction.reset().fadeIn(0.5).play();
            });
        });
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Update the mixer to ensure animations play smoothly
    if (mixer) mixer.update(clock.getDelta());

    renderer.render(scene, camera);
}
function generateRoadmap() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    const apiKey = localStorage.getItem('geminiApiKey');
    
    if (!apiKey) {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (confirm('Please set your Gemini API key in the Home page settings. Go there now?')) {
            window.location.href = 'HomePage.html#settings';
        }
        return;
    }
    
    if (window.learningPathGenerator) {
        window.learningPathGenerator.initialize(apiKey);
    } else {
        generateRoadmapLocally();
        return;
    }
    
    window.learningPathGenerator.generateRoadmap(
        state.selectedSkill, 
        state.proficiency, 
        state.duration, 
        state.hoursPerWeek, 
        state.experience
    ).then(roadmapData => {
        state.roadmapData = roadmapData;
        if (window.populateRoadmap) window.populateRoadmap(roadmapData);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        goToStep3();
    }).catch(error => {
        console.error('Failed to generate roadmap:', error);
        alert('Failed to generate roadmap. Using fallback data instead.');
        generateRoadmapLocally();
    });
}

function generateRoadmapLocally() {
    console.log('Falling back to local roadmap generation');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (window.learningPathGenerator) {
        const roadmapData = window.learningPathGenerator.generateFallbackRoadmap(
            state.selectedSkill,
            state.proficiency,
            state.duration,
            state.hoursPerWeek,
            state.experience
        );
        state.roadmapData = roadmapData;
        if (window.populateRoadmap) window.populateRoadmap(roadmapData);
    } else {
        createBasicRoadmap();
    }
    
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    goToStep3();
}

function createBasicRoadmap() {
    const totalWeeks = state.duration === '1-month' ? 4 : 
                      state.duration === '3-months' ? 12 : 
                      state.duration === '6-months' ? 24 : 48;
    const totalHours = totalWeeks * state.hoursPerWeek;
    const milestonesCount = state.proficiency === 'basic' ? 3 : 
                          state.proficiency === 'intermediate' ? 5 :
                          state.proficiency === 'advanced' ? 7 : 9;
    
    const milestones = [];
    
    for (let i = 0; i < milestonesCount; i++) {
        const weekStart = Math.floor((i / milestonesCount) * totalWeeks) + 1;
        const weekEnd = Math.floor(((i + 1) / milestonesCount) * totalWeeks);
        
        const milestone = {
            title: `${state.selectedSkill} - Phase ${i + 1}`,
            description: `Learn essential ${state.selectedSkill} concepts and skills in phase ${i + 1}, focusing on plain JavaScript implementation with Gemini integration.`,
            timeframe: `${Math.ceil((weekEnd - weekStart) * 7)} days`,
            period: `Week ${weekStart}${weekEnd > weekStart ? ` - Week ${weekEnd}` : ''}`,
            projects: [
                {
                    name: `${state.selectedSkill} Project ${i + 1}`,
                    description: `Build a simple application to demonstrate ${state.selectedSkill} concepts learned in this phase.`,
                    codeStructure: "Create modular JavaScript functions that interface with Gemini API using async/await pattern."
                }
            ],
            resources: [
                { type: "course", name: `${state.selectedSkill} Fundamentals Course`, url: "#" },
                { type: "tutorial", name: `Integrating ${state.selectedSkill} with Gemini`, url: "#" },
                { type: "documentation", name: `Official ${state.selectedSkill} Documentation`, url: "#" }
            ]
        };
        milestones.push(milestone);
    }
    
    state.roadmapData = {
        skill: state.selectedSkill,
        level: state.proficiency,
        duration: state.duration,
        hoursPerWeek: state.hoursPerWeek,
        totalHours: totalHours,
        milestones: milestones
    };
}

function downloadPDF() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    setTimeout(() => {
        const { jsPDF } = window.jspdf;
        const roadmapSection = document.getElementById('step3');
        
        // Clone the roadmap section and prepare it for rendering
        const tempRoadmap = roadmapSection.cloneNode(true);
        tempRoadmap.style.display = 'block';
        tempRoadmap.style.background = 'white';
        tempRoadmap.style.color = 'black';
        tempRoadmap.style.padding = '20px';
        tempRoadmap.style.position = 'absolute';
        tempRoadmap.style.top = '-9999px';
        tempRoadmap.style.width = '800px'; // Fixed width for consistent PDF layout
        
        // Ensure all accordion content is visible
        tempRoadmap.querySelectorAll('.accordion-content').forEach(content => {
            content.classList.add('active');
            content.style.maxHeight = 'none'; // Remove height restriction
        });
        
        document.body.appendChild(tempRoadmap);

        // Render the entire content with html2canvas
        html2canvas(tempRoadmap, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Enable if resources are cross-origin
            scrollX: 0,
            scrollY: 0,
            windowWidth: tempRoadmap.scrollWidth,
            windowHeight: tempRoadmap.scrollHeight
        }).then(canvas => {
            document.body.removeChild(tempRoadmap);
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth; // Scale image to fit PDF width
            const scaledImgHeight = imgHeight * ratio;
            const pageHeight = pdfHeight - 40; // Leave space for header/footer
            
            // Add title on first page
            pdf.setFontSize(24);
            pdf.setTextColor(33, 33, 33);
            pdf.text(`${state.roadmapData.skill} Learning Roadmap with Gemini Integration`, pdfWidth / 2, 20, { align: 'center' });

            let heightLeft = scaledImgHeight;
            let position = 30; // Start below title
            let pageCount = 1;

            // Add the image in chunks to multiple pages
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledImgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - scaledImgHeight;
                pdf.addPage();
                pageCount++;
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledImgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save(`${state.roadmapData.skill.replace(/\s+/g, '-').toLowerCase()}-gemini-roadmap.pdf`);
            
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }).catch(error => {
            console.error('Error generating PDF:', error);
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            alert('Failed to generate PDF. Please try again.');
        });
    }, 500);
}

function startNewRoadmap() {
    state.selectedSkill = null;
    state.duration = null;
    state.proficiency = null;
    state.hoursPerWeek = 10;
    state.experience = null;
    state.roadmapData = null;
    
    document.querySelectorAll('.skill-tag.selected').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    document.querySelectorAll('.radio-option.selected').forEach(option => {
        option.classList.remove('selected');
    });
    
    const hoursPerWeekSlider = document.getElementById('hours-per-week');
    const hoursDisplay = document.getElementById('hours-display');
    const step1Next = document.getElementById('step1-next');
    
    if (hoursPerWeekSlider) hoursPerWeekSlider.value = 10;
    if (hoursDisplay) hoursDisplay.textContent = '10';
    if (step1Next) step1Next.disabled = true;
    
    goToStep1();
}

window.filterSkills = filterSkills;
window.selectSkill = selectSkill;
window.addCustomSkill = addCustomSkill;
window.selectDuration = selectDuration;
window.selectProficiency = selectProficiency;
window.selectExperience = selectExperience;
window.goToStep1 = goToStep1;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.goToStep4 = goToStep4;
window.generateRoadmap = generateRoadmap;
window.downloadPDF = downloadPDF;
window.startNewRoadmap = startNewRoadmap;