/**
 * OSUN STATE UNIVERSITY PORTAL APPLICATION MANAGEMENT SCRIPT
 */

// --- CONFIGURATION WORKBENCH ---
const EMAILJS_PUBLIC_KEY = "e4lNbK-RTBf77j2Gm"; 
const EMAILJS_SERVICE_ID = "service_6hllp68";
const EMAILJS_TEMPLATE_ID = "template_p26v91n";

// Graceful fallback execution init sequence
if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
    let activeJambNumber = '';

    // Core Node Elements Map
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
    const btnReprint = document.getElementById('btn-reprint');

    const dotStep2 = document.getElementById('dot-step2');
    const descStep2 = document.getElementById('desc-step2');
    const dotStep3 = document.getElementById('dot-step3');
    const descStep3 = document.getElementById('desc-step3');

    const portalForm = document.getElementById('portal-form');
    const olevelRows = document.getElementById('olevel-rows');
    const slipContent = document.getElementById('slip-content');
    const btnLock = document.getElementById('btn-lock');
    const btnPrint = document.getElementById('btn-print');

    const adminTableBody = document.getElementById('admin-table-body');
    const adminClearAll = document.getElementById('admin-clear-all');

    const SUBJECTS = [
        "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
        "Agricultural Science", "Government", "Economics", "Geography", 
        "Commerce", "Literature in English", "Christian Religious Studies", "Islamic Studies"
    ];

    const getStorageData = () => JSON.parse(localStorage.getItem('uniosun_db')) || {};
    const setStorageData = (data) => localStorage.setItem('uniosun_db', JSON.stringify(data));

    // Dynamic O'Level Table Builder
    if (olevelRows) {
        let contentHtml = '';
        for (let i = 0; i < 5; i++) {
            contentHtml += `
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pb-2 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <div>
                        <select id="subj-name-${i}" required class="w-full p-1.5 border border-slate-300 rounded text-[12px] bg-white text-slate-800 font-medium outline-none">
                            <option value="">-- Select Subject --</option>
                            ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <select id="subj-sit-${i}" required class="w-full p-1.5 border border-slate-300 rounded text-[12px] bg-white text-slate-800 font-medium outline-none">
                            <option value="WAEC May/June 2026">WAEC May/June 2026</option>
                            <option value="NECO June/July 2026">NECO June/July 2026</option>
                            <option value="WAEC May/June 2025">WAEC May/June 2025</option>
                            <option value="NECO June/July 2025">NECO June/July 2025</option>
                        </select>
                    </div>
                    <div>
                        <select id="subj-grade-${i}" required class="w-full p-1.5 border border-slate-300 rounded text-[12px] bg-white text-slate-800 font-bold outline-none">
                            <option value="">-- Grade --</option>
                            ${["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"].map(g => `<option value="${g}">${g}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        }
        olevelRows.innerHTML = contentHtml;
    }

    const navigateToView = (viewTarget) => {
        [portalView, slipView, adminView].forEach(view => view.classList.add('hidden'));
        viewTarget.classList.remove('hidden');

        if (viewTarget === portalView) {
            step1.classList.remove('hidden');
            step2.classList.add('hidden');
            trackingCard.classList.add('hidden');
            jambInput.value = '';
            viewPortalBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-xs";
            viewAdminBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
        } else if (viewTarget === adminView) {
            viewAdminBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all bg-amber-400 text-slate-950 shadow-xs";
            viewPortalBtn.className = "px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all text-emerald-300 hover:text-white";
            buildAdminViewDataLogs();
        }
    };

    viewPortalBtn.addEventListener('click', () => navigateToView(portalView));
    viewAdminBtn.addEventListener('click', () => navigateToView(adminView));

    verifyBtn.addEventListener('click', () => {
        const jambNo = jambInput.value.trim().toUpperCase();
        if (!jambNo) {
            showStep1ErrorMsg("Please enter your JAMB Registration Number.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = getStorageData();

        if (db[jambNo]) {
            showStep1ErrorMsg("This application already exists. Click 'Track Admission Process' to access your profile.");
            return;
        }

        activeJambNumber = jambNo;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        portalForm.reset();
    });

    trackBtn.addEventListener('click', () => {
        const jambNo = jambInput.value.trim().toUpperCase();
        if (!jambNo) {
            showStep1ErrorMsg("Please enter your JAMB Registration Number to track application status.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = getStorageData();
        const record = db[jambNo];

        if (!record) {
            showStep1ErrorMsg("No record found for this entry parameters inside database.");
            return;
        }

        activeJambNumber = jambNo;
        trackName.textContent = record.biodata.name;
        trackRef.textContent = `Ref: ${record.applicationId}`;

        if (record.status === 'Under Review') {
            dotStep2.className = "w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 ml-1 z-10";
            descStep2.className = "text-[11px] text-amber-600 block font-medium";
            descStep2.textContent = "Credentials verification actively checked by registry desk.";
        } else if (record.status === 'Admitted') {
            dotStep2.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
            descStep2.className = "text-[11px] text-emerald-700 block";
            descStep2.textContent = "Credentials verified successfully.";
            dotStep3.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
            descStep3.className = "text-[11px] font-bold text-emerald-700 block";
            descStep3.textContent = "Congratulations! Admission granted to chosen course pipeline.";
        } else if (record.status === 'Rejected') {
            dotStep2.className = "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 ml-1 z-10";
            dotStep3.className = "w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 ml-1 z-10";
            descStep3.className = "text-[11px] font-bold text-red-600 block";
            descStep3.textContent = "Admission status criteria unfulfilled.";
        } else {
            dotStep2.className = "w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ml-1 z-10";
            descStep2.className = "text-[11px] text-slate-500 block";
            descStep2.textContent = "Credentials queued for review.";
            dotStep3.className = "w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ml-1 z-10";
            descStep3.className = "text-[11px] font-bold text-slate-500 block";
            descStep3.textContent = "Awaiting board decision.";
        }

        trackingCard.classList.remove('hidden');
    });

    btnReprint.addEventListener('click', () => {
        const db = getStorageData();
        const record = db[activeJambNumber];
        if (record) {
            populateSlipMarkupView(record);
            navigateToView(slipView);
        }
    });

    const showStep1ErrorMsg = (msg) => {
        step1Error.textContent = msg;
        step1Error.classList.remove('hidden');
    };

    portalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailAddress = document.getElementById('bio-email').value.trim();

        if (typeof PaystackPop === 'undefined') {
            executeApplicationPersistence('OFFLINE-GATEWAY-FALLBACK-' + Date.now());
            return;
        }

        const checkoutPopup = new PaystackPop();
        checkoutPopup.newTransaction({
            key: 'pk_test_bcd318f5e1420ba1743cf656363315a862fba1ed',
            email: emailAddress,
            amount: 2500 * 100,
            currency: 'NGN',
            onSuccess: (transaction) => {
                executeApplicationPersistence(transaction.reference);
            },
            onCancel: () => {
                alert("Payment interaction halted or abandoned by user.");
            }
        });
    });

    const executeApplicationPersistence = (referenceCode) => {
        const olevelItems = [];
        for (let i = 0; i < 5; i++) {
            olevelItems.push({
                subject: document.getElementById(`subj-name-${i}`).value,
                sitting: document.getElementById(`subj-sit-${i}`).value,
                grade: document.getElementById(`subj-grade-${i}`).value
            });
        }

        const registrationPayload = {
            jambNo: activeJambNumber,
            applicationId: 'UNIOSUN-' + Math.floor(100000 + Math.random() * 900000),
            paymentRef: referenceCode,
            status: 'Pending',
            timestamp: new Date().toLocaleDateString(),
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
            olevel: olevelItems
        };

        const db = getStorageData();
        db[activeJambNumber] = registrationPayload;
        setStorageData(db);

        populateSlipMarkupView(registrationPayload);
        navigateToView(slipView);

        dispatchDynamicNotificationEmail(registrationPayload);
    };

    const populateSlipMarkupView = (data) => {
        btnLock.classList.remove('hidden');
        btnPrint.classList.add('hidden');

        slipContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-5 rounded-lg border border-slate-200">
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Reference ID</span>
                    <span class="font-mono text-sm font-black text-emerald-800">${data.applicationId}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Payment Reference</span>
                    <span class="font-mono text-xs font-semibold text-slate-700">${data.paymentRef}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JAMB Registration Key</span>
                    <span class="font-mono text-xs font-bold text-slate-900">${data.jambNo}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chosen Academic Course</span>
                    <span class="text-xs font-bold text-emerald-900">${data.academic.course}</span>
                </div>
            </div>

            <div>
                <h3 class="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b pb-1 mb-3">Candidate Personal Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-800">
                    <div><span class="text-slate-400 font-medium">Full Name:</span> <strong class="text-slate-950">${data.biodata.name}</strong></div>
                    <div><span class="text-slate-400 font-medium">Gender Structural Form:</span> <strong>${data.biodata.gender}</strong></div>
                    <div><span class="text-slate-400 font-medium">Primary Email Address:</span> <strong class="lowercase font-normal">${data.biodata.email}</strong></div>
                    <div><span class="text-slate-400 font-medium">Mobile Telephone Line:</span> <strong class="font-mono">${data.biodata.phone}</strong></div>
                    <div><span class="text-slate-400 font-medium">Geographical State of Origin:</span> <strong>${data.biodata.state} (${data.biodata.lga})</strong></div>
                    <div class="md:col-span-2"><span class="text-slate-400 font-medium">Residential Contact Address:</span> <strong>${data.biodata.address}</strong></div>
                </div>
            </div>

            <div>
                <h3 class="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b pb-1 mb-3">Next of Kin Contact Layer</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-800">
                    <div><span class="text-slate-400 font-medium">Kin Name Index:</span> <strong class="text-slate-950">${data.nextOfKin.name}</strong></div>
                    <div><span class="text-slate-400 font-medium">Structural Linkage:</span> <strong>${data.nextOfKin.relation}</strong></div>
                    <div><span class="text-slate-400 font-medium">Kin Telephone Line:</span> <strong class="font-mono">${data.nextOfKin.phone}</strong></div>
                    <div><span class="text-slate-400 font-medium">Kin Physical Address:</span> <strong>${data.nextOfKin.address}</strong></div>
                </div>
            </div>

            <div>
                <h3 class="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b pb-1 mb-3">Academic Score Card & Secondary Credentials Profile</h3>
                <div class="mb-3">
                    <span class="text-slate-500 font-medium">Official Certified UTME Metric Score:</span> 
                    <strong class="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-xs">${data.academic.score} Points</strong>
                </div>
                <div class="bg-slate-50 rounded border overflow-hidden">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-200/80 font-bold text-slate-700 border-b">
                                <th class="p-2">Subject Title</th>
                                <th class="p-2">Sitting Source Exam Group</th>
                                <th class="p-2 text-center">Score Grade</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            ${data.olevel.map(row => `
                                <tr>
                                    <td class="p-2 font-medium text-slate-800">${row.subject || 'N/A'}</td>
                                    <td class="p-2 text-slate-600">${row.sitting || 'N/A'}</td>
                                    <td class="p-2 text-center font-bold text-emerald-800">${row.grade || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    btnLock.addEventListener('click', () => {
        btnLock.classList.add('hidden');
        btnPrint.classList.remove('hidden');
        alert("Verification completed. Data logs sealed. Ready for administrative presentation.");
    });

    // Execution loop to trigger both real EmailJS transmission and the local popup simulator
    const dispatchDynamicNotificationEmail = (payload) => {
        // Trigger floating corner alert notification toast
        const toast = document.getElementById('email-toast');
        if (toast) toast.classList.remove('hidden');

        // Populate dynamic properties into simulator overlay box window elements
        document.getElementById('sim-email-to').textContent = payload.biodata.email;
        document.getElementById('sim-applicant-name').textContent = payload.biodata.name;
        document.getElementById('sim-jamb-no').textContent = payload.jambNo;
        document.getElementById('sim-ref-id').textContent = payload.applicationId;
        document.getElementById('sim-course').textContent = payload.academic.course;
        document.getElementById('sim-phone').textContent = payload.biodata.phone;

        // Display the simulation modal after 1.5 seconds
        setTimeout(() => {
            const modal = document.getElementById('email-modal-simulator');
            if (modal) modal.classList.remove('hidden');
        }, 1500);

        // Run authentic server upload routine
        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
            const structuralParams = {
                to_email: payload.biodata.email,
                applicant_name: payload.biodata.name,
                jamb_number: payload.jambNo,
                course_choice: payload.academic.course,
                payment_reference: payload.applicationId,
                phone_number: payload.biodata.phone
            };
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, structuralParams).catch(err => console.log(err));
        }
    };

    const buildAdminViewDataLogs = () => {
        adminTableBody.innerHTML = '';
        const db = getStorageData();
        const processingKeys = Object.keys(db);

        if (processingKeys.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">No candidate data files located inside browser session storage cache.</td></tr>`;
            return;
        }

        processingKeys.forEach(key => {
            const rowData = db[key];
            const tableRow = document.createElement('tr');
            tableRow.className = "hover:bg-slate-50/70 transition-colors";
            
            tableRow.innerHTML = `
                <td class="p-3 font-mono font-bold text-slate-900">${rowData.jambNo}</td>
                <td class="p-3 font-semibold uppercase text-slate-700">${rowData.biodata.name}</td>
                <td class="p-3 font-mono font-bold text-slate-800">${rowData.academic.score}</td>
                <td class="p-3 text-slate-600 font-medium">${rowData.academic.course}</td>
                <td class="p-3">
                    <select id="status-toggle-${rowData.jambNo}" class="p-1 border rounded text-xs font-bold bg-white text-slate-700 outline-none">
                        <option value="Pending" ${rowData.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Under Review" ${rowData.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="Admitted" ${rowData.status === 'Admitted' ? 'selected' : ''}>Admitted</option>
                        <option value="Rejected" ${rowData.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td class="p-3 text-center">
                    <button id="del-btn-${rowData.jambNo}" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded px-2 py-1 text-[11px] font-bold uppercase">Purge</button>
                </td>
            `;
            
            adminTableBody.appendChild(tableRow);

            document.getElementById(`status-toggle-${rowData.jambNo}`).addEventListener('change', (e) => {
                const currentDb = getStorageData();
                currentDb[rowData.jambNo].status = e.target.value;
                setStorageData(currentDb);
            });

            document.getElementById(`del-btn-${rowData.jambNo}`).addEventListener('click', () => {
                if (confirm(`Remove candidate profile logs assigned to ${rowData.jambNo}?`)) {
                    const currentDb = getStorageData();
                    delete currentDb[rowData.jambNo];
                    setStorageData(currentDb);
                    buildAdminViewDataLogs();
                }
            });
        });
    };

    adminClearAll.addEventListener('click', () => {
        if (confirm("⚠️ System Master Warning: Completely purge applicant runtime data logs from system local storage cache?")) {
            localStorage.removeItem('uniosun_db');
            buildAdminViewDataLogs();
        }
    });
});
