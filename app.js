// Local application state control variables
let appState = { jambRegNumber: "" };

const coreSubjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", 
    "Biology", "Economics", "Government", "Literature in English", 
    "Geography", "Agricultural Science"
];

// Hydrate O'Level Select Rows on System Startup
const olevelContainer = document.getElementById('olevel-rows');
if (olevelContainer) {
    let rowsHtml = "";
    for (let i = 1; i <= 5; i++) {
        rowsHtml += `
            <div class="grid grid-cols-12 gap-2 item-row mb-2">
                <select class="col-span-6 px-2 py-2 border text-xs rounded-lg select-sub bg-white outline-none focus:border-emerald-700">
                    <option value="">-- Choose Subject --</option>
                    ${coreSubjects.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                </select>
                <select class="col-span-3 px-2 py-2 border text-xs rounded-lg select-grade bg-white outline-none focus:border-emerald-700">
                    <option value="">Grade</option>
                    ${["A1","B2","B3","C4","C5","C6","D7","E8","F9"].map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
                <select class="col-span-3 px-2 py-2 border text-xs rounded-lg select-sitting bg-white outline-none focus:border-emerald-700">
                    <option value="1">Sitting 1</option>
                    <option value="2">Sitting 2</option>
                </select>
            </div>
        `;
    }
    olevelContainer.innerHTML = rowsHtml;
}

/* ==========================================
   VIEW TOGGLE LOGIC (WITH SECURE ACCESS PIN)
   ========================================== */
const portalView = document.getElementById('portal-view-container');
const adminView = document.getElementById('admin-view-container');
const viewPortalBtn = document.getElementById('view-portal-btn');
const viewAdminBtn = document.getElementById('view-admin-btn');

function toggleInterface(target) {
    if (target === 'admin') {
        // Secure administration gate control trigger prompt
        const passwordCheck = prompt("ENTER ACCESS PIN FOR UNIOSUN ADMISSIONS BOARD:");
        
        if (passwordCheck === "UNIOSUN2026") {
            portalView.classList.add('hidden');
            adminView.classList.remove('hidden');
            viewAdminBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-sm";
            viewPortalBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
            renderAdminDashboard();
        } else if (passwordCheck !== null) {
            alert("ACCESS DENIED: Invalid Security Pin Number.");
        }
    } else {
        adminView.classList.add('hidden');
        portalView.classList.remove('hidden');
        viewPortalBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-sm";
        viewAdminBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
    }
}

viewPortalBtn.addEventListener('click', () => toggleInterface('portal'));
viewAdminBtn.addEventListener('click', () => toggleInterface('admin'));


/* ==========================================
   STEP 1 & STEP 2 APPLICANT LOGIC HANDLERS
   ========================================== */
document.getElementById('btn-verify').addEventListener('click', () => {
    const input = document.getElementById('jamb-num').value.trim();
    const err = document.getElementById('step-1-error');
    
    if(input.length < 8) {
        err.innerText = "Error: Please enter a valid JAMB Registration Number.";
        err.classList.remove('hidden');
        return;
    }
    err.classList.add('hidden');
    appState.jambRegNumber = input.toUpperCase();

    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
});

document.getElementById('portal-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const olevelItems = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const sub = row.querySelector('.select-sub').value;
        const grade = row.querySelector('.select-grade').value;
        const sitting = row.querySelector('.select-sitting').value;
        if(sub && grade) olevelItems.push({ subject: sub, grade: grade, sitting: parseInt(sitting, 10) });
    });

    const payload = {
        id: Date.now().toString(),
        jambNumber: appState.jambRegNumber,
        biodata: {
            full_name: document.getElementById('bio-name').value.trim() || "OGUNDELE AISHAT OMOLAYO",
            gender: document.getElementById('bio-gender').value,
            phone_number: document.getElementById('bio-phone').value.trim(),
            home_address: document.getElementById('bio-address').value.trim(),
            state_of_origin: document.getElementById('bio-state').value.trim() || "Ogun",
            lga_of_origin: document.getElementById('bio-lga').value.trim()
        },
        nextOfKin: {
            full_name: document.getElementById('nok-name').value.trim() || "OGUNDELE SHAKIRU",
            relationship: document.getElementById('nok-relation').value,
            phone_number: document.getElementById('nok-phone').value.trim(),
            home_address: document.getElementById('nok-address').value.trim()
        },
        academic: {
            utme_score: parseInt(document.getElementById('acad-score').value, 10),
            course_applied: document.getElementById('acad-course').value,
            num_olevel_sittings: parseInt(document.querySelector('input[name="sittings"]:checked').value, 10)
        },
        olevels: olevelItems
    };

    // Store record objects inside local storage array sets
    let existingApplications = JSON.parse(localStorage.getItem('uniosun_applications')) || [];
    existingApplications = existingApplications.filter(app => app.jambNumber !== payload.jambNumber);
    existingApplications.push(payload);
    localStorage.setItem('uniosun_applications', JSON.stringify(existingApplications));

    // Render Slip Summary Markup
    document.getElementById('slip-content').innerHTML = `
        <div class="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg mb-6 no-print flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="bg-emerald-600 text-white rounded-full p-1.5 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                    <p class="text-sm font-bold text-emerald-900">Application Saved Successfully!</p>
                    <p class="text-xs text-emerald-700">Please review your information carefully before locking your application details below.</p>
                </div>
            </div>
        </div>

        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div class="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Part A: Biodata Details</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 p-5 text-slate-800">
                <div class="sm:col-span-2 pb-2 border-b border-slate-100"><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Full Name</span><strong class="text-lg uppercase font-bold tracking-tight text-slate-900">${payload.biodata.full_name}</strong></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">JAMB Registration Number</span><strong class="text-sm font-mono tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 inline-block">${payload.jambNumber}</strong></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Course Choice</span><strong class="text-sm uppercase text-slate-900">${payload.academic.course_applied}</strong></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Gender</span><p class="text-sm font-medium">${payload.biodata.gender}</p></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Phone Number</span><p class="text-sm font-mono">${payload.biodata.phone_number}</p></div>
                <div class="sm:col-span-2"><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Home Address</span><p class="text-sm font-medium uppercase text-slate-700">${payload.biodata.home_address}</p></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">State of Origin</span><p class="text-sm font-medium uppercase">${payload.biodata.state_of_origin}</p></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">LGA of Origin</span><p class="text-sm font-medium uppercase">${payload.biodata.lga_of_origin}</p></div>
            </div>
        </div>

        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white mt-4">
            <div class="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Part B: Next of Kin</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 text-slate-800">
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Next of Kin Name & Relationship</span><p class="text-sm font-semibold">${payload.nextOfKin.full_name} <span class="text-xs text-slate-500 font-normal">(${payload.nextOfKin.relationship})</span></p></div>
                <div><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Next of Kin Phone Number</span><p class="text-sm font-mono font-medium">${payload.nextOfKin.phone_number}</p></div>
                <div class="sm:col-span-2"><span class="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Next of Kin Address</span><p class="text-xs text-slate-600 uppercase">${payload.nextOfKin.home_address}</p></div>
            </div>
        </div>

        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white mt-4">
            <div class="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Part C: Academic Performance</h3>
            </div>
            <div class="p-5">
                <div class="flex items-center space-x-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">JAMB Score:</span>
                    <span class="bg-emerald-800 text-white font-mono px-3 py-1 rounded text-base font-bold shadow-sm">${payload.academic.utme_score} / 400</span>
                </div>
                
                <p class="text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">O'Level Subjects Uploaded:</p>
                <div class="bg-white border rounded-lg overflow-hidden">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 border-b text-slate-500 font-bold">
                                <th class="p-2.5">Subject</th>
                                <th class="p-2.5 text-center">Grade</th>
                                <th class="p-2.5 text-right">Sitting</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y text-slate-700 font-medium">
                            ${payload.olevels.map(o => `
                                <tr class="hover:bg-slate-50/50">
                                    <td class="p-2.5 font-semibold text-slate-900">${o.subject}</td>
                                    <td class="p-2.5 text-center"><span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold font-mono">${o.grade}</span></td>
                                    <td class="p-2.5 text-right text-slate-500">Sitting ${o.sitting}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('btn-lock').addEventListener('click', () => {
    alert("Application details successfully locked onto institutional records storage!");
    document.getElementById('btn-lock').classList.add('hidden');
    document.getElementById('btn-print').classList.remove('hidden');
});


/* ==========================================
   ADMIN DASHBOARD PROCESSING ENGINE LOGIC
   ========================================== */
function renderAdminDashboard() {
    const apps = JSON.parse(localStorage.getItem('uniosun_applications')) || [];
    const tbody = document.getElementById('admin-table-body');
    const emptyState = document.getElementById('admin-empty-state');
    
    const mTotal = document.getElementById('metric-total');
    const mAvgJamb = document.getElementById('metric-avg-jamb');
    const mFemale = document.getElementById('metric-female');
    const mOgun = document.getElementById('metric-ogun');

    if (apps.length === 0) {
        tbody.innerHTML = "";
        emptyState.classList.remove('hidden');
        mTotal.innerText = "0";
        mAvgJamb.innerText = "0";
        mFemale.innerText = "0";
        mOgun.innerText = "0";
        return;
    }
    
    emptyState.classList.add('hidden');
    
    let totalJamb = 0;
    let femaleCount = 0;
    let ogunCount = 0;

    tbody.innerHTML = apps.map(app => {
        totalJamb += app.academic.utme_score;
        if(app.biodata.gender.toLowerCase() === 'female') femaleCount++;
        if(app.biodata.state_of_origin.toLowerCase() === 'ogun') ogunCount++;

        return `
            <tr class="hover:bg-slate-50 transition-colors" id="row-${app.id}">
                <td class="p-4 font-mono font-bold tracking-wider text-emerald-800">${app.jambNumber}</td>
                <td class="p-4 font-semibold text-slate-900 uppercase">${app.biodata.full_name}</td>
                <td class="p-4">${app.biodata.gender}</td>
                <td class="p-4 uppercase text-slate-500 font-medium">${app.biodata.state_of_origin} (${app.biodata.lga_of_origin})</td>
                <td class="p-4"><span class="bg-slate-100 font-mono font-bold px-2 py-1 rounded text-slate-800">${app.academic.utme_score}</span></td>
                <td class="p-4 font-medium text-slate-600">${app.academic.course_applied}</td>
                <td class="p-4 text-center">
                    <button onclick="deleteSingleRecord('${app.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded border border-red-200 transition-all text-[11px] uppercase tracking-wide">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    mTotal.innerText = apps.length;
    mAvgJamb.innerText = Math.round(totalJamb / apps.length);
    mFemale.innerText = femaleCount;
    mOgun.innerText = ogunCount;
}

function deleteSingleRecord(id) {
    if(confirm("Are you sure you want to remove this applicant's profile data?")) {
        let apps = JSON.parse(localStorage.getItem('uniosun_applications')) || [];
        apps = apps.filter(app => app.id !== id);
        localStorage.setItem('uniosun_applications', JSON.stringify(apps));
        renderAdminDashboard();
    }
}

document.getElementById('admin-clear-all').addEventListener('click', () => {
    if(confirm("CRITICAL WARNING:\nYou are about to execute a clear procedure. This wipes out ALL candidate files currently saved in local memory.\n\nDo you want to continue?")) {
        localStorage.removeItem('uniosun_applications');
        renderAdminDashboard();
    }
});

/* ==========================================
   DATA EXPORTER HANDLING UTILITIES (CSV COMPILES)
   ========================================== */
document.getElementById('admin-download-csv').addEventListener('click', () => {
    const apps = JSON.parse(localStorage.getItem('uniosun_applications')) || [];
    if(apps.length === 0) {
        alert("The storage array is empty. There is no candidate data to construct a file download with.");
        return;
    }

    let csvRows = [
        ["JAMB Reg Number", "Full Name", "Gender", "Phone Number", "State of Origin", "LGA", "Next of Kin", "Kin Relation", "UTME Score", "Course Chosen"]
    ];

    apps.forEach(app => {
        csvRows.push([
            app.jambNumber,
            app.biodata.full_name,
            app.biodata.gender,
            app.biodata.phone_number,
            app.biodata.state_of_origin,
            app.biodata.lga_of_origin,
            app.nextOfKin.full_name,
            app.nextOfKin.relationship,
            app.academic.utme_score,
            app.academic.course_applied
        ]);
    });

    const csvContent = csvRows.map(row => 
        row.map(value => {
            let stringVal = value === null || value === undefined ? "" : String(value);
            if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        }).join(",")
    ).join("\n");

    const universalBOM = "\uFEFF"; 
    const fileBlob = new Blob([universalBOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.href = URL.createObjectURL(fileBlob);
    downloadAnchor.download = `UNIOSUN_Applicants_Export_${new Date().toISOString().slice(0,10)}.csv`;
    downloadAnchor.style.visibility = 'hidden';
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
});