// Create this as a new JS file: analysis-fix.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Analysis fix script loaded');
    
    // Directly implement the analysis function here
    window.performSkillAnalysis = async function() {
        console.log('Starting skill analysis');
        
        // Get references to key elements
        const jobRoleInput = document.getElementById('jobRole');
        const resumeTextArea = document.getElementById('resumeText');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const resultsSection = document.getElementById('resultsSection');
        const requiredSkillsList = document.getElementById('requiredSkillsList');
        const currentSkillsList = document.getElementById('currentSkillsList');
        const skillGapsList = document.getElementById('skillGapsList');
        const recommendationsContainer = document.getElementById('recommendationsContainer');
        
        // Helper function for errors
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
        
        // Get input values
        const jobRole = jobRoleInput ? jobRoleInput.value.trim() : '';
        const resumeText = resumeTextArea ? resumeTextArea.value.trim() : '';
        
        // Get API key
        const apiKey = localStorage.getItem('geminiApiKey');
        
        // Validate inputs
        if (!jobRole) {
            showError('Please enter a job role.');
            return;
        }
        
        if (!resumeText) {
            showError('Please paste your resume text.');
            return;
        }
        
        if (!apiKey) {
            showError('Please set your Gemini API key in the Home page settings first.');
            return;
        }
        
        // Show loading indicator
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        if (resultsSection) resultsSection.classList.add('hidden');
        
        try {
            // Initialize API
            if (window.geminiApi) {
                window.geminiApi.initialize(apiKey);
            } else {
                throw new Error('Gemini API service not available');
            }
            
            // Step 1: Get required skills
            const requiredSkills = await window.geminiApi.getRequiredSkills(jobRole);
            console.log('Required skills:', requiredSkills);
            
            // Step 2: Extract current skills
            const currentSkills = await window.geminiApi.extractSkillsFromResume(resumeText);
            console.log('Current skills:', currentSkills);
            
            // Step 3: Identify skill gaps
            const skillGaps = requiredSkills.filter(skill => 
                !currentSkills.some(currentSkill => 
                    currentSkill.toLowerCase() === skill.toLowerCase()
                )
            );
            console.log('Skill gaps:', skillGaps);
            
            // Step 4: Get recommendations
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
            
            // Create analysis data
            const analysisData = {
                timestamp: new Date().toISOString(),
                jobRole,
                requiredSkills,
                currentSkills,
                skillGaps,
                recommendations
            };
            
            // Save in global scope for access by other functions
            window.analysisData = analysisData;
            
            // Display results
            displayResults(analysisData);
            
            // Hide loading, show results
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            if (resultsSection) resultsSection.classList.remove('hidden');
            
            // Scroll to results
            if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Analysis failed:', error);
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            showError(`Analysis failed: ${error.message}`);
        }
    };
    
    // Helper function to display results
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
                    
                    // Add event listener to checkbox
                    const checkbox = li.querySelector('.skill-gap-checkbox');
                    checkbox.addEventListener('change', () => updateRecommendations(data));
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
    
    // Connect button to analysis function
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        // Create a fresh button to remove any existing event listeners
        const newBtn = analyzeBtn.cloneNode(true);
        analyzeBtn.parentNode.replaceChild(newBtn, analyzeBtn);
        
        // Add our direct event listener
        newBtn.addEventListener('click', function(e) {
            console.log('Analyze button clicked - direct handler');
            e.preventDefault();
            window.performSkillAnalysis();
        });
        
        console.log('Successfully connected analyze button to performSkillAnalysis function');
    } else {
        console.error('Could not find analyze button');
    }
});