// INITIALIZE EMAILJS WITH YOUR PUBLIC KEY
emailjs.init("IiipzsMLoYhdtmUm7");

// SIMULATED SYSTEM LOCAL DATABASE STORE
let db = JSON.parse(localStorage.getItem('uniosun_db')) || [];
let selectedTrackedRecord = null; 

// CORE WINDOW SELECTORS INTERFACE 
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const portalContainer = document.getElementById('portal-view-container');
const slipContainer = document.getElementById('slip-view-container');
const adminContainer = document.getElementById('admin-view-container');

// DYNAMIC O'LEVEL SUBJECT CONFIGURATOR BUILDER MATRIX
const olevelContainer = document.getElementById('olevel-rows');
const requiredSubjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology", 
    "Agricultural Science", "Geography", "Economics", "Government"
];
const gradeValues = { "A1":6, "B2":5, "B3":4, "C4":3, "C5":2, "C6":1, "D7":0, "E8":0, "F9":0 };

// Auto-inject subject rows inside form
for (let i = 1; i <= 5; i++) {
    let row = document.createElement('div');
    row.className = "grid grid-cols-12 gap-2 items-center";
    row.innerHTML = `
        <div class="col-span-6">
            <select required class="w-full px-2 py-1.5 border border-slate-300 rounded text-[12px] font-medium bg-white outline-none">
                <option value="">-- Subject ${i} --</option>
                ${requiredSubjects.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
        </div>
        <div class="col-span-3">
            <select required class="w-full px-2 py-1.5 border border-slate-300 rounded text-[12px] font-medium bg-white outline-none font-bold text-emerald-800">
                <option value="">Grade</option>
                ${Object.keys(gradeValues).map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
        </div>
        <div class="col-span-3">
            <select required class="w-full px-2 py-1.5 border border-slate-300 rounded text-[11px] bg-white outline-none font-semibold">
                <option value="1">1st Sit</option>
                <option value="2">2nd Sit</option>
            </select>
        </div>
    `;
    olevelContainer.appendChild(row);
}

// UNIFIED INPUT TRIGGER: START NEW REGISTRATION 
document.getElementById('btn-verify').addEventListener('click', () => {
    const jNum = document.getElementById('jamb-num').value.trim().toUpperCase();
    const errorEl = document.getElementById('step-1-error');
    
    if (!jNum || jNum.length < 7) {
        errorEl.textContent = "Kindly key in a valid authentic standard JAMB Registration Number.";
        errorEl.classList.remove('hidden');
        return;
    }
    
    const existing = db.find(item => item.jambNumber === jNum);
    if(existing) {
        errorEl.textContent = "This JAMB Number has already registered! Click 'Track Admission Process' to view its timeline.";
        errorEl.classList.remove('hidden');
        return;
    }
    
    errorEl.classList.add('hidden');
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
});

// FIXED: NOW READS FROM THE EXACT SAME UNIFIED SINGLE INPUT FIELD (#jamb-num)
document.getElementById('btn-track').addEventListener('click', () => {
    const jNum = document.getElementById('jamb-num').value.trim().toUpperCase();
    const errorEl = document.getElementById('step-1-error');
    const trackingCard = document.getElementById('tracking-card');
    
    if (!jNum || jNum.length < 7) {
        errorEl.textContent = "Kindly enter your JAMB Registration Number inside the input area before tracking.";
        errorEl.classList.remove('hidden');
        trackingCard.classList.add('hidden');
        return;
    }

    const record = db.find(item => item.jambNumber === jNum);
    if (!record) {
        errorEl.textContent = "No profile found matching this number on our database registry.";
        errorEl.classList.remove('hidden');
        trackingCard.classList.add('hidden');
        return;
    }

    errorEl.classList.add('hidden');
    selectedTrackedRecord = record;
    
    document.getElementById('track-name').textContent = record.name;
    document.getElementById('track-ref').textContent = `Ref: ${record.paymentRef}`;
    
    const dot2 = document.getElementById('dot-step2');
    const desc2 = document.getElementById('desc-step2');
    const dot3 = document.getElementById('dot-step3');
    const desc3 = document.getElementById('desc-step3');

    // Default tracking steps reset setup
    dot2.className = "w-2.5 h-2.5 rounded-full z-10 bg-slate-300 mt-1.5 ml-1";
    desc2.className = "text-[11px] text-slate-500 block";
    desc2.textContent = "Credentials queued for review.";
    
    dot3.className = "w-2.5 h-2.5 rounded-full z-10 bg-slate-300 mt-1.5 ml-1";
    desc3.className = "text-[11px] font-bold text-slate-500 block";
    desc3.textContent = "Awaiting board decision.";

    if (record.status === "Screening Scheduled") {
        dot2.className = "w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 ml-1 z-10 animate-pulse";
        desc2.className = "text-[12px] text-amber-700 font-bold block";
        desc2.textContent = "SCHEDULED: Verified eligible. Report to campus ICT center for physical clearance.";
    } else if (record.status === "Admitted") {
        dot2.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
        desc2.className = "text-[11px] text-emerald-700 font-medium block";
        desc2.textContent = "Verified: O'level qualifications passed validation check.";
        
        dot3.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
        desc3.className = "text-[12px] font-black text-emerald-800 block uppercase";
        desc3.textContent = "CONGRATULATIONS! Provisional Admission Offered.";
    } else if (record.status === "Not Admitted") {
        dot2.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
        dot3.className = "w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 ml-1 z-10";
        desc3.className = "text-[12px] font-bold text-red-600 block uppercase";
        desc3.textContent = "Admission review closed. Minimum requirements not met.";
    } else {
        dot2.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
        desc2.className = "text-[11px] text-slate-600 font-medium block";
        desc2.textContent = "Received: Credentials currently undergoing background screening audits.";
    }

    trackingCard.classList.remove('hidden');
});

// REPRINT ACTION
document.getElementById('btn-reprint').addEventListener('click', () => {
    if (selectedTrackedRecord) {
        renderSlipReceipt(selectedTrackedRecord);
        portalContainer.classList.add('hidden');
        slipContainer.classList.remove('hidden');
        step3.classList.remove('hidden');
    }
});

// FORM SUBMISSION & PAYSTACK INTEGRATION
document.getElementById('portal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailAddr = document.getElementById('bio-email').value.trim();
    const applicantName = document.getElementById('bio-name').value.trim().toUpperCase();
    
    let olevels = [];
    let rows = olevelContainer.children;
    for (let row of rows) {
        let selects = row.getElementsByTagName('select');
        if (selects[0].value && selects[1].value) {
            olevels.push({
                subject: selects[0].value,
                grade: selects[1].value,
                sitting: selects[2].value
            });
        }
    }

    const payload = {
        jambNumber: document.getElementById('jamb-num').value.trim().toUpperCase(),
        name: applicantName,
        gender: document.getElementById('bio-gender').value,
        phone: document.getElementById('bio-phone').value,
        email: emailAddr,
        address: document.getElementById('bio-address').value,
        state: document.getElementById('bio-state').value,
        lga: document.getElementById('bio-lga').value,
        nokName: document.getElementById('nok-name').value.toUpperCase(),
        nokRelation: document.getElementById('nok-relation').value,
        nokPhone: document.getElementById('nok-phone').value,
        nokAddress: document.getElementById('nok-address').value,
        jambScore: parseInt(document.getElementById('acad-score').value),
        course: document.getElementById('acad-course').value,
        olevels: olevels,
        status: "Pending Review", 
        paymentRef: 'UNIOSUN-' + Math.floor(Math.random() * 8999999 + 1000000)
    };

    const paystackKey = 'pk_test_bcd318f5e1420ba1743cf656363315a862fba1ed'; 

    try {
        const handler = PaystackPop.setup({
            key: paystackKey,
            email: emailAddr,
            amount: 300000, 
            currency: 'NGN',
            ref: payload.paymentRef,
            callback: function(response) {
                completeSuccessfulRegistration(payload);
            },
            onClose: function() {
                alert('Gateway authentication canceled.');
            }
        });
        handler.openIframe();
    } catch(err) {
        alert("Could not trigger Paystack gateway panel window.");
    }
});

function completeSuccessfulRegistration(payload) {
    db.push(payload);
    localStorage.setItem('uniosun_db', JSON.stringify(db));
    
    const emailParams = {
        to_email: payload.email,
        applicant_name: payload.name,
        jamb_number: payload.jambNumber,
        course_choice: payload.course,
        payment_reference: payload.paymentRef,
        phone_number: payload.phone
    };

    emailjs.send("service_pc0nsyr", "template_pey3t8n", emailParams)
        .then(() => { console.log("Email confirmation dispatched!"); })
        .catch((error) => { console.error("EmailJS failure error:", error); });

    triggerEmailToast(payload.email);
    renderSlipReceipt(payload);
    
    portalContainer.classList.add('hidden');
    slipContainer.classList.remove('hidden');
    step2.classList.add('hidden');
    step3.classList.remove('hidden');
}

function renderSlipReceipt(data) {
    const slipTarget = document.getElementById('slip-content');
    let subjectRowsHtml = data.olevels.map(s => `
        <tr class="border-b border-slate-200">
            <td class="py-2 font-medium text-slate-800">${s.subject}</td>
            <td class="py-2 text-center font-bold text-emerald-800">${s.grade}</td>
            <td class="py-2 text-right text-slate-500 font-medium">${s.sitting === "1" ? "First Sitting" : "Second Sitting"}</td>
        </tr>
    `).join('');

    slipTarget.innerHTML = `
        <div class="bg-emerald-50/60 border border-emerald-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-2 no-print">
            <div><span class="text-[11px] uppercase text-slate-500 font-bold block">Transaction Clearing Status</span><strong class="text-emerald-800 text-sm font-black">✓ TRANSACTION CLEARED SUCCESSFUL VIA PAYSTACK</strong></div>
            <div class="text-left sm:text-right"><span class="text-[11px] uppercase text-slate-500 font-bold block">Current Tracking Process Status</span><strong class="text-amber-700 text-sm font-black uppercase">● ${data.status}</strong></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div class="space-y-3">
                <h3 class="text-xs font-black uppercase text-emerald-800 tracking-wider border-b pb-1">Primary Bio Data</h3>
                <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Candidate Full Name</span><span class="text-base font-black text-slate-900">${data.name}</span></div>
                <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">JAMB Registration ID</span><span class="font-mono font-bold text-sm text-slate-900 tracking-wider">${data.jambNumber}</span></div>
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">UTME Score</span><span class="font-bold text-sm text-emerald-800">${data.jambScore} / 400</span></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Gender Structure</span><span class="font-medium">${data.gender}</span></div>
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Phone Number</span><span class="font-medium">${data.phone}</span></div>
                </div>
                <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Email Address Contact</span><span class="font-medium">${data.email}</span></div>
            </div>
            <div class="space-y-3">
                <h3 class="text-xs font-black uppercase text-emerald-800 tracking-wider border-b pb-1">Assigned Institutional Options</h3>
                <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Selected Choice Course Major</span><span class="text-sm font-bold text-slate-900 bg-amber-100/60 px-1.5 py-0.5 rounded-sm">${data.course}</span></div>
                <h3 class="text-xs font-black uppercase text-emerald-800 tracking-wider border-b pt-3 pb-1">Emergency Kinship Record</h3>
                <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Next of Kin Contact Person</span><span class="font-bold text-slate-800">${data.nokName}</span></div>
                <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Relationship Link</span><span class="font-medium">${data.nokRelation}</span></div>
                    <div><span class="text-[11px] font-bold text-slate-400 uppercase block">Kin Phone Number</span><span class="font-medium">${data.nokPhone}</span></div>
                </div>
            </div>
        </div>
        <div class="pt-4">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="border-b-2 border-slate-300 text-slate-500 font-bold uppercase text-[11px]">
                        <th class="pb-1.5">Registered Academic Subject</th>
                        <th class="pb-1.5 text-center">Earned Grade</th>
                        <th class="pb-1.5 text-right">Sitting Sequence</th>
                    </tr>
                </thead>
                <tbody>${subjectRowsHtml}</tbody>
            </table>
        </div>
    `;
}

document.getElementById('btn-lock').addEventListener('click', function() {
    this.classList.add('hidden');
    document.getElementById('btn-print').classList.remove('hidden');
});

document.getElementById('view-portal-btn').addEventListener('click', () => {
    portalContainer.classList.remove('hidden');
    slipContainer.classList.add('hidden');
    adminContainer.classList.add('hidden');
});

document.getElementById('view-admin-btn').addEventListener('click', () => {
    const accessPin = prompt("Enter Administration Access Pin Code:");
    if (accessPin === "1234") {
        portalContainer.classList.add('hidden');
        slipContainer.classList.add('hidden');
        adminContainer.classList.remove('hidden');
        renderAdminDashboard();
    } else if (accessPin !== null) {
        alert("Invalid Pin.");
    }
});

function triggerEmailToast(email) {
    document.getElementById('email-toast-subj').textContent = `Copy Sent -> ${email}`;
    const toast = document.getElementById('email-toast');
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 9000);
}

function renderAdminDashboard() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';
    if (db.length === 0) return;
    db.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.className = "border-b border-slate-200 hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="p-3 font-mono font-bold">${item.jambNumber}</td>
            <td class="p-3 font-semibold">${item.name}</td>
            <td class="p-3 font-bold text-emerald-800">${item.jambScore}</td>
            <td class="p-3 font-medium text-slate-600">${item.course}</td>
            <td class="p-3">
                <select onchange="updateProcessStatus(${index}, this.value)" class="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold outline-none text-slate-800">
                    <option value="Pending Review" ${item.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                    <option value="Screening Scheduled" ${item.status === 'Screening Scheduled' ? 'selected' : ''}>Screening Scheduled</option>
                    <option value="Admitted" ${item.status === 'Admitted' ? 'selected' : ''}>Admitted</option>
                    <option value="Not Admitted" ${item.status === 'Not Admitted' ? 'selected' : ''}>Not Admitted</option>
                </select>
            </td>
            <td class="p-3 text-center"><button onclick="deleteRecord(${index})" class="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-2 py-1 rounded text-[10px] uppercase">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateProcessStatus = function(index, newStatus) {
    db[index].status = newStatus;
    localStorage.setItem('uniosun_db', JSON.stringify(db));
    alert(`Status altered to: "${newStatus}"`);
};

window.deleteRecord = function(index) {
    if (confirm("Discard this applicant profile?")) {
        db.splice(index, 1);
        localStorage.setItem('uniosun_db', JSON.stringify(db));
        renderAdminDashboard();
    }
}

document.getElementById('admin-clear-all').addEventListener('click', () => {
    if (confirm("Reset database?")) {
        db = [];
        localStorage.removeItem('uniosun_db');
        renderAdminDashboard();
    }
});
