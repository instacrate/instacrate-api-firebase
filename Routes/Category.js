var validate = require('express-jsonschema').validate;
var completion = require('../Helpers/Completion');
var schemas = require('../Schemas/CategorySchema');

module.exports = function(server, firebase) {

    var database = firebase.database();
    var categories = database.ref("categories");

    server.route("/categories")
        .post(validate({body: schemas.CategorySchema}), function (req, res) {
            var category = categories.push(req.body, function (error) {
                completion.push(error, res, category.key);
            });
        })
        .get("/:category", function (req, res) {
            // TODO
        });
};