var os = require('os');
// require statement pulls in more code than would normally have access to, requests module
var message = 'We are running ' + process.version + ' on a ' + os.type() + '-based operating system.';
// process is global only available in node - not normally available in browser
// running as a process, since via command line
console.log(message);