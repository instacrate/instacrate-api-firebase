var admin = require("firebase-admin");
var account = require("./instacrate-api-firebase-adminsdk-tanny-a853c4e677.json");
var express = require("express");
var firebaseSessions = require('./Middleware/FirebaseSessions');

admin.initializeApp({
    credential: admin.credential.cert(account),
    databaseURL: "https://instacrate-api.firebaseio.com/"
});

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(session({
    secret: '0ae3d581-3805-4c17-807b-bfe46099dc3a',
    resave: false,
    saveUninitialized: true,
    cookie: { },
    store: firebaseSessions({
        ref: admin.database().ref("sessions")
    })
}));

require("./Routes/Box.js")(app, admin);

app.use(function(err, req, res, next) {

    var responseData;

    if (err.name === 'JsonSchemaValidation') {
        // Log the error however you please
        console.log(err.message);
        // logs "express-jsonschema: Invalid data found"

        // Set a bad request http response status or whatever you want
        res.status(400);

        // Format the response body however you want
        responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validations  // All of your validation information
        };

        // Take into account the content type if your app serves various content types
        if (req.xhr || req.get('Content-Type') === 'application/json') {
            res.json(responseData);
        }
    } else {
        // pass error to next error middleware handler
        next(err);
    }
});

app.listen(8080, function() {
    console.log("listening");
});