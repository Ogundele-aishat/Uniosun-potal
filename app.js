// --- STATE MANAGEMENT ---
let localDb = JSON.parse(localStorage.getItem('uniosun_portal_db')) || [];
let activeJambNumber = "";

const coreSubjects = ["English Language", "Mathematics", "Subject 3 Choice", "Subject 4 Choice", "Subject 5 Choice"];
const gradeOptions = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

// --- DOM ELEMENT SELECTORS ---
const viewPortalBtn = document.getElementById('view-portal-btn');
const viewAdminBtn = document.getElementById('view-admin-btn');
const portalViewContainer = document.getElementById('portal-view-container');
const adminViewContainer = document.getElementById('admin-view-container');

const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');

const verifyBtn = document.getElementById('btn-verify');
const jambInput = document.getElementById('jamb-num');
const step1Error = document.getElementById('step-1-error');
const portalForm = document.getElementById('portal-form');
const olevelRowsContainer = document.getElementById('olevel-rows');
const slipContent = document.getElementById('slip-content');
const lockBtn = document.getElementById('btn-lock');
const printBtn = document.getElementById('btn-print');

const adminTableBody = document.getElementById('admin-table-body');
const adminEmptyState = document.getElementById('admin-empty-state');
const metricTotal = document.getElementById('metric-total');
const metricAvgJamb = document.getElementById('metric-avg-jamb');
const metricFemale = document.getElementById('metric-female');
const metricOgun = document.getElementById('metric-ogun');

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    generateOlevelRows();
    updateAdminDashboard();
});

// --- NAVIGATION SWITCHING ---
viewPortalBtn.addEventListener('click', () => toggleView('portal'));
viewAdminBtn.addEventListener('click', () => {
    toggleView('admin');
    updateAdminDashboard();
});

function toggleView(view) {
    if (view === 'portal') {
        portalViewContainer.classList.remove('hidden');
        adminViewContainer.classList.add('hidden');
        viewPortalBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-sm";
        viewAdminBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
    } else {
        portalViewContainer.classList.add('hidden');
        adminViewContainer.classList.remove('hidden');
        viewAdminBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-sm";
        viewPortalBtn.className = "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
    }
}

// --- DYNAMIC O'LEVEL FORM GENERATION ---
function generateOlevelRows() {
    olevelRowsContainer.innerHTML = "";
    coreSubjects.forEach((subject, idx) => {
        const row = document.createElement('div');
        row.className = "flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded border border-slate-200/60";
        
        let subjectField = `<input type="text" value="${idx < 2 ? subject : ''}" placeholder="Enter Subject Name" required ${idx < 2 ? 'readonly class="w-full sm:w-2/3 px-2 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded outline-none border"' : 'class="w-full sm:w-2/3 px-2 py-1.5 text-xs bg-white rounded outline-none border focus:border-emerald-700"' } data-role="subject">`;
        let gradeField = `<select required class="w-full sm:w-1/3 px-2 py-1.5 text-xs bg-white rounded outline-none border focus:border-emerald-700" data-role="grade">
            <option value="">Grade</option>
            ${gradeOptions.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>`;

        row.innerHTML = subjectField + gradeField;
        olevelRowsContainer.appendChild(row);
    });
}

// --- STEP 1: VERIFY/LOGIN ENTRY ---
verifyBtn.addEventListener('click', () => {
    const value = jambInput.value.trim().toUpperCase();
    if (value.length < 5) {
        step1Error.textContent = "Please enter a valid academic registration number reference.";
        step1Error.classList.remove('hidden');
        return;
    }
    step1Error.classList.add('hidden');
    activeJambNumber = value;
    
    // Check if user already exists in local DB to allow easy login access
    const existingCandidate = localDb.find(c => c.jambNo === activeJambNumber);
    if (existingCandidate) {
        populateFormDetails(existingCandidate);
    } else {
        // Clear previous input contents if it's a completely new registration attempt
        portalForm.reset();
        generateOlevelRows();
    }

    step1.classList.add('hidden');
    step2.classList.remove('hidden');
});

function populateFormDetails(candidate) {
    document.getElementById('bio-name').value = candidate.name;
    document.getElementById('bio-gender').value = candidate.gender;
    document.getElementById('bio-phone').value = candidate.phone;
    document.getElementById('bio-address').value = candidate.address;
    document.getElementById('bio-state').value = candidate.state;
    document.getElementById('bio-lga').value = candidate.lga;
    document.getElementById('nok-name').value = candidate.nokName;
    document.getElementById('nok-relation').value = candidate.nokRelation;
    document.getElementById('nok-phone').value = candidate.nokPhone;
    document.getElementById('nok-address').value = candidate.nokAddress;
    document.getElementById('acad-score').value = candidate.utmeScore;
    document.getElementById('acad-course').value = candidate.course;
}

// --- STEP 2: FORM HANDLING & PAYSTACK OVERLAY GATEWAY ---
portalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const phoneInput = document.getElementById('bio-phone').value.trim();
    const billingEmail = `${activeJambNumber.toLowerCase()}@uniosun-portal.edu.ng`;
    const screeningCost = 2500; // Administrative Fee in NGN

    const rows = olevelRowsContainer.querySelectorAll('div');
    const olevelResults = [];
    rows.forEach(row => {
        const sub = row.querySelector('[data-role="subject"]').value;
        const grd = row.querySelector('[data-role="grade"]').value;
        if(sub && grd) olevelResults.push({ subject: sub, grade: grd });
    });

    const payload = {
        jambNo: activeJambNumber,
        name: document.getElementById('bio-name').value.trim().toUpperCase(),
        gender: document.getElementById('bio-gender').value,
        phone: phoneInput,
        address: document.getElementById('bio-address').value.trim(),
        state: document.getElementById('bio-state').value.trim(),
        lga: document.getElementById('bio-lga').value.trim(),
        nokName: document.getElementById('nok-name').value.trim().toUpperCase(),
        nokRelation: document.getElementById('nok-relation').value,
        nokPhone: document.getElementById('nok-phone').value.trim(),
        nokAddress: document.getElementById('nok-address').value.trim(),
        utmeScore: parseInt(document.getElementById('acad-score').value),
        course: document.getElementById('acad-course').value,
        sittings: document.querySelector('input[name="sittings"]:checked').value,
        olevel: olevelResults,
        paymentRef: ""
    };

    // Initialize Paystack Inline Pop-up Modal Frame
    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: 'pk_test_bcd318f5e1420ba1743cf656363315a862fba1ed', // Public test key
        email: billingEmail,
        amount: screeningCost * 100, // Amount parsed in Kobo
        currency: 'NGN',
        onSuccess: function(transaction) {
            payload.paymentRef = transaction.reference;
            alert(`Payment Cleared! Reference ID: ${transaction.reference}`);
            
            renderSlipReceipt(payload);
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        },
        onCancel: function() {
            alert('Transaction window dismissed. Gateway authentication payment processing is mandatory.');
        }
    });
});

// --- STEP 3: DYNAMIC ACKNOWLEDGEMENT SLIP SLATE GENERATION ---
function renderSlipReceipt(data) {
    slipContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-lg border border-slate-200/60">
            <div>
                <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Registration Baseline</h4>
                <p class="mb-1"><span class="font-medium text-slate-500">JAMB Reg No:</span> <strong class="font-mono text-slate-900 select-all">${data.jambNo}</strong></p>
                <p class="mb-1"><span class="font-medium text-slate-500">Full Name:</span> <strong class="text-slate-900">${data.name}</strong></p>
                <p class="mb-1"><span class="font-medium text-slate-500">Gender Identity:</span> ${data.gender}</p>
                <p class="mb-1"><span class="font-medium text-slate-500">Phone Contact:</span> ${data.phone}</p>
                <p class="mb-1"><span class="font-medium text-slate-500">Home Address:</span> ${data.address}</p>
                <p class="mb-1"><span class="font-medium text-slate-500">Origin Metrics:</span> ${data.lga}, ${data.state} State</p>
            </div>
            <div>
                <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Academic Choice & Kin</h4>
                <p class="mb-1"><span class="font-medium text-slate-500">Course Choice:</span> <strong class="text-emerald-900">${data.course}</strong></p>
                <p class="mb-1"><span class="font-medium text-slate-500">UTME Score:</span> <span class="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">${data.utmeScore}</span></p>
                <p class="mb-1"><span class="font-medium text-slate-500">Emergency Contact:</span> ${data.nokName} (${data.nokRelation})</p>
                <p class="mb-1"><span class="font-medium text-slate-500">Kin Hotline:</span> ${data.nokPhone}</p>
                <p class="mb-1"><span class="font-medium text-slate-500">Gateway Ref:</span> <span class="font-mono text-xs text-emerald-700 bg-emerald-50 px-1 rounded font-bold">${data.paymentRef || 'N/A'}</span></p>
            </div>
        </div>
        <div>
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Verified O'Level Credentials Matrix (${data.sittings} Sitting)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                ${data.olevel.map(item => `
                    <div class="bg-white border p-2 rounded shadow-xs text-center">
                        <div class="text-[10px] text-slate-400 font-bold uppercase truncate" title="${item.subject}">${item.subject}</div>
                        <div class="text-base font-black text-slate-800 mt-0.5">${item.grade}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Ensure buttons switch status visibility properly when viewing a pre-saved slip setup
    lockBtn.classList.remove('hidden');
    printBtn.classList.add('hidden');

    lockBtn.onclick = () => saveRecordToDatabase(data);
}

function saveRecordToDatabase(data) {
    localDb = localDb.filter(record => record.jambNo !== data.jambNo);
    localDb.push(data);
    localStorage.setItem('uniosun_portal_db', JSON.stringify(localDb));
    
    alert("Application data configurations locked successfully. Printing access enabled.");
    lockBtn.classList.add('hidden');
    printBtn.classList.remove('hidden');
}

// --- ADMISSIONS BOARD ADMIN ANALYTICS ---
function updateAdminDashboard() {
    adminTableBody.innerHTML = "";
    
    if (localDb.length === 0) {
        adminEmptyState.classList.remove('hidden');
        metricTotal.textContent = "0";
        metricAvgJamb.textContent = "0";
        metricFemale.textContent = "0";
        metricOgun.textContent = "0";
        return;
    }
    
    adminEmptyState.classList.add('hidden');
    
    let totalJambScore = 0;
    let femaleCount = 0;
    let ogunCount = 0;

    localDb.forEach(candidate => {
        totalJambScore += candidate.utmeScore;
        if(candidate.gender === "Female") femaleCount++;
        if(candidate.state.toLowerCase().replace(/\s*state\s*/g, '') === "ogun") ogunCount++;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 border-b border-slate-200/60 transition-colors";
        tr.innerHTML = `
            <td class="p-4 font-mono font-bold tracking-wider text-slate-900">${candidate.jambNo}</td>
            <td class="p-4 font-medium text-slate-900">${candidate.name}</td>
            <td class="p-4">${candidate.gender}</td>
            <td class="p-4 text-slate-500">${candidate.state}</td>
            <td class="p-4 font-bold text-emerald-800">${candidate.utmeScore}</td>
            <td class="p-4 text-slate-600">${candidate.course}</td>
            <td class="p-4 text-center">
                <button onclick="deleteCandidateRecord('${candidate.jambNo}')" class="text-red-600 hover:text-red-900 font-bold transition-colors px-2 py-1">Delete</button>
            </td>
        `;
        adminTableBody.appendChild(tr);
    });

    metricTotal.textContent = localDb.length;
    metricAvgJamb.textContent = Math.round(totalJambScore / localDb.length);
    metricFemale.textContent = femaleCount;
    metricOgun.textContent = ogunCount;
}

window.deleteCandidateRecord = function(jambNo) {
    if(confirm(`Are you sure you want to completely remove registration profile record ${jambNo}?`)) {
        localDb = localDb.filter(c => c.jambNo !== jambNo);
        localStorage.setItem('uniosun_portal_db', JSON.stringify(localDb));
        updateAdminDashboard();
    }
};

// --- DATASET CSV DUMP ENGINE ---
document.getElementById('admin-download-csv').addEventListener('click', () => {
    if(localDb.length === 0) {
        alert("The working database memory contains zero rows to export.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "JAMB Reg No,Applicant Name,Gender,Phone,State,LGA,Course Choice,UTME Score\n";
    
    localDb.forEach(c => {
        csvContent += `"${c.jambNo}","${c.name}","${c.gender}","${c.phone}","${c.state}","${c.lga}","${c.course}",${c.utmeScore}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UNIOSUN_Admissions_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- TOTAL RESET ENGINE ---
document.getElementById('admin-clear-all').addEventListener('click', () => {
    if(confirm("CRITICAL ACTION: Are you sure you want to clear all applicant records from memory? This cannot be undone.")) {
        localDb = [];
        localStorage.removeItem('uniosun_portal_db');
        updateAdminDashboard();
    }
});
