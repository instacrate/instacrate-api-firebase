var validate = require('express-jsonschema').validate;
var completion = require('../Helpers/Completion');
var schemas = require('../Schemas/BoxSchema');

module.exports = function(server, firebase) {

    var database = firebase.database();
    var boxes = database.ref("boxes");

    var boxesRoute = server.route("/boxes");

    boxesRoute.post(validate({body: schemas.BoxShema}), function (req, res) {
            var box = boxes.push(req.body, function (error) {
                completion.push(error, res, box.key);
            });
        })
        .get("/all", validate({query: schemas.BoxQuerySchema}), function (req, res) {

            boxes.once("value", function (data) {
                completion.get(data, res);
            });
        })
        .get("/featured", validate({query: schemas.BoxQuerySchema}), function (req, res) {
            // TODO : implement
        })
        .get("/staffpicks", validate({query: schemas.BoxQuerySchema}), function (req, res) {
            // TODO : implement
        })
        .get("/new", validate({query: schemas.BoxQuerySchema}), function (req, res) {
            // TODO : implement
        });

    boxesRoute.route("/category/:category", function (req, res) {
        // TODO : implement
    });

    var boxRoute = boxesRoute.route("/:box_id")
        .patch(validate({body: schemas.BoxShema}), function (req, res) {
            // TODO : implement
        })
        .route("/pictures")
            .post(function (req, res) {
                // TODO : implement
            })
            .get(function (req, res) {
                // TODO : implement
            })
};