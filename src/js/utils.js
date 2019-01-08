module.exports = {
  constructTarget: () => {
    const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;
    return `postgres://${DB_USER}@${ DB_HOST }:${ DB_PORT }/${ DB_NAME }`;
  },
  createRoutePath: (path) => {
    return ['/', path].join('')
  }
}
