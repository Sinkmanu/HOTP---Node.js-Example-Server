#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
//var https = require('https');
var http = require('http');
var util=require('util');
var fs=require('fs');
var CryptoJS = require("crypto-js");

var login_screen = '<!DOCTYPE html><html><head><title>Login</title></head><body><script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha256.js"></script> \
<script>	\
function hotp() { \
	var password = document.getElementById(\'form1\').elements[\'password\'].value; 	\
	var otp = document.getElementById(\'form1\').elements[\'otp\'].value;				\
	var hash = CryptoJS.HmacSHA256(otp, password);  \
	document.getElementById(\'login\').elements[\'hash\'].value = hash; \
	document.forms.login.submit(); \
} \
</script> \
\
	<form id=\"login\" action=\"login\" method=\"post\" accept-charset=\"utf-8\"> \
	<li><label for=\"user\">User:</label><input type=\"text\" name=\"user\" placeholder=\"user\" required></li> \
	<input type="hidden" name="hash" value="" required>			\
</form>\
 <form id="form1" method="POST" action="login"> \
   <li><label for="password">Password:</label><input type="password" name="password" placeholder="password" required></li> \
   <li><label for="otp">OTP:</label><input type="text" name="otp" placeholder="contador" required></li> \
  </form> \
	<li><input type="submit" onclick="hotp();" value="Login"></li> \
</body>\
</html>'

var app = express();

app.use(bodyParser());

var loginCount = 0; // Contador para el hash de autenticación.
var user = 'username';
var passwd = 'password!!';
var hash = CryptoJS.HmacSHA256(loginCount.toString(), passwd); // El mensaje es el contador + contraseña
console.log('[*] The first HMAC: '+hash);

// If https
var options = {
     key: fs.readFileSync('Servidor.pem'),
     cert: fs.readFileSync('Servidor.crt'),
     ca: fs.readFileSync('CA_Manu.crt'),
     requestCert: true,
     rejectUnauthorized: false // debe ser true
};
 
app.get('/',function(req, res) {
	res.end(login_screen);
});

app.post('/login',function(req, res) {
	console.log("[*] User: "+req.body.user +"\n[*] Hash: "+req.body.hash);
	if ((hash ==  req.body.hash) && (user == req.body.user)){
		console.log("[+] "+req.body.user+" authenticated!");
		res.statusCode = 200; 
		loginCount++;
		hash = CryptoJS.HmacSHA256(loginCount.toString(), passwd);
		console.log('[*] New HMAC: '+hash);
		res.end('<html><body>Welcome '+req.body.user+'!!!</body></html>');
	}else {
		res.statusCode = 200;
		res.end('<html><body>Login failed!</body></html>');
	}
});
 
//https.createServer(options,app).listen(9998);
http.createServer(app).listen(9998);
