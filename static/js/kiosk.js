var kioskTimer;

function setKioskTimer() {
  kioskTimer = setTimeout(function() {
    kioskLogout();
  }, 30000);
}

function cancelKioskTimer() {
  clearTimeout(kioskTimer);
}

function resetKioskTimer() {
  cancelKioskTimer()
  setKioskTimer();
}

function kioskLogout() {
  window.location = '/kiosk/logout';
}
