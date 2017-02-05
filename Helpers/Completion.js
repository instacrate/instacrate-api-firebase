/**
 * Created by hakonhanesand on 2/5/17.
 */

module.exports.push = function (error, res, key) {
    res.set("Content-Type", "application/json");

    if (error) {
        res.send(JSON.stringify(error));
    } else {
        res.send(JSON.stringify({"key" : key}));
    }
};

module.exports.get = function (data, res) {
    res.set("Content-Type", "application/json");
    res.send(JSON.stringify(data.val()));
};