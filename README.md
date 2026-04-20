# 📒 UdhaarBook
### Track informal loans with trust. No bank needed.

🌐 **Live Demo:** [udhaarbook.netlify.app](https://udhaarbook.netlify.app)  

---

## 🚨 The Problem

In Pakistan, **informal lending (udhaar) is extremely common** — but it silently destroys relationships.

- There is **no neutral record** of who owes what
- Asking for money back feels **socially awkward**
- Borrowers sometimes **deny** they ever took money
- Lenders have **no proof**, no accountability, no recourse
- Friendships and family bonds break over small amounts

> *"Log udhaar le ke gayb ho jaate hain — aur hum kuch nahi kar sakte."*

This is not a banking problem. It is a **trust and accountability problem.**

---

## 💡 The Solution

**UdhaarBook** is a web app that creates a **mutual digital contract** between a lender and a borrower — without any bank, without any money movement, and without any awkwardness.

### How it works:

1. **Lender records the udhaar** — borrower name, amount, due date, CNIC, account number
2. **A unique confirmation link** is sent to the borrower via WhatsApp
3. **Borrower confirms** they received the money — creating a mutual digital record
4. **Both parties have proof** — a timestamped, signed contract
5. **Automatic reminders** are sent as the due date approaches
6. **Lender marks as paid** when money is returned

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 Create Udhaar | Record loans with full borrower details |
| 🔗 WhatsApp Confirmation | Send confirmation link directly via WhatsApp |
| ✅ Mutual Contract | Borrower digitally confirms receipt of money |
| 🔴 Real-time Updates | Firebase syncs status instantly across devices |
| ⏰ Auto Reminders | App alerts lender 3 days before due date |
| 📊 Dashboard | Track all udhaars with filter by status |
| 🛡️ Security Info | CNIC, father name, account number, guarantor |
| 💬 Reminder Tones | Friendly, Firm, or Urgent WhatsApp reminders |
| 📄 CSV Export | Download all records as spreadsheet |
| ✔️ Mark as Paid | Close contracts when money is returned |

---

## 🛡️ Security & Trust Features

UdhaarBook collects the following from the borrower at the time of recording:

- **CNIC Number** — verified identity
- **Father's Name** — additional identity verification  
- **Bank / JazzCash / Easypaisa Account** — payment traceability
- **Guarantor Name & Phone** — social accountability
- **Digital Confirmation** — borrower must click confirm via WhatsApp link

This creates **social and legal accountability** without requiring any court or bank.

---

## 🔄 The Confirmation Flow

```
Lender fills form
      ↓
Unique contract created (UB-2026-001)
      ↓
WhatsApp message sent to borrower with confirmation link
      ↓
Borrower clicks link → sees contract details → clicks "I Confirm"
      ↓
Firebase updates status to "Active" in real-time
      ↓
Lender's dashboard updates automatically
      ↓
Both parties now have a mutual digital record
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Database | Firebase Realtime Database |
| Hosting | Netlify |
| Version Control | GitHub |
| Libraries | Day.js, SweetAlert2, Animate.css, Remix Icons |
| Integration | WhatsApp Deep Links (wa.me) |

**No framework. No build step. No npm. Pure web.**

---

## 📱 Screens

| Screen | Purpose |
|---|---|
| Home | Stats overview + recent activity |
| Create Udhaar | Record new loan with security details |
| Send Confirmation | WhatsApp message preview + send link |
| Borrower Confirmation | Borrower sees contract and confirms |
| Contract Page | Full contract with status stamp |
| Dashboard | All udhaars with filters |
| Reminder | Send WhatsApp reminder with tone selector |

---

## 🚀 How to Run Locally

No installation needed. Just open `index.html` in any browser.

```bash
git clone https://github.com/Abrar-ul-hasnain/UdhaarBook
cd UdhaarBook
# Open index.html in browser
```

Or use VS Code Live Server extension.

---

## 🎯 Why UdhaarBook Wins

- 🇵🇰 **Built for Pakistan** — solves a real, widespread cultural problem
- 💸 **No bank needed** — works for unbanked population
- 📱 **WhatsApp native** — uses the app Pakistanis already use daily
- ⚡ **Real-time** — Firebase keeps both parties in sync instantly
- 🔒 **Security first** — CNIC and guarantor create real accountability
- 🌐 **Live and working** — not just a prototype, a real product

---

## 👨‍💻 Built By

**Abrar ul Hasnain**  
Hackathon Submission — 2026

---

> *"Udhaar lena aasaan hai. UdhaarBook se wapas karna bhi aasaan ho jata hai."*
