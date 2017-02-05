var debug = require('debug')('connect:redis');
var redis = require('redis');
var util = require('util');
var noop = function(){};

/**
 * One day in seconds.
 */

var oneDay = 86400;

function getTTL(store, sess) {
    var maxAge = sess.cookie.maxAge;
    return store.ttl || (typeof maxAge === 'number'
            ? Math.floor(maxAge / 1000)
            : oneDay);
}

/**
 * Return the `FirebaseStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */

module.exports = function (session) {

    /**
     * Express's session Store.
     */

    var Store = session.Store;

    /**
     * Initialize FirebaseStore with the given `options`.
     *
     * @param {Object} options
     * @api public
     */

    function FirebaseStore (options) {
        if (!(this instanceof FirebaseStore)) {
            throw new TypeError('Cannot call FirebaseStore constructor as a function');
        }

        var self = this;

        options = options || {};
        Store.call(this, options);

        this.prefix = options.prefix == null ? 'sess:' : options.prefix;
        delete options.prefix;

        this.serializer = options.serializer || JSON;

        if (options.ref) {
            this.sessions = options.ref;
        } else {
            console.error('Warning: connect-firebase expects firebase reference for the "ref" option');
        }

        options.logErrors = function (err) {
            console.error('Warning: connect-redis reported a client error: ' + err);
        };

        this.ttl = options.ttl;
        this.disableTTL = options.disableTTL;
    }

    /**
     * Inherit from `Store`.
     */

    util.inherits(FirebaseStore, Store);

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {String} sid
     * @param {Function} fn
     * @api public
     */

    FirebaseStore.prototype.get = function (sid, fn) {

        var store = this;
        var psid = store.prefix + sid;
        if (!fn) fn = noop;

        store.sessions.child(psid).once("value", function (data) {
            return fn(null, data.val());
        });
    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */

    RedisStore.prototype.set = function (sid, sess, fn) {
        var store = this;
        var psid = store.prefix + sid;
        if (!fn) fn = noop;

        var ttl = getTTL(store, sess);

        store.child(psid).set(sess);
    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @api public
     */

    RedisStore.prototype.destroy = function (sid, fn) {
        if (!Array.isArray(sid)) {
            sid = [sid];
        }

        var updates = sid.reduce(function (acc, cur, i) {
            acc[cur] = null;
            return acc;
        });

        if (Array.isArray(sid)) {
            var multi = this.client.multi();
            var prefix = this.prefix;
            sid.forEach(function (s) {
                multi.del(prefix + s);
            });
            multi.exec(fn);
        } else {
            sid = this.prefix + sid;
            this.client.del(sid, fn);
        }
    };

    /**
     * Refresh the time-to-live for the session with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */

    RedisStore.prototype.touch = function (sid, sess, fn) {
        var store = this;
        var psid = store.prefix + sid;
        if (!fn) fn = noop;
        if (store.disableTTL) return fn();

        var ttl = getTTL(store, sess);

        debug('EXPIRE "%s" ttl:%s', sid, ttl);
        store.client.expire(psid, ttl, function (er) {
            if (er) return fn(er);
            debug('EXPIRE complete');
            fn.apply(this, arguments);
        });
    };

    /**
     * Fetch all sessions' ids
     *
     * @param {Function} fn
     * @api public
     */

    RedisStore.prototype.ids = function (fn) {
        var store = this;
        var pattern = store.prefix + '*';
        var prefixLength = store.prefix.length;
        if (!fn) fn = noop;

        debug('KEYS "%s"', pattern);
        store.client.keys(pattern, function (er, keys) {
            if (er) return fn(er);
            debug('KEYS complete');
            keys = keys.map(function (key) {
                return key.substr(prefixLength);
            });
            return fn(null, keys);
        });
    };


    /**
     * Fetch all sessions
     *
     * @param {Function} fn
     * @api public
     */

    RedisStore.prototype.all = function (fn) {
        var store = this;
        var pattern = store.prefix + '*';
        var prefixLength = store.prefix.length;
        if (!fn) fn = noop;

        debug('KEYS "%s"', pattern);
        store.client.keys(pattern, function (er, keys) {
            if (er) return fn(er);
            debug('KEYS complete');

            var multi = store.client.multi();

            keys.forEach(function (key) {
                multi.get(key);
            });

            multi.exec(function (er, sessions) {
                if (er) return fn(er);

                var result;
                try {
                    result = sessions.map(function (data, index) {
                        data = data.toString();
                        data = store.serializer.parse(data);
                        data.id = keys[index].substr(prefixLength);
                        return data;
                    });
                } catch (er) {
                    return fn(er);
                }
                return fn(null, result);
            });
        });
    };

    return RedisStore;
};