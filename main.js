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

class Point {
	constructor(v,idx) {
		this.v = v;
		this.idx = idx || 0;
		this.k = 0;
		this.visited = false;
	}
}

class DBScan {
	constructor(data,eps,min) {
		this._multi = data[0].length>0;
		this._data = this.initData(data);
		this._eps = eps;
		this._min = min;
	}

	initData(data) {
		let ret = [], len = data.length;
		let multi = this._multi;

		for(let i=0;i<len;i++) {
			ret.push(new Point(multi? data[i] : [data[i]], i));
		}

		return ret;
	}

	regionQuery(p) {
		let	eps = this._eps, data = this._data,
				ret = [], len = data.length;

		for(let i=0;i<len;i++) {
			let np = data[i];
			if(np!=p && np.visited) continue;
			if(eudist(np.v,p.v,true) <= eps)
				ret.push(np);
		}

		return ret;
	}

	expandCluster(p, region, k) {
		let eps = this._eps, data = this._data, min = this._min;

		// Add p to cluster k
		p.k = k.id;
		k.data.push(p.v);

		// region.length is dynamic becaouse items added
		// from newRegion to region
		for(let j=0;j<region.length;j++) {
			// Get a point from the region
			let np = region[j];

			// If hasn't benn visited
			if(!np.visited) {
				// Mark as visited
				np.visited = true;

				// Get the region for this point
				let	newRegion = this.regionQuery(np), nrlen = newRegion.length;

				// If it's a valid region, append to the original region
				if(nrlen >= min) {
					let nlen = region.length+nrlen;
					for(let i=region.length,j=0;i<nlen;i++,j++)
						region[i] = newRegion[j];
				}

				// if the point isn't assigned to any cluster, assign to current
				if(!np.k) {
					np.k = k.id;
					k.data.push(np.v);
				}
			}
		}
	}

	dbscan() {
		let data = this._data, min = this._min,
				len = data.length,
				kid = 0,
				ks = [],		// Clusters
				noise = [],	// Noise
				k = null;		// Current cluster

		for(let j=0;j<len;j++) {
			let p = data[j];
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

		// Restore unidimiensional data that was transformed to
		// multidimensional for the algoryth purposes
		if(!this._multi) {
			ks.forEach(k=>{
				k.data = k.data.map(v=>v[0]);
			});
			noise.forEach(p=>p.v=p.v[0]);
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
