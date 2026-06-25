// 1. Initialize API Integrations
(function(){
    // EmailJS Public Initialization Token
    emailjs.init({ publicKey: "IiipzsMLoYhdtmUm7" });
})();

// 2. Interface Router: Switches Portal Tabs View
function switchTab(showId, hideId) {
    document.getElementById(showId).classList.remove('hidden');
    document.getElementById(hideId).classList.add('hidden');
    
    document.getElementById(`btn-${showId}`).className = "px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-all bg-amber-500 text-emerald-950";
    document.getElementById(`btn-${hideId}`).className = "px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-all text-emerald-100 hover:text-white";
}

// 3. Intercepts submission and initializes Paystack Payment Window Popup
function handleApplicationSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const course = document.getElementById('course').value;
    const sisterName = document.getElementById('sisterName').value;
    const nextOfKin = document.getElementById('nextOfKin').value;

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: 'pk_test_bcd318f5e1420ba1743cf656363315a862fba1ed', // Authorized Test Public Key
        email: email,
        amount: 250000, // NGN 2,500 calculated in lowest currency units (kobo)
        currency: 'NGN',
        firstName: fullName.split(' ')[0] || '',
        lastName: fullName.split(' ')[1] || '',
        onSuccess: function(transaction) {
            // Fires ONLY upon confirmed API payment response clearing
            saveApplicationToDatabase(transaction.reference, {
                fullName, email, phone, course, sisterName, nextOfKin
            });
        },
        onCancel: function() {
            alert('Transaction terminated by applicant. Payment validation is mandatory.');
        }
    });
}

// 4. Client Database Serialization (LocalStorage Management)
function saveApplicationToDatabase(payRef, applicantData) {
    const appId = 'APP-' + Date.now().toString().slice(-6); // Unique dynamic token ID string
    
    const record = {
        id: appId,
        ...applicantData,
        paymentReference: payRef,
        status: "Under Screening", // Default processing status state
        date: new Date().toLocaleDateString()
    };

    // Commit state row map straight into the browser database environment
    localStorage.setItem(appId, JSON.stringify(record));

    // Execute background dispatch communication link
    sendEmailReceipt(record);

    alert(`Payment Cleared Successfully!\nYour Application Tracking ID is: ${appId}`);
    
    document.getElementById('screeningForm').reset();
    switchTab('track-tab', 'apply-tab');
    document.getElementById('trackIdInput').value = appId;
    trackApplication();
}

// 5. External API Integrator Engine: Dispatches email content triggers using EmailJS
function sendEmailReceipt(record) {
    const templateParams = {
        to_name: record.fullName,
        to_email: record.email,
        application_id: record.id,
        selected_course: record.course,
        payment_ref: record.paymentReference
    };

    emailjs.send('service_pc0nsyr', 'template_pey3t8n', templateParams)
        .then(() => console.log('Automated tracking email delivery dispatched successfully.'))
        .catch((err) => console.error('API Email gateway error trace: ', err));
}

// 6. Realtime Tracking Engine: Processes status lookups and mutates progress lines
function trackApplication() {
    const trackId = document.getElementById('trackIdInput').value.trim().toUpperCase();
    const resultBox = document.getElementById('trackingResult');

    if (!trackId) {
        alert('Please provide your Application token string.');
        return;
    }

    const dataStr = localStorage.getItem(trackId);

    if (!dataStr) {
        alert('No portfolio match linked to this Application ID.');
        resultBox.classList.add('hidden');
        return;
    }

    const record = JSON.parse(dataStr);

    // Bind record keys down directly to the interface template labels
    document.getElementById('resId').innerText = record.id;
    document.getElementById('resName').innerText = record.fullName;
    document.getElementById('resCourse').innerText = record.course;
    document.getElementById('resPayRef').innerText = record.paymentReference;
    document.getElementById('resDate').innerText = record.date;
    
    const statusBadge = document.getElementById('resStatus');
    statusBadge.innerText = record.status;

    const lineProgress = document.getElementById('lineProgress');
    const stepScreening = document.getElementById('stepScreening');
    const stepAdmission = document.getElementById('stepAdmission');

    // UI State Engine mutations based on database record metrics values
    if (record.status === "Under Screening") {
        statusBadge.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800";
        lineProgress.style.width = "50%";
        stepScreening.className = "w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow";
        stepAdmission.className = "w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shadow";
        stepScreening.innerText = "2";
    } else if (record.status === "Admitted") {
        statusBadge.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800";
        lineProgress.style.width = "100%";
        stepScreening.className = "w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow";
        stepAdmission.className = "w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow";
        stepScreening.innerText = "✓";
        stepAdmission.innerText = "✓";
    }

    resultBox.classList.remove('hidden');
}
