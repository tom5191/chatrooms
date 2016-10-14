var CryptoJS = require('crypto-js');

module.exports.sha3 = function(value) {
	return CryptoJS.SHA3(value).toString();
}