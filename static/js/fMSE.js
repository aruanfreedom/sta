(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.fMSE || (g.fMSE = {})).init = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
'use strict';

var MediaSourceFlash = require('./lib/MediaSourceFlash');
var VideoExtension = require('./lib/VideoExtension');

function init(polyfillSwfUrl, videoElement, onReady, flashByDefault) {
    var isMSESupported = !!window.MediaSource;
    if (isMSESupported && !flashByDefault) {
        return onReady(videoElement);
    }

    window.MediaSource = MediaSourceFlash;

    window.fMSE.callbacks = window.fMSE.callbacks || {};
    window.fMSE.callbacks.onFlashReady = function () {
        onReady(new VideoExtension(swfObj));
    };

    var readyFunctionString = "window.fMSE.callbacks.onFlashReady";

    var height = videoElement.height || 150;
    var width = videoElement.width || 300;

    var oldId = videoElement.id;
    var oldIdClasses = videoElement.className;

    var swfObjString = '<object id="' + oldId + '" type="application/x-shockwave-flash"' + ' data="' + polyfillSwfUrl + '" width="' + width + '" height="' + height + '" name="' + oldId + '" class="' + oldIdClasses + '" style="display: block;">' + '        <param name="movie" value="' + polyfillSwfUrl + '">' + '        <param name="flashvars" value="readyFunction=' + readyFunctionString + '">' + '        <param name="allowScriptAccess" value="always">' + '        <param name="allowNetworking" value="all">' + '        <param name="wmode" value="opaque">' + '        <param name="bgcolor" value="#000000">' + '    </object>';

    var parentElement = videoElement.parentElement;
    parentElement.innerHTML = swfObjString;
    var swfObj = parentElement.firstChild;
}

module.exports = init;

},{"./lib/MediaSourceFlash":5,"./lib/VideoExtension":8}],3:[function(require,module,exports){
'use strict';

var B64Worker = require("./B64Worker.js");

/**
 * This object manage the B64Worker, which encode data in B64
 * Indeed, since data may come from different track (ie audio/video),
 * we need this object, that will keep in memory a callback for each data it received
 * When the data has been encoded, the corresponding callback is called
 */
var B64Encoder = function B64Encoder() {

    var self = this,
        _b64w,
        _jobQueue = [],
        _createWorker = function _createWorker() {
        //Build an inline worker that can be used with browserify
        var blobURL = URL.createObjectURL(new Blob(['(' + B64Worker.toString() + ')()'], { type: 'application/javascript' }));
        var worker = new Worker(blobURL);
        URL.revokeObjectURL(blobURL);
        return worker;
    },
        _encodeData = function _encodeData(data, cb) {
        var jobIndex = _jobQueue.push({
            cb: cb
        }) - 1;
        _b64w.postMessage({
            data: data,
            jobIndex: jobIndex
        });
    },
        _onWorkerMessage = function _onWorkerMessage(e) {
        var jobIndex = e.data.jobIndex,
            job = _jobQueue[jobIndex];
        delete _jobQueue[jobIndex]; //delete and not splice to avoid offsetting index
        job.cb(e.data.b64data);
    },
        _initialize = function _initialize() {
        _b64w = _createWorker();
        _b64w.onmessage = _onWorkerMessage;
    };

    _initialize();

    self.encodeData = _encodeData;
};

module.exports = B64Encoder;

},{"./B64Worker.js":4}],4:[function(require,module,exports){
// Apr 1st 2015
// Was removed by Kevin Oury, see commit 9be8c00a8c20e5889b367fec09448f086d69115f
// Restore by Stanislas Fechner for performance issue

/**
 * B64Encoding is done in a seperate worker to avoid performance issue when the
 * user switch tab or use fullscreen
 * In these use case, the browser consider the tab is not the active one, and all
 * timeout in the main thread are set to minimum 1 second
 * Since we need the timeout in the function _arrayBufferToBase64 (for performance issue)
 * we do it in a different worker, in which timeout will not be affected
 */

"use strict";

function B64Worker() {

    var _arrayBufferToBase64 = function _arrayBufferToBase64(bytes, index) {
        var len = bytes.byteLength,
            b64Data = "";
        for (var i = 0; i < len; i++) {
            b64Data += String.fromCharCode(bytes[i]);
        }
        b64Data = btoa(b64Data);
        self.postMessage({
            b64data: b64Data,
            jobIndex: index
        });
    };

    self.onmessage = function (e) {
        _arrayBufferToBase64(new Uint8Array(e.data.data), e.data.jobIndex);
    };

    //Not in use atm,
    //Method tick can be used trigger event 'timeUpdate' in flash.
    //We'll be able to use this event as a workaroud for the setTimeout / setInterval throttling when the tab is inactive / video in fullscreen

    var tick = function tick() {
        self.postMessage({
            tick: true
        });
    };

    //setInterval(tick, 125);
}

module.exports = B64Worker;

},{}],5:[function(require,module,exports){
"use strict";

var SourceBuffer = require('./SourceBuffer');
var B64Encoder = require('./B64Encoder');
var EventEmitter = require('eventemitter3');

var MediaSourceFlash = function MediaSourceFlash() {
    var self = this,
        _videoExtension,
        _swfobj,
        _b64Encoder = new B64Encoder(),
        _READY_STATE = {
        OPEN: 'open',
        CLOSED: 'closed'
    },
        _readyState = _READY_STATE.CLOSED,

    //TODO: is duration realy an attribute of MSE, or of video?
    _duration = 0,
        _ee = new EventEmitter(),
        _sourceBuffers = [],
        _addEventListener = function _addEventListener(type, listener) {
        _ee.on(type, listener);
    },
        _removeEventListener = function _removeEventListener(type, listener) {
        _ee.off(type, listener);
    },
        _trigger = function _trigger(event) {
        _ee.emit(event.type, event);
    },
        _addSourceBuffer = function _addSourceBuffer(type) {
        var sourceBuffer;
        sourceBuffer = new SourceBuffer(type, _videoExtension, _b64Encoder);
        _sourceBuffers.push(sourceBuffer);
        _videoExtension.registerSourceBuffer(sourceBuffer);
        _swfobj.addSourceBuffer(type);
        return sourceBuffer;
    },
        _removeSourceBuffer = function _removeSourceBuffer() {},
        _endOfStream = function _endOfStream() {},
        _initialize = function _initialize(videoExtension) {

        _videoExtension = videoExtension;
        _swfobj = _videoExtension.getSwf();

        _videoExtension.createSrc(self);

        _readyState = _READY_STATE.OPEN;
        _trigger({ type: "sourceopen" });

        window.fMSE.callbacks.transcodeError = function (message) {
            console.error(message);
            if (window.onPlayerError) {
                window.onPlayerError(message);
            }
        };

        _swfobj.jsReady();
    };

    this.addSourceBuffer = _addSourceBuffer;
    this.addEventListener = _addEventListener;
    this.removeEventListener = _removeEventListener;
    this.endOfStream = _endOfStream;
    this.initialize = _initialize;

    Object.defineProperty(this, "readyState", {
        get: function get() {
            return _readyState;
        },
        set: undefined
    });

    //Duration is set in Buffer._initBuffer.
    Object.defineProperty(this, "duration", {
        get: function get() {
            return _duration;
        },
        set: function set(newDuration) {
            _duration = newDuration;
            _swfobj.onMetaData(newDuration, 320, 240);
        }
    });

    Object.defineProperty(this, "sourceBuffers", {
        get: function get() {
            return _sourceBuffers;
        }
    });
};

MediaSourceFlash.isTypeSupported = function (type) {
    return type.indexOf('video/mp4') > -1;
};

module.exports = MediaSourceFlash;

},{"./B64Encoder":3,"./SourceBuffer":7,"eventemitter3":1}],6:[function(require,module,exports){
"use strict";

var SegmentAppender = function SegmentAppender(sourceBuffer, swfObj, b64Encoder) {
    var self = this,
        _b64Encoder = b64Encoder,
        _sourceBuffer = sourceBuffer,
        _swfObj = swfObj,
        _type,
        _startTime,
        _endTime,
        _segmentType,
        _discard = false,
        //prevent from appending decoded segment to swf obj during seeking (segment was already in B64 when we seeked)
    _seeking = false,
        //prevent an appendBuffer during seeking (segment arrived after having seeked)
    _isDecoding = false,

    //Before sending segment to flash we check first if we are seeking. If so, we don't append the decoded data.
    _doAppend = function _doAppend(data) {
        _isDecoding = false;
        if (!_discard) {
            console.info("SegmentApender: DO append " + _type + "_startTime=" + _startTime);

            var isInit = _segmentType !== undefined ? _segmentType == "InitializationSegment" : isNaN(_startTime) || typeof _endTime !== 'undefined';

            _swfObj.appendBuffer(data, _type, isInit, _startTime, _endTime);
        } else {
            console.info("SegmentApender: discard data " + _type);
            _discard = false;
            _sourceBuffer.segmentFlushed();
        }
    },
        _appendBuffer = function _appendBuffer(data, type, startTime, endTime, segmentType) {

        if (!_seeking) {
            _type = type;
            _startTime = startTime;
            _endTime = endTime;
            _segmentType = segmentType;

            console.info("SegmentApender: start decoding " + _type);
            _isDecoding = true;
            _b64Encoder.encodeData(data, _doAppend);
        } else {
            _sourceBuffer.segmentFlushed();
        }
    },
        _initialize = function _initialize() {};

    self.appendBuffer = _appendBuffer;

    self.seeking = function () {
        if (_isDecoding) {
            _discard = true;
        }
        _seeking = true;
    };
    self.seeked = function () {
        _seeking = false;
    };

    _initialize();
};

module.exports = SegmentAppender;

},{}],7:[function(require,module,exports){
"use strict";

var CustomTimeRange = require('./utils/CustomTimeRange');
var SegmentAppender = require('./SegmentAppender');
var EventEmitter = require('eventemitter3');

var SourceBuffer = function SourceBuffer(type, videoExtension, b64Encoder) {

    var self = this,
        _swfobj = videoExtension.getSwf(),
        _segmentAppender = new SegmentAppender(self, _swfobj, b64Encoder),
        _updating = false,
        //true , false
    _type = type,
        _startTime = 0,
        //TODO: Remove startTime hack
    _endTime = 0,
        _pendingEndTime = -1,

    /** _switchingTrack is set to true when we change rep and until the first segment of the new rep is appended in the Flash. It avoids fatal blocking at _isTimestampConsistent **/
    _switchingTrack = false,
        _onTrackSwitch = function _onTrackSwitch() {
        _switchingTrack = true;
    },
        _ee = new EventEmitter(),
        _addEventListener = function _addEventListener(type, listener) {
        _ee.on(type, listener);
    },
        _removeEventListener = function _removeEventListener(type, listener) {
        _ee.off(type, listener);
    },
        _trigger = function _trigger(event) {
        _ee.emit(event.type, event);
    },
        _isTimestampConsistent = function _isTimestampConsistent(startTime) {
        if (Math.abs(startTime - _endTime) >= 1 /*|| Math.abs(startTime - _endTime) > 60*/) {
                console.info("_isTimestampConsistent FALSE. startTime=", startTime, "_endTime=", _endTime);
            }

        return isNaN(startTime) || Math.abs(startTime - _endTime) < 1;
    },
        _appendBuffer = function _appendBuffer(arraybuffer_data, startTime, endTime) {
        _updating = true; //Do this at the very first
        _trigger({
            type: 'updatestart'
        });

        // that's dash.js segment descriptor
        if (startTime && startTime.segmentType) {
            var descriptor = startTime;
            startTime = descriptor.start;
            endTime = descriptor.end;
            var segmentType = descriptor.segmentType;
        }

        if (_isTimestampConsistent(startTime) || _switchingTrack || typeof startTime === "undefined") {
            //Test if discontinuity. Always pass test for initSegment (startTime unefined)
            _segmentAppender.appendBuffer(arraybuffer_data, _type, startTime, endTime, segmentType);
            _pendingEndTime = endTime;
        } else {
            //There's a discontinuity
            var firstSegmentBool = _startTime === _endTime;
            console.info('timestamp not consistent. First segment after seek: ' + firstSegmentBool + ".   " + startTime);
            _onUpdateend(true); //trigger updateend with error bool to true
        }
    },

    /**
    * This method remove data from the buffer.
    * WARN: all data between start and end time are not really removed from the buffer
    * Indeed we can't remove data from NetStream. To fix that an intermediate buffer has been implemented in flash (StreamBuffer.as)
    * Data is first stored in the streamBuffer, and then at the last moment, the minimum amount of data is inserted in NetStream
    * The methods _swfobj.flushSourceBuffer and _swfobj.remove clear data from the streamBuffer, but there will
    * always be a small amount of data in NetStream that can't be removed.
    *
    * @param  {int} start - Start of the removed interval, in seconds
    * @param  {int} end   - End of the removed interval, in seconds
    * @return - no returned value
    */
    _remove = function _remove(start, end) {
        if (start < 0 || end == Infinity || start > end) {
            throw new Error("Invalid Arguments: cannot call SourceBuffer.remove");
        }

        _updating = true;
        if (start >= _endTime || end <= _startTime) {
            //we don't remove anything
        } else if (start <= _startTime && end >= _endTime) {
                //we remove the whole buffer
                //we should set _endTime = _startTime;
                //however all data that have been inserted into NetStream can't be removed. Method flushSourceBuffer return the true endTime, ie the endTime of NetSteam
                _endTime = _swfobj.remove(start, end, _type);
            } else if (start > _startTime) {
                //we should set _endTime = start;
                //however all data that have been inserted into NetStream can't be removed. Method _swfobj.remove return the true endTime, ie the endTime of NetSteam
                _endTime = _swfobj.remove(start, end, _type);
            } else if (start <= _startTime) {
                //in that case we can't remove data from NetStream
                console.warn('Buffer is virtually removed but data still exist in NetStream object');
                _startTime = end;
            }
        //it is important to set _pendingEndTime to -1 so that _endTime is not reassigned when flash will trigger onUpdateend when decoding of the current segment is finished
        _pendingEndTime = -1;
        //trigger updateend to launch next job. Needs the setTimeout to be called asynchronously and avoid error with Max call stack size (infinite recursive loop)
        _onUpdateend();
    },
        _buffered = function _buffered() {
        var bufferedArray = [];
        if (_endTime > _startTime) {
            bufferedArray.push({
                start: _startTime,
                end: _endTime
            });
        }
        return new CustomTimeRange(bufferedArray);
    },
        _debugBuffered = function _debugBuffered() {
        var buffered = _buffered();
        if (_pendingEndTime > _endTime) {
            buffered.add({
                start: _endTime,
                end: _pendingEndTime
            });
        }
        return buffered;
    },
        _triggerUpdateend = function _triggerUpdateend(error) {
        _updating = false;

        //If _pendingEndTime < _endTime, it means a segment has arrived late (MBR?), and we don't want to reduce our buffered.end
        //(that would trigger other late downloads and we would add everything to flash in double, which is not good for
        //performance)
        console.info('updateend ' + _type);
        if (!error && _pendingEndTime > _endTime) {
            console.info('setting end time to ' + _pendingEndTime);
            _endTime = _pendingEndTime;
            // Wait until we're sure the right segment was appended to netStream before setting _switchingTrack to false to avoid perpetual blocking at _isTimestampConsistent
            _switchingTrack = false;
        } else if (error) {
            console.info("Wrong segment. Update map then bufferize OR discontinuity at sourceBuffer.appendBuffer");
        }

        _trigger({
            type: 'updateend'
        });
    },
        _onUpdateend = function _onUpdateend(error) {
        setTimeout(function () {
            _triggerUpdateend(error);
        }, 5);
    },
        _seekTime = function _seekTime(time) {
        //Sets both startTime and endTime to seek time.
        _startTime = time;
        _endTime = time;

        //set _pendingEndTime to -1, because update end is triggered 20ms after end of append in NetStream, so if a seek happens in the meantime we would set _endTime to _pendingEndTime wrongly.
        //This won't happen if we set _pendingEndTime to -1, since we need _pendingEndTime > _endTime.
        _pendingEndTime = -1;
    },
        _initialize = function _initialize() {
        if (_type.match(/video/)) {
            window.fMSE.callbacks.updateend_video = _onUpdateend;
        } else if (_type.match(/audio/)) {
            window.fMSE.callbacks.updateend_audio = _onUpdateend;
        } else if (_type.match(/vnd/)) {
            window.fMSE.callbacks.updateend_video = _onUpdateend;
        }
        videoExtension.addEventListener('trackSwitch', _onTrackSwitch);

        if (window.fMSE.debug.bufferDisplay) {
            var debugSourceBuffer = {
                buffered: _buffered,
                type: _type
            };

            Object.defineProperty(debugSourceBuffer, "debugBuffered", {
                get: _debugBuffered,
                set: undefined
            });

            window.fMSE.debug.bufferDisplay.attachSourceBuffer(debugSourceBuffer);
        }
    };

    this.appendBuffer = _appendBuffer;
    this.remove = _remove;
    this.addEventListener = _addEventListener;
    this.removeEventListener = _removeEventListener;

    Object.defineProperty(this, "updating", {
        get: function get() {
            return _updating;
        },
        set: undefined
    });

    Object.defineProperty(this, "buffered", {
        get: _buffered,
        set: undefined
    });

    this.appendWindowStart = 0;

    //
    //TODO: a lot of methods not in sourceBuffer spec. is there an other way?
    //

    this.seeking = function (time) {
        _seekTime(time);
        _segmentAppender.seeking();
    };

    this.seeked = function () {
        _segmentAppender.seeked();
    };

    this.segmentFlushed = function () {
        _onUpdateend(true);
    };

    Object.defineProperty(this, "isFlash", {
        get: function get() {
            return true;
        },
        set: undefined
    });

    _initialize();
};

module.exports = SourceBuffer;

},{"./SegmentAppender":6,"./utils/CustomTimeRange":9,"eventemitter3":1}],8:[function(require,module,exports){
"use strict";

var CustomTimeRange = require('./utils/CustomTimeRange');
var EventEmitter = require('eventemitter3');

var VideoExtension = function VideoExtension(swfObj) {

    var self = this,
        _swfObj = swfObj,
        _mediaSource,
        _sourceBuffers = [],
        _currentTime = 0,
        _fixedCurrentTime = 0,
        //In case of video paused or buffering
    _seekTarget,
        // Using another variable for seeking, because seekTarget can be set to undefined by "playing" event (TODO: triggered during seek, which is a separate issue)
    _lastCurrentTimeTimestamp,
        _REFRESH_INTERVAL = 2000,
        //Max interval until we look up flash to get real value of currentTime

    _ended = false,

    //_buffering = true,
    //_paused = false,
    _seeking = false,
        _seekedTimeout,
        _ee = new EventEmitter(),
        _isInitialized = function _isInitialized() {
        return typeof _swfObj !== 'undefined';
    },
        _addEventListener = function _addEventListener(type, listener) {
        _ee.on(type, listener);
    },
        _removeEventListener = function _removeEventListener(type, listener) {
        _ee.off(type, listener);
    },
        _trigger = function _trigger(event) {
        _ee.emit(event.type, event);
    },
        _play = function _play() {
        if (_isInitialized()) {
            _fixedCurrentTime = undefined;
            _swfObj.play();
        } else {
            //TODO: implement exceptions similar to HTML5 one, and handle them correctly in the code
            new Error('Flash video is not initialized'); //TODO: should be "throw new Error(...)" but that would stop the execution
        }
    },
        _pause = function _pause() {
        if (_isInitialized()) {
            if (typeof _fixedCurrentTime === "undefined") {
                //Don't override _fixedCurrentTime if it already exists (case of a seek for example);
                _fixedCurrentTime = _getCurrentTimeFromFlash();
            }
            _swfObj.pause();
        } else {
            //TODO: implement exceptions similar to HTML5 one, and handle them correctly in the code
            new Error('Flash video is not initialized'); //TODO: should be "throw new Error(...)" but that would stop the execution
        }
    },
        _seek = function _seek(time) {
        if (!_seeking) {
            _seekedTimeout = setTimeout(_onSeeked, 5000);
            if (_isInitialized()) {

                console.info("seeking");
                _trigger({
                    type: 'seeking'
                });
                _seeking = true;

                //Rapid fix. Check if better way
                for (var i = 0; i < _sourceBuffers.length; i++) {
                    _sourceBuffers[i].seeking(time);
                }

                _seekTarget = _fixedCurrentTime = time;

                //The flash is flushed somewhere in this seek function
                _swfObj.seek(time);
            } else {
                //TODO: implement exceptions similar to HTML5 one, and handle them correctly in the code
                new Error('Flash video is not initialized'); //TODO: should be "throw new Error(...)" but that would stop the execution
            }
        }
    },
        _getCurrentTimeFromFlash = function _getCurrentTimeFromFlash() {
        _currentTime = _swfObj.currentTime();
        return _currentTime;
    },
        _getCurrentTime = function _getCurrentTime() {
        var now = new Date().getTime();

        if (_ended) {
            return _mediaSource.duration;
        }

        if (typeof _seekTarget !== "undefined") {
            return _seekTarget;
        }

        if (typeof _fixedCurrentTime !== "undefined") {
            return _fixedCurrentTime;
        }

        if (_lastCurrentTimeTimestamp && now - _lastCurrentTimeTimestamp < _REFRESH_INTERVAL) {
            return _currentTime + (now - _lastCurrentTimeTimestamp) / 1000;
        } else if (_isInitialized()) {
            _lastCurrentTimeTimestamp = now;
            return _getCurrentTimeFromFlash();
        }
        return 0;
    },
        _getPaused = function _getPaused() {
        if (_isInitialized()) {
            return _swfObj.paused();
        } else {
            //TODO: implement exceptions similar to HTML5 one, and handle them correctly in the code
            new Error('Flash video is not initialized'); //TODO: should be "throw new Error(...)" but that would stop the execution
        }
    },
        _getBuffered = function _getBuffered() {
        var sbBuffered,
            start = Infinity,
            end = 0;
        for (var i = 0; i < _sourceBuffers.length; i++) {
            sbBuffered = _sourceBuffers[i].buffered;
            if (!sbBuffered.length) {
                return new CustomTimeRange([]);
            } else {
                // Compute the intersection of the TimeRanges of each SourceBuffer
                // WARNING: we make the assumption that SourceBuffer return a TimeRange with length 0 or 1, because that's how this property is implemented for now.
                // This will break if this is no longer the case (if we improve AS3 buffer management to support multiple ranges for example)
                start = Math.min(start, sbBuffered.start(0));
                end = Math.max(end, sbBuffered.end(0));
            }
        }
        if (start >= end) {
            return new CustomTimeRange([]);
        }
        return new CustomTimeRange([{ start: start, end: end }]);
    },
        _getPlayed = function _getPlayed() {
        // TODO: return normalized TimeRange here according to MediaElement API

        return [];
    },

    //EVENTS
    _onSeeked = function _onSeeked() {
        _seeking = false;
        _ended = false;
        _seekTarget = undefined;
        clearTimeout(_seekedTimeout);
        _trigger({
            type: 'seeked'
        }); //trigger with value _fixedCurrentTime
        for (var i = 0; i < _sourceBuffers.length; i++) {
            _sourceBuffers[i].seeked();
        }
    },
        _onLoadStart = function _onLoadStart() {
        _ended = false;
        _trigger({
            type: 'loadstart'
        });
    },
        _onPlay = function _onPlay() {
        _currentTime = _getCurrentTimeFromFlash(); //Force refresh _currentTime
        _fixedCurrentTime = undefined;

        _ended = false;
        _trigger({ type: 'play' });
    },

    //TODO: seems not be used anymore see CLIEN-268
    _onPause = function _onPause() {
        _fixedCurrentTime = _fixedCurrentTime !== undefined ? _fixedCurrentTime : _getCurrentTimeFromFlash(); // Do not erase value if already set
        _trigger({ type: 'pause' });
    },
        _onPlaying = function _onPlaying() {
        _fixedCurrentTime = undefined;
        _trigger({ type: 'playing' });
    },
        _onWaiting = function _onWaiting() {
        _fixedCurrentTime = _fixedCurrentTime !== undefined ? _fixedCurrentTime : _getCurrentTimeFromFlash(); // Do not erase value if already set
    },
        _onStopped = function _onStopped() {
        _ended = true;

        _trigger({
            type: 'ended'
        });
    },
        _onCanplay = function _onCanplay() {
        _trigger({
            type: 'canplay'
        });
    },
        _onDurationchange = function _onDurationchange() {
        _trigger({
            type: 'durationchange'
        });
    },
        _onVolumechange = function _onVolumechange() {
        _trigger({
            type: 'volumechange'
        });
    },
        _canPlayType = function _canPlayType() {
        return 'probably';
    },
        _initialize = function _initialize() {

        window.fMSE.callbacks.seeked = function () {
            //Trigger event when seek is done
            _onSeeked();
        };

        window.fMSE.callbacks.loadstart = function () {
            //Trigger event when we want to start loading data (at the beginning of the video or on replay)
            _onLoadStart();
        };

        window.fMSE.callbacks.play = function () {
            //Trigger event when media is ready to play
            _onPlay();
        };

        window.fMSE.callbacks.pause = function () {
            _onPause();
        };

        window.fMSE.callbacks.canplay = function () {
            _onCanplay();
        };

        window.fMSE.callbacks.playing = function () {
            //Trigger event when the media is playing
            _onPlaying();
        };

        window.fMSE.callbacks.waiting = function () {
            //Trigger event when video has been paused but is expected to resume (ie on buffering or manual paused)
            _onWaiting();
        };

        window.fMSE.callbacks.stopped = function () {
            //Trigger event when video ends.
            _onStopped();
        };

        window.fMSE.callbacks.durationChange = function (duration) {
            _onDurationchange(duration);
        };

        window.fMSE.callbacks.appended_segment = function (startTime, endTime) {
            // TODO: not sure what this event was meant for. It duplicates the updateend events, and the comments along this workflow don't reflect what it is really supposed to do
        };

        window.fMSE.callbacks.volumeChange = function (volume) {
            _onVolumechange(volume);
        };

        var oldCreateObjectURL = window.URL.createObjectURL;
        window.URL.createObjectURL = function (mediaSource) {
            if (mediaSource.initialize) {
                _mediaSource = mediaSource;
                _mediaSource.initialize(self);
            } else {
                return oldCreateObjectURL(mediaSource);
            }
        };

        if (window.fMSE.debug.bufferDisplay) {
            window.fMSE.debug.bufferDisplay.attachVideo(self);
        }
    };

    Object.defineProperty(this, "currentTime", {
        get: _getCurrentTime,
        set: function set(time) {
            _seek(time);
        }
    });

    Object.defineProperty(this, "seeking", {
        get: function get() {
            return _seeking;
        },
        set: undefined
    });

    Object.defineProperty(this, "paused", {
        get: _getPaused,
        set: undefined
    });

    Object.defineProperty(this, "duration", {
        get: function get() {
            return _mediaSource.duration;
        },
        set: undefined
    });

    Object.defineProperty(this, "playbackRate", {
        get: function get() {
            return 1; //Always return 1, as we don't support changing playback rate
        },
        set: function set() {
            //The only time we'll set playback rate for now is to pause video on rebuffering (workaround in HTML5 only).
            //Added warning if we ever wanted to use it for other purposes.
            console.error("Changing playback rate is not supported for now with Streamroot Flash playback.");
        }
    });

    Object.defineProperty(this, "isFlash", {
        get: function get() {
            return true;
        },
        set: undefined
    });

    Object.defineProperty(this, "buffered", {
        get: _getBuffered,
        set: undefined
    });

    Object.defineProperty(this, "played", {
        get: _getPlayed,
        set: undefined
    });

    Object.defineProperty(this, "preload", {
        get: undefined,
        set: function set() {}
    });

    Object.defineProperty(this, "onencrypted", {
        get: undefined,
        set: undefined
    });

    Object.defineProperty(this, "autoplay", {
        get: undefined,
        set: function set() {}
    });

    Object.defineProperty(this, "ended", {
        get: undefined,
        set: undefined
    });

    Object.defineProperty(this, "readyState", {
        get: _swfObj.readyState,
        set: undefined
    });

    this.createSrc = function (mediaSourceFlash) {
        _mediaSource = mediaSourceFlash;
    };

    this.registerSourceBuffer = function (sourceBuffer) {
        _sourceBuffers.push(sourceBuffer);
        //TODO: register source buffer in there for sourceBufferEvents
    };

    this.getSwf = function () {
        return _swfObj;
    };

    this.play = _play;
    this.pause = _pause;
    this.addEventListener = _addEventListener;
    this.removeEventListener = _removeEventListener;
    this.dispatchEvent = _trigger;
    this.canPlayType = _canPlayType;

    //TODO:register mediaSource and video events

    //TODO: create global methods for flash events here, and dispatch events to registered MediaSource, SourceBuffers, etc...

    _initialize();
};

VideoExtension.prototype = Object.create(window.HTMLMediaElement.prototype);
VideoExtension.prototype.constructor = VideoExtension;

module.exports = VideoExtension;

},{"./utils/CustomTimeRange":9,"eventemitter3":1}],9:[function(require,module,exports){
"use strict";

var CustomTimeRange = function CustomTimeRange() {
    var timeRangeArray = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var _timeRangeArray = timeRangeArray;

    this.length = _timeRangeArray.length;

    this.add = function (segment) {
        _timeRangeArray.push(segment);
        this.length = _timeRangeArray.length;
    };

    this.start = function (i) {
        if (isInteger(i) && i >= 0 && i < _timeRangeArray.length) {
            return _timeRangeArray[i].start;
        } else {
            // console.error('Index out of range');
            // if(Number.isInteger(i)){ // Comes with ECMAScript 6. Only works in Chrome and Firefox. "Enable Experimental Javascript" flag in Chrome
            if (isInteger(i)) {
                throw new Error("CustomTimeRange index out of range");
            } else {
                throw new Error("Incorrect index type");
            }
        }
    };

    this.end = function (i) {
        if (isInteger(i) && i >= 0 && i < _timeRangeArray.length) {
            return _timeRangeArray[i].end;
        } else {
            // console.error('Index out of range');
            // if(Number.isInteger(i)){ // Comes with ECMAScript 6. Only works in Chrome and Firefox. "Enable Experimental Javascript" flag in Chrome
            if (isInteger(i)) {
                throw new Error("CustomTimeRange index out of range");
            } else {
                throw new Error("Incorrect index type");
            }
        }
    };
};

function isInteger(n) {
    return typeof n === "number" && n % 1 === 0;
}

module.exports = CustomTimeRange;

},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsIkM6L1VzZXJzL2FydWFuL0Rvd25sb2Fkcy9QUk9KRUNUL0RPQ1VNRU5UUy9TVEEvZm1zZS9zcmMvanMvTWFpbi5qcyIsIkM6L1VzZXJzL2FydWFuL0Rvd25sb2Fkcy9QUk9KRUNUL0RPQ1VNRU5UUy9TVEEvZm1zZS9zcmMvanMvbGliL0I2NEVuY29kZXIuanMiLCJDOi9Vc2Vycy9hcnVhbi9Eb3dubG9hZHMvUFJPSkVDVC9ET0NVTUVOVFMvU1RBL2Ztc2Uvc3JjL2pzL2xpYi9CNjRXb3JrZXIuanMiLCJDOi9Vc2Vycy9hcnVhbi9Eb3dubG9hZHMvUFJPSkVDVC9ET0NVTUVOVFMvU1RBL2Ztc2Uvc3JjL2pzL2xpYi9NZWRpYVNvdXJjZUZsYXNoLmpzIiwiQzovVXNlcnMvYXJ1YW4vRG93bmxvYWRzL1BST0pFQ1QvRE9DVU1FTlRTL1NUQS9mbXNlL3NyYy9qcy9saWIvU2VnbWVudEFwcGVuZGVyLmpzIiwiQzovVXNlcnMvYXJ1YW4vRG93bmxvYWRzL1BST0pFQ1QvRE9DVU1FTlRTL1NUQS9mbXNlL3NyYy9qcy9saWIvU291cmNlQnVmZmVyLmpzIiwiQzovVXNlcnMvYXJ1YW4vRG93bmxvYWRzL1BST0pFQ1QvRE9DVU1FTlRTL1NUQS9mbXNlL3NyYy9qcy9saWIvVmlkZW9FeHRlbnNpb24uanMiLCJDOi9Vc2Vycy9hcnVhbi9Eb3dubG9hZHMvUFJPSkVDVC9ET0NVTUVOVFMvU1RBL2Ztc2Uvc3JjL2pzL2xpYi91dGlscy9DdXN0b21UaW1lUmFuZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QixZQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFO0FBQ3RELG1CQUFPLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDbkMsTUFBTTs7O0FBR0gsZ0JBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2Qsc0JBQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQzthQUN6RCxNQUFNO0FBQ0gsc0JBQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUMzQztTQUNKO0tBQ0osQ0FBQzs7QUFFRixRQUFJLENBQUMsR0FBRyxHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ25CLFlBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUU7QUFDdEQsbUJBQU8sZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztTQUNqQyxNQUFNOzs7QUFHSCxnQkFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDZCxzQkFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2FBQ3pELE1BQU07QUFDSCxzQkFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQzNDO1NBQ0o7S0FDSixDQUFDO0NBQ0wsQ0FBQzs7QUFFRixTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDbEIsV0FBUSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUU7Q0FDakQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29uY2U9ZmFsc2VdIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZCB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzXG4gICAgLCBuYW1lcyA9IFtdXG4gICAgLCBuYW1lO1xuXG4gIGlmICghZXZlbnRzKSByZXR1cm4gbmFtZXM7XG5cbiAgZm9yIChuYW1lIGluIGV2ZW50cykge1xuICAgIGlmIChoYXMuY2FsbChldmVudHMsIG5hbWUpKSBuYW1lcy5wdXNoKHByZWZpeCA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lKTtcbiAgfVxuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgcmV0dXJuIG5hbWVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGV2ZW50cykpO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBbY29udGV4dD10aGlzXSBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCJ2YXIgTWVkaWFTb3VyY2VGbGFzaCA9IHJlcXVpcmUoJy4vbGliL01lZGlhU291cmNlRmxhc2gnKTtcclxudmFyIFZpZGVvRXh0ZW5zaW9uID0gcmVxdWlyZSgnLi9saWIvVmlkZW9FeHRlbnNpb24nKTtcclxuXHJcbmZ1bmN0aW9uIGluaXQocG9seWZpbGxTd2ZVcmwsIHZpZGVvRWxlbWVudCwgb25SZWFkeSwgZmxhc2hCeURlZmF1bHQpe1xyXG4gICAgdmFyIGlzTVNFU3VwcG9ydGVkID0gISF3aW5kb3cuTWVkaWFTb3VyY2U7XHJcbiAgICBpZihpc01TRVN1cHBvcnRlZCAmJiAhZmxhc2hCeURlZmF1bHQpe1xyXG4gICAgICAgIHJldHVybiBvblJlYWR5KHZpZGVvRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93Lk1lZGlhU291cmNlID0gTWVkaWFTb3VyY2VGbGFzaDtcclxuXHJcbiAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3MgPSB3aW5kb3cuZk1TRS5jYWxsYmFja3MgfHwge307XHJcbiAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3Mub25GbGFzaFJlYWR5ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBvblJlYWR5KG5ldyBWaWRlb0V4dGVuc2lvbihzd2ZPYmopKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJlYWR5RnVuY3Rpb25TdHJpbmcgPSBcIndpbmRvdy5mTVNFLmNhbGxiYWNrcy5vbkZsYXNoUmVhZHlcIjtcclxuXHJcbiAgICB2YXIgaGVpZ2h0ID0gdmlkZW9FbGVtZW50LmhlaWdodCB8fCAxNTA7XHJcbiAgICB2YXIgd2lkdGggPSB2aWRlb0VsZW1lbnQud2lkdGggfHwgMzAwO1xyXG5cclxuICAgIHZhciBvbGRJZCA9IHZpZGVvRWxlbWVudC5pZDtcclxuICAgIHZhciBvbGRJZENsYXNzZXMgPSB2aWRlb0VsZW1lbnQuY2xhc3NOYW1lO1xyXG5cclxuICAgIHZhciBzd2ZPYmpTdHJpbmcgPSAnPG9iamVjdCBpZD1cIicrb2xkSWQrJ1wiIHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiJytcclxuICAgICAgICAnIGRhdGE9XCInKyBwb2x5ZmlsbFN3ZlVybCArJ1wiIHdpZHRoPVwiJysgd2lkdGggKydcIiBoZWlnaHQ9XCInKyBoZWlnaHQgKydcIiBuYW1lPVwiJytvbGRJZCsnXCIgY2xhc3M9XCInK29sZElkQ2xhc3NlcysnXCIgc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIj4nK1xyXG4gICAgICAgICcgICAgICAgIDxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicrIHBvbHlmaWxsU3dmVXJsICsnXCI+JytcclxuICAgICAgICAnICAgICAgICA8cGFyYW0gbmFtZT1cImZsYXNodmFyc1wiIHZhbHVlPVwicmVhZHlGdW5jdGlvbj0nK3JlYWR5RnVuY3Rpb25TdHJpbmcrJ1wiPicrXHJcbiAgICAgICAgJyAgICAgICAgPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JytcclxuICAgICAgICAnICAgICAgICA8cGFyYW0gbmFtZT1cImFsbG93TmV0d29ya2luZ1wiIHZhbHVlPVwiYWxsXCI+JytcclxuICAgICAgICAnICAgICAgICA8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJvcGFxdWVcIj4nK1xyXG4gICAgICAgICcgICAgICAgIDxwYXJhbSBuYW1lPVwiYmdjb2xvclwiIHZhbHVlPVwiIzAwMDAwMFwiPicrXHJcbiAgICAgICAgJyAgICA8L29iamVjdD4nO1xyXG5cclxuICAgIHZhciBwYXJlbnRFbGVtZW50ID0gdmlkZW9FbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICBwYXJlbnRFbGVtZW50LmlubmVySFRNTCA9IHN3Zk9ialN0cmluZztcclxuICAgIHZhciBzd2ZPYmogPSBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQ7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5pdDtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIEI2NFdvcmtlciA9IHJlcXVpcmUoXCIuL0I2NFdvcmtlci5qc1wiKTtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIG9iamVjdCBtYW5hZ2UgdGhlIEI2NFdvcmtlciwgd2hpY2ggZW5jb2RlIGRhdGEgaW4gQjY0XHJcbiAqIEluZGVlZCwgc2luY2UgZGF0YSBtYXkgY29tZSBmcm9tIGRpZmZlcmVudCB0cmFjayAoaWUgYXVkaW8vdmlkZW8pLFxyXG4gKiB3ZSBuZWVkIHRoaXMgb2JqZWN0LCB0aGF0IHdpbGwga2VlcCBpbiBtZW1vcnkgYSBjYWxsYmFjayBmb3IgZWFjaCBkYXRhIGl0IHJlY2VpdmVkXHJcbiAqIFdoZW4gdGhlIGRhdGEgaGFzIGJlZW4gZW5jb2RlZCwgdGhlIGNvcnJlc3BvbmRpbmcgY2FsbGJhY2sgaXMgY2FsbGVkXHJcbiAqL1xyXG52YXIgQjY0RW5jb2RlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBfYjY0dyxcclxuICAgICAgICBfam9iUXVldWUgPSBbXSxcclxuXHJcbiAgICAgICAgX2NyZWF0ZVdvcmtlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvL0J1aWxkIGFuIGlubGluZSB3b3JrZXIgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGJyb3dzZXJpZnlcclxuICAgICAgICAgICAgdmFyIGJsb2JVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxyXG4gICAgICAgICAgICAgICAgWyAnKCcgKyBCNjRXb3JrZXIudG9TdHJpbmcoKSArICcpKCknIF0sXHJcbiAgICAgICAgICAgICAgICB7dHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnfVxyXG4gICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgdmFyIHdvcmtlciA9IG5ldyBXb3JrZXIoYmxvYlVSTCk7XHJcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYmxvYlVSTCk7XHJcbiAgICAgICAgICAgIHJldHVybiB3b3JrZXI7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2VuY29kZURhdGEgPSBmdW5jdGlvbiAoZGF0YSwgY2IpIHtcclxuICAgICAgICAgICAgdmFyIGpvYkluZGV4ID0gX2pvYlF1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY2I6IGNiXHJcbiAgICAgICAgICAgIH0pIC0xO1xyXG4gICAgICAgICAgICBfYjY0dy5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgam9iSW5kZXg6IGpvYkluZGV4XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbldvcmtlck1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBqb2JJbmRleCA9IGUuZGF0YS5qb2JJbmRleCxcclxuICAgICAgICAgICAgICAgIGpvYiA9IF9qb2JRdWV1ZVtqb2JJbmRleF07XHJcbiAgICAgICAgICAgIGRlbGV0ZShfam9iUXVldWVbam9iSW5kZXhdKTsgLy9kZWxldGUgYW5kIG5vdCBzcGxpY2UgdG8gYXZvaWQgb2Zmc2V0dGluZyBpbmRleFxyXG4gICAgICAgICAgICBqb2IuY2IoZS5kYXRhLmI2NGRhdGEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pbml0aWFsaXplID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgX2I2NHcgPSBfY3JlYXRlV29ya2VyKCk7XHJcbiAgICAgICAgICAgIF9iNjR3Lm9ubWVzc2FnZSA9IF9vbldvcmtlck1lc3NhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBfaW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgIHNlbGYuZW5jb2RlRGF0YSA9IF9lbmNvZGVEYXRhO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCNjRFbmNvZGVyO1xyXG4iLCIvLyBBcHIgMXN0IDIwMTVcclxuLy8gV2FzIHJlbW92ZWQgYnkgS2V2aW4gT3VyeSwgc2VlIGNvbW1pdCA5YmU4YzAwYThjMjBlNTg4OWIzNjdmZWMwOTQ0OGYwODZkNjkxMTVmXHJcbi8vIFJlc3RvcmUgYnkgU3RhbmlzbGFzIEZlY2huZXIgZm9yIHBlcmZvcm1hbmNlIGlzc3VlXHJcblxyXG4vKipcclxuICogQjY0RW5jb2RpbmcgaXMgZG9uZSBpbiBhIHNlcGVyYXRlIHdvcmtlciB0byBhdm9pZCBwZXJmb3JtYW5jZSBpc3N1ZSB3aGVuIHRoZVxyXG4gKiB1c2VyIHN3aXRjaCB0YWIgb3IgdXNlIGZ1bGxzY3JlZW5cclxuICogSW4gdGhlc2UgdXNlIGNhc2UsIHRoZSBicm93c2VyIGNvbnNpZGVyIHRoZSB0YWIgaXMgbm90IHRoZSBhY3RpdmUgb25lLCBhbmQgYWxsXHJcbiAqIHRpbWVvdXQgaW4gdGhlIG1haW4gdGhyZWFkIGFyZSBzZXQgdG8gbWluaW11bSAxIHNlY29uZFxyXG4gKiBTaW5jZSB3ZSBuZWVkIHRoZSB0aW1lb3V0IGluIHRoZSBmdW5jdGlvbiBfYXJyYXlCdWZmZXJUb0Jhc2U2NCAoZm9yIHBlcmZvcm1hbmNlIGlzc3VlKVxyXG4gKiB3ZSBkbyBpdCBpbiBhIGRpZmZlcmVudCB3b3JrZXIsIGluIHdoaWNoIHRpbWVvdXQgd2lsbCBub3QgYmUgYWZmZWN0ZWRcclxuICovXHJcblxyXG5mdW5jdGlvbiBCNjRXb3JrZXIoKXtcclxuXHJcbiAgICB2YXIgX2FycmF5QnVmZmVyVG9CYXNlNjQgPSBmdW5jdGlvbihieXRlcywgaW5kZXgpIHtcclxuICAgICAgICB2YXIgbGVuID0gYnl0ZXMuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgYjY0RGF0YSA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBiNjREYXRhICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBiNjREYXRhID0gYnRvYShiNjREYXRhKTtcclxuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgYjY0ZGF0YTogYjY0RGF0YSxcclxuICAgICAgICAgICAgam9iSW5kZXg6IGluZGV4XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIF9hcnJheUJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KGUuZGF0YS5kYXRhKSwgZS5kYXRhLmpvYkluZGV4KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vTm90IGluIHVzZSBhdG0sXHJcbiAgICAvL01ldGhvZCB0aWNrIGNhbiBiZSB1c2VkIHRyaWdnZXIgZXZlbnQgJ3RpbWVVcGRhdGUnIGluIGZsYXNoLlxyXG4gICAgLy9XZSdsbCBiZSBhYmxlIHRvIHVzZSB0aGlzIGV2ZW50IGFzIGEgd29ya2Fyb3VkIGZvciB0aGUgc2V0VGltZW91dCAvIHNldEludGVydmFsIHRocm90dGxpbmcgd2hlbiB0aGUgdGFiIGlzIGluYWN0aXZlIC8gdmlkZW8gaW4gZnVsbHNjcmVlblxyXG5cclxuICAgIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgIHRpY2s6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vc2V0SW50ZXJ2YWwodGljaywgMTI1KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCNjRXb3JrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNvdXJjZUJ1ZmZlciA9IHJlcXVpcmUoJy4vU291cmNlQnVmZmVyJyk7XHJcbnZhciBCNjRFbmNvZGVyID0gcmVxdWlyZSgnLi9CNjRFbmNvZGVyJyk7XHJcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XHJcblxyXG52YXIgTWVkaWFTb3VyY2VGbGFzaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG5cclxuICAgICAgICBfdmlkZW9FeHRlbnNpb24sXHJcblxyXG4gICAgICAgIF9zd2ZvYmosXHJcblxyXG4gICAgICAgIF9iNjRFbmNvZGVyID0gbmV3IEI2NEVuY29kZXIoKSxcclxuXHJcbiAgICAgICAgX1JFQURZX1NUQVRFID0ge1xyXG4gICAgICAgICAgICBPUEVOOiAnb3BlbicsXHJcbiAgICAgICAgICAgIENMT1NFRDogJ2Nsb3NlZCdcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVhZHlTdGF0ZSA9IF9SRUFEWV9TVEFURS5DTE9TRUQsXHJcblxyXG4gICAgICAgIC8vVE9ETzogaXMgZHVyYXRpb24gcmVhbHkgYW4gYXR0cmlidXRlIG9mIE1TRSwgb3Igb2YgdmlkZW8/XHJcbiAgICAgICAgX2R1cmF0aW9uID0gMCxcclxuXHJcbiAgICAgICAgX2VlID0gbmV3IEV2ZW50RW1pdHRlcigpLFxyXG5cclxuICAgICAgICBfc291cmNlQnVmZmVycyA9IFtdLFxyXG5cclxuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIF9lZS5vbih0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICBfZWUub2ZmKHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIF9lZS5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkU291cmNlQnVmZmVyID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlQnVmZmVyO1xyXG4gICAgICAgICAgICBzb3VyY2VCdWZmZXIgPSBuZXcgU291cmNlQnVmZmVyKHR5cGUsIF92aWRlb0V4dGVuc2lvbiwgX2I2NEVuY29kZXIpO1xyXG4gICAgICAgICAgICBfc291cmNlQnVmZmVycy5wdXNoKHNvdXJjZUJ1ZmZlcik7XHJcbiAgICAgICAgICAgIF92aWRlb0V4dGVuc2lvbi5yZWdpc3RlclNvdXJjZUJ1ZmZlcihzb3VyY2VCdWZmZXIpO1xyXG4gICAgICAgICAgICBfc3dmb2JqLmFkZFNvdXJjZUJ1ZmZlcih0eXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZUJ1ZmZlcjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVtb3ZlU291cmNlQnVmZmVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9lbmRPZlN0cmVhbSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKHZpZGVvRXh0ZW5zaW9uKSB7XHJcblxyXG4gICAgICAgICAgICBfdmlkZW9FeHRlbnNpb24gPSB2aWRlb0V4dGVuc2lvbjtcclxuICAgICAgICAgICAgX3N3Zm9iaiA9IF92aWRlb0V4dGVuc2lvbi5nZXRTd2YoKTtcclxuXHJcbiAgICAgICAgICAgIF92aWRlb0V4dGVuc2lvbi5jcmVhdGVTcmMoc2VsZik7XHJcblxyXG4gICAgICAgICAgICBfcmVhZHlTdGF0ZSA9IF9SRUFEWV9TVEFURS5PUEVOO1xyXG4gICAgICAgICAgICBfdHJpZ2dlcih7dHlwZTogXCJzb3VyY2VvcGVuXCJ9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5mTVNFLmNhbGxiYWNrcy50cmFuc2NvZGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lm9uUGxheWVyRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cub25QbGF5ZXJFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIF9zd2ZvYmouanNSZWFkeSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgdGhpcy5hZGRTb3VyY2VCdWZmZXIgPSBfYWRkU291cmNlQnVmZmVyO1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyID0gX2FkZEV2ZW50TGlzdGVuZXI7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBfcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuICAgIHRoaXMuZW5kT2ZTdHJlYW0gPSBfZW5kT2ZTdHJlYW07XHJcbiAgICB0aGlzLmluaXRpYWxpemUgPSBfaW5pdGlhbGl6ZTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJyZWFkeVN0YXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX3JlYWR5U3RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9EdXJhdGlvbiBpcyBzZXQgaW4gQnVmZmVyLl9pbml0QnVmZmVyLlxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHVyYXRpb25cIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfZHVyYXRpb247XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKG5ld0R1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgIF9kdXJhdGlvbiA9IG5ld0R1cmF0aW9uO1xyXG4gICAgICAgICAgICBfc3dmb2JqLm9uTWV0YURhdGEobmV3RHVyYXRpb24sIDMyMCwgMjQwKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJzb3VyY2VCdWZmZXJzXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9zb3VyY2VCdWZmZXJzO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuTWVkaWFTb3VyY2VGbGFzaC5pc1R5cGVTdXBwb3J0ZWQgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIHR5cGUuaW5kZXhPZigndmlkZW8vbXA0JykgPiAtMTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVkaWFTb3VyY2VGbGFzaDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2VnbWVudEFwcGVuZGVyID0gZnVuY3Rpb24oc291cmNlQnVmZmVyLCBzd2ZPYmosIGI2NEVuY29kZXIpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuXHJcbiAgICAgICAgX2I2NEVuY29kZXIgPSBiNjRFbmNvZGVyLFxyXG5cclxuICAgICAgICBfc291cmNlQnVmZmVyID0gc291cmNlQnVmZmVyLFxyXG4gICAgICAgIF9zd2ZPYmogPSBzd2ZPYmosXHJcblxyXG4gICAgICAgIF90eXBlLFxyXG4gICAgICAgIF9zdGFydFRpbWUsXHJcbiAgICAgICAgX2VuZFRpbWUsXHJcbiAgICAgICAgX3NlZ21lbnRUeXBlLFxyXG4gICAgICAgIF9kaXNjYXJkID0gZmFsc2UsIC8vcHJldmVudCBmcm9tIGFwcGVuZGluZyBkZWNvZGVkIHNlZ21lbnQgdG8gc3dmIG9iaiBkdXJpbmcgc2Vla2luZyAoc2VnbWVudCB3YXMgYWxyZWFkeSBpbiBCNjQgd2hlbiB3ZSBzZWVrZWQpXHJcbiAgICAgICAgX3NlZWtpbmcgPSBmYWxzZSwgLy9wcmV2ZW50IGFuIGFwcGVuZEJ1ZmZlciBkdXJpbmcgc2Vla2luZyAoc2VnbWVudCBhcnJpdmVkIGFmdGVyIGhhdmluZyBzZWVrZWQpXHJcbiAgICAgICAgX2lzRGVjb2RpbmcgPSBmYWxzZSxcclxuXHJcbiAgICAgICAgLy9CZWZvcmUgc2VuZGluZyBzZWdtZW50IHRvIGZsYXNoIHdlIGNoZWNrIGZpcnN0IGlmIHdlIGFyZSBzZWVraW5nLiBJZiBzbywgd2UgZG9uJ3QgYXBwZW5kIHRoZSBkZWNvZGVkIGRhdGEuXHJcbiAgICAgICAgX2RvQXBwZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgX2lzRGVjb2RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKCFfZGlzY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiU2VnbWVudEFwZW5kZXI6IERPIGFwcGVuZCBcIiArIF90eXBlICsgXCJfc3RhcnRUaW1lPVwiICsgX3N0YXJ0VGltZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGlzSW5pdCA9IF9zZWdtZW50VHlwZSAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICA/IF9zZWdtZW50VHlwZSA9PSBcIkluaXRpYWxpemF0aW9uU2VnbWVudFwiXHJcbiAgICAgICAgICAgICAgICA6IGlzTmFOKF9zdGFydFRpbWUpIHx8ICh0eXBlb2YgX2VuZFRpbWUgIT09ICd1bmRlZmluZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBfc3dmT2JqLmFwcGVuZEJ1ZmZlcihkYXRhLCBfdHlwZSwgaXNJbml0LCBfc3RhcnRUaW1lLCBfZW5kVGltZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJTZWdtZW50QXBlbmRlcjogZGlzY2FyZCBkYXRhIFwiICsgX3R5cGUpO1xyXG4gICAgICAgICAgICAgICAgX2Rpc2NhcmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIF9zb3VyY2VCdWZmZXIuc2VnbWVudEZsdXNoZWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9hcHBlbmRCdWZmZXIgPSBmdW5jdGlvbihkYXRhLCB0eXBlLCBzdGFydFRpbWUsIGVuZFRpbWUsIHNlZ21lbnRUeXBlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIV9zZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICBfdHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICBfc3RhcnRUaW1lID0gc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgX2VuZFRpbWUgPSBlbmRUaW1lO1xyXG4gICAgICAgICAgICAgICAgX3NlZ21lbnRUeXBlID0gc2VnbWVudFR5cGU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiU2VnbWVudEFwZW5kZXI6IHN0YXJ0IGRlY29kaW5nIFwiICsgX3R5cGUpO1xyXG4gICAgICAgICAgICAgICAgX2lzRGVjb2RpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgX2I2NEVuY29kZXIuZW5jb2RlRGF0YShkYXRhLCBfZG9BcHBlbmQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3NvdXJjZUJ1ZmZlci5zZWdtZW50Rmx1c2hlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2luaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xyXG5cclxuICAgIHNlbGYuYXBwZW5kQnVmZmVyID0gX2FwcGVuZEJ1ZmZlcjtcclxuXHJcbiAgICBzZWxmLnNlZWtpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoX2lzRGVjb2RpbmcpIHtcclxuICAgICAgICAgICAgX2Rpc2NhcmQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfc2Vla2luZyA9IHRydWU7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5zZWVrZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBfc2Vla2luZyA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBfaW5pdGlhbGl6ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWdtZW50QXBwZW5kZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEN1c3RvbVRpbWVSYW5nZSA9IHJlcXVpcmUoJy4vdXRpbHMvQ3VzdG9tVGltZVJhbmdlJyk7XHJcbnZhciBTZWdtZW50QXBwZW5kZXIgPSByZXF1aXJlKCcuL1NlZ21lbnRBcHBlbmRlcicpO1xyXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xyXG5cclxudmFyIFNvdXJjZUJ1ZmZlciA9IGZ1bmN0aW9uKHR5cGUsIHZpZGVvRXh0ZW5zaW9uLCBiNjRFbmNvZGVyKSB7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG5cclxuICAgICAgICBfc3dmb2JqID0gdmlkZW9FeHRlbnNpb24uZ2V0U3dmKCksXHJcblxyXG4gICAgICAgIF9zZWdtZW50QXBwZW5kZXIgPSBuZXcgU2VnbWVudEFwcGVuZGVyKHNlbGYsIF9zd2ZvYmosIGI2NEVuY29kZXIpLFxyXG5cclxuICAgICAgICBfdXBkYXRpbmcgPSBmYWxzZSwgLy90cnVlICwgZmFsc2VcclxuICAgICAgICBfdHlwZSA9IHR5cGUsXHJcblxyXG4gICAgICAgIF9zdGFydFRpbWUgPSAwLCAvL1RPRE86IFJlbW92ZSBzdGFydFRpbWUgaGFja1xyXG4gICAgICAgIF9lbmRUaW1lID0gMCxcclxuICAgICAgICBfcGVuZGluZ0VuZFRpbWUgPSAtMSxcclxuICAgICAgICAvKiogX3N3aXRjaGluZ1RyYWNrIGlzIHNldCB0byB0cnVlIHdoZW4gd2UgY2hhbmdlIHJlcCBhbmQgdW50aWwgdGhlIGZpcnN0IHNlZ21lbnQgb2YgdGhlIG5ldyByZXAgaXMgYXBwZW5kZWQgaW4gdGhlIEZsYXNoLiBJdCBhdm9pZHMgZmF0YWwgYmxvY2tpbmcgYXQgX2lzVGltZXN0YW1wQ29uc2lzdGVudCAqKi9cclxuICAgICAgICBfc3dpdGNoaW5nVHJhY2sgPSBmYWxzZSxcclxuXHJcbiAgICAgICAgX29uVHJhY2tTd2l0Y2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX3N3aXRjaGluZ1RyYWNrID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCksXHJcblxyXG4gICAgICAgIF9hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgX2VlLm9uKHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIF9lZS5vZmYodHlwZSwgbGlzdGVuZXIpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF90cmlnZ2VyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgX2VlLmVtaXQoZXZlbnQudHlwZSwgZXZlbnQpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pc1RpbWVzdGFtcENvbnNpc3RlbnQgPSBmdW5jdGlvbihzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHN0YXJ0VGltZSAtIF9lbmRUaW1lKSA+PSAxIC8qfHwgTWF0aC5hYnMoc3RhcnRUaW1lIC0gX2VuZFRpbWUpID4gNjAqLyApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIl9pc1RpbWVzdGFtcENvbnNpc3RlbnQgRkFMU0UuIHN0YXJ0VGltZT1cIiwgc3RhcnRUaW1lLCBcIl9lbmRUaW1lPVwiLCBfZW5kVGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpc05hTihzdGFydFRpbWUpIHx8IChNYXRoLmFicyhzdGFydFRpbWUgLSBfZW5kVGltZSkgPCAxKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYXBwZW5kQnVmZmVyID0gZnVuY3Rpb24oYXJyYXlidWZmZXJfZGF0YSwgc3RhcnRUaW1lLCBlbmRUaW1lKSB7XHJcbiAgICAgICAgICAgIF91cGRhdGluZyA9IHRydWU7IC8vRG8gdGhpcyBhdCB0aGUgdmVyeSBmaXJzdFxyXG4gICAgICAgICAgICBfdHJpZ2dlcih7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlc3RhcnQnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhhdCdzIGRhc2guanMgc2VnbWVudCBkZXNjcmlwdG9yXHJcbiAgICAgICAgICAgIGlmIChzdGFydFRpbWUgJiYgc3RhcnRUaW1lLnNlZ21lbnRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGRlc2NyaXB0b3Iuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICBlbmRUaW1lID0gZGVzY3JpcHRvci5lbmQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VnbWVudFR5cGUgPSBkZXNjcmlwdG9yLnNlZ21lbnRUeXBlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoX2lzVGltZXN0YW1wQ29uc2lzdGVudChzdGFydFRpbWUpIHx8IF9zd2l0Y2hpbmdUcmFjayB8fCB0eXBlb2Ygc3RhcnRUaW1lID09PSBcInVuZGVmaW5lZFwiKSB7IC8vVGVzdCBpZiBkaXNjb250aW51aXR5LiBBbHdheXMgcGFzcyB0ZXN0IGZvciBpbml0U2VnbWVudCAoc3RhcnRUaW1lIHVuZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgX3NlZ21lbnRBcHBlbmRlci5hcHBlbmRCdWZmZXIoYXJyYXlidWZmZXJfZGF0YSwgX3R5cGUsIHN0YXJ0VGltZSwgZW5kVGltZSwgc2VnbWVudFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgX3BlbmRpbmdFbmRUaW1lID0gZW5kVGltZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIGRpc2NvbnRpbnVpdHlcclxuICAgICAgICAgICAgICAgIHZhciBmaXJzdFNlZ21lbnRCb29sID0gKF9zdGFydFRpbWUgPT09IF9lbmRUaW1lKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygndGltZXN0YW1wIG5vdCBjb25zaXN0ZW50LiBGaXJzdCBzZWdtZW50IGFmdGVyIHNlZWs6ICcgKyBmaXJzdFNlZ21lbnRCb29sICsgXCIuICAgXCIgKyAoc3RhcnRUaW1lKSk7XHJcbiAgICAgICAgICAgICAgICBfb25VcGRhdGVlbmQodHJ1ZSk7IC8vdHJpZ2dlciB1cGRhdGVlbmQgd2l0aCBlcnJvciBib29sIHRvIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICogVGhpcyBtZXRob2QgcmVtb3ZlIGRhdGEgZnJvbSB0aGUgYnVmZmVyLlxyXG4gICAgICogV0FSTjogYWxsIGRhdGEgYmV0d2VlbiBzdGFydCBhbmQgZW5kIHRpbWUgYXJlIG5vdCByZWFsbHkgcmVtb3ZlZCBmcm9tIHRoZSBidWZmZXJcclxuICAgICAqIEluZGVlZCB3ZSBjYW4ndCByZW1vdmUgZGF0YSBmcm9tIE5ldFN0cmVhbS4gVG8gZml4IHRoYXQgYW4gaW50ZXJtZWRpYXRlIGJ1ZmZlciBoYXMgYmVlbiBpbXBsZW1lbnRlZCBpbiBmbGFzaCAoU3RyZWFtQnVmZmVyLmFzKVxyXG4gICAgICogRGF0YSBpcyBmaXJzdCBzdG9yZWQgaW4gdGhlIHN0cmVhbUJ1ZmZlciwgYW5kIHRoZW4gYXQgdGhlIGxhc3QgbW9tZW50LCB0aGUgbWluaW11bSBhbW91bnQgb2YgZGF0YSBpcyBpbnNlcnRlZCBpbiBOZXRTdHJlYW1cclxuICAgICAqIFRoZSBtZXRob2RzIF9zd2ZvYmouZmx1c2hTb3VyY2VCdWZmZXIgYW5kIF9zd2ZvYmoucmVtb3ZlIGNsZWFyIGRhdGEgZnJvbSB0aGUgc3RyZWFtQnVmZmVyLCBidXQgdGhlcmUgd2lsbFxyXG4gICAgICogYWx3YXlzIGJlIGEgc21hbGwgYW1vdW50IG9mIGRhdGEgaW4gTmV0U3RyZWFtIHRoYXQgY2FuJ3QgYmUgcmVtb3ZlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtpbnR9IHN0YXJ0IC0gU3RhcnQgb2YgdGhlIHJlbW92ZWQgaW50ZXJ2YWwsIGluIHNlY29uZHNcclxuICAgICAqIEBwYXJhbSAge2ludH0gZW5kICAgLSBFbmQgb2YgdGhlIHJlbW92ZWQgaW50ZXJ2YWwsIGluIHNlY29uZHNcclxuICAgICAqIEByZXR1cm4gLSBubyByZXR1cm5lZCB2YWx1ZVxyXG4gICAgICovXHJcbiAgICAgICAgX3JlbW92ZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPT0gSW5maW5pdHkgfHwgc3RhcnQgPiBlbmQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgQXJndW1lbnRzOiBjYW5ub3QgY2FsbCBTb3VyY2VCdWZmZXIucmVtb3ZlXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfdXBkYXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoc3RhcnQgPj0gX2VuZFRpbWUgfHwgZW5kIDw9IF9zdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIC8vd2UgZG9uJ3QgcmVtb3ZlIGFueXRoaW5nXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhcnQgPD0gX3N0YXJ0VGltZSAmJiBlbmQgPj0gX2VuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIC8vd2UgcmVtb3ZlIHRoZSB3aG9sZSBidWZmZXJcclxuICAgICAgICAgICAgICAgIC8vd2Ugc2hvdWxkIHNldCBfZW5kVGltZSA9IF9zdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICAvL2hvd2V2ZXIgYWxsIGRhdGEgdGhhdCBoYXZlIGJlZW4gaW5zZXJ0ZWQgaW50byBOZXRTdHJlYW0gY2FuJ3QgYmUgcmVtb3ZlZC4gTWV0aG9kIGZsdXNoU291cmNlQnVmZmVyIHJldHVybiB0aGUgdHJ1ZSBlbmRUaW1lLCBpZSB0aGUgZW5kVGltZSBvZiBOZXRTdGVhbVxyXG4gICAgICAgICAgICAgICAgX2VuZFRpbWUgPSBfc3dmb2JqLnJlbW92ZShzdGFydCwgZW5kLCBfdHlwZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhcnQgPiBfc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAvL3dlIHNob3VsZCBzZXQgX2VuZFRpbWUgPSBzdGFydDtcclxuICAgICAgICAgICAgICAgIC8vaG93ZXZlciBhbGwgZGF0YSB0aGF0IGhhdmUgYmVlbiBpbnNlcnRlZCBpbnRvIE5ldFN0cmVhbSBjYW4ndCBiZSByZW1vdmVkLiBNZXRob2QgX3N3Zm9iai5yZW1vdmUgcmV0dXJuIHRoZSB0cnVlIGVuZFRpbWUsIGllIHRoZSBlbmRUaW1lIG9mIE5ldFN0ZWFtXHJcbiAgICAgICAgICAgICAgICBfZW5kVGltZSA9IF9zd2ZvYmoucmVtb3ZlKHN0YXJ0LCBlbmQsIF90eXBlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGFydCA8PSBfc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAvL2luIHRoYXQgY2FzZSB3ZSBjYW4ndCByZW1vdmUgZGF0YSBmcm9tIE5ldFN0cmVhbVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdCdWZmZXIgaXMgdmlydHVhbGx5IHJlbW92ZWQgYnV0IGRhdGEgc3RpbGwgZXhpc3QgaW4gTmV0U3RyZWFtIG9iamVjdCcpO1xyXG4gICAgICAgICAgICAgICAgX3N0YXJ0VGltZSA9IGVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2l0IGlzIGltcG9ydGFudCB0byBzZXQgX3BlbmRpbmdFbmRUaW1lIHRvIC0xIHNvIHRoYXQgX2VuZFRpbWUgaXMgbm90IHJlYXNzaWduZWQgd2hlbiBmbGFzaCB3aWxsIHRyaWdnZXIgb25VcGRhdGVlbmQgd2hlbiBkZWNvZGluZyBvZiB0aGUgY3VycmVudCBzZWdtZW50IGlzIGZpbmlzaGVkXHJcbiAgICAgICAgICAgIF9wZW5kaW5nRW5kVGltZSA9IC0xO1xyXG4gICAgICAgICAgICAvL3RyaWdnZXIgdXBkYXRlZW5kIHRvIGxhdW5jaCBuZXh0IGpvYi4gTmVlZHMgdGhlIHNldFRpbWVvdXQgdG8gYmUgY2FsbGVkIGFzeW5jaHJvbm91c2x5IGFuZCBhdm9pZCBlcnJvciB3aXRoIE1heCBjYWxsIHN0YWNrIHNpemUgKGluZmluaXRlIHJlY3Vyc2l2ZSBsb29wKVxyXG4gICAgICAgICAgICBfb25VcGRhdGVlbmQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVmZmVyZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGJ1ZmZlcmVkQXJyYXkgPSBbXTtcclxuICAgICAgICAgICAgaWYgKF9lbmRUaW1lID4gX3N0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyZWRBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogX3N0YXJ0VGltZSxcclxuICAgICAgICAgICAgICAgICAgICBlbmQ6IF9lbmRUaW1lXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEN1c3RvbVRpbWVSYW5nZShidWZmZXJlZEFycmF5KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZGVidWdCdWZmZXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgYnVmZmVyZWQgPSBfYnVmZmVyZWQoKTtcclxuICAgICAgICAgICAgaWYgKF9wZW5kaW5nRW5kVGltZSA+IF9lbmRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJlZC5hZGQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBfZW5kVGltZSxcclxuICAgICAgICAgICAgICAgICAgICBlbmQ6IF9wZW5kaW5nRW5kVGltZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcmVkO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF90cmlnZ2VyVXBkYXRlZW5kID0gZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgX3VwZGF0aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvL0lmIF9wZW5kaW5nRW5kVGltZSA8IF9lbmRUaW1lLCBpdCBtZWFucyBhIHNlZ21lbnQgaGFzIGFycml2ZWQgbGF0ZSAoTUJSPyksIGFuZCB3ZSBkb24ndCB3YW50IHRvIHJlZHVjZSBvdXIgYnVmZmVyZWQuZW5kXHJcbiAgICAgICAgICAgIC8vKHRoYXQgd291bGQgdHJpZ2dlciBvdGhlciBsYXRlIGRvd25sb2FkcyBhbmQgd2Ugd291bGQgYWRkIGV2ZXJ5dGhpbmcgdG8gZmxhc2ggaW4gZG91YmxlLCB3aGljaCBpcyBub3QgZ29vZCBmb3JcclxuICAgICAgICAgICAgLy9wZXJmb3JtYW5jZSlcclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd1cGRhdGVlbmQgJyArIF90eXBlKTtcclxuICAgICAgICAgICAgaWYgKCFlcnJvciAmJiBfcGVuZGluZ0VuZFRpbWUgPiBfZW5kVGltZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdzZXR0aW5nIGVuZCB0aW1lIHRvICcgKyBfcGVuZGluZ0VuZFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgX2VuZFRpbWUgPSBfcGVuZGluZ0VuZFRpbWU7XHJcbiAgICAgICAgICAgICAgICAvLyBXYWl0IHVudGlsIHdlJ3JlIHN1cmUgdGhlIHJpZ2h0IHNlZ21lbnQgd2FzIGFwcGVuZGVkIHRvIG5ldFN0cmVhbSBiZWZvcmUgc2V0dGluZyBfc3dpdGNoaW5nVHJhY2sgdG8gZmFsc2UgdG8gYXZvaWQgcGVycGV0dWFsIGJsb2NraW5nIGF0IF9pc1RpbWVzdGFtcENvbnNpc3RlbnRcclxuICAgICAgICAgICAgICAgIF9zd2l0Y2hpbmdUcmFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJXcm9uZyBzZWdtZW50LiBVcGRhdGUgbWFwIHRoZW4gYnVmZmVyaXplIE9SIGRpc2NvbnRpbnVpdHkgYXQgc291cmNlQnVmZmVyLmFwcGVuZEJ1ZmZlclwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX3RyaWdnZXIoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZWVuZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uVXBkYXRlZW5kID0gZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIF90cmlnZ2VyVXBkYXRlZW5kKGVycm9yKTtcclxuICAgICAgICAgICAgfSwgNSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3NlZWtUaW1lID0gZnVuY3Rpb24odGltZSkge1xyXG4gICAgICAgICAgICAvL1NldHMgYm90aCBzdGFydFRpbWUgYW5kIGVuZFRpbWUgdG8gc2VlayB0aW1lLlxyXG4gICAgICAgICAgICBfc3RhcnRUaW1lID0gdGltZTtcclxuICAgICAgICAgICAgX2VuZFRpbWUgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgLy9zZXQgX3BlbmRpbmdFbmRUaW1lIHRvIC0xLCBiZWNhdXNlIHVwZGF0ZSBlbmQgaXMgdHJpZ2dlcmVkIDIwbXMgYWZ0ZXIgZW5kIG9mIGFwcGVuZCBpbiBOZXRTdHJlYW0sIHNvIGlmIGEgc2VlayBoYXBwZW5zIGluIHRoZSBtZWFudGltZSB3ZSB3b3VsZCBzZXQgX2VuZFRpbWUgdG8gX3BlbmRpbmdFbmRUaW1lIHdyb25nbHkuXHJcbiAgICAgICAgICAgIC8vVGhpcyB3b24ndCBoYXBwZW4gaWYgd2Ugc2V0IF9wZW5kaW5nRW5kVGltZSB0byAtMSwgc2luY2Ugd2UgbmVlZCBfcGVuZGluZ0VuZFRpbWUgPiBfZW5kVGltZS5cclxuICAgICAgICAgICAgX3BlbmRpbmdFbmRUaW1lID0gLTE7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2luaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKF90eXBlLm1hdGNoKC92aWRlby8pKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3MudXBkYXRlZW5kX3ZpZGVvID0gX29uVXBkYXRlZW5kO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKF90eXBlLm1hdGNoKC9hdWRpby8pKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3MudXBkYXRlZW5kX2F1ZGlvID0gX29uVXBkYXRlZW5kO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKF90eXBlLm1hdGNoKC92bmQvKSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLnVwZGF0ZWVuZF92aWRlbyA9IF9vblVwZGF0ZWVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2aWRlb0V4dGVuc2lvbi5hZGRFdmVudExpc3RlbmVyKCd0cmFja1N3aXRjaCcsIF9vblRyYWNrU3dpdGNoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZk1TRS5kZWJ1Zy5idWZmZXJEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVidWdTb3VyY2VCdWZmZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyZWQ6IF9idWZmZXJlZCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBfdHlwZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVidWdTb3VyY2VCdWZmZXIsIFwiZGVidWdCdWZmZXJlZFwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBfZGVidWdCdWZmZXJlZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgd2luZG93LmZNU0UuZGVidWcuYnVmZmVyRGlzcGxheS5hdHRhY2hTb3VyY2VCdWZmZXIoZGVidWdTb3VyY2VCdWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB0aGlzLmFwcGVuZEJ1ZmZlciA9IF9hcHBlbmRCdWZmZXI7XHJcbiAgICB0aGlzLnJlbW92ZSA9IF9yZW1vdmU7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgPSBfYWRkRXZlbnRMaXN0ZW5lcjtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IF9yZW1vdmVFdmVudExpc3RlbmVyO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInVwZGF0aW5nXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX3VwZGF0aW5nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiB1bmRlZmluZWRcclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImJ1ZmZlcmVkXCIsIHtcclxuICAgICAgICBnZXQ6IF9idWZmZXJlZCxcclxuICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcHBlbmRXaW5kb3dTdGFydCA9IDA7XHJcblxyXG4gICAgLy9cclxuICAgIC8vVE9ETzogYSBsb3Qgb2YgbWV0aG9kcyBub3QgaW4gc291cmNlQnVmZmVyIHNwZWMuIGlzIHRoZXJlIGFuIG90aGVyIHdheT9cclxuICAgIC8vXHJcblxyXG4gICAgdGhpcy5zZWVraW5nID0gZnVuY3Rpb24odGltZSkge1xyXG4gICAgICAgIF9zZWVrVGltZSh0aW1lKTtcclxuICAgICAgICBfc2VnbWVudEFwcGVuZGVyLnNlZWtpbmcoKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZWVrZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBfc2VnbWVudEFwcGVuZGVyLnNlZWtlZCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNlZ21lbnRGbHVzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX29uVXBkYXRlZW5kKHRydWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpc0ZsYXNoXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICB9KTtcclxuXHJcbiAgICBfaW5pdGlhbGl6ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VCdWZmZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEN1c3RvbVRpbWVSYW5nZSA9IHJlcXVpcmUoJy4vdXRpbHMvQ3VzdG9tVGltZVJhbmdlJyk7XHJcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XHJcblxyXG52YXIgVmlkZW9FeHRlbnNpb24gPSBmdW5jdGlvbihzd2ZPYmopIHtcclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcblxyXG4gICAgICAgIF9zd2ZPYmogPSBzd2ZPYmosXHJcblxyXG4gICAgICAgIF9tZWRpYVNvdXJjZSxcclxuICAgICAgICBfc291cmNlQnVmZmVycyA9IFtdLFxyXG5cclxuICAgICAgICBfY3VycmVudFRpbWUgPSAwLFxyXG4gICAgICAgIF9maXhlZEN1cnJlbnRUaW1lID0gMCwgLy9JbiBjYXNlIG9mIHZpZGVvIHBhdXNlZCBvciBidWZmZXJpbmdcclxuICAgICAgICBfc2Vla1RhcmdldCwgLy8gVXNpbmcgYW5vdGhlciB2YXJpYWJsZSBmb3Igc2Vla2luZywgYmVjYXVzZSBzZWVrVGFyZ2V0IGNhbiBiZSBzZXQgdG8gdW5kZWZpbmVkIGJ5IFwicGxheWluZ1wiIGV2ZW50IChUT0RPOiB0cmlnZ2VyZWQgZHVyaW5nIHNlZWssIHdoaWNoIGlzIGEgc2VwYXJhdGUgaXNzdWUpXHJcbiAgICAgICAgX2xhc3RDdXJyZW50VGltZVRpbWVzdGFtcCxcclxuICAgICAgICBfUkVGUkVTSF9JTlRFUlZBTCA9IDIwMDAsIC8vTWF4IGludGVydmFsIHVudGlsIHdlIGxvb2sgdXAgZmxhc2ggdG8gZ2V0IHJlYWwgdmFsdWUgb2YgY3VycmVudFRpbWVcclxuXHJcbiAgICAgICAgX2VuZGVkID0gZmFsc2UsXHJcbiAgICAgICAgLy9fYnVmZmVyaW5nID0gdHJ1ZSxcclxuICAgICAgICAvL19wYXVzZWQgPSBmYWxzZSxcclxuICAgICAgICBfc2Vla2luZyA9IGZhbHNlLFxyXG4gICAgICAgIF9zZWVrZWRUaW1lb3V0LFxyXG5cclxuICAgICAgICBfZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCksXHJcblxyXG4gICAgICAgIF9pc0luaXRpYWxpemVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodHlwZW9mIF9zd2ZPYmogIT09ICd1bmRlZmluZWQnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIF9lZS5vbih0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICBfZWUub2ZmKHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIF9lZS5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoX2lzSW5pdGlhbGl6ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgX2ZpeGVkQ3VycmVudFRpbWUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBfc3dmT2JqLnBsYXkoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vVE9ETzogaW1wbGVtZW50IGV4Y2VwdGlvbnMgc2ltaWxhciB0byBIVE1MNSBvbmUsIGFuZCBoYW5kbGUgdGhlbSBjb3JyZWN0bHkgaW4gdGhlIGNvZGVcclxuICAgICAgICAgICAgICAgIG5ldyBFcnJvcignRmxhc2ggdmlkZW8gaXMgbm90IGluaXRpYWxpemVkJyk7IC8vVE9ETzogc2hvdWxkIGJlIFwidGhyb3cgbmV3IEVycm9yKC4uLilcIiBidXQgdGhhdCB3b3VsZCBzdG9wIHRoZSBleGVjdXRpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9wYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoX2lzSW5pdGlhbGl6ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfZml4ZWRDdXJyZW50VGltZSA9PT0gXCJ1bmRlZmluZWRcIikgeyAvL0Rvbid0IG92ZXJyaWRlIF9maXhlZEN1cnJlbnRUaW1lIGlmIGl0IGFscmVhZHkgZXhpc3RzIChjYXNlIG9mIGEgc2VlayBmb3IgZXhhbXBsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2ZpeGVkQ3VycmVudFRpbWUgPSBfZ2V0Q3VycmVudFRpbWVGcm9tRmxhc2goKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF9zd2ZPYmoucGF1c2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vVE9ETzogaW1wbGVtZW50IGV4Y2VwdGlvbnMgc2ltaWxhciB0byBIVE1MNSBvbmUsIGFuZCBoYW5kbGUgdGhlbSBjb3JyZWN0bHkgaW4gdGhlIGNvZGVcclxuICAgICAgICAgICAgICAgIG5ldyBFcnJvcignRmxhc2ggdmlkZW8gaXMgbm90IGluaXRpYWxpemVkJyk7IC8vVE9ETzogc2hvdWxkIGJlIFwidGhyb3cgbmV3IEVycm9yKC4uLilcIiBidXQgdGhhdCB3b3VsZCBzdG9wIHRoZSBleGVjdXRpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9zZWVrID0gZnVuY3Rpb24odGltZSkge1xyXG4gICAgICAgICAgICBpZiAoIV9zZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICBfc2Vla2VkVGltZW91dCA9IHNldFRpbWVvdXQoX29uU2Vla2VkLCA1MDAwKTtcclxuICAgICAgICAgICAgICAgIGlmIChfaXNJbml0aWFsaXplZCgpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcInNlZWtpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RyaWdnZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2Vla2luZydcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBfc2Vla2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vUmFwaWQgZml4LiBDaGVjayBpZiBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfc291cmNlQnVmZmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc291cmNlQnVmZmVyc1tpXS5zZWVraW5nKHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgX3NlZWtUYXJnZXQgPSBfZml4ZWRDdXJyZW50VGltZSA9IHRpbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vVGhlIGZsYXNoIGlzIGZsdXNoZWQgc29tZXdoZXJlIGluIHRoaXMgc2VlayBmdW5jdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIF9zd2ZPYmouc2Vlayh0aW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBpbXBsZW1lbnQgZXhjZXB0aW9ucyBzaW1pbGFyIHRvIEhUTUw1IG9uZSwgYW5kIGhhbmRsZSB0aGVtIGNvcnJlY3RseSBpbiB0aGUgY29kZVxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcignRmxhc2ggdmlkZW8gaXMgbm90IGluaXRpYWxpemVkJyk7IC8vVE9ETzogc2hvdWxkIGJlIFwidGhyb3cgbmV3IEVycm9yKC4uLilcIiBidXQgdGhhdCB3b3VsZCBzdG9wIHRoZSBleGVjdXRpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRDdXJyZW50VGltZUZyb21GbGFzaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBfY3VycmVudFRpbWUgPSBfc3dmT2JqLmN1cnJlbnRUaW1lKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBfY3VycmVudFRpbWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfZW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfbWVkaWFTb3VyY2UuZHVyYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9zZWVrVGFyZ2V0ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX3NlZWtUYXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX2ZpeGVkQ3VycmVudFRpbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfZml4ZWRDdXJyZW50VGltZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKF9sYXN0Q3VycmVudFRpbWVUaW1lc3RhbXAgJiYgbm93IC0gX2xhc3RDdXJyZW50VGltZVRpbWVzdGFtcCA8IF9SRUZSRVNIX0lOVEVSVkFMKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJlbnRUaW1lICsgKG5vdyAtIF9sYXN0Q3VycmVudFRpbWVUaW1lc3RhbXApIC8gMTAwMDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChfaXNJbml0aWFsaXplZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBfbGFzdEN1cnJlbnRUaW1lVGltZXN0YW1wID0gbm93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9nZXRDdXJyZW50VGltZUZyb21GbGFzaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRQYXVzZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKF9pc0luaXRpYWxpemVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfc3dmT2JqLnBhdXNlZCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBpbXBsZW1lbnQgZXhjZXB0aW9ucyBzaW1pbGFyIHRvIEhUTUw1IG9uZSwgYW5kIGhhbmRsZSB0aGVtIGNvcnJlY3RseSBpbiB0aGUgY29kZVxyXG4gICAgICAgICAgICAgICAgbmV3IEVycm9yKCdGbGFzaCB2aWRlbyBpcyBub3QgaW5pdGlhbGl6ZWQnKTsgLy9UT0RPOiBzaG91bGQgYmUgXCJ0aHJvdyBuZXcgRXJyb3IoLi4uKVwiIGJ1dCB0aGF0IHdvdWxkIHN0b3AgdGhlIGV4ZWN1dGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldEJ1ZmZlcmVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzYkJ1ZmZlcmVkLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBJbmZpbml0eSxcclxuICAgICAgICAgICAgICAgIGVuZCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3NvdXJjZUJ1ZmZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHNiQnVmZmVyZWQgPSBfc291cmNlQnVmZmVyc1tpXS5idWZmZXJlZDtcclxuICAgICAgICAgICAgICAgIGlmICghc2JCdWZmZXJlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEN1c3RvbVRpbWVSYW5nZShbXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbXB1dGUgdGhlIGludGVyc2VjdGlvbiBvZiB0aGUgVGltZVJhbmdlcyBvZiBlYWNoIFNvdXJjZUJ1ZmZlclxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdBUk5JTkc6IHdlIG1ha2UgdGhlIGFzc3VtcHRpb24gdGhhdCBTb3VyY2VCdWZmZXIgcmV0dXJuIGEgVGltZVJhbmdlIHdpdGggbGVuZ3RoIDAgb3IgMSwgYmVjYXVzZSB0aGF0J3MgaG93IHRoaXMgcHJvcGVydHkgaXMgaW1wbGVtZW50ZWQgZm9yIG5vdy5cclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHdpbGwgYnJlYWsgaWYgdGhpcyBpcyBubyBsb25nZXIgdGhlIGNhc2UgKGlmIHdlIGltcHJvdmUgQVMzIGJ1ZmZlciBtYW5hZ2VtZW50IHRvIHN1cHBvcnQgbXVsdGlwbGUgcmFuZ2VzIGZvciBleGFtcGxlKVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gTWF0aC5taW4oc3RhcnQsIHNiQnVmZmVyZWQuc3RhcnQoMCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IE1hdGgubWF4KGVuZCwgc2JCdWZmZXJlZC5lbmQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGFydCA+PSBlbmQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tVGltZVJhbmdlKFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEN1c3RvbVRpbWVSYW5nZShbe3N0YXJ0LCBlbmR9XSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFBsYXllZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiByZXR1cm4gbm9ybWFsaXplZCBUaW1lUmFuZ2UgaGVyZSBhY2NvcmRpbmcgdG8gTWVkaWFFbGVtZW50IEFQSVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vRVZFTlRTXHJcbiAgICAgICAgX29uU2Vla2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF9zZWVraW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIF9lbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBfc2Vla1RhcmdldCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF9zZWVrZWRUaW1lb3V0KTtcclxuICAgICAgICAgICAgX3RyaWdnZXIoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlZWtlZCdcclxuICAgICAgICAgICAgfSk7IC8vdHJpZ2dlciB3aXRoIHZhbHVlIF9maXhlZEN1cnJlbnRUaW1lXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3NvdXJjZUJ1ZmZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIF9zb3VyY2VCdWZmZXJzW2ldLnNlZWtlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTG9hZFN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF9lbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBfdHJpZ2dlcih7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZHN0YXJ0J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25QbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF9jdXJyZW50VGltZSA9IF9nZXRDdXJyZW50VGltZUZyb21GbGFzaCgpOyAvL0ZvcmNlIHJlZnJlc2ggX2N1cnJlbnRUaW1lXHJcbiAgICAgICAgICAgIF9maXhlZEN1cnJlbnRUaW1lID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgX2VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIF90cmlnZ2VyKHt0eXBlOiAncGxheSd9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvL1RPRE86IHNlZW1zIG5vdCBiZSB1c2VkIGFueW1vcmUgc2VlIENMSUVOLTI2OFxyXG4gICAgICAgIF9vblBhdXNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF9maXhlZEN1cnJlbnRUaW1lID0gX2ZpeGVkQ3VycmVudFRpbWUgIT09IHVuZGVmaW5lZCA/IF9maXhlZEN1cnJlbnRUaW1lIDogX2dldEN1cnJlbnRUaW1lRnJvbUZsYXNoKCk7IC8vIERvIG5vdCBlcmFzZSB2YWx1ZSBpZiBhbHJlYWR5IHNldFxyXG4gICAgICAgICAgICBfdHJpZ2dlcih7dHlwZTogJ3BhdXNlJ30pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vblBsYXlpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX2ZpeGVkQ3VycmVudFRpbWUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIF90cmlnZ2VyKHt0eXBlOiAncGxheWluZyd9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25XYWl0aW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF9maXhlZEN1cnJlbnRUaW1lID0gX2ZpeGVkQ3VycmVudFRpbWUgIT09IHVuZGVmaW5lZCA/IF9maXhlZEN1cnJlbnRUaW1lIDogX2dldEN1cnJlbnRUaW1lRnJvbUZsYXNoKCk7IC8vIERvIG5vdCBlcmFzZSB2YWx1ZSBpZiBhbHJlYWR5IHNldFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vblN0b3BwZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX2VuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIF90cmlnZ2VyKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdlbmRlZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uQ2FucGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBfdHJpZ2dlcih7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2FucGxheSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uRHVyYXRpb25jaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX3RyaWdnZXIoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2R1cmF0aW9uY2hhbmdlJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Wb2x1bWVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX3RyaWdnZXIoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3ZvbHVtZWNoYW5nZSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2NhblBsYXlUeXBlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncHJvYmFibHknO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3Muc2Vla2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RyaWdnZXIgZXZlbnQgd2hlbiBzZWVrIGlzIGRvbmVcclxuICAgICAgICAgICAgICAgIF9vblNlZWtlZCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLmxvYWRzdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9UcmlnZ2VyIGV2ZW50IHdoZW4gd2Ugd2FudCB0byBzdGFydCBsb2FkaW5nIGRhdGEgKGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHZpZGVvIG9yIG9uIHJlcGxheSlcclxuICAgICAgICAgICAgICAgIF9vbkxvYWRTdGFydCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLnBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVHJpZ2dlciBldmVudCB3aGVuIG1lZGlhIGlzIHJlYWR5IHRvIHBsYXlcclxuICAgICAgICAgICAgICAgIF9vblBsYXkoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5mTVNFLmNhbGxiYWNrcy5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF9vblBhdXNlKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3MuY2FucGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgX29uQ2FucGxheSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLnBsYXlpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVHJpZ2dlciBldmVudCB3aGVuIHRoZSBtZWRpYSBpcyBwbGF5aW5nXHJcbiAgICAgICAgICAgICAgICBfb25QbGF5aW5nKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3Mud2FpdGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy9UcmlnZ2VyIGV2ZW50IHdoZW4gdmlkZW8gaGFzIGJlZW4gcGF1c2VkIGJ1dCBpcyBleHBlY3RlZCB0byByZXN1bWUgKGllIG9uIGJ1ZmZlcmluZyBvciBtYW51YWwgcGF1c2VkKVxyXG4gICAgICAgICAgICAgICAgX29uV2FpdGluZygpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLnN0b3BwZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vVHJpZ2dlciBldmVudCB3aGVuIHZpZGVvIGVuZHMuXHJcbiAgICAgICAgICAgICAgICBfb25TdG9wcGVkKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuZk1TRS5jYWxsYmFja3MuZHVyYXRpb25DaGFuZ2UgPSBmdW5jdGlvbihkdXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgX29uRHVyYXRpb25jaGFuZ2UoZHVyYXRpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLmFwcGVuZGVkX3NlZ21lbnQgPSBmdW5jdGlvbihzdGFydFRpbWUsIGVuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IG5vdCBzdXJlIHdoYXQgdGhpcyBldmVudCB3YXMgbWVhbnQgZm9yLiBJdCBkdXBsaWNhdGVzIHRoZSB1cGRhdGVlbmQgZXZlbnRzLCBhbmQgdGhlIGNvbW1lbnRzIGFsb25nIHRoaXMgd29ya2Zsb3cgZG9uJ3QgcmVmbGVjdCB3aGF0IGl0IGlzIHJlYWxseSBzdXBwb3NlZCB0byBkb1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmZNU0UuY2FsbGJhY2tzLnZvbHVtZUNoYW5nZSA9IGZ1bmN0aW9uKHZvbHVtZSkge1xyXG4gICAgICAgICAgICAgICAgX29uVm9sdW1lY2hhbmdlKHZvbHVtZSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgb2xkQ3JlYXRlT2JqZWN0VVJMID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkw7XHJcbiAgICAgICAgICAgIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMID0gZnVuY3Rpb24gKG1lZGlhU291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVkaWFTb3VyY2UuaW5pdGlhbGl6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9tZWRpYVNvdXJjZSA9IG1lZGlhU291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIF9tZWRpYVNvdXJjZS5pbml0aWFsaXplKHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xkQ3JlYXRlT2JqZWN0VVJMKG1lZGlhU291cmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZk1TRS5kZWJ1Zy5idWZmZXJEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZk1TRS5kZWJ1Zy5idWZmZXJEaXNwbGF5LmF0dGFjaFZpZGVvKHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJjdXJyZW50VGltZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBfZ2V0Q3VycmVudFRpbWUsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbih0aW1lKSB7XHJcbiAgICAgICAgICAgIF9zZWVrKHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInNlZWtpbmdcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfc2Vla2luZztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJwYXVzZWRcIiwge1xyXG4gICAgICAgIGdldDogX2dldFBhdXNlZCxcclxuICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgfSk7XHJcblxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHVyYXRpb25cIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX21lZGlhU291cmNlLmR1cmF0aW9uO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiB1bmRlZmluZWRcclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInBsYXliYWNrUmF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxOyAvL0Fsd2F5cyByZXR1cm4gMSwgYXMgd2UgZG9uJ3Qgc3VwcG9ydCBjaGFuZ2luZyBwbGF5YmFjayByYXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy9UaGUgb25seSB0aW1lIHdlJ2xsIHNldCBwbGF5YmFjayByYXRlIGZvciBub3cgaXMgdG8gcGF1c2UgdmlkZW8gb24gcmVidWZmZXJpbmcgKHdvcmthcm91bmQgaW4gSFRNTDUgb25seSkuXHJcbiAgICAgICAgICAgIC8vQWRkZWQgd2FybmluZyBpZiB3ZSBldmVyIHdhbnRlZCB0byB1c2UgaXQgZm9yIG90aGVyIHB1cnBvc2VzLlxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2hhbmdpbmcgcGxheWJhY2sgcmF0ZSBpcyBub3Qgc3VwcG9ydGVkIGZvciBub3cgd2l0aCBTdHJlYW1yb290IEZsYXNoIHBsYXliYWNrLlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpc0ZsYXNoXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJidWZmZXJlZFwiLCB7XHJcbiAgICAgICAgZ2V0OiBfZ2V0QnVmZmVyZWQsXHJcbiAgICAgICAgc2V0OiB1bmRlZmluZWRcclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInBsYXllZFwiLCB7XHJcbiAgICAgICAgZ2V0OiBfZ2V0UGxheWVkLFxyXG4gICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJwcmVsb2FkXCIsIHtcclxuICAgICAgICBnZXQ6IHVuZGVmaW5lZCxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm9uZW5jcnlwdGVkXCIsIHtcclxuICAgICAgICBnZXQ6IHVuZGVmaW5lZCxcclxuICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgfSk7XHJcblxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYXV0b3BsYXlcIiwge1xyXG4gICAgICAgIGdldDogdW5kZWZpbmVkLFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZW5kZWRcIiwge1xyXG4gICAgICAgIGdldDogdW5kZWZpbmVkLFxyXG4gICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJyZWFkeVN0YXRlXCIsIHtcclxuICAgICAgICBnZXQ6IF9zd2ZPYmoucmVhZHlTdGF0ZSxcclxuICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVTcmMgPSBmdW5jdGlvbihtZWRpYVNvdXJjZUZsYXNoKSB7XHJcbiAgICAgICAgX21lZGlhU291cmNlID0gbWVkaWFTb3VyY2VGbGFzaDtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5yZWdpc3RlclNvdXJjZUJ1ZmZlciA9IGZ1bmN0aW9uKHNvdXJjZUJ1ZmZlcikge1xyXG4gICAgICAgIF9zb3VyY2VCdWZmZXJzLnB1c2goc291cmNlQnVmZmVyKTtcclxuICAgICAgICAvL1RPRE86IHJlZ2lzdGVyIHNvdXJjZSBidWZmZXIgaW4gdGhlcmUgZm9yIHNvdXJjZUJ1ZmZlckV2ZW50c1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmdldFN3ZiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfc3dmT2JqO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBsYXkgPSBfcGxheTtcclxuICAgIHRoaXMucGF1c2UgPSBfcGF1c2U7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgPSBfYWRkRXZlbnRMaXN0ZW5lcjtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IF9yZW1vdmVFdmVudExpc3RlbmVyO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50ID0gX3RyaWdnZXI7XHJcbiAgICB0aGlzLmNhblBsYXlUeXBlID0gX2NhblBsYXlUeXBlO1xyXG5cclxuICAgIC8vVE9ETzpyZWdpc3RlciBtZWRpYVNvdXJjZSBhbmQgdmlkZW8gZXZlbnRzXHJcblxyXG4gICAgLy9UT0RPOiBjcmVhdGUgZ2xvYmFsIG1ldGhvZHMgZm9yIGZsYXNoIGV2ZW50cyBoZXJlLCBhbmQgZGlzcGF0Y2ggZXZlbnRzIHRvIHJlZ2lzdGVyZWQgTWVkaWFTb3VyY2UsIFNvdXJjZUJ1ZmZlcnMsIGV0Yy4uLlxyXG5cclxuICAgIF9pbml0aWFsaXplKCk7XHJcbn07XHJcblxyXG5WaWRlb0V4dGVuc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSk7XHJcblZpZGVvRXh0ZW5zaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZpZGVvRXh0ZW5zaW9uO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWRlb0V4dGVuc2lvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQ3VzdG9tVGltZVJhbmdlID0gZnVuY3Rpb24odGltZVJhbmdlQXJyYXkgPSBbXSkge1xyXG4gICAgdmFyIF90aW1lUmFuZ2VBcnJheSA9IHRpbWVSYW5nZUFycmF5O1xyXG5cclxuICAgIHRoaXMubGVuZ3RoID0gX3RpbWVSYW5nZUFycmF5Lmxlbmd0aDtcclxuXHJcbiAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICBfdGltZVJhbmdlQXJyYXkucHVzaChzZWdtZW50KTtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IF90aW1lUmFuZ2VBcnJheS5sZW5ndGg7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbihpKSB7XHJcbiAgICAgICAgaWYgKGlzSW50ZWdlcihpKSAmJiBpID49IDAgJiYgaSA8IF90aW1lUmFuZ2VBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF90aW1lUmFuZ2VBcnJheVtpXS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKTtcclxuICAgICAgICAgICAgLy8gaWYoTnVtYmVyLmlzSW50ZWdlcihpKSl7IC8vIENvbWVzIHdpdGggRUNNQVNjcmlwdCA2LiBPbmx5IHdvcmtzIGluIENocm9tZSBhbmQgRmlyZWZveC4gXCJFbmFibGUgRXhwZXJpbWVudGFsIEphdmFzY3JpcHRcIiBmbGFnIGluIENocm9tZVxyXG4gICAgICAgICAgICBpZiAoaXNJbnRlZ2VyKGkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDdXN0b21UaW1lUmFuZ2UgaW5kZXggb3V0IG9mIHJhbmdlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5jb3JyZWN0IGluZGV4IHR5cGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuZW5kID0gZnVuY3Rpb24oaSkge1xyXG4gICAgICAgIGlmIChpc0ludGVnZXIoaSkgJiYgaSA+PSAwICYmIGkgPCBfdGltZVJhbmdlQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGltZVJhbmdlQXJyYXlbaV0uZW5kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xyXG4gICAgICAgICAgICAvLyBpZihOdW1iZXIuaXNJbnRlZ2VyKGkpKXsgLy8gQ29tZXMgd2l0aCBFQ01BU2NyaXB0IDYuIE9ubHkgd29ya3MgaW4gQ2hyb21lIGFuZCBGaXJlZm94LiBcIkVuYWJsZSBFeHBlcmltZW50YWwgSmF2YXNjcmlwdFwiIGZsYWcgaW4gQ2hyb21lXHJcbiAgICAgICAgICAgIGlmIChpc0ludGVnZXIoaSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN1c3RvbVRpbWVSYW5nZSBpbmRleCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvcnJlY3QgaW5kZXggdHlwZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBpc0ludGVnZXIobikge1xyXG4gICAgcmV0dXJuICh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiAmJiBuICUgMSA9PT0gMCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3VzdG9tVGltZVJhbmdlO1xyXG4iXX0=
