var admin = require("firebase-admin");
var account = require("./instacrate-api-firebase-adminsdk-tanny-a853c4e677.json");
var express = require("express");

var firebase = admin.initializeApp({
    credential: admin.credential.cert(account),
    databaseURL: "https://instacrate-api.firebaseio.com/"
});

var app = express();

app.get('/', function (req, res) {
    res.send("Hello");
});

app.listen(8080, function() {
    console.log("listening");
});

