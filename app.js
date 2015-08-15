var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/index')());
app.use('/profile', require('./routes/profile')());
app.use('/fight', require('./routes/fight')());

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
