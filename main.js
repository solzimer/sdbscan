const
	Distance = require("./distance.js"),
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

class DBScan {
	constructor(data,eps,min) {
		this._data = this.initData(data);
		this._eps = eps;
		this._min = min;
	}

	initData(data) {
		var ret = [], len = data.length;

		for(let i=0;i<len;i++) {
			ret.push({v:data[i], visited:false, idx:i, k:0});
		}

		return ret;
	}

	regionQuery(p) {
		let	eps = this._eps,
				data = this._data,
				ret = [], len = data.length;

		for(let i=0;i<len;i++) {
			if(eudist(data[i].v,p.v,true) <= eps)
				ret.push(data[i]);
		}

		return ret;
	}

	expandCluster(p, region, k) {
		let eps = this._eps,
				data = this._data,
				min = this._min;

		// Add p to cluster k
		p.k = k.id;
		k.data.push(p.v);

		while(region.length) {
			let np = region.pop();
			if(!np.visited) {
				np.visited = true;
				let newRegion = this.regionQuery(np);
				if(newRegion.length >= min) {
					region = region.concat(newRegion);
				}
				if(!np.k) {
					np.k = k.id;
					k.data.push(np.v);
				}
			}
		}
	}

	dbscan() {
		let data = this._data,
				min = this._min,
				kid = 0,
				ks = [],		// Clusters
				noise = [],	// Noise
				k = null;		// Current cluster

		// Unvisited points
		var unvisited = [].concat(data);

		while(unvisited.length) {
			let p = unvisited.pop();
			if(!p.visited) {
				// Mark as visited
				p.visited = true;

				// Get the reachable region for this point
				let region = this.regionQuery(p);

				// Too small region
				if(region.length<min) {
					noise.push(p);
				}
				else {
					k = {id:kid++, data:[]};
					ks.push(k);
					this.expandCluster(p, region, k);
				}
			}
		}

		return {
			noise : noise.map(p=>p.v),
			clusters : ks
		}
	}
}

module.exports = function(data,eps,min) {
	return (new DBScan(data,eps,min)).dbscan();
}
