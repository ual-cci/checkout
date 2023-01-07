let kioskTimer

function setKioskTimer() {
	kioskTimer = setTimeout(() => {
		kioskLogout()
	}, 30000)
}

function cancelKioskTimer() {
	clearTimeout(kioskTimer)
}

function resetKioskTimer() {
	cancelKioskTimer()
	setKioskTimer()
}

function kioskLogout() {
	window.location = '/kiosk/logout'
}
