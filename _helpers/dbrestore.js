const { exec } = require('child_process');
const fs = require('fs-extra');
const homedir = require('os').homedir();
const path = require('path');
const readline = require('readline');

require('dotenv-safe').config({allowEmptyValues: true});

const { POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } = process.env;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Put backup file path: ', answer => {
  const prcs = exec(`pg_restore -h ${ POSTGRES_HOST } -p ${ POSTGRES_PORT } -U ${ POSTGRES_USER } -d ${ POSTGRES_DB } -v ${answer}`)
  prcs.stdout.pipe(process.stdout);
  rl.close();
});
