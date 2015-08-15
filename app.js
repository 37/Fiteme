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

app.use(stormpath.init(app, {
  apiKeyId:     process.env.STORMPATH_API_KEY_ID,
  apiKeySecret: process.env.STORMPATH_API_KEY_SECRET,
  secretKey:    process.env.STORMPATH_SECRET_KEY,
  application:  process.env.STORMPATH_URL,
}));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
