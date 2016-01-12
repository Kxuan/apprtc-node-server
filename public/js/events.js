(function () {
    "use strict";
    function EventEmitter() {

    }

    EventEmitter.prototype.on = function (event, handler) {
        if (typeof event !== 'string')
            throw new TypeError("The 1st argument is not a string");
        if (typeof handler !== 'function')
            throw new TypeError("The 2nd argument is not a function");

        if (!this._events) {
            this._events = {__proto__: null};
        }
        if (!this._events[event]) {
            this._events[event] = [];
        }

        this._events[event].push(handler);
        return this;
    };

    EventEmitter.prototype.once = function (event, handler) {
        if (typeof event !== 'string')
            throw new TypeError("The 1st argument is not a string");
        if (typeof handler !== 'function')
            throw new TypeError("The 2nd argument is not a function");

        var emitFn = function () {
            handler.apply(this, arguments);
            this.off(event, emitFn);
        };
        emitFn.applyFn = handler;
        return this.on(event, emitFn);
    };

    EventEmitter.prototype.off = function (event, handler) {
        if (event !== undefined && typeof event !== 'string') {
            throw new TypeError("The 1st argument is not a string");
        }
        if (handler !== undefined && typeof handler !== 'function') {
            throw new TypeError("The 2nd argument is not a function");
        }
        if (!this._events)
            return this;

        if (event === undefined) {
            delete this._events;
            return this;
        } else if (handler === undefined) {
            delete this._events[event];
            return this;
        } else {
            if (!this._events[event])
                return this;

            var allFn = this._events[event];
            for (var i = 0; i < allFn.length; i++) {
                var fn = allFn[i];
                if (fn === handler || fn.applyFn === handler) {
                    allFn.splice(i, 1);
                    return this;
                }
            }

        }
        return this;
    };

    EventEmitter.prototype.emit = function (event, args) {
        if (event !== undefined && typeof event !== 'string') {
            throw new TypeError("The 1st argument is not a string");
        }

        if (!this._events)
            return this;
        if (!this._events[event])
            return this;
        var extra_arguments = Array.prototype.slice.call(arguments, 1);
        var handlers = this._events[event].slice();
        handlers.forEach(function (fn) {
            fn.apply(this, extra_arguments);
        }.bind(this));
        return this;
    };
    EventEmitter.bindPrototype = function (ctor) {
        ctor.prototype = EventEmitter.prototype;
    };
    this.EventEmitter = EventEmitter;
}).call(
    (function () {
        return this
    })()
);
