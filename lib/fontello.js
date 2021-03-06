// Generated by CoffeeScript 1.6.3
(function() {
  var HOST, apiRequest, fontello, fs, needle, open, path, print, unzip;

  fs = require('fs');

  needle = require('needle');

  open = require('open');

  print = console.log;

  path = require('path');

  unzip = require('unzip');

  HOST = 'http://fontello.com';

  apiRequest = function(options, successCallback, errorCallback) {
    var data, requestOptions;
    if (options.host == null) {
      options.host = HOST;
    }
    requestOptions = {
      multipart: true
    };
    if (options.proxy != null) {
      requestOptions.proxy = options.proxy;
    }
    data = {
      config: {
        file: options.config,
        content_type: 'application/json'
      }
    };
    return needle.post(options.host, data, requestOptions, function(error, response, body) {
      var sessionId, sessionUrl;
      if (error) {
        throw error;
      }
      sessionId = body;
      if (response.statusCode === 200) {
        sessionUrl = "" + options.host + "/" + sessionId;

        return typeof successCallback === "function" ? successCallback(sessionUrl) : void 0;
      } else {
        return typeof errorCallback === "function" ? errorCallback(response) : void 0;
      }
    });
  };

  fontello = {
    install: function(options) {
      var requestOptions, zipFile;
      requestOptions = {};
      if (options.proxy != null) {
        requestOptions.proxy = options.proxy;
      }
      zipFile = needle.get("" + options.sessionUrl + "/get", requestOptions, function(error, response, body) {
        if (error) {
          throw error;
        }
      });
      if (options.css && options.font) {
        return zipFile.pipe(unzip.Parse()).on('entry', (function(entry) {
          var cssPath, dirName, fileName, fontPath, pathName, type, _ref;
          pathName = entry.path, type = entry.type;
          // console.log(entry.type);
          // console.log(path.basename(pathName));
          if (type === 'File') {
            dirName = (_ref = path.dirname(pathName).match(/\/([^\/]*)$/)) != null ? _ref[1] : void 0;
            fileName = path.basename(pathName);
            if(path.basename(pathName) === 'config.json') {
              dirName = 'config';
            }
            switch (dirName) {
              case 'css':
                cssPath = path.join(options.css, fileName);
                return entry.pipe(fs.createWriteStream(cssPath));
              case 'font':
                fontPath = path.join(options.font, fileName);
                return entry.pipe(fs.createWriteStream(fontPath));
              case 'config':
                fontPath = path.join(options.font, fileName);
                return entry.pipe(fs.createWriteStream(fontPath));
              default:
                return entry.autodrain();
            }
          }
        })).on('finish', (function() {
          return print('Install complete');
        }));
      } else {
        return zipFile.pipe(unzip.Extract({
          path: '.'
        })).on('finish', (function() {
          return print('Install complete.');
        }));
      }
    },
    open: function(options, cb) {
      return apiRequest(options, function(sessionUrl) {
        return open(sessionUrl, function(){
          cb(sessionUrl);
        });
      });
    }
  };

  module.exports = fontello;

}).call(this);
