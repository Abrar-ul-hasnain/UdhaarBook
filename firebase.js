import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEtUXPscdJv1D2kq7nVKqrBrY2GgHWlyw",
  authDomain: "udhaarbook-4cb37.firebaseapp.com",
  databaseURL: "https://udhaarbook-4cb37-default-rtdb.firebaseio.com",
  projectId: "udhaarbook-4cb37",
  storageBucket: "udhaarbook-4cb37.firebasestorage.app",
  messagingSenderId: "879505000444",
  appId: "1:879505000444:web:ba3eff21e4898478675479"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// Save udhaar to Firebase
window.firebaseSaveUdhaar = function(udhaar) {
  return set(ref(db, 'udhaars/' + udhaar.id), udhaar);
};

// Update udhaar status in Firebase
window.firebaseUpdateUdhaar = function(id, changes) {
  return update(ref(db, 'udhaars/' + id), changes);
};

// Get single udhaar from Firebase
window.firebaseGetUdhaar = function(id) {
  return get(ref(db, 'udhaars/' + id)).then(snapshot => {
    if (snapshot.exists()) return snapshot.val();
    return null;
  });
};

// Listen for real-time changes on dashboard
window.firebaseListenUdhaars = function(callback) {
  onValue(ref(db, 'udhaars'), snapshot => {
    const data = snapshot.val();
    if (data) {
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
};
// Listen for specific udhaar status change
window.firebaseListenUdhaar = function(id, callback) {
  onValue(ref(db, 'udhaars/' + id), snapshot => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};
// Signal that Firebase is ready
window.dispatchEvent(new Event('firebaseReady'));