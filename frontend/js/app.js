document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsForm');
    const input = document.getElementById('newsInput');
    const btn = document.getElementById('analyzeBtn');
    
    // Modules Elements
    const inputModule = form.parentElement;
    const loadingModule = document.getElementById('loadingIndicator');
    const resultModule = document.getElementById('resultModule');
    
    // Result Elements
    const predCircle = document.getElementById('predictionCircle');
    const predText = document.getElementById('predictionText');
    const confScore = document.getElementById('confidenceScore');
    const apiVerification = document.getElementById('apiVerification');
    const resetBtn = document.getElementById('resetBtn');

    // The URL where EXPRESS is running (not Python!)
    const EXPRESS_API_URL = 'http://localhost:5000';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // --- MODULE 4: Free Guest Search Limit ---
        const userNav = document.getElementById('userNav');
        const isGuest = userNav && userNav.classList.contains('hidden');

        if (isGuest) {
            let count = parseInt(localStorage.getItem('guest_search_count')) || 0;
            if (count >= 3) {
                // Show Signup Modal (Module 8)
                const signupModal = document.getElementById('signupModal');
                if (signupModal) {
                    signupModal.classList.remove('hidden');
                    signupModal.classList.add('flex');
                }
                return; // Stop analysis
            }
        }

        // UI Transition to Loading
        input.disabled = true;
        btn.classList.add('hidden');
        loadingModule.classList.remove('hidden');
        loadingModule.classList.add('flex');
        resultModule.classList.add('hidden');

        try {
            // Send to our Backend API (Module 5)
            const response = await fetch(`${EXPRESS_API_URL}/api/check-news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Server Error Occurred');
            }

            // Data mapping
            const { prediction, confidence, api_verification, ai_summary, credibility_score, matched_sources, category, manipulation_risk, is_cached } = result.data;
            
            // Format confidence as percentage
            const percentage = (confidence * 100).toFixed(1) + '%';

            // Apply styles based on prediction
            const predictionGlow = document.getElementById('predictionGlow');
            if (prediction === 'Fake') {
                predCircle.innerHTML = 'warning';
                predCircle.className = 'material-symbols-outlined text-red-500 text-8xl relative z-10';
                if(predictionGlow) predictionGlow.className = 'absolute w-32 h-32 bg-red-500/20 rounded-full blur-2xl';
                predText.className = 'text-4xl font-black text-red-500';
                predText.innerText = 'LIKELY FAKE';
            } else {
                predCircle.innerHTML = 'check_circle';
                predCircle.className = 'material-symbols-outlined text-green-500 text-8xl relative z-10';
                if(predictionGlow) predictionGlow.className = 'absolute w-32 h-32 bg-green-500/20 rounded-full blur-2xl';
                predText.className = 'text-4xl font-black text-green-500';
                predText.innerText = 'LIKELY REAL';
            }

            // --- MODULE 5: Cache Display ---
            const cacheBadge = document.getElementById('cacheBadge');
            if(cacheBadge) {
                if(is_cached) cacheBadge.classList.remove('hidden');
                else cacheBadge.classList.add('hidden');
            }

            // Update UI variables
            confScore.innerText = percentage;
            
            const credEl = document.getElementById('credibilityScore');
            if (credEl) {
                credEl.innerHTML = `${credibility_score}<span class="text-sm">/100</span>`;
            }
            
            // --- MODULE 3: Claim Category & Risk Level ---
            const catBadge = document.getElementById('claimCategoryBadge');
            if (catBadge) {
                catBadge.innerHTML = category || 'Other';
            }

            const riskBadge = document.getElementById('riskLevelBadge');
            if (riskBadge) {
                let riskTxt = 'High';
                let riskCol = 'bg-red-500/20 text-red-500 border-red-500/30';
                if (credibility_score > 75) { riskTxt = 'Low'; riskCol = 'bg-green-500/20 text-green-400 border-green-500/30'; }
                else if (credibility_score > 45) { riskTxt = 'Moderate'; riskCol = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'; }
                riskBadge.innerText = `Verification Risk: ${riskTxt}`;
                riskBadge.className = `${riskCol} text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider`;
            }

            // --- MODULE 4: Manipulation Risk Badge ---
            const manipulationBadge = document.getElementById('manipulationRiskBadge');
            const manipulationTitle = document.getElementById('manipulationTitle');
            const manipulationDesc = document.getElementById('manipulationDesc');
            const manipContainer = document.getElementById('manipContainer');
            const manipIconContainer = document.getElementById('manipIconContainer');
            const manipIcon = document.getElementById('manipIcon');

            if (manipulationBadge) {
                if (manipulation_risk === "HIGH") {
                    manipulationBadge.innerText = `HIGH`;
                    manipContainer.className = "bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4";
                    manipIconContainer.className = "bg-red-500/20 p-2 rounded-lg";
                    manipIcon.className = "material-symbols-outlined text-red-500";
                    manipulationTitle.className = "text-red-500 font-bold text-sm";
                    manipulationDesc.innerText = "Structural anomalies detected in syntax patterns.";
                    manipulationDesc.classList.add('heartbeat');
                } else {
                    manipulationBadge.innerText = `LOW`;
                    manipContainer.className = "bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-4";
                    manipIconContainer.className = "bg-green-500/20 p-2 rounded-lg";
                    manipIcon.className = "material-symbols-outlined text-green-500";
                    manipulationTitle.className = "text-green-500 font-bold text-sm";
                    manipulationDesc.innerText = "Language appears objective and neutral.";
                    manipulationDesc.classList.remove('heartbeat');
                }
            }
            
            // Module 7 API verification formatting
            if (api_verification.includes('High')) {
                apiVerification.innerHTML = `<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span class="text-sm text-slate-200">${api_verification}</span>`;
            } else if (api_verification.includes('Moderate')) {
                apiVerification.innerHTML = `<div class="w-2 h-2 rounded-full bg-yellow-500"></div><span class="text-sm text-slate-200">${api_verification}</span>`;
            } else {
                apiVerification.innerHTML = `<div class="w-2 h-2 rounded-full bg-slate-500"></div><span class="text-sm text-slate-200">${api_verification}</span>`;
            }

            // Populate Gemini AI Summary
            const aiSummaryElement = document.getElementById('aiSummaryText');
            if(aiSummaryElement) {
                aiSummaryElement.innerText = ai_summary || "No summary provided.";
            }

            // --- MODULE 2 & 7: Render Trusted Sources & Evidence ---
            const sourcesContainer = document.getElementById('sourcesContainer');
            const trustedSourcesList = document.getElementById('trustedSourcesList');
            const evidenceContainer = document.getElementById('evidenceContainer');
            const resultsGrid = document.getElementById('resultsGrid');
            
            if (matched_sources && matched_sources.length > 0) {
                trustedSourcesList.innerHTML = ''; // clear previous
                if (evidenceContainer) evidenceContainer.innerHTML = '';
                
                // Get sanitized claim words to match & highlight
                const userWords = text.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3).map(w => w.toLowerCase());
                
                matched_sources.forEach(source => {
                    // Create colorful badges based on internal credibility mapping string
                    let pct = Math.round(source.score * 100);
                    trustedSourcesList.innerHTML += `
                            <div class="px-3 py-2 glass-card rounded border border-primary/20 flex items-center gap-2 group cursor-pointer hover:bg-primary/10 transition-all">
                                <span class="material-symbols-outlined text-sm">link</span>
                                <span class="text-xs font-bold">${source.name}</span>
                            </div>
                    `;
                    
                    // --- MODULE 7: Dynamic Highlighting of Evidence ---
                    if (evidenceContainer && source.description) {
                        let highlightedDesc = source.description;
                        
                        // Parse HTML safely, find user words, and dynamically highlight them!
                        userWords.forEach(word => {
                            const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                            highlightedDesc = highlightedDesc.replace(regex, '<mark class="bg-yellow-500/80 text-background-dark px-1 mx-1 rounded-sm fw-bold"><u>$1</u></mark>');
                        });
                        
                        evidenceContainer.innerHTML += `
                                <div class="bg-white/5 rounded border border-glass-border flex flex-col gap-2 p-3">
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm text-primary">quote</span>
                                        <h6 class="text-primary font-bold text-xs m-0">${source.name} Snippet:</h6>
                                    </div>
                                    <p class="mb-0 text-slate-300 opacity-75 text-xs italic">"...${highlightedDesc}..."</p>
                                </div>
                        `;
                    }
                });
            } else {
                // Generate beautiful empty state to perfectly maintain template layout
                trustedSourcesList.innerHTML = `
                    <div class="px-3 py-2 glass-card rounded border border-red-500/20 flex items-center gap-2 w-full">
                        <span class="material-symbols-outlined text-sm text-red-500">warning</span>
                        <span class="text-xs font-bold text-slate-300">No Reliable publishers found</span>
                    </div>
                `;
                if (evidenceContainer) {
                    evidenceContainer.innerHTML = `
                        <div class="bg-white/5 rounded border border-glass-border flex flex-col items-center justify-center p-6 text-center h-full gap-2">
                            <span class="material-symbols-outlined text-3xl text-slate-600">travel_explore</span>
                            <p class="text-slate-500 text-xs italic">The AI could not confidently verify this claim against live publisher databases.</p>
                        </div>
                    `;
                }
            }
            
            // Enforce default grid layout
            sourcesContainer.classList.remove('hidden');
            if (resultsGrid) {
                resultsGrid.classList.remove('lg:grid-cols-2');
                resultsGrid.classList.add('lg:grid-cols-3');
            }

            // Hide loading, Show result
            // --- MODULE 4: Increment Guest Count & Store Local History ---
            if (isGuest) {
                let count = parseInt(localStorage.getItem('guest_search_count')) || 0;
                localStorage.setItem('guest_search_count', count + 1);

                // Save the ID of this specific search for the guest history page
                let guestHistory = JSON.parse(localStorage.getItem('guest_history_ids')) || [];
                guestHistory.push(result.data.id);
                localStorage.setItem('guest_history_ids', JSON.stringify(guestHistory));
            }

            loadingModule.classList.remove('flex');
            loadingModule.classList.add('hidden');
            resultModule.classList.remove('hidden');
            resultModule.classList.add('flex');
            input.disabled = false;
            btn.classList.remove('hidden');

        } catch (err) {
            console.error(err);
            alert(`Error analyzing text: ${err.message}`);
            // Revert UI on crash
            loadingModule.classList.remove('flex');
            loadingModule.classList.add('hidden');
            input.disabled = false;
            btn.classList.remove('hidden');
        }
    });

    const resetMainBtn = document.getElementById('resetMainBtn');
    
    const resetHandler = () => {
        // Reset the form layout dynamically (Single Page App feel)
        input.value = '';
        input.disabled = false;
        btn.classList.remove('hidden');
        resultModule.classList.remove('flex');
        resultModule.classList.add('hidden');
    };

    if (resetBtn) resetBtn.addEventListener('click', resetHandler);
    if (resetMainBtn) resetMainBtn.addEventListener('click', resetHandler);
});
