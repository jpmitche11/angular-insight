(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function insightController($scope, GroupList){

	// this needs integration with list directive, infinite scroll, and search

	$scope.state = {};
	$scope.state.preview = 1;

	GroupList.groups.$promise.then(function(response){
		var data = $scope.data = GroupList.groups;
		$scope.favorites = [];
		$scope.recents = [];

		$scope.favorites.push(data[3]);
		$scope.favorites.push(data[6]);
		$scope.favorites.push(data[7]);

		$scope.recents.push(data[1]);
		$scope.recents.push(data[2]);
		$scope.recents.push(data[8]);
	});




	$scope.assignedItems = [];

	$scope.addOption = function(item) {

		if (!item.assigned) {
			item.assigned = true;
			item.selected = false;

			_.each($scope.assignedItems, function(group){ group.selected = false;});

			$scope.assignedItems.push(item);
		}
	};

	$scope.toggleItem = function(item) {

		if (!item.assigned) {
			$scope.showMessage = false;
			$scope.currentSelection = item;
			item.assigned = true;
			$scope.assignedItems.push(item);
		} else {

			$scope.removeItem(item);
		}
	};

	$scope.change = function(item){

		$scope.currentSelection = item;

		if(item.assigned === false) {
			$scope.showMessage = true;
			$scope.messageItem = item;
		} else {
			$scope.showMessage = false;
		}
	};

	$scope.selectItem = function(item){

		_.each($scope.data, function(group){ group.selected = false;});
		item.selected = true;
	};

	$scope.inputPlaceholder = 'Add groups ...';

	$scope.setPlaceholder = function(value){
		$scope.inputPlaceholder = value;
		if(value === 'Find assigned groups ...'){
			$scope.showOptions = false;
		}
	};

	$scope.selectAndToggle = function(item) {
		$scope.selection(item);
		$scope.toggleItem(item);
	};

	$scope.selection = function(item){

		$scope.showMessage = null;

		if (item.selected) {
			$scope.currentSelection = item;
		} else {
			$scope.currentSelection = null;
		}
	};

	$scope.closeOptions = function() {
		$scope.showOptions = false;
		$scope.query = '';
		$scope.focus = false;
		$scope.currentSelection.selected = true;
		// _.each($scope.data, function(group){ group.selected = false;});
	};

	$scope.removeItem = function(group) {
		group.selected = false;
		group.assigned = false;
		$scope.showMessage = true;
		$scope.messageItem = group;

		var found, index;

		found =  $scope.assignedItems.filter(function(obj) {
			return obj._id === group._id;
		});

		index = $scope.assignedItems.indexOf(found[0]);
		$scope.assignedItems.splice(index,1);
	};

	$scope.groupOptions = {};

	$scope.groupOptions.displayItems = [
		{id:0, field:'name', label:'name', fill:true},
		{id:1, field:'users', label:'users', type:'array-length' },
		{id:2, field:'status', label:'status' },
		{id:3, field:null, label:'tools', type:'tools', actions: [
			{label:'Edit'},
			{label: 'Delete'}
		]}
	];

	$scope.groupOptions.actions = [
		{label:'Edit', callback: GroupList.get},
		{label: 'Delete', callback: GroupList.removeGroup}
	];
}

},{}],2:[function(require,module,exports){
module.exports = function() {

	return {
		transclude: true,
		templateUrl: function(tElement, tAttrs) {
			return tAttrs.templateUrl || 'option-row.html';
		}
	}

}

},{}],3:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

var path = require('path');

module.exports = angular
	.module('insight', ['ngSanitize', 'ui.highlight', 'ui.bootstrap'])
	.controller('InsightController', ['$scope', 'GroupList', require('./insightController')])
	.directive('optionRow', require('./insightDirective'))
	.run(['$templateCache', function($templateCache) {
		$templateCache.put('insight.html', "\n<div class=\"preview-widget\" ng-class=\"{ 'preview-active' : state.preview }\">\n\n\t<button type=\"button\" class=\"btn btn-preview\" ng-model=\"state.preview\" btn-checkbox\n\t        btn-checkbox-true=\"1\" btn-checkbox-false=\"0\">\n\t\t<span class=\"glyphicons eye_close\" ng-show=\"state.preview\"></span>\n\t\t<span class=\"glyphicons eye_open\" ng-hide=\"state.preview\"></span>\n\t</button>\n\n\n\t<div style=\"padding: 0\" ng-class=\"state.preview ? 'col-xs-7' : 'col-xs-12'\" class=\"assigned-items\">\n\t\t<div class=\"insight\"\n\t\t     ng-mouseenter=\"focus = true\">\n\n\t\t\t<div class=\"search-field-wrapper\" ng-class=\"{focus:focus && showOptions}\">\n\n\t\t\t\t<div class=\"search-field-inner\">\n\t\t\t\t\t<div class=\"flex-fill\">\n\t\t\t\t\t\t<div class=\"search-field\" ng-class=\"{focus:focus && showOptions }\">\n\t\t\t\t\t\t\t<span class=\"glyphicons search icon\" ng-hide=\"state.loading\"></span>\n\t\t\t\t\t\t\t<span class=\"glyphicons refresh icon\" ng-show=\"state.loading\"></span>\n\t\t\t\t\t\t\t<button class=\"btn btn-close\"\n\t\t\t\t\t\t\t        ng-if=\"showOptions\"\n\t\t\t\t\t\t\t        ng-click=\"closeOptions()\">\n\t\t\t\t\t\t\t\tDone\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t<input class=\"input\" ng-model=\"query.name\"\n\t\t\t\t\t\t\t       ng-click=\"showOptions = true\"\n\t\t\t\t\t\t\t       placeholder=\"Find items ...\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div ng-hide=\"state.preview\" class=\"preview-spacer\"></div>\n\t\t\t\t</div>\n\n\t\t\t\t<!-- user is searching -->\n\t\t\t\t<div class=\"widget-options animate-if\" ng-if=\"query && showOptions\">\n\t\t\t\t\t<div class=\"scroll-container\">\n\n\t\t\t\t\t\t<div ng-if=\"!filtered.length\">No results found.</div>\n\n\t\t\t\t\t\t<div ng-if=\"!state.preview\"\n\t\t\t\t\t\t     option-row\n\t\t\t\t\t\t     ng-repeat=\"item in filtered = ( data | filter:query | orderBy: 'name' )\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\">\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div ng-if=\"state.preview\"\n\t\t\t\t\t\t     option-row\n\t\t\t\t\t\t     ng-repeat=\"item in data | filter:query | orderBy: 'name'\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\"\n\n\t\t\t\t\t\t     selection-model\n\t\t\t\t\t\t     selection-model-on-change=\"change(item)\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<!-- safari style browse options -->\n\t\t\t\t<div class=\"widget-options animate-if\" ng-if=\"!query && showOptions\">\n\t\t\t\t\t<div class=\"scroll-container\" ng-if=\"state.preview\">\n\n\t\t\t\t\t\t<!-- TODO: right now you can select an item in BOTH lists\n\t\t\t\t\t\t\t How to prevent this?\n\t\t\t\t\t\t-->\n\n\t\t\t\t\t\t<div class=\"subhead\">Favorites</div>\n\n\t\t\t\t\t\t<div option-row\n\t\t\t\t\t\t     ng-repeat=\"item in favorites\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\"\n\n\t\t\t\t\t\t     selection-model-on-change=\"change(item)\"\n\t\t\t\t\t\t     selection-model>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"subhead\">Recent</div>\n\n\t\t\t\t\t\t<div option-row\n\t\t\t\t\t\t     ng-repeat=\"item in recents\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\"\n\n\t\t\t\t\t\t     selection-model-on-change=\"change(item)\"\n\t\t\t\t\t\t     selection-model>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"scroll-container\" ng-if=\"!state.preview\">\n\t\t\t\t\t\t<div class=\"subhead\">Favorites</div>\n\n\t\t\t\t\t\t<div option-row\n\t\t\t\t\t\t     ng-repeat=\"item in favorites\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\">\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"subhead\">Recent</div>\n\n\t\t\t\t\t\t<div option-row\n\t\t\t\t\t\t     ng-repeat=\"item in recents\"\n\t\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t\t     ng-class=\"{assigned:item.assigned}\"\n\t\t\t\t\t\t     ng-click=\"toggleItem(item)\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"widget-members\"  ng-class=\"{focus:focus && showOptions}\">\n\t\t\t\t<div class=\"scroll-container\">\n\t\t\t\t\t<div ng-if=\"assignedItems.length === 0\" style=\"color: gray\">\n\t\t\t\t\t\tNo items assigned.\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div ng-repeat=\"item in assignedItems | filter:query | orderBy: 'name'\"\n\t\t\t\t\t     class=\"insight-option-row\"\n\t\t\t\t\t     selection-model-on-change=\"change(item)\"\n\t\t\t\t\t     selection-model>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<span class=\"circle glyphicons group\"></span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"flex-fill\">\n\t\t\t\t\t\t\t{{ item.name }}\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<button class=\"btn btn-link pull-right\" ng-click=\"removeItem(item)\" selection-model-ignore>\n\t\t\t\t\t\t\t\t<span class=\"glyphicons remove_2\"></span>\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"overlay\" ng-show=\"showOptions === true\" ng-click=\"closeOptions()\"></div>\n\t\t</div>\n\t</div>\n\n\t<div class=\"col-xs-5 preview-column animate-if\" ng-if=\"state.preview\" ng-class=\"{ 'show-preview': showOptions }\">\n\n\t\t<!--<button type=\"button\"\n\t\t        class=\"btn btn-preview\"\n\t\t        ng-model=\"state.preview\" btn-checkbox btn-checkbox-true=\"1\" btn-checkbox-false=\"0\">\n\t\t\t<span class=\"glyphicons eye_close\"></span>\n\t\t</button>-->\n\n\t\t<div class=\"scroll-container\">\n\n\t\t\t<div class=\"scroll-message\" ng-if=\"!filteredAssignedItems.length && !filteredData.length && !showMessage\">\n\t\t\t\t<h3>No Items Selected</h3>\n\t\t\t</div>\n\t\t\t<div class=\"scroll-message\" ng-show=\"showMessage\">\n\t\t\t\t<h3>{{ messageItem.name }} was removed</h3>\n\t\t\t</div>\n\n\t\t\t<!-- preview has to be specific to data type -->\n\t\t\t<div class=\"preview-item\"\n\t\t\t     ng-repeat=\"item in filteredAssignedItems = ( assignedItems | filter:{selected:true} | limitTo:1 | orderBy:reverse )\"\n\t\t\t     ng-if=\"!query\">\n\t\t\t\t<h1>\n\t\t\t\t\t<span class=\"circle glyphicons group\"></span>\n\t\t\t\t</h1>\n\n\t\t\t\t<h3>{{ item.name }}</h3>\n\t\t\t\t<p>{{ item.description }}</p>\n\n\t\t\t\t<p ng-if=\"item.roles.length\" ng-repeat=\"role in item.roles track by $index\">{{ role.name }}</p>\n\t\t\t\t<p ng-if=\"!item.roles.length\">No assigned roles.</p>\n\n\t\t\t\t<p ng-if=\"item.users.length\" ng-repeat=\"user in item.users track by $index\">{{ user }}</p>\n\t\t\t\t<p ng-if=\"!item.users.length\">No assigned users.</p>\n\t\t\t</div>\n\n\n\t\t\t<div class=\"preview-item\" ng-repeat=\"item in filteredData = ( data | filter:{selected:true} | limitTo:1 | orderBy:reverse )\"\n\t\t\t     ng-if=\"query\">\n\t\t\t\t<h1>\n\t\t\t\t\t<span class=\"circle glyphicons group\"></span>\n\t\t\t\t</h1>\n\t\t\t\t<h3>{{ item.name }}</h3>\n\t\t\t\t<p>{{ item.description }}</p>\n\n\t\t\t\t<p ng-if=\"item.roles.length\" ng-repeat=\"role in item.roles track by $index\">{{ role.name }}</p>\n\t\t\t\t<p ng-if=\"!item.roles.length\">No assigned roles.</p>\n\n\t\t\t\t<p ng-if=\"item.users.length\" ng-repeat=\"user in item.users track by $index\">{{ user }}</p>\n\t\t\t\t<p ng-if=\"!item.users.length\">No assigned users.</p>\n\t\t\t</div>\n\n\n\n\t\t</div>\n\t</div>\n</div>\n");
		$templateCache.put('option-row.html', "<div>\n\t<button class=\"btn btn-link pull-right\" ng-show=\"item.assigned\">\n\t\t<span class=\"glyphicons ok_2\"></span>\n\t</button>\n\t<button class=\"btn btn-link pull-right\" ng-hide=\"item.assigned\">\n\t\t<span class=\"glyphicons plus\"></span>\n\t</button>\n</div>\n<div>\n\t<span class=\"circle glyphicons group\"></span>\n</div>\n<div class=\"flex-fill\">\n\t{{ item.name }}\n</div>\n<div>\n\t<span class=\"badge remove-item\" ng-show=\"item.assigned\">Remove item</span>\n\t<span class=\"badge add-item\" ng-hide=\"item.assigned\">Add item</span>\n</div>\n");
	}])
	.name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./insightController":1,"./insightDirective":2,"path":4}],4:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":5}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3]);