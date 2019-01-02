const { exec } = require('child_process');
const fs = require('fs-extra');
const homedir = require('os').homedir();
const path = require('path');
const moment = require('moment');

require('dotenv').config();

const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;
const BACKUP_LIMIT = 30;

const backupFileDir = path.join(homedir, 'checkout_backups');
const backupFileName = `backup-${moment().format('YYYY-MM-DD.HH-mm-ss')}.backup`;

fs.ensureDir(backupFileDir, err => {
	if (err) {
		console.error('Backup failed at creating directory');
		console.error(err);
	} else {
		trimBackups();
		runBackup();
	}
});

function trimBackups() {
	const IGNORES = ['.DS_Store'];
	const files = fs.readdirSync(backupFileDir).filter(f => IGNORES.indexOf(f) < 0);

	files.sort(function(a, b) {
		return fs.statSync(path.join(backupFileDir, a)).mtime.getTime() -
			   fs.statSync(path.join(backupFileDir, b)).mtime.getTime();
	});

	if (files.length >= BACKUP_LIMIT) {
		const dels = files.slice(0, files.length - (BACKUP_LIMIT - 1));

		dels.forEach(f => {
			fs.unlinkSync(path.join(backupFileDir, f));
		});

		console.log(`Deleted ${dels.length} file(s)`);
	}
}

function runBackup() {
	exec(`pg_dump -h ${ DB_HOST } -U ${ DB_USER } -F c -b -v -f "${ path.join(backupFileDir, backupFileName) }" -d ${ DB_NAME }`);

	console.log(`Saved ${ path.join(backupFileDir, backupFileName) }`);
}
