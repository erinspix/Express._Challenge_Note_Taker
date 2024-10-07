// Custom middleware that logs the method and path of each request
const cog = (req, res, next) => {
    const fgCyan = '\x1b[36m';
    switch (req.method) {
      case 'GET':
        console.info(`📗 ${fgCyan}${req.method} request to ${req.path}`);
        break;
      case 'POST':
        console.info(`📘 ${fgCyan}${req.method} request to ${req.path}`);
        break;
      case 'DELETE':
        console.info(`📙 ${fgCyan}${req.method} request to ${req.path}`);
        break;
      default:
        console.log(`📙 ${fgCyan}${req.method} request to ${req.path}`);
    }
    next();
  };
  
  module.exports = cog;
  