// Resume Builder Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize state
    const resumeState = {
        template: 'professional',
        personalInfo: {},
        education: [],
        work: [],
        skills: {
            technical: [],
            soft: [],
            languages: []
        },
        projects: [],
        targetJob: '',
        keywords: [],
        aiOptimize: false
    };

    // Initialize event listeners
    initializeFormListeners();
    initializeNavigation();
    
    // Character counter for Professional Summary
    const professionalSummary = document.getElementById('professionalSummary');
    const professionalSummaryCount = document.getElementById('professionalSummaryCount');
    
    if (professionalSummary && professionalSummaryCount) {
        professionalSummary.addEventListener('input', function() {
            const charCount = this.value.length;
            professionalSummaryCount.textContent = charCount;
            
            if (charCount > 300) {
                professionalSummaryCount.classList.add('text-red-500');
                professionalSummaryCount.classList.remove('text-gray-500');
            } else {
                professionalSummaryCount.classList.remove('text-red-500');
                professionalSummaryCount.classList.add('text-gray-500');
            }
        });
    }
    
    // Initialize error modal
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', function() {
            document.getElementById('errorModal').classList.add('hidden');
        });
    }
    
    // Check for API key
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        console.warn('No Gemini API key found. Resume enhancement will be limited.');
    }
});

// Initialize form listeners
function initializeFormListeners() {
    // Current job checkbox
    document.querySelectorAll('.work-current').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const endDateInput = this.closest('.flex').querySelector('.work-end');
            if (this.checked) {
                endDateInput.value = '';
                endDateInput.disabled = true;
            } else {
                endDateInput.disabled = false;
            }
        });
    });
    
    // Technical skill input
    const technicalSkillInput = document.getElementById('technical-skill-input');
    if (technicalSkillInput) {
        technicalSkillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTechnicalSkill();
            }
        });
    }
    
    // Soft skill input
    const softSkillInput = document.getElementById('soft-skill-input');
    if (softSkillInput) {
        softSkillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSoftSkill();
            }
        });
    }
    
    // Language input
    const languageInput = document.getElementById('language-input');
    if (languageInput) {
        languageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLanguage();
            }
        });
    }
}

// Navigation functions
function initializeNavigation() {
    updateProgressIndicator(1);
}

function updateProgressIndicator(step) {
    for (let i = 1; i <= 5; i++) {
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

function goToStep1() {
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    document.getElementById('step5').classList.add('hidden');
    updateProgressIndicator(1);
}

function goToStep2() {
    // Validate Step 1
    if (!validateStep1()) return;
    
    // Save personal info
    savePersonalInfo();
    
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    document.getElementById('step5').classList.add('hidden');
    updateProgressIndicator(2);
}

function goToStep3() {
    // Validate Step 2
    if (!validateStep2()) return;
    
    // Save education and work data
    saveEducationWork();
    
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
    document.getElementById('step4').classList.add('hidden');
    document.getElementById('step5').classList.add('hidden');
    updateProgressIndicator(3);
}

function goToStep4() {
    // Validate Step 3
    if (!validateStep3()) return;
    
    // Save skills and projects
    saveSkillsProjects();
    
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.remove('hidden');
    document.getElementById('step5').classList.add('hidden');
    updateProgressIndicator(4);
}

function goToStep5() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    document.getElementById('step5').classList.remove('hidden');
    updateProgressIndicator(5);
}

// Form validation functions
function validateStep1() {
    const requiredFields = [
        { id: 'fullName', label: 'Full Name' },
        { id: 'jobTitle', label: 'Professional Title' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'location', label: 'Location' },
        { id: 'professionalSummary', label: 'Professional Summary' }
    ];
    
    for (const field of requiredFields) {
        const inputElem = document.getElementById(field.id);
        if (!inputElem || !inputElem.value.trim()) {
            showError(`Please fill in the ${field.label} field.`);
            inputElem.focus();
            return false;
        }
    }
    
    // Validate email format
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        showError('Please enter a valid email address.');
        emailInput.focus();
        return false;
    }
    
    return true;
}

function validateStep2() {
    // Validate that at least one education entry is filled out
    const educationItems = document.querySelectorAll('.education-item');
    let hasValidEducation = false;
    
    for (const item of educationItems) {
        const degree = item.querySelector('.education-degree').value.trim();
        const institution = item.querySelector('.education-institution').value.trim();
        const startDate = item.querySelector('.education-start').value.trim();
        const endDate = item.querySelector('.education-end').value.trim();
        
        if (degree && institution && startDate) {
            hasValidEducation = true;
            break;
        }
    }
    
    if (!hasValidEducation) {
        showError('Please add at least one education entry with degree, institution, and start date.');
        return false;
    }
    
    // Validate that at least one work experience entry is filled out
    const workItems = document.querySelectorAll('.work-item');
    let hasValidWork = false;
    
    for (const item of workItems) {
        const title = item.querySelector('.work-title').value.trim();
        const company = item.querySelector('.work-company').value.trim();
        const startDate = item.querySelector('.work-start').value.trim();
        const description = item.querySelector('.work-description').value.trim();
        
        if (title && company && startDate && description) {
            hasValidWork = true;
            break;
        }
    }
    
    if (!hasValidWork) {
        showError('Please add at least one work experience with title, company, start date, and description.');
        return false;
    }
    
    return true;
}

function validateStep3() {
    // Validate technical skills
    const technicalSkills = document.querySelectorAll('#technical-skills-container .skill-tag');
    if (technicalSkills.length === 0) {
        showError('Please add at least one technical skill.');
        document.getElementById('technical-skill-input').focus();
        return false;
    }
    
    // Validate that at least one project is filled out
    const projectItems = document.querySelectorAll('.project-item');
    let hasValidProject = false;
    
    for (const item of projectItems) {
        const name = item.querySelector('.project-name').value.trim();
        const tech = item.querySelector('.project-tech').value.trim();
        const description = item.querySelector('.project-description').value.trim();
        
        if (name && tech && description) {
            hasValidProject = true;
            break;
        }
    }
    
    if (!hasValidProject) {
        showError('Please add at least one project with name, technologies, and description.');
        return false;
    }
    
    return true;
}

// Data collection functions
function savePersonalInfo() {
    window.resumeState = window.resumeState || {};
    
    window.resumeState.personalInfo = {
        fullName: document.getElementById('fullName').value.trim(),
        jobTitle: document.getElementById('jobTitle').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        location: document.getElementById('location').value.trim(),
        portfolio: document.getElementById('portfolio').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        github: document.getElementById('github').value.trim(),
        summary: document.getElementById('professionalSummary').value.trim()
    };
}

function saveEducationWork() {
    window.resumeState = window.resumeState || {};
    
    // Save education
    const educationItems = document.querySelectorAll('.education-item');
    window.resumeState.education = [];
    
    educationItems.forEach(item => {
        const degree = item.querySelector('.education-degree').value.trim();
        const institution = item.querySelector('.education-institution').value.trim();
        
        if (degree && institution) {
            window.resumeState.education.push({
                degree: degree,
                institution: institution,
                location: item.querySelector('.education-location').value.trim(),
                startDate: item.querySelector('.education-start').value.trim(),
                endDate: item.querySelector('.education-end').value.trim(),
                description: item.querySelector('.education-description').value.trim()
            });
        }
    });
    
    // Save work experience
    const workItems = document.querySelectorAll('.work-item');
    window.resumeState.work = [];
    
    workItems.forEach(item => {
        const title = item.querySelector('.work-title').value.trim();
        const company = item.querySelector('.work-company').value.trim();
        
        if (title && company) {
            const currentCheckbox = item.querySelector('.work-current');
            const isCurrent = currentCheckbox ? currentCheckbox.checked : false;
            
            window.resumeState.work.push({
                title: title,
                company: company,
                location: item.querySelector('.work-location').value.trim(),
                startDate: item.querySelector('.work-start').value.trim(),
                endDate: isCurrent ? 'Present' : item.querySelector('.work-end').value.trim(),
                current: isCurrent,
                description: item.querySelector('.work-description').value.trim()
            });
        }
    });
}

function saveSkillsProjects() {
    window.resumeState = window.resumeState || {};
    window.resumeState.skills = window.resumeState.skills || {};
    
    // Save technical skills
    window.resumeState.skills.technical = [];
    document.querySelectorAll('#technical-skills-container .skill-tag').forEach(tag => {
        const skillText = tag.querySelector('.skill-tag-text').textContent.trim();
        window.resumeState.skills.technical.push(skillText);
    });
    
    // Save soft skills
    window.resumeState.skills.soft = [];
    document.querySelectorAll('#soft-skills-container .skill-tag').forEach(tag => {
        const skillText = tag.querySelector('.skill-tag-text').textContent.trim();
        window.resumeState.skills.soft.push(skillText);
    });
    
    // Save languages
    window.resumeState.skills.languages = [];
    document.querySelectorAll('#languages-container .skill-tag').forEach(tag => {
        const skillText = tag.querySelector('.skill-tag-text').textContent.trim();
        window.resumeState.skills.languages.push(skillText);
    });
    
    // Save projects
    window.resumeState.projects = [];
    document.querySelectorAll('.project-item').forEach(item => {
        const name = item.querySelector('.project-name').value.trim();
        const tech = item.querySelector('.project-tech').value.trim();
        
        if (name && tech) {
            window.resumeState.projects.push({
                name: name,
                technologies: tech,
                link: item.querySelector('.project-link').value.trim(),
                date: item.querySelector('.project-date').value.trim(),
                description: item.querySelector('.project-description').value.trim()
            });
        }
    });
}

// Skills/Projects management functions
function addTechnicalSkill() {
    const skillInput = document.getElementById('technical-skill-input');
    const skillText = skillInput.value.trim();
    
    if (skillText) {
        const skillContainer = document.getElementById('technical-skills-container');
        const existingSkills = Array.from(skillContainer.querySelectorAll('.skill-tag-text')).map(el => el.textContent.trim());
        
        if (!existingSkills.includes(skillText)) {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                <span class="skill-tag-text">${skillText}</span>
                <span class="skill-tag-remove" onclick="removeSkill(this, 'technical')">
                    <i class="fas fa-times"></i>
                </span>
            `;
            
            skillContainer.appendChild(skillTag);
        }
        
        skillInput.value = '';
        skillInput.focus();
    }
}

function addSoftSkill() {
    const skillInput = document.getElementById('soft-skill-input');
    const skillText = skillInput.value.trim();
    
    if (skillText) {
        const skillContainer = document.getElementById('soft-skills-container');
        const existingSkills = Array.from(skillContainer.querySelectorAll('.skill-tag-text')).map(el => el.textContent.trim());
        
        if (!existingSkills.includes(skillText)) {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                <span class="skill-tag-text">${skillText}</span>
                <span class="skill-tag-remove" onclick="removeSkill(this, 'soft')">
                    <i class="fas fa-times"></i>
                </span>
            `;
            
            skillContainer.appendChild(skillTag);
        }
        
        skillInput.value = '';
        skillInput.focus();
    }
}

function addLanguage() {
    const languageInput = document.getElementById('language-input');
    const languageText = languageInput.value.trim();
    
    if (languageText) {
        const languageContainer = document.getElementById('languages-container');
        const existingLanguages = Array.from(languageContainer.querySelectorAll('.skill-tag-text')).map(el => el.textContent.trim());
        
        if (!existingLanguages.includes(languageText)) {
            const languageTag = document.createElement('div');
            languageTag.className = 'skill-tag';
            languageTag.innerHTML = `
                <span class="skill-tag-text">${languageText}</span>
                <span class="skill-tag-remove" onclick="removeSkill(this, 'language')">
                    <i class="fas fa-times"></i>
                </span>
            `;
            
            languageContainer.appendChild(languageTag);
        }
        
        languageInput.value = '';
        languageInput.focus();
    }
}

function removeSkill(element, type) {
    const skillTag = element.closest('.skill-tag');
    if (skillTag) {
        skillTag.remove();
    }
}

// Add/Remove functions for education, work, and projects
function addEducation() {
    const container = document.getElementById('education-container');
    const educationItems = container.querySelectorAll('.education-item');
    const newId = educationItems.length + 1;
    
    const newItem = document.createElement('div');
    newItem.className = 'education-item bg-gray-800 p-4 rounded-lg mb-4';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-gray-300 text-sm mb-1">Degree/Certificate*</label>
                <input type="text" class="education-degree w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. Bachelor of Science in Computer Science">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Institution*</label>
                <input type="text" class="education-institution w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. University of Technology">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Location</label>
                <input type="text" class="education-location w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. Boston, MA">
            </div>
            <div class="flex gap-4">
                <div class="w-1/2">
                    <label class="block text-gray-300 text-sm mb-1">Start Date*</label>
                    <input type="month" class="education-start w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm">
                </div>
                <div class="w-1/2">
                    <label class="block text-gray-300 text-sm mb-1">End Date*</label>
                    <input type="month" class="education-end w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm">
                </div>
            </div>
        </div>
        <div class="mt-3">
            <label class="block text-gray-300 text-sm mb-1">Description / Achievements</label>
            <textarea class="education-description w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" rows="2" placeholder="e.g. Dean's List, GPA, relevant coursework, achievements"></textarea>
        </div>
        <div class="text-right mt-2">
            <button onclick="removeEducation(this)" class="text-red-400 hover:text-red-300 text-sm">
                <i class="fas fa-trash-alt mr-1"></i>Remove
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
}

function removeEducation(button) {
    const educationItem = button.closest('.education-item');
    const container = document.getElementById('education-container');
    
    // Ensure there's at least one education item
    if (container.querySelectorAll('.education-item').length > 1) {
        educationItem.remove();
    } else {
        showError('You must have at least one education entry. Clear the fields instead of removing.');
    }
}

function addWorkExperience() {
    const container = document.getElementById('work-container');
    const workItems = container.querySelectorAll('.work-item');
    const newId = workItems.length + 1;
    
    const newItem = document.createElement('div');
    newItem.className = 'work-item bg-gray-800 p-4 rounded-lg mb-4';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-gray-300 text-sm mb-1">Job Title*</label>
                <input type="text" class="work-title w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. Senior Frontend Developer">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Company*</label>
                <input type="text" class="work-company w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. Tech Innovations Inc.">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Location</label>
                <input type="text" class="work-location w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. San Francisco, CA">
            </div>
            <div class="flex gap-4">
                <div class="w-1/2">
                    <label class="block text-gray-300 text-sm mb-1">Start Date*</label>
                    <input type="month" class="work-start w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm">
                </div>
                <div class="w-1/2">
                    <label class="block text-gray-300 text-sm mb-1">End Date*</label>
                    <div class="flex items-center">
                        <input type="month" class="work-end w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm">
                        <div class="ml-2">
                            <input type="checkbox" class="work-current" id="work-current-${newId}">
                            <label for="work-current-${newId}" class="text-gray-300 text-sm ml-1">Current</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-3">
            <label class="block text-gray-300 text-sm mb-1">Responsibilities & Achievements*</label>
            <textarea class="work-description w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" rows="3" placeholder="Describe your key responsibilities and achievements..."></textarea>
            <p class="text-xs text-gray-500 mt-1">Tip: Use bullet points by starting each line with - or *</p>
        </div>
        <div class="text-right mt-2">
            <button onclick="removeWorkExperience(this)" class="text-red-400 hover:text-red-300 text-sm">
                <i class="fas fa-trash-alt mr-1"></i>Remove
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Add event listener for the "Current" checkbox
    const currentCheckbox = newItem.querySelector('.work-current');
    const endDateInput = newItem.querySelector('.work-end');
    
    currentCheckbox.addEventListener('change', function() {
        if (this.checked) {
            endDateInput.value = '';
            endDateInput.disabled = true;
        } else {
            endDateInput.disabled = false;
        }
    });
}

function removeWorkExperience(button) {
    const workItem = button.closest('.work-item');
    const container = document.getElementById('work-container');
    
    // Ensure there's at least one work item
    if (container.querySelectorAll('.work-item').length > 1) {
        workItem.remove();
    } else {
        showError('You must have at least one work experience entry. Clear the fields instead of removing.');
    }
}

function addProject() {
    const container = document.getElementById('projects-container');
    
    const newItem = document.createElement('div');
    newItem.className = 'project-item bg-gray-800 p-4 rounded-lg mb-4';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-gray-300 text-sm mb-1">Project Name*</label>
                <input type="text" class="project-name w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. E-commerce Platform">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Technologies Used*</label>
                <input type="text" class="project-tech w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. React, Node.js, MongoDB">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Project Link</label>
                <input type="url" class="project-link w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. https://github.com/yourusername/project">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-1">Timeframe</label>
                <input type="text" class="project-date w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="e.g. Jan 2022 - Mar 2022">
            </div>
        </div>
        <div class="mt-3">
            <label class="block text-gray-300 text-sm mb-1">Description*</label>
            <textarea class="project-description w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" rows="2" placeholder="Describe the project, your role, and key achievements..."></textarea>
        </div>
        <div class="text-right mt-2">
            <button onclick="removeProject(this)" class="text-red-400 hover:text-red-300 text-sm">
                <i class="fas fa-trash-alt mr-1"></i>Remove
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
}

function removeProject(button) {
    const projectItem = button.closest('.project-item');
    const container = document.getElementById('projects-container');
    
    // Ensure there's at least one project item
    if (container.querySelectorAll('.project-item').length > 1) {
        projectItem.remove();
    } else {
        showError('You must have at least one project entry. Clear the fields instead of removing.');
    }
}

// Template selection
function selectTemplate(templateName) {
    window.resumeState = window.resumeState || {};
    window.resumeState.template = templateName;
    
    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('border-blue-500');
        card.classList.add('border-transparent');
        card.querySelector('.template-check').classList.add('hidden');
    });
    
    const selectedCard = document.querySelector(`.template-card[onclick="selectTemplate('${templateName}')"]`);
    if (selectedCard) {
        selectedCard.classList.add('border-blue-500');
        selectedCard.classList.remove('border-transparent');
        selectedCard.querySelector('.template-check').classList.remove('hidden');
    }
}

// Generate resume
function generateResume() {
    // Save optimization options
    window.resumeState = window.resumeState || {};
    window.resumeState.targetJob = document.getElementById('targetJob').value.trim();
    window.resumeState.keywords = document.getElementById('keywords').value.trim().split(',').map(k => k.trim()).filter(k => k);
    window.resumeState.aiOptimize = document.getElementById('aiOptimize').checked;
    
    // Show loading indicator
    document.getElementById('resumeLoadingIndicator').classList.remove('hidden');
    document.getElementById('generate-resume-btn').disabled = true;
    
    // If AI optimization is enabled and API key exists, optimize resume content
    if (window.resumeState.aiOptimize) {
        const apiKey = localStorage.getItem('geminiApiKey');
        if (apiKey) {
            optimizeResumeWithGemini(apiKey)
                .then(() => {
                    createResumeHTML();
                })
                .catch((error) => {
                    console.error('Error optimizing resume with Gemini:', error);
                    showError('Failed to optimize resume. Generating without optimization.');
                    createResumeHTML();
                });
        } else {
            showError('No Gemini API key found. Generating resume without AI optimization.');
            createResumeHTML();
        }
    } else {
        // Generate without optimization
        createResumeHTML();
    }
}

async function optimizeResumeWithGemini(apiKey) {
    // Initialize the Gemini API service
    if (window.geminiApi) {
        window.geminiApi.initialize(apiKey);
    } else {
        throw new Error('Gemini API not available');
    }
    
    try {
        const resumeData = window.resumeState;
        const targetJob = resumeData.targetJob || resumeData.personalInfo.jobTitle;
        
        // Optimize professional summary
        if (resumeData.personalInfo.summary) {
            const optimizedSummary = await optimizeText(
                resumeData.personalInfo.summary,
                `a professional summary for a ${targetJob} resume`,
                `Focus on achievements and skills relevant to ${targetJob}. Keep it under 300 characters.`
            );
            
            if (optimizedSummary) {
                resumeData.personalInfo.summary = optimizedSummary;
            }
        }
        
        // Optimize work descriptions
        for (let i = 0; i < resumeData.work.length; i++) {
            const job = resumeData.work[i];
            if (job.description) {
                const optimizedDescription = await optimizeText(
                    job.description,
                    `a job description for ${job.title} at ${job.company}`,
                    `Focus on quantifiable achievements and responsibilities relevant to ${targetJob}. Use bullet points.`
                );
                
                if (optimizedDescription) {
                    resumeData.work[i].description = optimizedDescription;
                }
            }
        }
        
        // Optimize project descriptions
        for (let i = 0; i < resumeData.projects.length; i++) {
            const project = resumeData.projects[i];
            if (project.description) {
                const optimizedDescription = await optimizeText(
                    project.description,
                    `a project description for ${project.name}`,
                    `Focus on your role, technologies used (${project.technologies}), and outcomes relevant to ${targetJob}.`
                );
                
                if (optimizedDescription) {
                    resumeData.projects[i].description = optimizedDescription;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error in AI optimization:', error);
        throw error;
    }
}

async function optimizeText(originalText, context, instructions) {
    try {
        const prompt = `
        Optimize the following text for ${context}:

        Original text:
        ${originalText}

        Instructions:
        ${instructions}

        Return only the optimized text without any additional commentary.
        `;
        
        const response = await window.geminiApi.callGeminiApi(prompt);
        return response;
    } catch (error) {
        console.error('Error optimizing text:', error);
        return null;
    }
}

function createResumeHTML() {
    const resumeData = window.resumeState;
    const template = resumeData.template || 'professional';
    
    let resumeHTML = '';
    
    switch (template) {
        case 'minimalist':
            resumeHTML = generateMinimalistTemplate(resumeData);
            break;
        case 'modern':
            resumeHTML = generateModernTemplate(resumeData);
            break;
        case 'professional':
        default:
            resumeHTML = generateProfessionalTemplate(resumeData);
            break;
    }
    
    // Create preview
    const previewFrame = document.getElementById('resume-preview');
    if (previewFrame) {
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(resumeHTML);
        frameDoc.close();
    }
    
    // Save HTML for download
    window.resumeState.generatedHTML = resumeHTML;
    
    // Hide loading indicator and enable next button
    document.getElementById('resumeLoadingIndicator').classList.add('hidden');
    document.getElementById('step4-next').disabled = false;
    
    // Save resume to localStorage
    saveResumeToLocalStorage();
}

// Generate template functions
function generateProfessionalTemplate(data) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.personalInfo.fullName} - Resume</title>
            <style>
                body {
                    font-family: 'Calibri', 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .resume-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    background-color: #fff;
                }
                .header {
                    margin-bottom: 20px;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 10px;
                }
                .name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin: 0;
                }
                .title {
                    font-size: 18px;
                    color: #7f8c8d;
                    margin: 5px 0;
                }
                .contact-info {
                    margin-top: 10px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    font-size: 14px;
                }
                .contact-item {
                    margin-right: 15px;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #2c3e50;
                    text-transform: uppercase;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }
                .summary {
                    margin-bottom: 20px;
                }
                .experience-item, .education-item, .project-item {
                    margin-bottom: 15px;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .item-title {
                    font-weight: bold;
                    font-size: 16px;
                    color: #34495e;
                }
                .item-subtitle {
                    font-size: 15px;
                }
                .item-date {
                    font-style: italic;
                    color: #7f8c8d;
                }
                .item-location {
                    color: #7f8c8d;
                    font-size: 14px;
                }
                .item-description {
                    margin-top: 5px;
                    font-size: 14px;
                }
                .skills-section {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px 20px;
                }
                .skill-category {
                    margin-bottom: 10px;
                    flex: 1 0 45%;
                }
                .skill-category h4 {
                    margin-bottom: 5px;
                    color: #34495e;
                }
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .skill-item {
                    background-color: #ecf0f1;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 13px;
                }
                ul.bullet-list {
                    margin: 5px 0;
                    padding-left: 20px;
                }
                ul.bullet-list li {
                    margin-bottom: 3px;
                }
                .project-link {
                    color: #3498db;
                    text-decoration: none;
                    font-size: 14px;
                }
                .project-link:hover {
                    text-decoration: underline;
                }
                .project-tech {
                    font-size: 13px;
                    color: #7f8c8d;
                    font-style: italic;
                }
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .resume-container {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                <!-- Header -->
                <div class="header">
                    <h1 class="name">${data.personalInfo.fullName}</h1>
                    <p class="title">${data.personalInfo.jobTitle}</p>
                    <div class="contact-info">
                        <span class="contact-item">${data.personalInfo.email}</span>
                        <span class="contact-item">${data.personalInfo.phone}</span>
                        <span class="contact-item">${data.personalInfo.location}</span>
                        ${data.personalInfo.linkedin ? `<span class="contact-item">${data.personalInfo.linkedin}</span>` : ''}
                        ${data.personalInfo.github ? `<span class="contact-item">${data.personalInfo.github}</span>` : ''}
                        ${data.personalInfo.portfolio ? `<span class="contact-item">${data.personalInfo.portfolio}</span>` : ''}
                    </div>
                </div>
                
                <!-- Summary -->
                <div class="section summary">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${data.personalInfo.summary}</p>
                </div>
                
                <!-- Work Experience -->
                <div class="section">
                    <h2 class="section-title">Professional Experience</h2>
                    ${data.work.map(job => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">${job.title}</div>
                                    <div class="item-subtitle">${job.company}</div>
                                    ${job.location ? `<div class="item-location">${job.location}</div>` : ''}
                                </div>
                                <div class="item-date">${formatDate(job.startDate)} - ${job.current ? 'Present' : formatDate(job.endDate)}</div>
                            </div>
                            <div class="item-description">
                                ${formatBulletList(job.description)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Education -->
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">${edu.degree}</div>
                                    <div class="item-subtitle">${edu.institution}</div>
                                    ${edu.location ? `<div class="item-location">${edu.location}</div>` : ''}
                                </div>
                                <div class="item-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
                            </div>
                            ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Skills -->
                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-section">
                        <div class="skill-category">
                            <h4>Technical Skills</h4>
                            <div class="skills-list">
                                ${data.skills.technical.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        ${data.skills.soft.length > 0 ? `
                            <div class="skill-category">
                                <h4>Soft Skills</h4>
                                <div class="skills-list">
                                    ${data.skills.soft.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${data.skills.languages.length > 0 ? `
                            <div class="skill-category">
                                <h4>Languages</h4>
                                <div class="skills-list">
                                    ${data.skills.languages.map(language => `<span class="skill-item">${language}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Projects -->
                ${data.projects.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Projects</h2>
                        ${data.projects.map(project => `
                            <div class="project-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">${project.name}</div>
                                        <div class="project-tech">Technologies: ${project.technologies}</div>
                                    </div>
                                    ${project.date ? `<div class="item-date">${project.date}</div>` : ''}
                                </div>
                                <div class="item-description">
                                    ${formatBulletList(project.description)}
                                </div>
                                ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">${project.link}</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
}

function generateMinimalistTemplate(data) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.personalInfo.fullName} - Resume</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.5;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #fff;
                }
                .resume-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .name {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                    letter-spacing: 1px;
                }
                .title {
                    font-size: 16px;
                    color: #666;
                    margin: 5px 0 15px;
                }
                .contact-info {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 15px;
                    font-size: 14px;
                }
                .contact-item {
                    margin-right: 10px;
                }
                .divider {
                    height: 1px;
                    background-color: #ddd;
                    margin: 15px 0;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }
                .experience-item, .education-item, .project-item {
                    margin-bottom: 15px;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .item-title {
                    font-weight: bold;
                    font-size: 15px;
                }
                .item-subtitle {
                    font-size: 14px;
                }
                .item-date {
                    font-size: 14px;
                    color: #666;
                }
                .item-location {
                    font-size: 13px;
                    color: #666;
                    margin-top: 2px;
                }
                .item-description {
                    font-size: 13px;
                    margin-top: 5px;
                }
                .skills-group {
                    margin-bottom: 15px;
                }
                .skills-group h4 {
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 13px;
                }
                .skill-item {
                    background-color: #f5f5f5;
                    padding: 2px 8px;
                    border-radius: 2px;
                }
                ul.bullet-list {
                    margin: 5px 0;
                    padding-left: 20px;
                    font-size: 13px;
                }
                ul.bullet-list li {
                    margin-bottom: 3px;
                }
                .project-link {
                    color: #666;
                    text-decoration: none;
                    font-size: 13px;
                }
                .project-tech {
                    font-size: 13px;
                    color: #666;
                }
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                <!-- Header -->
                <div class="header">
                    <h1 class="name">${data.personalInfo.fullName}</h1>
                    <p class="title">${data.personalInfo.jobTitle}</p>
                    <div class="contact-info">
                        <span class="contact-item">${data.personalInfo.email}</span>
                        <span class="contact-item">${data.personalInfo.phone}</span>
                        <span class="contact-item">${data.personalInfo.location}</span>
                        ${data.personalInfo.linkedin ? `<span class="contact-item">${data.personalInfo.linkedin}</span>` : ''}
                        ${data.personalInfo.github ? `<span class="contact-item">${data.personalInfo.github}</span>` : ''}
                        ${data.personalInfo.portfolio ? `<span class="contact-item">${data.personalInfo.portfolio}</span>` : ''}
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <!-- Summary -->
                <div class="section">
                    <h2 class="section-title">Summary</h2>
                    <p>${data.personalInfo.summary}</p>
                </div>
                
                <div class="divider"></div>
                
                <!-- Skills -->
                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-group">
                        <h4>Technical Skills</h4>
                        <div class="skills-list">
                            ${data.skills.technical.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                        </div>
                    </div>
                    
                    ${data.skills.soft.length > 0 ? `
                        <div class="skills-group">
                            <h4>Soft Skills</h4>
                            <div class="skills-list">
                                ${data.skills.soft.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${data.skills.languages.length > 0 ? `
                        <div class="skills-group">
                            <h4>Languages</h4>
                            <div class="skills-list">
                                ${data.skills.languages.map(language => `<span class="skill-item">${language}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="divider"></div>
                
                <!-- Experience -->
                <div class="section">
                    <h2 class="section-title">Experience</h2>
                    ${data.work.map(job => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div class="item-title">${job.title} | ${job.company}</div>
                                <div class="item-date">${formatDate(job.startDate)} - ${job.current ? 'Present' : formatDate(job.endDate)}</div>
                            </div>
                            ${job.location ? `<div class="item-location">${job.location}</div>` : ''}
                            <div class="item-description">
                                ${formatBulletList(job.description)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="divider"></div>
                
                <!-- Education -->
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div class="item-title">${edu.degree} | ${edu.institution}</div>
                                <div class="item-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
                            </div>
                            ${edu.location ? `<div class="item-location">${edu.location}</div>` : ''}
                            ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${data.projects.length > 0 ? `
                    <div class="divider"></div>
                    
                    <!-- Projects -->
                    <div class="section">
                        <h2 class="section-title">Projects</h2>
                        ${data.projects.map(project => `
                            <div class="project-item">
                                <div class="item-header">
                                    <div class="item-title">${project.name}</div>
                                    ${project.date ? `<div class="item-date">${project.date}</div>` : ''}
                                </div>
                                <div class="project-tech">Technologies: ${project.technologies}</div>
                                <div class="item-description">
                                    ${formatBulletList(project.description)}
                                </div>
                                ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">${project.link}</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
}

function generateModernTemplate(data) {
    const accentColor = '#3498db';
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.personalInfo.fullName} - Resume</title>
            <style>
                body {
                    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #fff;
                }
                .resume-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }
                .header {
                    margin-bottom: 30px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .header::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 0;
                    width: 80px;
                    height: 4px;
                    background-color: ${accentColor};
                }
                .name {
                    font-size: 32px;
                    font-weight: 600;
                    margin: 0;
                    color: #222;
                }
                .title {
                    font-size: 18px;
                    color: ${accentColor};
                    margin: 5px 0 15px;
                    font-weight: 500;
                }
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    font-size: 14px;
                }
                .contact-item {
                    margin-right: 15px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #222;
                    margin-bottom: 15px;
                    position: relative;
                    padding-bottom: 8px;
                }
                .section-title::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 40px;
                    height: 3px;
                    background-color: ${accentColor};
                }
                .experience-item, .education-item, .project-item {
                    margin-bottom: 20px;
                    position: relative;
                    padding-left: 20px;
                }
                .experience-item::before, .education-item::before, .project-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 5px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: ${accentColor};
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .item-title {
                    font-weight: 600;
                    font-size: 16px;
                    color: #222;
                }
                .item-subtitle {
                    font-size: 15px;
                    color: #444;
                }
                .item-date {
                    font-size: 14px;
                    color: ${accentColor};
                    font-weight: 500;
                }
                .item-location {
                    font-size: 14px;
                    color: #666;
                    margin-top: 2px;
                }
                .item-description {
                    font-size: 14px;
                    color: #444;
                    margin-top: 8px;
                }
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .skill-category {
                    flex: 1 0 45%;
                    margin-bottom: 15px;
                }
                .skill-category h4 {
                    font-size: 16px;
                    color: #222;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .skill-item {
                    background-color: #f0f7fc;
                    color: ${accentColor};
                    padding: 5px 10px;
                    border-radius: 3px;
                    font-size: 13px;
                    font-weight: 500;
                }
                ul.bullet-list {
                    margin: 5px 0;
                    padding-left: 20px;
                }
                ul.bullet-list li {
                    margin-bottom: 5px;
                    position: relative;
                }
                ul.bullet-list li::marker {
                    color: ${accentColor};
                }
                .project-link {
                    color: ${accentColor};
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-block;
                    margin-top: 5px;
                }
                .project-link:hover {
                    text-decoration: underline;
                }
                .project-tech {
                    font-size: 13px;
                    color: #666;
                    font-style: italic;
                    margin-top: 3px;
                }
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                <!-- Header -->
                <div class="header">
                    <h1 class="name">${data.personalInfo.fullName}</h1>
                    <p class="title">${data.personalInfo.jobTitle}</p>
                    <div class="contact-info">
                        <span class="contact-item">${data.personalInfo.email}</span>
                        <span class="contact-item">${data.personalInfo.phone}</span>
                        <span class="contact-item">${data.personalInfo.location}</span>
                        ${data.personalInfo.linkedin ? `<span class="contact-item">${data.personalInfo.linkedin}</span>` : ''}
                        ${data.personalInfo.github ? `<span class="contact-item">${data.personalInfo.github}</span>` : ''}
                        ${data.personalInfo.portfolio ? `<span class="contact-item">${data.personalInfo.portfolio}</span>` : ''}
                    </div>
                </div>
                
                <!-- Summary -->
                <div class="section">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${data.personalInfo.summary}</p>
                </div>
                
                <!-- Skills -->
                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-container">
                        <div class="skill-category">
                            <h4>Technical Skills</h4>
                            <div class="skills-list">
                                ${data.skills.technical.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        ${data.skills.soft.length > 0 ? `
                            <div class="skill-category">
                                <h4>Soft Skills</h4>
                                <div class="skills-list">
                                    ${data.skills.soft.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${data.skills.languages.length > 0 ? `
                            <div class="skill-category">
                                <h4>Languages</h4>
                                <div class="skills-list">
                                    ${data.skills.languages.map(language => `<span class="skill-item">${language}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Experience -->
                <div class="section">
                    <h2 class="section-title">Work Experience</h2>
                    ${data.work.map(job => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">${job.title}</div>
                                    <div class="item-subtitle">${job.company}</div>
                                    ${job.location ? `<div class="item-location">${job.location}</div>` : ''}
                                </div>
                                <div class="item-date">${formatDate(job.startDate)} - ${job.current ? 'Present' : formatDate(job.endDate)}</div>
                            </div>
                            <div class="item-description">
                                ${formatBulletList(job.description)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Education -->
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">${edu.degree}</div>
                                    <div class="item-subtitle">${edu.institution}</div>
                                    ${edu.location ? `<div class="item-location">${edu.location}</div>` : ''}
                                </div>
                                <div class="item-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
                            </div>
                            ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Projects -->
                ${data.projects.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Projects</h2>
                        ${data.projects.map(project => `
                            <div class="project-item">
                                <div class="item-header">
                                    <div class="item-title">${project.name}</div>
                                    ${project.date ? `<div class="item-date">${project.date}</div>` : ''}
                                </div>
                                <div class="project-tech">Technologies: ${project.technologies}</div>
                                <div class="item-description">
                                    ${formatBulletList(project.description)}
                                </div>
                                ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">${project.link}</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString || dateString === 'Present') return dateString;
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    } catch (e) {
        return dateString;
    }
}

function formatBulletList(text) {
    if (!text) return '';
    
    // Check if text already contains bullet points (starting with - or *)
    if (text.includes('\n-') || text.includes('\n*') || text.startsWith('-') || text.startsWith('*')) {
        const lines = text.split('\n').map(line => line.trim());
        const bulletItems = lines.map(line => {
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return `<li>${line.substring(2)}</li>`;
            } else if (line.startsWith('-') || line.startsWith('*')) {
                return `<li>${line.substring(1)}</li>`;
            }
            return line ? `<li>${line}</li>` : '';
        });
        
        return `<ul class="bullet-list">${bulletItems.join('')}</ul>`;
    }
    
    // If no bullet points, return as paragraph
    return `<p>${text}</p>`;
}

// Download functions
function downloadResumeAsPDF() {
    // Use jsPDF
    if (window.resumeState && window.resumeState.generatedHTML) {
        const { jsPDF } = window.jspdf;
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const previewFrame = document.getElementById('resume-preview');
        
        if (previewFrame) {
            const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            html2canvas(frameDoc.body, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = pdfWidth / imgWidth;
                const scaledImgHeight = imgHeight * ratio;
                
                let heightLeft = scaledImgHeight;
                let position = 0;
                let pageCount = 1;
                
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledImgHeight);
                heightLeft -= pdfHeight;
                
                while (heightLeft > 0) {
                    position = heightLeft - scaledImgHeight;
                    pdf.addPage();
                    pageCount++;
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledImgHeight);
                    heightLeft -= pdfHeight;
                }
                
                pdf.save(`${window.resumeState.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
            });
        }
    } else {
        showError('Resume not generated yet. Please generate the resume first.');
    }
}

function downloadResumeAsWord() {
    showError('DOCX download is not fully implemented in this version.');
    
    // Note: This would require more complex implementation with docxtemplater
    // or server-side processing to properly convert HTML to DOCX format
}

function copyResumeAsText() {
    if (window.resumeState) {
        // Create a plain text version of the resume
        const data = window.resumeState;
        
        const textContent = `
${data.personalInfo.fullName}
${data.personalInfo.jobTitle}
${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}
${data.personalInfo.linkedin ? data.personalInfo.linkedin + ' | ' : ''}${data.personalInfo.github ? data.personalInfo.github + ' | ' : ''}${data.personalInfo.portfolio ? data.personalInfo.portfolio : ''}

PROFESSIONAL SUMMARY
${data.personalInfo.summary}

SKILLS
Technical: ${data.skills.technical.join(', ')}
${data.skills.soft.length > 0 ? 'Soft Skills: ' + data.skills.soft.join(', ') : ''}
${data.skills.languages.length > 0 ? 'Languages: ' + data.skills.languages.join(', ') : ''}

EXPERIENCE
${data.work.map(job => 
    `${job.title} | ${job.company} | ${formatDate(job.startDate)} - ${job.current ? 'Present' : formatDate(job.endDate)}
${job.location ? job.location : ''}
${job.description}`
).join('\n\n')}

EDUCATION
${data.education.map(edu => 
    `${edu.degree} | ${edu.institution} | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}
${edu.location ? edu.location : ''}
${edu.description ? edu.description : ''}`
).join('\n\n')}

${data.projects.length > 0 ? `PROJECTS
${data.projects.map(project => 
    `${project.name} | ${project.date ? project.date : ''}
Technologies: ${project.technologies}
${project.description}
${project.link ? project.link : ''}`
).join('\n\n')}` : ''}
        `;
        
        navigator.clipboard.writeText(textContent).then(() => {
            alert('Resume text copied to clipboard!');
        }).catch(err => {
            showError('Failed to copy resume text. Try again later.');
            console.error('Failed to copy:', err);
        });
    } else {
        showError('Resume not generated yet. Please generate the resume first.');
    }
}

function createNewResume() {
    // Reset form data and go back to step 1
    window.location.reload();
}

function saveResume() {
    if (!window.resumeState) {
        showError('Resume not generated yet. Please generate the resume first.');
        return;
    }
    
    // Save to localStorage
    saveResumeToLocalStorage();
    
    // Show confirmation
    alert('Resume saved successfully!');
}

function saveResumeToLocalStorage() {
    if (!window.resumeState) return;
    
    // Get existing saved resumes or initialize empty array
    let savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
    
    // Create resume object with timestamp and name
    const resumeObject = {
        id: Date.now().toString(),
        name: window.resumeState.personalInfo.fullName,
        title: window.resumeState.personalInfo.jobTitle,
        timestamp: new Date().toISOString(),
        data: window.resumeState
    };
    
    // Add to beginning of array
    savedResumes.unshift(resumeObject);
    
    // Limit to 5 saved resumes
    if (savedResumes.length > 5) {
        savedResumes = savedResumes.slice(0, 5);
    }
    
    // Save back to localStorage
    localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
}

// Error handling
function showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    } else {
        alert(message);
    }
}

// Export global functions
window.addEducation = addEducation;
window.removeEducation = removeEducation;
window.addWorkExperience = addWorkExperience;
window.removeWorkExperience = removeWorkExperience;
window.addProject = addProject;
window.removeProject = removeProject;
window.addTechnicalSkill = addTechnicalSkill;
window.addSoftSkill = addSoftSkill;
window.addLanguage = addLanguage;
window.removeSkill = removeSkill;
window.goToStep1 = goToStep1;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.goToStep4 = goToStep4;
window.goToStep5 = goToStep5;
window.selectTemplate = selectTemplate;
window.generateResume = generateResume;
window.downloadResumeAsPDF = downloadResumeAsPDF;
window.downloadResumeAsWord = downloadResumeAsWord;
window.copyResumeAsText = copyResumeAsText;
window.createNewResume = createNewResume;
window.saveResume = saveResume;
window.showError = showError;