// CORE ADMISSION ARCHITECTURE CONTROLLER
document.addEventListener('DOMContentLoaded', () => {
    // Core Dom Bindings
    const viewPortalBtn = document.getElementById('view-portal-btn');
    const viewAdminBtn = document.getElementById('view-admin-btn');
    const portalView = document.getElementById('portal-view-container');
    const slipView = document.getElementById('slip-view-container');
    const adminView = document.getElementById('admin-view-container');
    
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const jambInput = document.getElementById('jamb-num');
    const verifyBtn = document.getElementById('btn-verify');
    const trackBtn = document.getElementById('btn-track');
    const step1Error = document.getElementById('step-1-error');
    
    const trackingCard = document.getElementById('tracking-card');
    const trackName = document.getElementById('track-name');
    const trackRef = document.getElementById('track-ref');
    const dotStep1 = document.getElementById('dot-step1');
    const dotStep2 = document.getElementById('dot-step2');
    const dotStep3 = document.getElementById('dot-step3');
    const descStep2 = document.getElementById('desc-step2');
    const descStep3 = document.getElementById('desc-step3');
    const reprintBtn = document.getElementById('btn-reprint');
    
    const portalForm = document.getElementById('portal-form');
    const olevelRowsContainer = document.getElementById('olevel-rows');
    const slipContent = document.getElementById('slip-content');
    const btnLock = document.getElementById('btn-lock');
    const btnPrint = document.getElementById('btn-print');
    const adminTableBody = document.getElementById('admin-table-body');
    const adminClearAll = document.getElementById('admin-clear-all');

    // State Variables
    let dynamicActiveJamb = '';
    const REQUIRED_SUBJECTS = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

    // Local Storage Base Loaders
    const loadRegistryData = () => JSON.parse(localStorage.getItem('uniosun_registry')) || {};
    const saveRegistryData = (data) => localStorage.setItem('uniosun_registry', JSON.stringify(data));

    // Render OLevel Subjects Input Form Block Matrix
    // Render OLevel Subjects Input Form Block Matrix (Restored Layout)
    if (olevelRowsContainer) {
        olevelRowsContainer.innerHTML = REQUIRED_SUBJECTS.map((subject, index) => `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-emerald-100/50 pb-2 last:border-0">
                <span class="text-[12px] font-semibold text-slate-700">${subject}</span>
                <div>
                    <input type="text" placeholder="e.g., WAEC 2025" required id="exam-${index}" class="w-full px-2 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-800 uppercase outline-none focus:border-emerald-700">
                </div>
                <div>
                    <select id="grade-${index}" required class="w-full px-2 py-1.5 border border-slate-300 text-xs font-bold rounded text-slate-800 bg-white outline-none focus:border-emerald-700">
                        <option value="">-- Grade --</option>
                        ${['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                </div>
            </div>
        `).join('');
    }
    }

    // Tab Views Control Core Routing Switchboards
    const switchActiveView = (targetView) => {
        [portalView, slipView, adminView].forEach(el => el.classList.add('hidden'));
        targetView.classList.remove('hidden');
        if(targetView === portalView) {
            step1.classList.remove('hidden');
            step2.classList.add('hidden');
            trackingCard.classList.add('hidden');
            jambInput.value = '';
        }
    };

    viewPortalBtn.addEventListener('click', () => {
        viewPortalBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-xs";
        viewAdminBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
        switchActiveView(portalView);
    });

    viewAdminBtn.addEventListener('click', () => {
        viewAdminBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-xs";
        viewPortalBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
        switchActiveView(adminView);
        renderAdminDashboardTable();
    });

    // Verification Logic (Start Application Button)
    verifyBtn.addEventListener('click', () => {
        const value = jambInput.value.trim().toUpperCase();
        if (!value) {
            showStep1Error("Please enter a valid JAMB Registration Number.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = loadRegistryData();

        if (db[value]) {
            showStep1Error("This profile is already registered. Use 'Track Admission Process' to view details.");
            return;
        }
        dynamicActiveJamb = value;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        portalForm.reset();
    });

    // Tracking Matrix Controller Engine
    trackBtn.addEventListener('click', () => {
        const value = jambInput.value.trim().toUpperCase();
        if (!value) {
            showStep1Error("Enter your JAMB reference key to track status.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = loadRegistryData();
        const student = db[value];

        if (!student) {
            showStep1Error("No screening profile found with this reference number.");
            trackingCard.classList.add('hidden');
            return;
        }

        dynamicActiveJamb = value;
        trackName.textContent = student.biodata.name.toUpperCase();
        trackRef.textContent = `JAMB NO: ${value} | REF: ${student.receiptRef}`;
        
        // Reset steps graphics configuration
        [dotStep1, dotStep2, dotStep3].forEach(d => { d.className = "w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ml-1 z-10"; });
        descStep2.className = "text-[11px] text-slate-500 block";
        descStep3.className = "text-[11px] font-bold text-slate-500 block";

        dotStep1.classList.replace('bg-slate-300', 'bg-emerald-600');

        if (student.status === 'Reviewing') {
            dotStep2.classList.replace('bg-slate-300', 'bg-amber-500');
            descStep2.textContent = "Your O'level results are matching our course cutoffs.";
            descStep2.className = "text-[11px] text-amber-700 font-semibold block";
        } else if (student.status === 'Approved') {
            dotStep2.classList.replace('bg-slate-300', 'bg-emerald-600');
            dotStep3.classList.replace('bg-slate-300', 'bg-emerald-600');
            descStep2.textContent = "Academic criteria matching confirmed.";
            descStep3.textContent = `CONGRATULATIONS! Offered Admission into ${student.academic.course}.`;
            descStep3.className = "text-[11px] font-black text-emerald-700 block";
        } else if (student.status === 'Rejected') {
            dotStep2.classList.replace('bg-slate-300', 'bg-emerald-600');
            dotStep3.classList.replace('bg-slate-300', 'bg-red-600');
            descStep2.textContent = "Review sequence completed.";
            descStep3.textContent = "Admission status: Denied. Deficit in required O'Level metric configurations.";
            descStep3.className = "text-[11px] font-black text-red-600 block";
        } else {
            descStep2.textContent = "Credentials queued for admissions board review.";
            descStep3.textContent = "Awaiting board decision.";
        }

        trackingCard.classList.remove('hidden');
    });

    reprintBtn.addEventListener('click', () => {
        const db = loadRegistryData();
        renderSlipPrintLayout(db[dynamicActiveJamb]);
        switchActiveView(slipView);
    });

    const showStep1Error = (msg) => {
        step1Error.textContent = msg;
        step1Error.classList.remove('hidden');
    };

    // Form Submit Submission Engine Handler -> Integrated with Paystack Popup
    portalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailAddress = document.getElementById('bio-email').value.trim();
        const applicantName = document.getElementById('bio-name').value.trim().toUpperCase();

        const handler = PaystackPop.setup({
            key: 'pk_test_4e86a23a7e588432a11b81643193217b12345678', // Hardcoded public test key
            email: emailAddress,
            amount: 2500 * 100, // NGN 2,500 in kobo
            currency: 'NGN',
            callback: function(response) {
                executeCoreDataStorageSequence(response.reference);
            },
            onClose: function() {
                alert('Payment window terminated. Complete screening payment processing to yield registration slips.');
            }
        });
        handler.openIframe();
    });

    // Save Profile & Prep Print Layout Output
    const executeCoreDataStorageSequence = (payRef) => {
        const olevelResults = REQUIRED_SUBJECTS.map((subject, idx) => ({
            subject,
            exam: document.getElementById(`exam-${idx}`).value.trim().toUpperCase(),
            grade: document.getElementById(`grade-${idx}`).value
        }));

        const record = {
            jambNo: dynamicActiveJamb,
            receiptRef: 'UNIOSUN-' + Math.floor(100000 + Math.random() * 900000),
            paymentRef: payRef,
            status: 'Pending',
            biodata: {
                name: document.getElementById('bio-name').value.trim().toUpperCase(),
                gender: document.getElementById('bio-gender').value,
                phone: document.getElementById('bio-phone').value.trim(),
                email: document.getElementById('bio-email').value.trim(),
                address: document.getElementById('bio-address').value.trim(),
                state: document.getElementById('bio-state').value.trim(),
                lga: document.getElementById('bio-lga').value.trim()
            },
            nextOfKin: {
                name: document.getElementById('nok-name').value.trim().toUpperCase(),
                relation: document.getElementById('nok-relation').value,
                phone: document.getElementById('nok-phone').value.trim(),
                address: document.getElementById('nok-address').value.trim()
            },
            academic: {
                score: document.getElementById('acad-score').value,
                course: document.getElementById('acad-course').value
            },
            olevel: olevelResults
        };

        const db = loadRegistryData();
        db[dynamicActiveJamb] = record;
        saveRegistryData(db);

        renderSlipPrintLayout(record);
        switchActiveView(slipView);
        
        // Trigger EmailJS Automation System Dispatches
        triggerAutomatedEmailNotification(record);
    };

    // Render Clean Aesthetic Slip Format
    const renderSlipPrintLayout = (student) => {
        btnPrint.classList.add('hidden');
        btnLock.classList.remove('hidden');

        slipContent.innerHTML = `
            <div class="grid grid-cols-2 gap-x-6 gap-y-4 border-b pb-4">
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Application Status</span><span class="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-0.5 inline-block">${student.status}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Transaction Reference</span><span class="font-mono text-xs font-bold text-slate-800">${student.receiptRef}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">JAMB Registration Number</span><span class="font-mono text-xs font-bold text-slate-900">${student.jambNo}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Selected Program of Choice</span><span class="text-xs font-bold text-emerald-800">${student.academic.course}</span></div>
            </div>

            <div>
                <h4 class="text-[11px] font-black uppercase text-emerald-900 tracking-wider mb-2">1. Personal Biodata Details</h4>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-50 p-3 rounded border">
                    <div><span class="text-slate-500">Full Name:</span> <strong class="text-slate-900">${student.biodata.name}</strong></div>
                    <div><span class="text-slate-500">Gender:</span> <strong>${student.biodata.gender}</strong></div>
                    <div><span class="text-slate-500">Phone Number:</span> <strong>${student.biodata.phone}</strong></div>
                    <div><span class="text-slate-500">Email Address:</span> <strong class="lowercase text-slate-800">${student.biodata.email}</strong></div>
                    <div class="col-span-2"><span class="text-slate-500">Residential Address:</span> <strong>${student.biodata.address}</strong></div>
                    <div><span class="text-slate-500">State of Origin:</span> <strong>${student.biodata.state}</strong></div>
                    <div><span class="text-slate-500">LGA:</span> <strong>${student.biodata.lga}</strong></div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 class="text-[11px] font-black uppercase text-emerald-900 tracking-wider mb-2">2. Next of Kin Matrix</h4>
                    <div class="space-y-1.5 text-xs bg-slate-50 p-3 rounded border min-h-[95px]">
                        <div><span class="text-slate-500">Kin Name:</span> <strong class="text-slate-900">${student.nextOfKin.name}</strong></div>
                        <div><span class="text-slate-500">Relationship:</span> <strong>${student.nextOfKin.relation}</strong></div>
                        <div><span class="text-slate-500">Emergency Phone:</span> <strong>${student.nextOfKin.phone}</strong></div>
                    </div>
                </div>
                <div>
                    <h4 class="text-[11px] font-black uppercase text-emerald-900 tracking-wider mb-2">3. Institutional Records</h4>
                    <div class="space-y-1.5 text-xs bg-slate-50 p-3 rounded border min-h-[95px]">
                        <div><span class="text-slate-500">UTME Score:</span> <strong class="text-slate-900 font-mono">${student.academic.score} / 400</strong></div>
                        <div><span class="text-slate-500">Screening Fee:</span> <strong>NGN 2,500.00 (PAID)</strong></div>
                        <div><span class="text-slate-500">Gateway Ref:</span> <span class="text-[10px] font-mono text-slate-600">${student.paymentRef.substring(0,14)}...</span></div>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="text-[11px] font-black uppercase text-emerald-900 tracking-wider mb-2">4. Verified O'Level Credentials Matrix</h4>
                <div class="border rounded overflow-hidden">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-slate-100 font-bold border-b text-slate-700">
                                <th class="p-2 pl-3">O'level Core Subject</th>
                                <th class="p-2">Exam Institution Body & Sitting</th>
                                <th class="p-2 text-right pr-4">Earned Grade</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            ${student.olevel.map(row => `
                                <tr>
                                    <td class="p-2 pl-3 font-semibold text-slate-800">${row.subject}</td>
                                    <td class="p-2 text-slate-600 uppercase font-mono text-[11px]">${row.exam}</td>
                                    <td class="p-2 text-right pr-4 font-black text-emerald-800">${row.grade}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // Lock Details Button Event
    btnLock.addEventListener('click', () => {
        btnLock.classList.add('hidden');
        btnPrint.classList.remove('hidden');
        alert("Details verified and locked successfully. You can now safely print your acknowledgment slip.");
    });

    // EmailJS Engine Automations Dispatcher
    const triggerAutomatedEmailNotification = (student) => {
        if (typeof emailjs === 'undefined') {
            console.error("EmailJS engine context unmapped.");
            return;
        }

        // ⚠️ Customize these parameters to exactly mirror your EmailJS Dashboard fields
        const templateParams = {
            to_email: student.biodata.email,
            applicant_name: student.biodata.name,
            jamb_number: student.jambNo,
            course_choice: student.academic.course,
            utme_score: student.academic.score,
            receipt_reference: student.receiptRef
        };

        emailjs.send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", templateParams)
            .then(() => {
                const toast = document.getElementById('email-toast');
                if (toast) {
                    toast.classList.remove('hidden');
                    setTimeout(() => toast.classList.add('hidden'), 6000);
                }
            })
            .catch((err) => console.error("Email API Failure:", err));
    };

    // Admin Panel Render Operations
    const renderAdminDashboardTable = () => {
        const db = loadRegistryData();
        adminTableBody.innerHTML = '';
        const keys = Object.keys(db);

        if (keys.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center font-medium text-slate-400">No applicant profiles submitted yet.</td></tr>`;
            return;
        }

        keys.forEach(key => {
            const student = db[key];
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50/80 transition-all font-medium text-slate-800";
            tr.innerHTML = `
                <td class="p-3 font-mono font-bold text-slate-900">${student.jambNo}</td>
                <td class="p-3 font-semibold uppercase">${student.biodata.name}</td>
                <td class="p-3 font-mono font-bold text-emerald-800">${student.academic.score}</td>
                <td class="p-3 text-slate-600">${student.academic.course}</td>
                <td class="p-3">
                    <select class="status-selector border rounded px-2 py-1 font-bold text-xs bg-white ${
                        student.status === 'Approved' ? 'text-emerald-700 border-emerald-300' : 
                        student.status === 'Rejected' ? 'text-red-600 border-red-300' : 
                        student.status === 'Reviewing' ? 'text-amber-700 border-amber-300' : 'text-slate-600'
                    }">
                        <option value="Pending" ${student.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Reviewing" ${student.status === 'Reviewing' ? 'selected' : ''}>Reviewing</option>
                        <option value="Approved" ${student.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${student.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td class="p-3 text-center">
                    <button class="delete-applicant-btn bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 px-2 py-1 rounded transition-all font-bold">Delete</button>
                </td>
            `;

            // Status updates event tracking listener
            tr.querySelector('.status-selector').addEventListener('change', (e) => {
                const updatedStatus = e.target.value;
                const freshDb = loadRegistryData();
                freshDb[key].status = updatedStatus;
                saveRegistryData(freshDb);
                renderAdminDashboardTable();
            });

            // Single applicant deletion row context handler
            tr.querySelector('.delete-applicant-btn').addEventListener('click', () => {
                if(confirm(`Remove candidate entry profile for ${student.biodata.name}?`)) {
                    const freshDb = loadRegistryData();
                    delete freshDb[key];
                    saveRegistryData(freshDb);
                    renderAdminDashboardTable();
                }
            });

            adminTableBody.appendChild(tr);
        });
    };

    adminClearAll.addEventListener('click', () => {
        if (confirm("⚠️ CRITICAL ACTION: Wipe the entire student admissions local storage database?")) {
            localStorage.removeItem('uniosun_registry');
            renderAdminDashboardTable();
        }
    });
});
