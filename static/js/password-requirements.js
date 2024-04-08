let pw
let mat

const options = {
	trigger: 'focus',
	html: true,
	title: 'Requirements',
	content: '<p class="pw len">8 characters</p><p class="pw up">Uppercase letters</p><p class="pw low">Lowercase letters</p><p class="pw num">Numbers</p><p class="pw special">Special characters</p><p class="pw mat">Passwords match</p>',
}

window.addEventListener('DOMContentLoaded', () => {
	pw  = document.querySelector('.pw-req')
	mat = document.querySelector('.pw-mat')

	let pw_popover = new bootstrap.Popover(pw, options)
	pw_popover._element.addEventListener('inserted.bs.popover', check)
	pw_popover._element.addEventListener('shown.bs.popover', check)
	pw.addEventListener('input', check)

	let mat_popover = new bootstrap.Popover(mat, options)
	mat_popover._element.addEventListener('inserted.bs.popover', check)
	mat_popover._element.addEventListener('shown.bs.popover', check)
	mat.addEventListener('input', check)
})

function check() {
	if (pw.value.length < 8) {
		document.querySelector('.pw.len').classList.remove('pass')
		document.querySelector('.pw.len').classList.add('fail')
	} else {
		document.querySelector('.pw.len').classList.add('pass')
		document.querySelector('.pw.len').classList.remove('fail')
	}

	if (pw.value.match(/\d/g) == null) {
		document.querySelector('.pw.num').classList.remove('pass')
		document.querySelector('.pw.num').classList.add('fail')
	} else {
		document.querySelector('.pw.num').classList.add('pass')
		document.querySelector('.pw.num').classList.remove('fail')
	}

	if (pw.value.match(/[A-Z]/g) == null) {
		document.querySelector('.pw.up').classList.remove('pass')
		document.querySelector('.pw.up').classList.add('fail')
	} else {
		document.querySelector('.pw.up').classList.add('pass')
		document.querySelector('.pw.up').classList.remove('fail')
	}

	if (pw.value.match(/[a-z]/g) == null) {
		document.querySelector('.pw.low').classList.remove('pass')
		document.querySelector('.pw.low').classList.add('fail')
	} else {
		document.querySelector('.pw.low').classList.add('pass')
		document.querySelector('.pw.low').classList.remove('fail')
	}

	if (pw.value.match(/[^A-z0-9]/g) == null) {
		document.querySelector('.pw.special').classList.remove('pass')
		document.querySelector('.pw.special').classList.add('fail')
	} else {
		document.querySelector('.pw.special').classList.add('pass')
		document.querySelector('.pw.special').classList.remove('fail')
	}

	if (pw.value == mat.value && pw.value.trim() != '') {
		document.querySelector('.pw.mat').classList.add('pass')
		document.querySelector('.pw.mat').classList.remove('fail')
	} else {
		document.querySelector('.pw.mat').classList.remove('pass')
		document.querySelector('.pw.mat').classList.add('fail')
	}
}
