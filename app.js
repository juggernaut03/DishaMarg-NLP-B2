document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const jobRoleInput = document.getElementById('jobRole');
    const resumeTextArea = document.getElementById('resumeText');
    const apiKeyInput = document.getElementById('apiKey');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    const requiredSkillsList = document.getElementById('requiredSkillsList');
    const currentSkillsList = document.getElementById('currentSkillsList');
    const skillGapsList = document.getElementById('skillGapsList');
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const saveResultsBtn = document.getElementById('saveResultsBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    const savedResultsSection = document.getElementById('savedResultsSection');
    const savedResultsList = document.getElementById('savedResultsList');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');

    // State
    let analysisData = null;
    let savedResults = JSON.parse(localStorage.getItem('skillGapAnalyses') || '[]');

    // Initialize
    updateSavedResultsList();

    // Event Listeners
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    analyzeBtn.addEventListener('click', startAnalysis);
    saveResultsBtn.addEventListener('click', saveResults);
    downloadBtn.addEventListener('click', downloadResults);
    newAnalysisBtn.addEventListener('click', resetForm);
    closeErrorBtn.addEventListener('click', closeErrorModal);

    // Function to toggle API key visibility
    function toggleApiKeyVisibility() {
        const icon = toggleApiKeyBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            apiKeyInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Function to show error modal
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    }

    // Function to close error modal
    function closeErrorModal() {
        errorModal.classList.add('hidden');
    }

    // Function to start the analysis process
    async function startAnalysis() {
        // Validate inputs
        const jobRole = jobRoleInput.value.trim();
        const resumeText = resumeTextArea.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!jobRole) {
            showError('Please enter a job role.');
            return;
        }

        if (!resumeText) {
            showError('Please paste your resume text.');
            return;
        }

        if (!apiKey) {
            showError('Please enter your Gemini API key.');
            return;
        }

        // Show loading indicator and hide results
        loadingIndicator.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        try {
            // Initialize the Gemini API service with the API key
            geminiApi.initialize(apiKey);
            
            // Step 1: Get required skills for job role
            const requiredSkills = await geminiApi.getRequiredSkills(jobRole);
            
            // Step 2: Extract current skills from resume
            const currentSkills = await geminiApi.extractSkillsFromResume(resumeText);
            
            // Step 3: Identify skill gaps
            const skillGaps = identifySkillGaps(requiredSkills, currentSkills);
            
            // Step 4: Get learning recommendations for each skill gap
            const recommendations = {};
            for (const skill of skillGaps) {
                try {
                    recommendations[skill] = await geminiApi.getLearningRecommendations(skill);
                } catch (error) {
                    console.error(`Failed to get recommendations for ${skill}:`, error);
                    recommendations[skill] = {
                        courses: ['API error - recommendations unavailable'],
                        tutorials: ['API error - recommendations unavailable'],
                        projects: ['API error - recommendations unavailable']
                    };
                }
            }
            
            // Store analysis data
            analysisData = {
                timestamp: new Date().toISOString(),
                jobRole,
                requiredSkills,
                currentSkills,
                skillGaps,
                recommendations
            };
            
            // Display results
            displayResults(analysisData);
            
            // Hide loading indicator and show results
            loadingIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            loadingIndicator.classList.add('hidden');
            showError(`Analysis failed: ${error.message}`);
            console.error(error);
        }
    }

    // Function to identify skill gaps
    function identifySkillGaps(requiredSkills, currentSkills) {
        // Check if inputs are arrays, if not convert them
        const requiredArray = Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills];
        const currentArray = Array.isArray(currentSkills) ? currentSkills : [currentSkills];

        return requiredArray.filter(skill => 
            !currentArray.some(currentSkill => 
                currentSkill.toLowerCase() === skill.toLowerCase()
            )
        );
    }

    // Function to display results
    function displayResults(data) {
        // Clear previous results
        requiredSkillsList.innerHTML = '';
        currentSkillsList.innerHTML = '';
        skillGapsList.innerHTML = '';
        recommendationsContainer.innerHTML = '';
        
        // Ensure data arrays are actually arrays
        const requiredSkills = Array.isArray(data.requiredSkills) ? data.requiredSkills : [data.requiredSkills];
        const currentSkills = Array.isArray(data.currentSkills) ? data.currentSkills : [data.currentSkills];
        const skillGaps = Array.isArray(data.skillGaps) ? data.skillGaps : [data.skillGaps];
        
        // Display required skills
        requiredSkills.forEach(skill => {
            if (typeof skill === 'string' && skill.trim()) {
                const li = document.createElement('li');
                li.textContent = skill;
                requiredSkillsList.appendChild(li);
            }
        });
        
        // Display current skills
        currentSkills.forEach(skill => {
            if (typeof skill === 'string' && skill.trim()) {
                const li = document.createElement('li');
                li.textContent = skill;
                currentSkillsList.appendChild(li);
            }
        });
        
        // Display skill gaps with checkboxes
        if (skillGaps.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<span class="text-green-600 font-medium">No skill gaps found! Your skills match the job requirements.</span>';
            skillGapsList.appendChild(li);
        } else {
            skillGaps.forEach(skill => {
                if (typeof skill === 'string' && skill.trim()) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <label class="flex items-start">
                            <input type="checkbox" class="skill-gap-checkbox mt-1 mr-2" value="${skill}" checked>
                            <span class="text-red-600">${skill}</span>
                        </label>
                    `;
                    skillGapsList.appendChild(li);
                    
                    // Add event listener to checkbox
                    const checkbox = li.querySelector('.skill-gap-checkbox');
                    checkbox.addEventListener('change', updateRecommendations);
                }
            });
        }
        
        // Initial display of recommendations
        updateRecommendations();
    }

    // Function to update recommendations based on selected skill gaps
    function updateRecommendations() {
        recommendationsContainer.innerHTML = '';
        
        const selectedSkills = Array.from(document.querySelectorAll('.skill-gap-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedSkills.length === 0) {
            recommendationsContainer.innerHTML = '<p class="text-gray-500 italic">Select skill gaps to see recommendations</p>';
            return;
        }
        
        selectedSkills.forEach(skill => {
            const recommendations = analysisData.recommendations[skill] || {
                courses: ['No recommendations available'],
                tutorials: ['No recommendations available'],
                projects: ['No recommendations available']
            };
            
            // Make sure each property exists
            if (!recommendations.courses) recommendations.courses = ['No courses available'];
            if (!recommendations.tutorials) recommendations.tutorials = ['No tutorials available'];
            if (!recommendations.projects) recommendations.projects = ['No projects available'];
            
            // Make sure each property is an array
            const courses = Array.isArray(recommendations.courses) ? recommendations.courses : [recommendations.courses];
            const tutorials = Array.isArray(recommendations.tutorials) ? recommendations.tutorials : [recommendations.tutorials];
            const projects = Array.isArray(recommendations.projects) ? recommendations.projects : [recommendations.projects];
            
            const skillSection = document.createElement('div');
            skillSection.className = 'mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0';
            
            skillSection.innerHTML = `
                <h3 class="text-xl font-medium text-blue-700 mb-4">${skill}</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Courses</th>
                                <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Tutorials</th>
                                <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Projects</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="px-4 py-2 align-top">
                                    <ul class="list-disc pl-5 space-y-1">
                                        ${courses.map(course => `<li>${course}</li>`).join('')}
                                    </ul>
                                </td>
                                <td class="px-4 py-2 align-top">
                                    <ul class="list-disc pl-5 space-y-1">
                                        ${tutorials.map(tutorial => `<li>${tutorial}</li>`).join('')}
                                    </ul>
                                </td>
                                <td class="px-4 py-2 align-top">
                                    <ul class="list-disc pl-5 space-y-1">
                                        ${projects.map(project => `<li>${project}</li>`).join('')}
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            
            recommendationsContainer.appendChild(skillSection);
        });
    }

    // Function to save results to localStorage
    function saveResults() {
        if (!analysisData) {
            showError('No analysis data to save.');
            return;
        }
        
        // Create a new saved result object
        const savedResult = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            jobRole: analysisData.jobRole,
            data: analysisData
        };
        
        // Add to saved results array
        savedResults.unshift(savedResult);
        
        // Limit to 10 saved results
        if (savedResults.length > 10) {
            savedResults = savedResults.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('skillGapAnalyses', JSON.stringify(savedResults));
        
        // Update saved results list
        updateSavedResultsList();
        
        // Show saved results section
        savedResultsSection.classList.remove('hidden');
    }

    // Function to update saved results list
    function updateSavedResultsList() {
        savedResultsList.innerHTML = '';
        
        if (savedResults.length === 0) {
            savedResultsList.innerHTML = '<p class="text-gray-500 italic">No saved analyses</p>';
            savedResultsSection.classList.add('hidden');
            return;
        }
        
        savedResults.forEach(result => {
            const date = new Date(result.timestamp).toLocaleString();
            
            const savedResultItem = document.createElement('div');
            savedResultItem.className = 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50';
            
            savedResultItem.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium">${result.jobRole}</h3>
                        <p class="text-sm text-gray-500">${date}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="load-result-btn text-blue-600 hover:text-blue-800" data-id="${result.id}">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="delete-result-btn text-red-600 hover:text-red-800" data-id="${result.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            savedResultsList.appendChild(savedResultItem);
            
            // Add event listeners
            savedResultItem.querySelector('.load-result-btn').addEventListener('click', () => loadSavedResult(result.id));
            savedResultItem.querySelector('.delete-result-btn').addEventListener('click', () => deleteSavedResult(result.id));
        });
        
        savedResultsSection.classList.remove('hidden');
    }

    // Function to load a saved result
    function loadSavedResult(id) {
        const result = savedResults.find(r => r.id === id);
        
        if (!result) {
            showError('Saved result not found.');
            return;
        }
        
        // Load data
        analysisData = result.data;
        
        // Display results
        displayResults(analysisData);
        
        // Show results section
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Function to delete a saved result
    function deleteSavedResult(id) {
        savedResults = savedResults.filter(r => r.id !== id);
        
        // Save to localStorage
        localStorage.setItem('skillGapAnalyses', JSON.stringify(savedResults));
        
        // Update saved results list
        updateSavedResultsList();
    }

    // Function to download results as JSON
    // Function to download results as TXT
function downloadResults() {
    if (!analysisData) {
        showError('No analysis data to download.');
        return;
    }
    
    // Create formatted text content
    const textContent = generateTextReport(analysisData);
    
    // Create a Blob with the text data
    const blob = new Blob([textContent], { type: 'text/plain' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-gap-analysis-${analysisData.jobRole.replace(/\s+/g, '-').toLowerCase()}.txt`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Helper function to generate formatted text report
function generateTextReport(data) {
    const lines = [
        `SKILL GAP ANALYSIS REPORT`,
        `===========================`,
        `Job Role: ${data.jobRole}`,
        `Date: ${new Date(data.timestamp).toLocaleString()}`,
        ``,
        `REQUIRED SKILLS`,
        `---------------------------`
    ];
    
    // Add required skills
    const requiredSkills = Array.isArray(data.requiredSkills) ? data.requiredSkills : [data.requiredSkills];
    requiredSkills.forEach(skill => {
        if (typeof skill === 'string' && skill.trim()) {
            lines.push(`• ${skill}`);
        }
    });
    
    // Add current skills
    lines.push(
        ``,
        `YOUR CURRENT SKILLS`,
        `---------------------------`
    );
    
    const currentSkills = Array.isArray(data.currentSkills) ? data.currentSkills : [data.currentSkills];
    currentSkills.forEach(skill => {
        if (typeof skill === 'string' && skill.trim()) {
            lines.push(`• ${skill}`);
        }
    });
    
    // Add skill gaps
    lines.push(
        ``,
        `SKILL GAPS IDENTIFIED`,
        `---------------------------`
    );
    
    const skillGaps = Array.isArray(data.skillGaps) ? data.skillGaps : [data.skillGaps];
    if (skillGaps.length === 0) {
        lines.push(`No skill gaps found! Your skills match the job requirements.`);
    } else {
        skillGaps.forEach(skill => {
            if (typeof skill === 'string' && skill.trim()) {
                lines.push(`• ${skill}`);
            }
        });
    }
    
    // Add recommendations
    if (skillGaps.length > 0) {
        lines.push(
            ``,
            `LEARNING RECOMMENDATIONS`,
            `===========================`
        );
        
        skillGaps.forEach(skill => {
            if (typeof skill === 'string' && skill.trim()) {
                const recommendations = data.recommendations[skill] || {
                    courses: ['No recommendations available'],
                    tutorials: ['No recommendations available'],
                    projects: ['No recommendations available']
                };
                
                // Make sure each property exists
                if (!recommendations.courses) recommendations.courses = ['No courses available'];
                if (!recommendations.tutorials) recommendations.tutorials = ['No tutorials available'];
                if (!recommendations.projects) recommendations.projects = ['No projects available'];
                
                // Make sure each property is an array
                const courses = Array.isArray(recommendations.courses) ? recommendations.courses : [recommendations.courses];
                const tutorials = Array.isArray(recommendations.tutorials) ? recommendations.tutorials : [recommendations.tutorials];
                const projects = Array.isArray(recommendations.projects) ? recommendations.projects : [recommendations.projects];
                
                lines.push(
                    ``,
                    `${skill.toUpperCase()}`,
                    `---------------------------`,
                    `Courses:`,
                    ...courses.map(course => `  • ${course}`),
                    ``,
                    `Tutorials:`,
                    ...tutorials.map(tutorial => `  • ${tutorial}`),
                    ``,
                    `Projects:`,
                    ...projects.map(project => `  • ${project}`)
                );
            }
        });
    }
    
    // Add footer
    lines.push(
        ``,
        `===========================`,
        `Generated by Skill Gap Analyzer`
    );
    
    return lines.join('\n');
}

// Function to reset the form
function resetForm() {
    jobRoleInput.value = '';
    resumeTextArea.value = '';
    resultsSection.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Add this at the end of your existing app.js file

// Expose key functions to global scope
// Add these lines at the end of app.js to expose the startAnalysis function globally
// and ensure the analyze button is properly connected

// Make startAnalysis function available globally
window.startAnalysis = function() {
    // Check if API key exists first
    const savedApiKey = localStorage.getItem('geminiApiKey');
    
    if (!savedApiKey) {
        showError('Please set your Gemini API key in the Home page settings first.');
        return;
    }
    
    // Initialize API with saved key
    if (window.geminiApi) {
        window.geminiApi.initialize(savedApiKey);
    } else {
        showError('Gemini API not available. Please refresh the page.');
        return;
    }
    
    // Get form values
    const jobRole = document.getElementById('jobRole').value.trim();
    const resumeText = document.getElementById('resumeText').value.trim();
    
    // Validate inputs
    if (!jobRole) {
        showError('Please enter a job role.');
        return;
    }
    
    if (!resumeText) {
        showError('Please paste your resume text.');
        return;
    }
    
    // Show loading indicator and hide results
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    
    // Call the actual analysis function if it exists
    if (typeof window.performAnalysis === 'function') {
        window.performAnalysis(jobRole, resumeText, savedApiKey);
    } else {
        // If the original analysis function can't be accessed, recreate core functionality
        analyzeSkills(jobRole, resumeText, savedApiKey);
    }
};

// Also make the showError function available globally
window.showError = function(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    } else {
        alert(message);
    }
};

// Function to handle analysis if the original can't be accessed
async function analyzeSkills(jobRole, resumeText, apiKey) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    
    try {
        // Initialize the Gemini API service with the API key
        window.geminiApi.initialize(apiKey);
        
        // Step 1: Get required skills for job role
        const requiredSkills = await window.geminiApi.getRequiredSkills(jobRole);
        
        // Step 2: Extract current skills from resume
        const currentSkills = await window.geminiApi.extractSkillsFromResume(resumeText);
        
        // Step 3: Identify skill gaps
        const skillGaps = requiredSkills.filter(skill => 
            !currentSkills.some(currentSkill => 
                currentSkill.toLowerCase() === skill.toLowerCase()
            )
        );
        
        // Step 4: Get learning recommendations for each skill gap
        const recommendations = {};
        for (const skill of skillGaps) {
            try {
                recommendations[skill] = await window.geminiApi.getLearningRecommendations(skill);
            } catch (error) {
                console.error(`Failed to get recommendations for ${skill}:`, error);
                recommendations[skill] = {
                    courses: ['API error - recommendations unavailable'],
                    tutorials: ['API error - recommendations unavailable'],
                    projects: ['API error - recommendations unavailable']
                };
            }
        }
        
        // Store analysis data
        const analysisData = {
            timestamp: new Date().toISOString(),
            jobRole,
            requiredSkills,
            currentSkills,
            skillGaps,
            recommendations
        };
        
        // Display results
        displayResults(analysisData);
        
        // Hide loading indicator and show results
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (resultsSection) resultsSection.classList.remove('hidden');
        
        // Scroll to results
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        window.showError(`Analysis failed: ${error.message}`);
        console.error(error);
    }
}

// Helper function to display results if needed
function displayResults(data) {
    const requiredSkillsList = document.getElementById('requiredSkillsList');
    const currentSkillsList = document.getElementById('currentSkillsList');
    const skillGapsList = document.getElementById('skillGapsList');
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    
    if (!requiredSkillsList || !currentSkillsList || !skillGapsList || !recommendationsContainer) {
        console.error('Results elements not found in the DOM');
        return;
    }
    
    // Clear previous results
    requiredSkillsList.innerHTML = '';
    currentSkillsList.innerHTML = '';
    skillGapsList.innerHTML = '';
    recommendationsContainer.innerHTML = '';
    
    // Ensure data arrays are actually arrays
    const requiredSkills = Array.isArray(data.requiredSkills) ? data.requiredSkills : [data.requiredSkills];
    const currentSkills = Array.isArray(data.currentSkills) ? data.currentSkills : [data.currentSkills];
    const skillGaps = Array.isArray(data.skillGaps) ? data.skillGaps : [data.skillGaps];
    
    // Display required skills
    requiredSkills.forEach(skill => {
        if (typeof skill === 'string' && skill.trim()) {
            const li = document.createElement('li');
            li.textContent = skill;
            requiredSkillsList.appendChild(li);
        }
    });
    
    // Display current skills
    currentSkills.forEach(skill => {
        if (typeof skill === 'string' && skill.trim()) {
            const li = document.createElement('li');
            li.textContent = skill;
            currentSkillsList.appendChild(li);
        }
    });
    
    // Display skill gaps with checkboxes
    if (skillGaps.length === 0) {
        const li = document.createElement('li');
        li.innerHTML = '<span class="text-green-600 font-medium">No skill gaps found! Your skills match the job requirements.</span>';
        skillGapsList.appendChild(li);
    } else {
        skillGaps.forEach(skill => {
            if (typeof skill === 'string' && skill.trim()) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <label class="flex items-start">
                        <input type="checkbox" class="skill-gap-checkbox mt-1 mr-2" value="${skill}" checked>
                        <span class="text-red-600">${skill}</span>
                    </label>
                `;
                skillGapsList.appendChild(li);
            }
        });
    }
    
    // Display recommendations
    updateRecommendations(data);
}

// Update recommendations based on selected skill gaps
function updateRecommendations(data) {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    if (!recommendationsContainer) return;
    
    recommendationsContainer.innerHTML = '';
    
    const selectedSkills = Array.from(document.querySelectorAll('.skill-gap-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedSkills.length === 0) {
        recommendationsContainer.innerHTML = '<p class="text-gray-500 italic">Select skill gaps to see recommendations</p>';
        return;
    }
    
    selectedSkills.forEach(skill => {
        const recommendations = data.recommendations[skill] || {
            courses: ['No recommendations available'],
            tutorials: ['No recommendations available'],
            projects: ['No recommendations available']
        };
        
        // Make sure each property exists
        if (!recommendations.courses) recommendations.courses = ['No courses available'];
        if (!recommendations.tutorials) recommendations.tutorials = ['No tutorials available'];
        if (!recommendations.projects) recommendations.projects = ['No projects available'];
        
        // Make sure each property is an array
        const courses = Array.isArray(recommendations.courses) ? recommendations.courses : [recommendations.courses];
        const tutorials = Array.isArray(recommendations.tutorials) ? recommendations.tutorials : [recommendations.tutorials];
        const projects = Array.isArray(recommendations.projects) ? recommendations.projects : [recommendations.projects];
        
        const skillSection = document.createElement('div');
        skillSection.className = 'mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0';
        
        skillSection.innerHTML = `
            <h3 class="text-xl font-medium text-blue-700 mb-4">${skill}</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Courses</th>
                            <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Tutorials</th>
                            <th class="px-4 py-2 bg-gray-100 text-left text-gray-700">Projects</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="px-4 py-2 align-top">
                                <ul class="list-disc pl-5 space-y-1">
                                    ${courses.map(course => `<li>${course}</li>`).join('')}
                                </ul>
                            </td>
                            <td class="px-4 py-2 align-top">
                                <ul class="list-disc pl-5 space-y-1">
                                    ${tutorials.map(tutorial => `<li>${tutorial}</li>`).join('')}
                                </ul>
                            </td>
                            <td class="px-4 py-2 align-top">
                                <ul class="list-disc pl-5 space-y-1">
                                    ${projects.map(project => `<li>${project}</li>`).join('')}
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        recommendationsContainer.appendChild(skillSection);
    });
}

// Add event listener to make sure the button is properly connected
document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (analyzeBtn) {
        // Remove existing listeners to prevent duplicates
        const newBtn = analyzeBtn.cloneNode(true);
        analyzeBtn.parentNode.replaceChild(newBtn, analyzeBtn);
        
        // Add a fresh event listener
        newBtn.addEventListener('click', function() {
            console.log('Analyze button clicked');
            if (typeof window.startAnalysis === 'function') {
                window.startAnalysis();
            } else {
                console.error('startAnalysis function not found');
                alert('Analysis function not available. Please refresh the page.');
            }
        });
    }
})})