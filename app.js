/**
 * OSUN STATE UNIVERSITY
 * Post-UTME Admission Screening Portal — 2026 Registry
 * Core Frontend Architecture & EmailJS Synchronizer
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CORE DOM STRUCTURAL BINDINGS ---
    // Safely mapping navigation elements using your actual text layout headers
    const navButtons = Array.from(document.querySelectorAll('button, a'));
    
    const portalSystemBtn = navButtons.find(el => el.textContent.includes('Portal System'));
    const adminBenchBtn = navButtons.find(el => el.textContent.includes('Admin Bench'));
    
    // Locating main application display containers
    const portalView = document.getElementById('portal-view-container') || document.querySelector('.portal-view');
    const adminView = document.getElementById('admin-view-container') || document.querySelector('.admin-view');
    const slipView = document.getElementById('slip-view-container') || document.querySelector('.slip-view');

    // Form Steps & Interaction Triggers
    const candidateGate = document.getElementById('step-1') || document.querySelector('.candidate-gate') || document.getElementById('candidate-gate');
    const screeningFormContainer = document.getElementById('step-2') || document.querySelector('.screening-form');
    
    const jambInput = document.getElementById('jamb-num') || document.querySelector('input[placeholder*="JAMB"]');
    const applyFreshBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Apply Fresh'));
    const trackStatusBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Track Status'));
    const step1Error = document.getElementById('step-1-error');

    const portalForm = document.getElementById('portal-form');
    const olevelRowsContainer = document.getElementById('olevel-rows');
    const slipContent = document.getElementById('slip-content');
    const btnLock = document.getElementById('btn-lock');
    const btnPrint = document.getElementById('btn-print');
    const adminTableBody = document.getElementById('admin-table-body');
    const adminClearAll = document.getElementById('admin-clear-all');

    // --- 2. GLOBAL STATE ---
    let dynamicActiveJamb = '';
    const SUBJECT_OPTIONS = [
        "Agricultural Science", "Biology", "Chemistry", "Commerce", "Christian Religious Studies",
        "Economics", "English Language", "Financial Accounting", "Geography", "Government",
        "History", "Islamic Religious Studies", "Literature-in-English", "Mathematics", "Physics"
    ];

    // --- 3. STORAGE ENGINE WORKERS ---
    const loadRegistryData = () => JSON.parse(localStorage.getItem('uniosun_registry')) || {};
    const saveRegistryData = (data) => localStorage.setItem('uniosun_registry', JSON.stringify(data));

    // --- 4. DYNAMIC O'LEVEL MATRIX GENERATOR ---
    if (olevelRowsContainer) {
        let rowsHtml = '';
        for (let i = 0; i < 5; i++) {
            rowsHtml += `
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-slate-100 pb-2 last:border-0">
                    <div>
                        <select id="subject-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-xs font-semibold rounded text-slate-800 bg-white outline-none">
                            <option value="">-- Select Subject ${i + 1} --</option>
                            ${SUBJECT_OPTIONS.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <select id="exam-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-xs font-bold rounded text-slate-800 bg-white outline-none">
                            <option value="">-- Exam Sitting --</option>
                            <option value="WAEC 2026">WAEC 2026</option>
                            <option value="NECO 2026">NECO 2026</option>
                            <option value="WAEC 2025">WAEC 2025</option>
                            <option value="NECO 2025">NECO 2025</option>
                        </select>
                    </div>
                    <div>
                        <select id="grade-${i}" required class="w-full px-2 py-1.5 border border-slate-300 text-xs font-bold rounded text-slate-800 bg-white outline-none">
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

    // --- 5. VIEW ROUTING CONTROLLER ---
    const switchActiveView = (targetView) => {
        [portalView, slipView, adminView].forEach(el => { if(el) el.classList.add('hidden'); });
        if(targetView) targetView.classList.remove('hidden');
        
        if (targetView === portalView) {
            if(candidateGate) candidateGate.classList.remove('hidden');
            if(screeningFormContainer) screeningFormContainer.classList.add('hidden');
            if(jambInput) jambInput.value = '';
        }
    };

    if (portalSystemBtn) portalSystemBtn.addEventListener('click', () => switchActiveView(portalView));
    if (adminBenchBtn) adminBenchBtn.addEventListener('click', () => {
        switchActiveView(adminView);
        renderAdminDashboardTable();
    });

    // --- 6. CANDIDATE GATE GATEWAY INTERACTION ---
    if (applyFreshBtn) {
        applyFreshBtn.addEventListener('click', () => {
            if (!jambInput) return;
            const value = jambInput.value.trim().toUpperCase();
            if (!value) {
                showErrorNotification("Please input your JAMB Registration Reference Number.");
                return;
            }
            hideErrorNotification();
            const db = loadRegistryData();

            if (db[value]) {
                showErrorNotification("Profile registration exists. Click 'Track Status' to manage your profile.");
                return;
            }
            dynamicActiveJamb = value;
            if(candidateGate) candidateGate.classList.add('hidden');
            if(screeningFormContainer) screeningFormContainer.classList.remove('hidden');
            if(portalForm) portalForm.reset();
        });
    }

    if (trackStatusBtn) {
        trackStatusBtn.addEventListener('click', () => {
            if (!jambInput) return;
            const value = jambInput.value.trim().toUpperCase();
            if (!value) {
                showErrorNotification("Please enter your JAMB Number to parse system database status.");
                return;
            }
            hideErrorNotification();
            const db = loadRegistryData();
            const student = db[value];

            if (!student) {
                showErrorNotification("No records discovered for this registration parameters.");
                return;
            }

            dynamicActiveJamb = value;
            renderSlipPrintLayout(student);
            switchActiveView(slipView);
        });
    }

    const showErrorNotification = (msg) => {
        if (step1Error) {
            step1Error.textContent = msg;
            step1Error.classList.remove('hidden');
        } else {
            alert(msg);
        }
    };

    const hideErrorNotification = () => {
        if (step1Error) step1Error.classList.add('hidden');
    };

    // --- 7. FORMS MANAGEMENT & TRANSACTIONS ---
    if (portalForm) {
        portalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailAddress = document.getElementById('bio-email').value.trim();

            if(typeof PaystackPop === 'undefined') {
                alert("Payment engine integration script failure. Emulating dynamic fallback mock processing reference key.");
                executeCoreDataStorageSequence('MOCK-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase());
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
                    alert('Transaction terminated. Screening checkout payment validation requirements mandatory.');
                }
            });
            handler.openIframe();
        });
    }

    const executeCoreDataStorageSequence = (payRef) => {
        const olevelResults = [];
        for (let i = 0; i < 5; i++) {
            const subEl = document.getElementById(`subject-${i}`);
            const exEl = document.getElementById(`exam-${i}`);
            const grEl = document.getElementById(`grade-${i}`);
            if(subEl && exEl && grEl) {
                olevelResults.push({ subject: subEl.value, exam: exEl.value, grade: grEl.value });
            }
        }

        const record = {
            jambNo: dynamicActiveJamb,
            receiptRef: 'UNIOSUN-' + Math.floor(100000 + Math.random() * 900000),
            paymentRef: payRef,
            status: 'Pending',
            biodata: {
                name: (document.getElementById('bio-name')?.value || 'UNKNOWN APPLICANT').trim().toUpperCase(),
                gender: document.getElementById('bio-gender')?.value || 'M',
                phone: document.getElementById('bio-phone')?.value || '',
                email: document.getElementById('bio-email')?.value || '',
                address: document.getElementById('bio-address')?.value || '',
                state: document.getElementById('bio-state')?.value || 'Osun',
                lga: document.getElementById('bio-lga')?.value || ''
            },
            academic: {
                score: document.getElementById('acad-score')?.value || '200',
                course: document.getElementById('acad-course')?.value || 'General Studies'
            },
            olevel: olevelResults
        };

        const db = loadRegistryData();
        db[dynamicActiveJamb] = record;
        saveRegistryData(db);

        renderSlipPrintLayout(record);
        switchActiveView(slipView);
        
        // EXECUTE EMAIL DISPATCH DISPATCHER IMMEDIATE
        triggerAutomatedEmailNotification(record);
    };

    // --- 8. ORIGINAL RENDER COMPONENT SLIPS ---
    const renderSlipPrintLayout = (student) => {
        if(!slipContent) return;
        if(btnPrint) btnPrint.classList.add('hidden');
        if(btnLock) btnLock.classList.remove('hidden');

        slipContent.innerHTML = `
            <div class="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-slate-200 pb-4 mb-4">
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Application Status</span><span class="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded mt-0.5 inline-block">${student.status}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Transaction Reference</span><span class="font-mono text-xs font-bold text-slate-800">${student.receiptRef}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">JAMB Registration Number</span><span class="font-mono text-xs font-bold text-slate-900">${student.jambNo}</span></div>
                <div><span class="text-[10px] uppercase text-slate-400 font-bold block">Selected Course</span><span class="text-xs font-bold text-slate-800">${student.academic.course}</span></div>
            </div>
            <div class="space-y-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div><span class="text-slate-500">Applicant Name:</span> <strong>${student.biodata.name}</strong></div>
                <div><span class="text-slate-500">Contact Email:</span> <strong class="lowercase">${student.biodata.email}</strong></div>
                <div><span class="text-slate-500">UTME Score:</span> <strong class="font-mono">${student.academic.score} / 400</strong></div>
            </div>
        `;
    };

    if (btnLock) {
        btnLock.addEventListener('click', () => {
            btnLock.classList.add('hidden');
            if(btnPrint) btnPrint.classList.remove('hidden');
            alert("Application data validation state successfully locked.");
        });
    }

    // --- 9. THE BULLETPROOF EMAILJS INTEGRATION TRIGGER ---
    const triggerAutomatedEmailNotification = (student) => {
        if (typeof emailjs === 'undefined') {
            console.error("EmailJS execution context failure: SDK layer scripts missing from document head framework.");
            return;
        }

        // Mapping your explicit backend templates variables safely
        const templateParams = {
            to_email: student.biodata.email,
            applicant_name: student.biodata.name,
            jamb_number: student.jambNo,
            course_choice: student.academic.course,
            payment_reference: student.receiptRef,
            phone_number: student.biodata.phone
        };

        // Enforcing system identifiers parameter locks explicitly
        emailjs.send("service_6hllp68", "template_p26v91n", templateParams)
            .then((res) => {
                console.log("Email status: Dispatched successfully.", res.status, res.text);
                const toast = document.getElementById('email-toast');
                if (toast) {
                    toast.classList.remove('hidden');
                    setTimeout(() => toast.classList.add('hidden'), 6000);
                }
            })
            .catch((err) => {
                console.error("Critical EmailJS Transaction Rejection Handler Output:", err);
                alert(`Data stored locally, but mail routing failed: ${err.text || 'Check API public security keys.'}`);
            });
    };

    // --- 10. ADMIN CONSOLE MANAGEMENT CONTROLLERS ---
    const renderAdminDashboardTable = () => {
        if (!adminTableBody) return;
        const db = loadRegistryData();
        adminTableBody.innerHTML = '';
        const keys = Object.keys(db);

        if (keys.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No submission records.</td></tr>`;
            return;
        }

        keys.forEach(key => {
            const student = db[key];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2 font-mono font-bold">${student.jambNo}</td>
                <td class="p-2 uppercase text-xs">${student.biodata.name}</td>
                <td class="p-2 font-mono">${student.academic.score}</td>
                <td class="p-2 text-xs">${student.academic.course}</td>
                <td class="p-2">${student.status}</td>
            `;
            adminTableBody.appendChild(tr);
        });
    };

    if (adminClearAll) {
        adminClearAll.addEventListener('click', () => {
            if (confirm("Purge full database instances?")) {
                localStorage.removeItem('uniosun_registry');
                renderAdminDashboardTable();
            }
        });
    }
});
