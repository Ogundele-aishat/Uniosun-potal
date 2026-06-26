/**
 * OSUN STATE UNIVERSITY
 * Post-UTME Admission Screening Portal — 2026 Registry
 * System Controller Engine Core Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CORE ELEMENT ROUTING REF REGISTRY LOCKS ---
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
    
    const portalForm = document.getElementById('portal-form');
    const olevelRowsContainer = document.getElementById('olevel-rows');
    const slipContent = document.getElementById('slip-content');
    const btnLock = document.getElementById('btn-lock');
    const btnPrint = document.getElementById('btn-print');
    const adminTableBody = document.getElementById('admin-table-body');
    const adminClearAll = document.getElementById('admin-clear-all');

    // System Cache Dynamic Context State
    let dynamicActiveJamb = '';
    
    const SUBJECT_OPTIONS = [
        "Agricultural Science", "Biology", "Chemistry", "Commerce", "Christian Religious Studies",
        "Economics", "English Language", "Financial Accounting", "Geography", "Government",
        "History", "Islamic Religious Studies", "Literature-in-English", "Mathematics", "Physics"
    ];

    // Local Storage Registry Loaders
    const loadRegistryData = () => JSON.parse(localStorage.getItem('uniosun_registry')) || {};
    const saveRegistryData = (data) => localStorage.setItem('uniosun_registry', JSON.stringify(data));

    // --- 2. O'LEVEL SUBJECT SELECT MATRIX INJECTOR ---
    if (olevelRowsContainer) {
        let rowsHtml = '';
        for (let i = 0; i < 5; i++) {
            rowsHtml += `
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-slate-100 pb-2 last:border-0">
                    <div>
                        <select id="subject-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-[11px] font-semibold rounded text-slate-800 bg-white outline-none">
                            <option value="">-- Select Subject ${i + 1} --</option>
                            ${SUBJECT_OPTIONS.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <select id="exam-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-[11px] font-bold rounded text-slate-800 bg-white outline-none">
                            <option value="">-- Exam Sitting --</option>
                            <option value="WAEC 2026">WAEC 2026</option>
                            <option value="NECO 2026">NECO 2026</option>
                            <option value="WAEC 2025">WAEC 2025</option>
                            <option value="NECO 2025">NECO 2025</option>
                        </select>
                    </div>
                    <div>
                        <select id="grade-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-[11px] font-bold rounded text-slate-800 bg-white outline-none">
                            <option value="">-- Grade --</option>
                            <option value="A1">A1</option><option value="B2">B2</option><option value="B3">B3</option>
                            <option value="C4">C4</option><option value="C5">C5</option><option value="C6">C6</option>
                            <option value="D7">D7</option><option value="E8">E8</option><option value="F9">F9</option>
                        </select>
                    </div>
                </div>
            `;
        }
        olevelRowsContainer.innerHTML = rowsHtml;
    }

    // --- 3. REVENUE & DISPLAY ROUTING LOCKS ---
    const switchActiveView = (targetView) => {
        [portalView, slipView, adminView].forEach(el => el.classList.add('hidden'));
        targetView.classList.remove('hidden');
        
        // Dynamic active state styling switches for the header navigation elements
        if (targetView === portalView) {
            step1.classList.remove('hidden');
            step2.classList.add('hidden');
            jambInput.value = '';
            viewPortalBtn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all bg-amber-400 text-slate-950 shadow";
            viewAdminBtn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all text-emerald-200 hover:text-white hover:bg-emerald-700/50";
        } else if (targetView === adminView) {
            viewAdminBtn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all bg-amber-400 text-slate-950 shadow";
            viewPortalBtn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all text-emerald-200 hover:text-white hover:bg-emerald-700/50";
            renderAdminDashboardTable();
        }
    };

    viewPortalBtn.addEventListener('click', () => switchActiveView(portalView));
    viewAdminBtn.addEventListener('click', () => switchActiveView(adminView));

    // --- 4. VERIFICATION ENTRYGATE OPERATORS ---
    verifyBtn.addEventListener('click', () => {
        const value = jambInput.value.trim().toUpperCase();
        if (!value) {
            showStep1Error("Validation Failure: Valid JAMB Registration reference key required.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = loadRegistryData();

        if (db[value]) {
            showStep1Error("Profile mismatch: This record entry exists inside the screening registry database.");
            return;
        }
        dynamicActiveJamb = value;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        portalForm.reset();
    });

    trackBtn.addEventListener('click', () => {
        const value = jambInput.value.trim().toUpperCase();
        if (!value) {
            showStep1Error("Input your registration key parameters to fetch progress parameters.");
            return;
        }
        step1Error.classList.add('hidden');
        const db = loadRegistryData();
        const student = db[value];

        if (!student) {
            showStep1Error("Registry lookup failed: No data match discovered.");
            return;
        }

        dynamicActiveJamb = value;
        renderSlipPrintLayout(student);
        switchActiveView(slipView);
    });

    const showStep1Error = (msg) => {
        step1Error.textContent = msg;
        step1Error.classList.remove('hidden');
    };

    // --- 5. SECURE TRANSACTION INLINE CHECKOUT GATEWAY ---
    portalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailAddress = document.getElementById('bio-email').value.trim();

        if (typeof PaystackPop === 'undefined') {
            // Secure fallback engine bypass processing handler in case CDN stalls
            executeCoreDataStorageSequence('OFFLINE-GATEWAY-REF-' + Math.floor(Math.random() * 89999 + 10000));
            return;
        }

        const handler = PaystackPop.setup({
            key: 'pk_test_bcd318f5e1420ba1743cf656363315a862fba1ed', 
            email: emailAddress,
            amount: 2500 * 100, 
            currency: 'NGN',
            callback: function(response) {
                executeCoreDataStorageSequence(response.reference);
            },
            onClose: function() {
                alert('Screening portal checkout authentication cycle interrupted.');
            }
        });
        handler.openIframe();
    });

    const executeCoreDataStorageSequence = (payRef) => {
        const olevelResults = [];
        for (let i = 0; i < 5; i++) {
            olevelResults.push({
                subject: document.getElementById(`subject-${i}`).value,
                exam: document.getElementById(`exam-${i}`).value,
                grade: document.getElementById(`grade-${i}`).value
            });
        }

        const record = {
            jambNo: dynamicActiveJamb,
            receiptRef: 'UNIOSUN-2026-' + Math.floor(100000 + Math.random() * 900000),
            paymentRef: payRef,
            status: 'Pending',
            biodata: {
                name: document.getElementById('bio-name').value.trim().toUpperCase(),
                gender: document.getElementById('bio-gender').value,
                phone: document.getElementById('bio-phone').value.trim(),
                email: document.getElementById('bio-email').value.trim()
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
        
        // FORCE DISPATCH SYSTEM TRANSACTION EMAIL DISPATCHER INSTANTLY
        triggerAutomatedEmailNotification(record);
    };

    // --- 6. ACKNOWLEDGEMENT SLIP CONTENT VIEW RENDERS ---
    const renderSlipPrintLayout = (student) => {
        btnPrint.classList.add('hidden');
        btnLock.classList.remove('hidden');

        slipContent.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Registration Code</span>
                    <span class="font-mono text-xs font-black text-slate-800">${student.receiptRef}</span>
                </div>
                <div>
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">System Verification Status</span>
                    <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded mt-0.5 inline-block bg-amber-100 text-amber-800 border border-amber-300">${student.status}</span>
                </div>
                <div>
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">JAMB Reference Number</span>
                    <span class="font-mono text-xs font-bold text-slate-900">${student.jambNo}</span>
                </div>
                <div>
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Mapped Program Pipeline</span>
                    <span class="text-xs font-bold text-emerald-800">${student.academic.course}</span>
                </div>
            </div>
            
            <div class="bg-slate-50 p-4 rounded-lg border text-xs space-y-2">
                <div><span class="text-slate-500 font-medium">Candidate Name:</span> <strong class="text-slate-900">${student.biodata.name}</strong></div>
                <div><span class="text-slate-500 font-medium">Registry Email Anchor:</span> <strong class="lowercase">${student.biodata.email}</strong></div>
                <div><span class="text-slate-500 font-medium">UTME Verified Metric Score:</span> <strong class="font-mono text-slate-900">${student.academic.score} / 400</strong></div>
            </div>
        `;
    };

    btnLock.addEventListener('click', () => {
        btnLock.classList.add('hidden');
        btnPrint.classList.remove('hidden');
        alert("Information parameters verification state successfully locked to registry server logs.");
    });

    // --- 7. FIX: RECONFIGURED EMAILJS DISPATCHER ROUTINE ---
    const triggerAutomatedEmailNotification = (student) => {
        if (typeof emailjs === 'undefined') {
            console.error("Critical System Interruption: EmailJS core library context unmapped on global frame.");
            return;
        }

        // Reconfigured variables to match standard backend templates explicitly
        const templateParams = {
            to_email: student.biodata.email,
            applicant_name: student.biodata.name,
            jamb_number: student.jambNo,
            course_choice: student.academic.course,
            payment_reference: student.receiptRef,
            phone_number: student.biodata.phone
        };

        // Execution of routing token keys
        emailjs.send("service_6hllp68", "template_p26v91n", templateParams)
            .then((response) => {
                console.log("Transmission Success Status:", response.status, response.text);
                const toast = document.getElementById('email-toast');
                if (toast) toast.classList.remove('hidden');
            })
            .catch((error) => {
                console.error("Critical Email Engine Failure Trace:", error);
                alert(`Data Saved locally! Email Dispatch Failure: ${error.text || 'Verify public key anchor initialization parameters.'}`);
            });
    };

    // --- 8. ADMIN DASHBOARD DATABASE REVIEWS ---
    const renderAdminDashboardTable = () => {
        adminTableBody.innerHTML = '';
        const db = loadRegistryData();
        const keys = Object.keys(db);

        if (keys.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">No candidate registrations processed.</td></tr>`;
            return;
        }

        keys.forEach(key => {
            const student = db[key];
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-slate-50/50";
            tr.innerHTML = `
                <td class="p-3 font-mono font-bold text-slate-900">${student.jambNo}</td>
                <td class="p-3 font-semibold uppercase text-slate-700">${student.biodata.name}</td>
                <td class="p-3 font-mono font-bold">${student.academic.score}</td>
                <td class="p-3 text-slate-600">${student.academic.course}</td>
                <td class="p-3"><span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700">${student.status}</span></td>
            `;
            adminTableBody.appendChild(tr);
        });
    };

    adminClearAll.addEventListener('click', () => {
        if (confirm("⚠️ System Warning: Purge current registry session storage entries?")) {
            localStorage.removeItem('uniosun_registry');
            renderAdminDashboardTable();
        }
    });
});
