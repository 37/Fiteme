var express = require('express');
var stormpath = require('express-stormpath');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/index')());
app.use('/profile', require('./routes/profile')());
app.use('/fight', require('./routes/fight')());

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: './storm/apiKey.properties',
  application: 'https://api.stormpath.com/v1/applications/7GhZzyjSP2k4YtPHPCYhVL',
  secretKey: 'keaton_candice_eliza_unihack',
	expandCustomData: true,
	enableForgotPassword: true
});

app.use(stormpathMiddleware);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
