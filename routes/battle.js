var express = require('express');
var stormpath = require('express-stormpath');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var extend = require('xtend');
var url = require('url');
var pg = require('pg');

//Declare the schema of hidden form fightResults:

var fightResults = forms.create({
	p1id: forms.fields.string({
		required: true
	}),
	p2id: forms.fields.string({
		required: true
	}),
	topic: forms.fields.string({
		required: true
	}),
	args: forms.fields.array({
    required: true
  })
});

// Generate title
function generateTitle(){
  var items =   [
      "Toilet paper should hang over the roll.",
      "Superman would beat Goku in a bar fight.",
      "Tony Abbot is actually a great leader.",
      "Global warming isnt real.",
      "Jet fuel CAN melt steal memes.",
      "Doritos and Mountain Dew are important pillars of every good diet.",
      "We live in a simulation",
      "Mac is better than PC",
      "Lil Wayne is a far better rapper than Tupac ever was.",
      "Arnold Schwarzenegger made an incredible Governor."
    ]
  var item = items[Math.floor(Math.random()*items.length)];
  return item;
}

// A render function that will render our page and provide the values of the
// fields, as well as any situation-specific Locals.

function renderForm (req, res, locals){

	res.render('pages/battle', extend({
		title: generateTitle(),
		csrfToken: req.csrfToken(),
		givenName: req.user.givenName,
    uid: req.user.email,
	}, locals || {} ));
}

function isEmpty(str) {
	return (!str || 0 === str.length);
}

//Export a function which will create the router and return it:
module.exports = function loader(){
	var router = express.Router();

	router.use(csurf({ sessionKey: 'stormpathSession' }));

	// Capture all parametised requests, the form library will regotiate between them
	router.all ('/', stormpath.loginRequired, function (req, res) {
    // Handle the results of collected and sanitised form fightResults.
    fightResults.handle(req, {
      success: function(form){
        console.log('processing form!');
        // The form library calls this success method if the form
        // is being POSTED and does not have errors.

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care about
        // and then call save() on the user object:
        if (isEmpty(form.data)){
          console.log ('Form data is empty');
        }
        else {

          var p1id = form.data.p1id;
          var p2id = form.data.p2id;
          var topic = form.data.topic;
          var args = form.data.args;
          var outcome = 'tba';

          console.log('\nFight results: \n user1 - ' + p1id + ';\n user2 - ' + p2id + ';\n topic - ' + topic + ';\n args - ' + args + ';\n outcome - ' + tba + '.');
          
          pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
              return console.error('error fetching client from pool', err);
            }

            var importdata = client.query("INSERT INTO fights (p1id, p2id, topic, args, outcome) VALUES ($1, $2, $3, $4, $5)", [p1id, p2id, topic, args, outcome]);
            importdata.on('error', function(error) {
              return console.error(error);
              return console.log('Data import failed for some reason.');
            });
            importdata.on('row', function(row){
              res.redirect('/');
            });
            importdata.on('end', function(done){
              res.redirect('/');
              console.log('Successfully updated form, publishing to pool');
            });
          });
        }
      },
      error: function (form) {
        // The form library calls this method if the form
        // has validation errors.  We will collect the errors
        // and render the form again, showing the errors
        // to the user
        renderForm(req, res, {
          errors: collectFormErrors(form)
        });
      },
      empty: function (){

        // The form library calls this method if the method
        // is GET - thus we just need to render the form.
        renderForm (req, res);
      }
    });
	});

	// This is an error handler for this router

	router.use(function (err, req, res, next) {
		// This handler catches errors for this router
		if (err.code ==='EBADCSRFTOKEN'){
			// The csrf library is telling us that it can't find a
			// valid token on the form
			if (req.user){
				// session token is invalid or expired.
				// render the form anyway but tell them what happened.
				renderForm(req, res, {
					errors: [{error: 'Your form has expired, please try again.'}]
				});
			} else {
				// The user's cookies have been deleted, we don't know their
				// intention. Send them back to the home page!
				res.redirect('/');
			}
		} else {
			// Let the parent app handle this error.
			return next(err);
		}
	});
	return router;
}
