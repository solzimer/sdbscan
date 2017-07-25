"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
			}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, l, l.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		"use strict";

		(function ($) {
			var sdbscan = require("./main.js");
			$.sdbscan = sdbscan;
		})(window);
	}, { "./main.js": 3 }], 2: [function (require, module, exports) {
		module.exports = {
			/**
    * Euclidean distance
    */
			eudist: function eudist(v1, v2, sqrt) {
				var len = v1.length;
				var sum = 0;

				for (var i = 0; i < len; i++) {
					var d = (v1[i] || 0) - (v2[i] || 0);
					sum += d * d;
				}
				// Square root not really needed
				return sqrt ? Math.sqrt(sum) : sum;
			},
			mandist: function mandist(v1, v2, sqrt) {
				var len = v1.length;
				var sum = 0;

				for (var i = 0; i < len; i++) {
					sum += Math.abs((v1[i] || 0) - (v2[i] || 0));
				}

				// Square root not really needed
				return sqrt ? Math.sqrt(sum) : sum;
			},


			/**
    * Unidimensional distance
    */
			dist: function dist(v1, v2, sqrt) {
				var d = Math.abs(v1 - v2);
				return sqrt ? d : d * d;
			}
		};
	}, {}], 3: [function (require, module, exports) {
		var Distance = require("./distance.js"),
		    eudist = Distance.eudist;

		/*
  DBSCAN(D, epsilon, min_points):
        C = 0
        for each unvisited point P in dataset
              mark P as visited
              sphere_points = regionQuery(P, epsilon)
              if sizeof(sphere_points) < min_points
                    ignore P
              else
                    C = next cluster
                    expandCluster(P, sphere_points, C, epsilon, min_points)
  
  expandCluster(P, sphere_points, C, epsilon, min_points):
        add P to cluster C
        for each point P’ in sphere_points
              if P’ is not visited
                    mark P’ as visited
                    sphere_points’ = regionQuery(P’, epsilon)
                    if sizeof(sphere_points’) >= min_points
                          sphere_points = sphere_points joined with sphere_points’
                    if P’ is not yet member of any cluster
                          add P’ to cluster C
  
  regionQuery(P, epsilon):
        return all points within the n-dimensional sphere centered at P with radius epsilon (including P)
  */

		var DBScan = function () {
			function DBScan(data, eps, min) {
				_classCallCheck(this, DBScan);

				this._multi = data[0].length > 0;
				this._data = this.initData(data);
				this._eps = eps;
				this._min = min;
			}

			_createClass(DBScan, [{
				key: "initData",
				value: function initData(data) {
					var ret = [],
					    len = data.length;
					var multi = this._multi;

					for (var i = 0; i < len; i++) {
						ret.push({ v: multi ? data[i] : [data[i]], visited: false, idx: i, k: 0 });
					}

					return ret;
				}
			}, {
				key: "regionQuery",
				value: function regionQuery(p) {
					var eps = this._eps,
					    data = this._data,
					    ret = [],
					    len = data.length;

					for (var i = 0; i < len; i++) {
						if (eudist(data[i].v, p.v, true) <= eps) ret.push(data[i]);
					}

					return ret;
				}
			}, {
				key: "expandCluster",
				value: function expandCluster(p, region, k) {
					var eps = this._eps,
					    data = this._data,
					    min = this._min;

					// Add p to cluster k
					p.k = k.id;
					k.data.push(p.v);

					while (region.length) {
						var np = region.pop();
						if (!np.visited) {
							np.visited = true;
							var newRegion = this.regionQuery(np);
							if (newRegion.length >= min) {
								region = region.concat(newRegion);
							}
							if (!np.k) {
								np.k = k.id;
								k.data.push(np.v);
							}
						}
					}
				}
			}, {
				key: "dbscan",
				value: function dbscan() {
					var data = this._data,
					    min = this._min,
					    kid = 0,
					    ks = [],
					    // Clusters
					noise = [],
					    // Noise
					k = null; // Current cluster

					// Unvisited points
					var unvisited = [].concat(data);

					while (unvisited.length) {
						var p = unvisited.pop();
						if (!p.visited) {
							// Mark as visited
							p.visited = true;

							// Get the reachable region for this point
							var region = this.regionQuery(p);

							// Too small region
							if (region.length < min) {
								noise.push(p);
							} else {
								k = { id: kid++, data: [] };
								ks.push(k);
								this.expandCluster(p, region, k);
							}
						}
					}

					// Restore unidimiensional data that was transformed to
					// multidimensional for the algoryth purposes
					if (!this._multi) {
						ks.forEach(function (k) {
							k = k.map(function (v) {
								return v[0];
							});
						});
					}

					return {
						noise: noise.map(function (p) {
							return p.v;
						}),
						clusters: ks
					};
				}
			}]);

			return DBScan;
		}();

		module.exports = function (data, eps, min) {
			return new DBScan(data, eps, min).dbscan();
		};
	}, { "./distance.js": 2 }] }, {}, [1]);
//# sourceMappingURL=sdbscan.js.map
