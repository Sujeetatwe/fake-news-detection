let allHistoryData = [];
let currentPage = 1;
const itemsPerPage = 8; // Show 8 items per page

document.addEventListener('DOMContentLoaded', async () => {
    const loadingIndicator = document.getElementById('loadingIndicatorHistory');
    const noDataMessage = document.getElementById('noDataMessage');
    const EXPRESS_API_URL = 'http://localhost:5000';

    try {
        let response;
        
        // --- MODULE 6: Secure the History Page & Fetch User Data ---
        const authResponse = await fetch(`${EXPRESS_API_URL}/api/auth/me`);
        
        if (!authResponse.ok) {
            // User is a Guest! Display Guest Navbar and fetch their local history.
            const guestNav = document.getElementById('guestNav');
            const userAvatarGroup = document.getElementById('userAvatar');
            if(guestNav) guestNav.classList.remove('hidden');
            if(userAvatarGroup) userAvatarGroup.parentElement.classList.add('hidden');
            
            // Get local storage IDs
            const guestIds = JSON.parse(localStorage.getItem('guest_history_ids')) || [];
            
            if (guestIds.length === 0) {
                document.getElementById('tableContainer').classList.add('hidden');
                noDataMessage.classList.remove('hidden');
                loadingIndicator.classList.add('hidden');
                return;
            }

            response = await fetch(`${EXPRESS_API_URL}/api/history/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: guestIds })
            });

        } else {
            // User is logged in!
            const authData = await authResponse.json();
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.src = authData.user.profile_picture;
                userAvatar.parentElement.classList.remove('hidden');
            }
            const guestNav = document.getElementById('guestNav');
            if(guestNav) guestNav.classList.add('hidden');

            // Fetch user-specific history
            response = await fetch(`${EXPRESS_API_URL}/api/history`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch history from server.');
        }

        allHistoryData = result.data;
        loadingIndicator.classList.add('hidden'); 

        if (allHistoryData.length === 0) {
            document.getElementById('tableContainer').classList.add('hidden');
            noDataMessage.classList.remove('hidden');
            return;
        }

        document.getElementById('tableContainer').classList.remove('hidden');
        
        // --- MODULE 6: Populate Analytics Dashboard ---
        if (result.analytics) {
            document.getElementById('statTotal').innerText = result.analytics.total_claims;
            document.getElementById('statFake').innerText = result.analytics.fake_news;
            document.getElementById('statReal').innerText = result.analytics.real_news;
            document.getElementById('statCred').innerText = result.analytics.avg_credibility + ' / 100';
            document.getElementById('analyticsDashboard').classList.remove('hidden');
        }

        document.getElementById('paginationControls').classList.remove('hidden');
        document.getElementById('paginationControls').classList.add('flex');
        
        renderTable();
        setupPagination();
        
        // Modal logic
        const detailsModal = document.getElementById('detailsModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeModalBtnTop = document.getElementById('closeModalBtnTop');

        const hideModal = () => {
            detailsModal.classList.add('hidden');
            detailsModal.classList.remove('flex');
        };
        if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
        if (closeModalBtnTop) closeModalBtnTop.addEventListener('click', hideModal);

        // Close on outside click (click on backdrop, not on modal box)
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) hideModal();
        });

        // Add event listeners for Modal Buttons (Event Delegation)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-details-btn');
            if (btn) {
                const itemIndex = btn.getAttribute('data-index');
                const item = allHistoryData[itemIndex];

                // Populate Modal Data
                document.getElementById('modalNewsText').textContent = item.news_text;
                document.getElementById('modalPrediction').innerHTML = item.prediction === 'Fake' ? '<span class="text-red-500 font-black">FAKE</span>' : '<span class="text-emerald-500 font-black">REAL</span>';
                document.getElementById('modalConfidence').textContent = (item.confidence * 100).toFixed(1) + '%';
                
                // --- MODULE 3: Category ---
                document.getElementById('modalCategory').innerText = item.claim_category || 'Other';
                
                const credEl = document.getElementById('modalCredibility');
                const credVal = item.credibility_score || 0;
                let credColor = credVal > 70 ? 'text-emerald-500' : (credVal > 40 ? 'text-amber-400' : 'text-red-500');
                let credText = credVal > 70 ? 'HIGH' : (credVal > 40 ? 'MEDIUM' : 'LOW');
                credEl.innerHTML = `<span class="${credColor}">${credText}</span>`;
                
                let modalApiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${item.api_verification}</span>`;
                if (item.api_verification.includes('High')) {
                    modalApiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"><span class="material-symbols-outlined text-sm mr-1">check</span> Verified Sources</span>`;
                } else if (item.api_verification.includes('Moderate')) {
                    modalApiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"><span class="material-symbols-outlined text-sm mr-1">contrast</span> Mixed Sources</span>`;
                } else if (item.api_verification.includes('Low')) {
                    modalApiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"><span class="material-symbols-outlined text-sm mr-1">close</span> Unverified</span>`;
                }
                document.getElementById('modalApiVerify').innerHTML = modalApiBadge;

                if (item.ai_summary) {
                    document.getElementById('modalAiSummary').innerHTML = `<p>${item.ai_summary.replace(/\n/g, '<br>')}</p>`;
                } else {
                    document.getElementById('modalAiSummary').innerHTML = '<p>No AI Summary was generated for this entry.</p>';
                }

                // Show Modal safely tailwind way
                detailsModal.classList.remove('hidden');
                detailsModal.classList.add('flex');
            }
        });

    } catch (err) {
        loadingIndicator.classList.add('hidden');
        document.getElementById('tableContainer').classList.remove('hidden');
        document.getElementById('historyTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4 font-bold">Error: ${err.message}</td></tr>`;
    }
});

function renderTable() {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = allHistoryData.slice(startIndex, endIndex);

    paginatedItems.forEach((item, relativeIndex) => {
        const absoluteIndex = startIndex + relativeIndex;
        const tr = document.createElement('tr');
        
        const textPreview = item.news_text.length > 70 ? item.news_text.substring(0, 70) + '...' : item.news_text;
        const predBadge = item.prediction === 'Fake' 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">FAKE</span>' 
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">REAL</span>';
        const confidencePercent = (item.confidence * 100).toFixed(1) + '%';
        
        let apiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">${item.api_verification}</span>`;
        if (item.api_verification.includes('High')) {
            apiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">VERIFIED</span>`;
        } else if (item.api_verification.includes('Moderate')) {
            apiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">MIXED</span>`;
        } else if (item.api_verification.includes('Low')) {
            apiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">UNVERIFIED</span>`;
        } else if (item.api_verification.includes('Setup Required')) {
            apiBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">KEY REQ</span>`;
        }

        const date = new Date(item.created_at).toLocaleDateString();

        tr.className = 'hover:bg-primary/5 transition-colors group';
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200 max-w-xs truncate" title="${item.news_text}">${textPreview}</td>
            <td class="px-6 py-4">${predBadge}</td>
            <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${confidencePercent}</span>
                </div>
            </td>
            <td class="px-6 py-4">${apiBadge}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${date}</td>
            <td class="px-6 py-4 text-right">
                <button class="view-details-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-background-dark text-xs font-bold hover:neon-glow transition-all" data-index="${absoluteIndex}">
                    <span class="material-symbols-outlined text-sm">visibility</span> View
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    const totalStr = allHistoryData.length;
    const startStr = totalStr === 0 ? 0 : startIndex + 1;
    const endStr = Math.min(endIndex, totalStr);
    document.getElementById('pageInfo').textContent = `Showing ${startStr} to ${endStr} of ${totalStr} entries`;
}

function setupPagination() {
    const paginationUl = document.getElementById('paginationUl');
    paginationUl.innerHTML = '';
    const pageCount = Math.ceil(allHistoryData.length / itemsPerPage);
    
    if (pageCount <= 1) return;

    // Prev Button logic 
    const prevBtn = document.getElementById('prevBtn');
    if(currentPage === 1) {
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    prevBtn.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            setupPagination();
        }
    };

    // Page Numbers
    for (let i = 1; i <= pageCount; i++) {
        const span = document.createElement('span');
        
        if (currentPage === i) {
            span.className = 'h-8 w-8 flex items-center justify-center bg-primary text-background-dark rounded-lg text-xs font-bold neon-glow cursor-pointer';
        } else {
            span.className = 'h-8 w-8 flex items-center justify-center text-slate-500 hover:text-primary text-xs cursor-pointer transition-colors';
        }
        
        span.textContent = i;
        span.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            renderTable();
            setupPagination();
        });
        paginationUl.appendChild(span);
    }

    // Next Button logic
    const nextBtn = document.getElementById('nextBtn');
    if (currentPage === pageCount) {
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    nextBtn.onclick = (e) => {
        e.preventDefault();
        if (currentPage < pageCount) {
            currentPage++;
            renderTable();
            setupPagination();
        }
    };
}
// --- MODULE 1 & 7: Logout Handler ---
window.handleLogout = async () => {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            window.location.href = '/'; // Kick back to home
        }
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
