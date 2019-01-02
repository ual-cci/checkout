const { exec } = require('child_process');
const fs = require('fs-extra');
const homedir = require('os').homedir();
const path = require('path');
const readline = require('readline');

require('dotenv').config();

const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Put backup file path: ', answer => {
  const prcs = exec(`pg_restore -h ${ DB_HOST } -p ${ DB_PORT } -U ${ DB_USER } -d ${ DB_NAME } -v ${answer}`)
  prcs.stdout.pipe(process.stdout);
  rl.close();
});


