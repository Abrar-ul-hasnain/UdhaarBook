// =====================
// NAVIGATION CORE
// =====================

function showScreen(id) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show target screen
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

// =====================
// INIT — runs on page load
// =====================

function init() {
  const params    = new URLSearchParams(window.location.search);
  const confirmId = params.get('confirm');

  if (confirmId) {
    loadConfirmScreen(confirmId);
    showScreen('screen-confirm');
  } else {
    renderHomeScreen();
    showScreen('screen-home');
  }
 
  initButtonEffects();
}


// =====================
// LOCALSTORAGE HELPERS
// =====================

function saveUdhaar(data) {
  const all = getAllUdhaars();
  all.push(data);
  localStorage.setItem('udhaars', JSON.stringify(all));
  // Firebase mein bhi save karo
  if (window.firebaseSaveUdhaar) {
    window.firebaseSaveUdhaar(data);
  }
}

function getAllUdhaars() {
  return JSON.parse(localStorage.getItem('udhaars') || '[]');
}

function getUdhaarById(id) {
  return getAllUdhaars().find(u => u.id === id) || null;
}

function updateUdhaar(id, changes) {
  const all = getAllUdhaars();
  const index = all.findIndex(u => u.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], ...changes };
    localStorage.setItem('udhaars', JSON.stringify(all));
  }
  // Firebase mein bhi update karo
  if (window.firebaseUpdateUdhaar) {
    window.firebaseUpdateUdhaar(id, changes);
  }
}

// =====================
// STATUS & DATE HELPERS
// =====================

function getDaysRemaining(dueDate) {
  return dayjs(dueDate).diff(dayjs().startOf('day'), 'day');
}

function getBadgeStatus(udhaar) {
  if (udhaar.status === 'pending') return 'pending';
  if (udhaar.status === 'paid')    return 'paid';
  if (udhaar.status === 'declined') return 'declined';
  const days = getDaysRemaining(udhaar.dueDate);
  if (days < 0)  return 'overdue';
  if (days <= 3) return 'soon';
  return 'active';
}

function formatDate(dateStr) {
  return dayjs(dateStr).format('MMM D, YYYY');
}

function formatAmount(amount) {
  return 'PKR ' + Number(amount).toLocaleString();
}

// =====================
// HOME SCREEN
// =====================

function renderHomeScreen() {
  const all = getAllUdhaars();

  // Stats
  const given    = all.filter(u => u.lender === 'You');
  const overdue  = given.filter(u => getBadgeStatus(u) === 'overdue');
  const totalGiven = given.reduce((sum, u) => sum + u.amount, 0);

  document.getElementById('stat-given').textContent   = formatAmount(totalGiven);
  document.getElementById('stat-taken').textContent   = 'PKR 0';
  document.getElementById('stat-overdue').textContent = overdue.length;

  // Recent activity
  const container = document.getElementById('recent-activity-list');
  const recent = [...all].reverse().slice(0, 3);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ri-file-list-3-line"></i>
        No udhaar recorded yet
      </div>`;
    return;
  }

  container.innerHTML = recent.map(u => {
    const status = getBadgeStatus(u);
    return `
      <div class="activity-card" onclick="loadContractScreen('${u.id}')">
        <div class="activity-left">
          <span class="activity-name">${u.borrower}</span>
          <span class="activity-due">Due ${formatDate(u.dueDate)}</span>
        </div>
        <div class="activity-right">
          <span class="activity-amount">${formatAmount(u.amount)}</span>
          <span class="badge badge-${status}">${status}</span>
        </div>
      </div>`;
  }).join('');
}

// =====================
// CREATE UDHAAR
// =====================

function generateContractId() {
  const year = dayjs().year();
  const all  = getAllUdhaars();
  const num  = String(all.length + 1).padStart(3, '0');
  return `UB-${year}-${num}`;
}

function createUdhaar() {
  // Read fields
const borrower        = document.getElementById('field-borrower').value.trim();
const phone           = document.getElementById('field-phone').value.trim().replace(/\D/g, '');
const amount          = document.getElementById('field-amount').value.trim();
const dueDate         = document.getElementById('field-due').value;
const note            = document.getElementById('field-note').value.trim();
const fatherName      = document.getElementById('field-father').value.trim();
const cnic            = document.getElementById('field-cnic').value.trim();
const account         = document.getElementById('field-account').value.trim();
const guarantor       = document.getElementById('field-guarantor').value.trim();
const guarantorPhone  = document.getElementById('field-guarantor-phone').value.trim();
  // Validate
  if (!borrower) {
    Swal.fire({ icon: 'warning', title: 'Missing field', text: 'Please enter borrower name.', confirmButtonColor: '#0F6E56' });
    return;
  }
  if (!phone || phone.length < 10) {
    Swal.fire({ icon: 'warning', title: 'Invalid phone', text: 'Please enter a valid phone number.', confirmButtonColor: '#0F6E56' });
    return;
  }
  if (!amount || Number(amount) <= 0) {
    Swal.fire({ icon: 'warning', title: 'Invalid amount', text: 'Please enter a valid amount.', confirmButtonColor: '#0F6E56' });
    return;
  }
  if (!dueDate) {
    Swal.fire({ icon: 'warning', title: 'Missing field', text: 'Please select a due date.', confirmButtonColor: '#0F6E56' });
    return;
  }
  if (!fatherName) {
  Swal.fire({ icon: 'warning', title: 'Missing field', text: "Please enter borrower's father name.", confirmButtonColor: '#0F6E56' });
  return;
}
if (!cnic || cnic.length < 13) {
  Swal.fire({ icon: 'warning', title: 'Invalid CNIC', text: 'Please enter a valid CNIC number.', confirmButtonColor: '#0F6E56' });
  return;
}
if (!account) {
  Swal.fire({ icon: 'warning', title: 'Missing field', text: 'Please enter bank/JazzCash/Easypaisa number.', confirmButtonColor: '#0F6E56' });
  return;
}

  // Build object
 const udhaar = {
  id:             generateContractId(),
  lender:         'You',
  borrower:       borrower,
  phone:          phone.startsWith('92') ? phone : '92' + phone.replace(/^0/, ''),
  amount:         Number(amount),
  note:           note,
  fatherName:     fatherName,
  cnic:           cnic,
  account:        account,
  guarantor:      guarantor,
  guarantorPhone: guarantorPhone,
  createdDate:    dayjs().format('YYYY-MM-DD'),
  dueDate:        dueDate,
  status:         'pending',
  confirmedDate:  null,
  paidDate:       null,
  remindersCount: 0
};

  // Save
  saveUdhaar(udhaar);

  // Go to send confirmation screen
  loadSendConfirmationScreen(udhaar.id);
}

// =====================
// SEND CONFIRMATION SCREEN
// =====================

function buildConfirmationLink(id) {
  const u = getUdhaarById(id);
  if (!u) return '';
  const shortData = {
    i: u.id,
    b: u.borrower,
    l: u.lender,
    a: u.amount,
    d: u.dueDate,
    p: u.phone,
    n: u.note || ''
  };
  const encoded = encodeURIComponent(JSON.stringify(shortData));
  return `https://udhaarbook.netlify.app/?confirm=${id}&data=${encoded}`;
}
function buildWhatsAppLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function loadSendConfirmationScreen(id) {
  const u = getUdhaarById(id);
  if (!u) return;

  // Fill summary
  document.getElementById('sc-borrower').textContent = u.borrower;
  document.getElementById('sc-amount').textContent   = formatAmount(u.amount);
  document.getElementById('sc-due').textContent      = formatDate(u.dueDate);

  // Build message
  const link    = buildConfirmationLink(u.id);
  const message = `Assalamu Alaikum ${u.borrower} bhai, I have recorded an udhaar of ${formatAmount(u.amount)} in your name on UdhaarBook. Please confirm you have received this by clicking the link below. This creates a mutual record for both of us.\n\n${link}`;

  // Fill preview bubble
  document.getElementById('sc-message-preview').innerText = message;

  // Wire WhatsApp button
  const waBtn = document.getElementById('sc-wa-btn');
  waBtn.onclick = () => {
    window.open(buildWhatsAppLink(u.phone, message), '_blank');
  };

  // Wire skip link
  const skipLink = document.getElementById('sc-skip-link');
  skipLink.onclick = (e) => {
    e.preventDefault();
    loadContractScreen(u.id);
  };
  // Listen for borrower confirmation
  if (window.firebaseListenUdhaar) {
    window.firebaseListenUdhaar(u.id, function(updatedUdhaar) {
      if (updatedUdhaar.status === 'active') {
        Swal.fire({
          icon:               'success',
          title:              'Confirmed!',
          text:               `${updatedUdhaar.borrower} has confirmed the udhaar. Contract is now active.`,
          confirmButtonColor: '#0F6E56',
          confirmButtonText:  'View Contract',
          allowOutsideClick:  false
        }).then(() => {
          renderHomeScreen();
          showScreen('screen-home');
        });
      }
    });
  }
  window.currentSendId = u.id;
  showScreen('screen-send-confirmation');
}

// =====================
// BORROWER CONFIRMATION SCREEN
// =====================

function loadConfirmScreen(id) {
  const params = new URLSearchParams(window.location.search);
  const urlData = params.get('data');

  let u = null;

  if (urlData) {
    try {
      const short = JSON.parse(decodeURIComponent(urlData));
      u = {
        id:             short.i,
        borrower:       short.b,
        lender:         short.l,
        amount:         Number(short.a),
        dueDate:        short.d,
        phone:          short.p,
        note:           short.n || '',
        status:         'pending',
        confirmedDate:  null,
        paidDate:       null,
        remindersCount: 0,
        createdDate:    dayjs().format('YYYY-MM-DD')
      };
      const all = getAllUdhaars();
      const exists = all.find(x => x.id === u.id);
      if (!exists) {
        all.push(u);
        localStorage.setItem('udhaars', JSON.stringify(all));
      }
    } catch(e) {
      console.error('URL data parse error', e);
    }
  }

  if (!u) u = getUdhaarById(id);

  if (!u) {
    document.getElementById('bc-not-found').classList.remove('hidden');
    return;
  }

  document.getElementById('bc-lender').textContent   = u.lender;
  document.getElementById('bc-borrower').textContent = u.borrower;
  document.getElementById('bc-amount').textContent   = formatAmount(u.amount);
  document.getElementById('bc-due').textContent      = formatDate(u.dueDate);

  if (u.note) {
    document.getElementById('bc-note').textContent = u.note;
  } else {
    document.getElementById('bc-note-row').classList.add('hidden');
  }

  document.getElementById('bc-agreement-text').textContent =
    `You are confirming that you have received ${formatAmount(u.amount)} from ${u.lender} and agree to return it by ${formatDate(u.dueDate)}.`;

  document.getElementById('bc-confirm-btn').onclick = () => confirmUdhaar(u.id);
  document.getElementById('bc-decline-btn').onclick = () => declineUdhaar(u.id);
}
function confirmUdhaar(id) {
  updateUdhaar(id, {
    status:        'active',
    confirmedDate: dayjs().format('YYYY-MM-DD')
  });

  // Firebase update
  if (window.firebaseUpdateUdhaar) {
    window.firebaseUpdateUdhaar(id, {
      status:        'active',
      confirmedDate: dayjs().format('YYYY-MM-DD')
    });
  }

  Swal.fire({
    icon:               'success',
    title:              'Confirmed!',
    text:               'You have successfully confirmed this udhaar. A mutual record has been created for both parties.',
    confirmButtonColor: '#0F6E56',
    confirmButtonText:  'Done',
    allowOutsideClick:  false
  }).then(() => {
    showThankYouScreen();
  });
}

function showThankYouScreen() {
  document.getElementById('app').innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px;
      text-align: center;
      font-family: Inter, sans-serif;
      background: white;
    ">
      <div style="
        width: 72px;
        height: 72px;
        background: #E1F5EE;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto 20px;
      ">✓</div>
      <h2 style="font-size: 20px; font-weight: 600; color: #0D1F1A; margin-bottom: 10px;">
        Udhaar Confirmed
      </h2>
      <p style="font-size: 14px; color: #4A6560; line-height: 1.7; max-width: 280px;">
        You have successfully acknowledged this udhaar. Both parties now have a mutual digital record.
        Please ensure payment is made by the due date.
      </p>
      <p style="font-size: 12px; color: #8A9E99; margin-top: 24px;">
        You may now close this tab.
      </p>
    </div>
  `;
}

function declineUdhaar(id) {
  Swal.fire({
    icon:               'warning',
    title:              'Decline this udhaar?',
    text:               'This will mark the contract as declined and notify the lender.',
    showCancelButton:   true,
    confirmButtonColor: '#A32D2D',
    confirmButtonText:  'Yes, decline',
    cancelButtonText:   'Go back'
  }).then(result => {
    if (result.isConfirmed) {
      updateUdhaar(id, { status: 'declined' });
      Swal.fire({
        icon:               'info',
        title:              'Udhaar Declined',
        text:               'You have declined this udhaar request. The lender has been notified.',
        confirmButtonColor: '#0F6E56',
        allowOutsideClick:  false
      }).then(() => {
        document.getElementById('app').innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 32px;
            text-align: center;
            font-family: Inter, sans-serif;
            background: white;
          ">
            <div style="
              width: 72px;
              height: 72px;
              background: #FDECEA;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              margin: 0 auto 20px;
            ">✕</div>
            <h2 style="font-size: 20px; font-weight: 600; color: #0D1F1A; margin-bottom: 10px;">
              Udhaar Declined
            </h2>
            <p style="font-size: 14px; color: #4A6560; line-height: 1.7; max-width: 280px;">
              You have declined this udhaar request. The lender will be informed accordingly.
            </p>
            <p style="font-size: 12px; color: #8A9E99; margin-top: 24px;">
              You may now close this tab.
            </p>
          </div>
        `;
      });
    }
  });
}
// =====================
// CONTRACT SCREEN
// =====================

let currentContractId = null;

function loadContractScreen(id) {
  const u = getUdhaarById(id);
  if (!u) return;

  currentContractId = id;

  // Fill header
  document.getElementById('ct-id').textContent     = u.id;
  document.getElementById('ct-amount').textContent = formatAmount(u.amount);

  // Fill parties
  document.getElementById('ct-lender').textContent   = u.lender;
  document.getElementById('ct-borrower').textContent = u.borrower;

  // Fill meta
  document.getElementById('ct-created').textContent   = formatDate(u.createdDate);
  document.getElementById('ct-due').textContent       = formatDate(u.dueDate);
  document.getElementById('ct-phone').textContent     = u.phone;
  document.getElementById('ct-reminders').textContent = u.remindersCount;

  // Days remaining
  const days    = getDaysRemaining(u.dueDate);
  const daysEl  = document.getElementById('ct-days');
  if (days < 0) {
    daysEl.textContent  = `${Math.abs(days)} days overdue`;
    daysEl.style.color  = 'var(--color-danger)';
  } else {
    daysEl.textContent  = `${days} days left`;
    daysEl.style.color  = 'var(--color-success)';
  }

  // Note
  if (u.note) {
    document.getElementById('ct-note').textContent = u.note;
  } else {
    document.getElementById('ct-note-row').classList.add('hidden');
  }
// Security info
  document.getElementById('ct-father').textContent  = u.fatherName  || '-';
  document.getElementById('ct-cnic').textContent    = u.cnic        || '-';
  document.getElementById('ct-account').textContent = u.account     || '-';

  if (u.guarantor) {
    document.getElementById('ct-guarantor').textContent       = u.guarantor;
    document.getElementById('ct-guarantor-phone').textContent = u.guarantorPhone || '-';
  } else {
    document.getElementById('ct-guarantor-row').classList.add('hidden');
  }
  // Stamp
  renderContractStamp(u);

  // Buttons
  const status = getBadgeStatus(u);
  document.getElementById('ct-btn-reminder').className = (status === 'active' || status === 'overdue' || status === 'soon') ? '' : 'hidden';
  document.getElementById('ct-btn-paid').className     = (status === 'active' || status === 'soon') ? '' : 'hidden';
  document.getElementById('ct-btn-resend').className   = (status === 'pending') ? '' : 'hidden';

  showScreen('screen-contract');
}

function renderContractStamp(u) {
  const stamp  = document.getElementById('ct-stamp');
  const status = getBadgeStatus(u);

  // Reset animation
  stamp.classList.remove('animate__fadeIn');
  void stamp.offsetWidth;
  stamp.classList.add('animate__fadeIn');

  const configs = {
    pending:  { cls: 'stamp-pending',  icon: 'ri-time-line',          title: 'Pending Confirmation', sub: 'Waiting for borrower to confirm' },
    active:   { cls: 'stamp-active',   icon: 'ri-shield-check-line',  title: 'Both Parties Confirmed', sub: `Confirmed on ${formatDate(u.confirmedDate)}` },
    soon:     { cls: 'stamp-soon',     icon: 'ri-alarm-warning-line', title: 'Due Soon',               sub: 'Payment due within 3 days' },
    overdue:  { cls: 'stamp-overdue',  icon: 'ri-error-warning-line', title: 'Overdue',                sub: `Was due on ${formatDate(u.dueDate)}` },
    paid:     { cls: 'stamp-paid',     icon: 'ri-checkbox-circle-line', title: 'Marked as Paid',       sub: `Paid on ${formatDate(u.paidDate)}` },
    declined: { cls: 'stamp-declined', icon: 'ri-close-circle-line',  title: 'Borrower Declined',      sub: 'This udhaar was declined by the borrower' }
  };

  const c = configs[status] || configs.pending;
  stamp.className = `contract-stamp animate__animated animate__fadeIn ${c.cls}`;
  stamp.innerHTML = `
    <i class="${c.icon}"></i>
    <div class="stamp-text">
      <span class="stamp-title">${c.title}</span>
      <span class="stamp-sub">${c.sub}</span>
    </div>`;
}

function markPaid(id) {
  Swal.fire({
    icon:               'question',
    title:              'Mark as paid?',
    text:               'This will close the contract.',
    showCancelButton:   true,
    confirmButtonColor: '#0F6E56',
    confirmButtonText:  'Yes, mark paid',
    cancelButtonText:   'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      updateUdhaar(id, {
        status:   'paid',
        paidDate: dayjs().format('YYYY-MM-DD')
      });
      const u = getUdhaarById(id);
      renderContractStamp(u);
      document.getElementById('ct-btn-paid').className     = 'hidden';
      document.getElementById('ct-btn-reminder').className = 'hidden';
      Swal.fire({
        icon:               'success',
        title:              'Paid!',
        text:               'Contract has been marked as paid.',
        confirmButtonColor: '#0F6E56'
      });
    }
  });
}

// =====================
// REMINDER SCREEN
// =====================

let currentReminderId = null;

function loadReminderScreen(id) {
  const u = getUdhaarById(id);
  if (!u) return;

  currentReminderId = id;

  // Fill details
  document.getElementById('rm-borrower').textContent = u.borrower;
  document.getElementById('rm-amount').textContent   = formatAmount(u.amount);
  document.getElementById('rm-due').textContent      = formatDate(u.dueDate);

  // Reset tone to friendly
  document.getElementById('rm-tone').value = 'friendly';
  changeTone('friendly');

  // Wire send button
  document.getElementById('rm-wa-btn').onclick = () => sendReminder(id);

  showScreen('screen-reminder');
}

function getReminderMessage(u, tone) {
  const count = u.remindersCount + 1;
  const messages = {
    friendly: `Assalamu Alaikum ${u.borrower} bhai, just a gentle reminder — ${formatAmount(u.amount)} was due on ${formatDate(u.dueDate)}. Please let me know when you can return it. No pressure.`,
    firm:     `Hi ${u.borrower}, this is a reminder that ${formatAmount(u.amount)} was due on ${formatDate(u.dueDate)} and is still unpaid. Kindly arrange payment soon.`,
    urgent:   `Bhai, ${formatAmount(u.amount)} has been overdue since ${formatDate(u.dueDate)}. This is reminder number ${count}. Please settle this today.`
  };
  return messages[tone] || messages.friendly;
}

function changeTone(tone) {
  const id = currentReminderId;
  if (!id) return;
  const u = getUdhaarById(id);
  if (!u) return;
  document.getElementById('rm-message-preview').textContent = getReminderMessage(u, tone);
}

function sendReminder(id) {
  const u    = getUdhaarById(id);
  const tone = document.getElementById('rm-tone').value;
  const msg  = getReminderMessage(u, tone);

  // Increment reminders count
  updateUdhaar(id, { remindersCount: u.remindersCount + 1 });

  // Open WhatsApp
  window.open(buildWhatsAppLink(u.phone, msg), '_blank');

  Swal.fire({
    icon:               'success',
    title:              'Reminder sent!',
    text:               `Reminder #${u.remindersCount + 1} sent to ${u.borrower}.`,
    confirmButtonColor: '#0F6E56'
  }).then(() => {
    loadContractScreen(id);
  });
}

// =====================
// DASHBOARD SCREEN
// =====================

function renderDashboard(filter = 'all') {
  const all  = getAllUdhaars();
  const list = document.getElementById('dashboard-list');

  // Apply filter
  let filtered = all;
  if (filter !== 'all') {
    filtered = all.filter(u => getBadgeStatus(u) === filter);
  }

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="ri-file-list-3-line"></i>
        No udhaar found
      </div>`;
    return;
  }

  // Render cards — newest first
  list.innerHTML = [...filtered].reverse().map(u => {
    const status = getBadgeStatus(u);
    return `
      <div class="dashboard-card" onclick="loadContractScreen('${u.id}')">
        <div class="dashboard-card-top">
          <span class="dashboard-card-name">${u.borrower}</span>
          <span class="badge badge-${status}">${status}</span>
        </div>
        <div class="dashboard-card-bottom">
          <span class="dashboard-card-amount">${formatAmount(u.amount)}</span>
          <span class="dashboard-card-due">Due ${formatDate(u.dueDate)}</span>
        </div>
      </div>`;
  }).join('');
}

function filterDashboard(filter, btn) {
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Re-render
  renderDashboard(filter);
}

function showDashboard() {
  renderDashboard('all');
  showScreen('screen-dashboard');
}

function exportCSV() {
  const all = getAllUdhaars();

  if (all.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No data',
      text: 'Koi udhaar record nahi hai.',
      confirmButtonColor: '#0F6E56'
    });
    return;
  }

  const headers = ['ID', 'Borrower', 'Phone', 'Amount (PKR)', 'Created Date', 'Due Date', 'Status', 'Reminders Sent', 'Note'];

  const rows = all.map(u => [
    u.id,
    u.borrower,
    u.phone,
    u.amount,
    formatDate(u.createdDate),
    formatDate(u.dueDate),
    u.status,
    u.remindersCount,
    u.note || '-'
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${val}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `UdhaarBook_${dayjs().format('YYYY-MM-DD')}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  Swal.fire({
    icon:               'success',
    title:              'Downloaded!',
    text:               `${all.length} records CSV mein save ho gaye.`,
    confirmButtonColor: '#0F6E56'
  });
}

// =====================
// GOOEY BUTTON EFFECT
// =====================

function initButtonEffects() {
  document.querySelectorAll('.btn').forEach(btn => {
    // Ripple on click
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: rgba(255,255,255,0.45);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        animation: gooeyRipple 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    });

    // Magnetic follow on hover
    btn.addEventListener('mousemove', function(e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translateY(-3px) translate(${x * 0.08}px, ${y * 0.08}px) scale(1.01)`;
      btn.style.borderRadius = '18px';
    });

    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
      btn.style.borderRadius = '';
      btn.style.boxShadow = '';
    });

    // Squish on mousedown
    btn.addEventListener('mousedown', function() {
      btn.style.transition = 'transform 0.12s ease, border-radius 0.12s ease';
      btn.style.transform = 'scaleX(1.06) scaleY(0.91)';
      btn.style.borderRadius = '6px';
      btn.style.boxShadow = 'none';
    });

    btn.addEventListener('mouseup', function() {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.55s ease';
      btn.style.transform = 'translateY(-3px) scale(1.01)';
      btn.style.borderRadius = '18px';
    });
  });
}

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes gooeyRipple {
    0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    60%  { transform: translate(-50%, -50%) scale(18); opacity: 0.4; }
    100% { transform: translate(-50%, -50%) scale(24); opacity: 0; }
  }
`;
document.head.appendChild(style);
function cancelUdhaar(id) {
  Swal.fire({
    icon:               'warning',
    title:              'Cancel Request?',
    text:               'This will permanently delete this udhaar request.',
    showCancelButton:   true,
    confirmButtonColor: '#A32D2D',
    confirmButtonText:  'Yes, cancel it',
    cancelButtonText:   'Go back'
  }).then(result => {
    if (result.isConfirmed) {
      // Remove from localStorage
      const all = getAllUdhaars().filter(u => u.id !== id);
      localStorage.setItem('udhaars', JSON.stringify(all));

      // Remove from Firebase
      if (window.firebaseUpdateUdhaar) {
        import('https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js')
          .then(({ getDatabase, ref, remove }) => {
            const db = getDatabase();
            remove(ref(db, 'udhaars/' + id));
          });
      }

      Swal.fire({
        icon:               'success',
        title:              'Request Cancelled',
        text:               'The udhaar request has been successfully cancelled.',
        confirmButtonColor: '#0F6E56'
      }).then(() => {
        renderHomeScreen();
        showScreen('screen-home');
      });
    }
  });
}
// =====================
// START
// =====================

init();

