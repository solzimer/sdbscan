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
		this._multi = data[0].length>0;
		this._visited = new Array(data.length);
		this._cluster = new Array(data.length);
		this._data = this.initData(data);
		this._eps = eps;
		this._min = min;
	}

	initData(data) {
		let ret = [], len = data.length, multi = this._multi;
		let visited = this._visited, cluster = this._cluster;

		for(let i=0;i<len;i++) {
			ret.push(multi? data[i] : [data[i]]);
			visited[i] = 0;
			cluster[i] = -1;
		}

		return ret;
	}

	regionQuery(p) {
		let	eps = this._eps, data = this._data,
				visited = this._visited,
				ret = [], len = data.length;

		for(let i=0;i<len;i++) {
			let np = data[i];
			if(np!=p && visited[i]) continue;
			if(eudist(np,p,true) <= eps)
				ret.push(i);
		}

		return ret;
	}

	expandCluster(idx, region, k) {
		let eps = this._eps, min = this._min;
		let data = this._data, visited = this._visited, cluster = this._cluster;
		let kdata = k.data, kid = k.id;

		// Add p to cluster k
		cluster[idx] = kid;
		kdata.push(data[idx]);

		// region.length is dynamic becaouse items added
		// from newRegion to region
		for(let j=0;j<region.length;j++) {
			// Get a point from the region
			let nidx = region[j];
			let np = data[nidx];

			// If hasn't benn visited
			if(!visited[nidx]) {
				// Mark as visited
				visited[nidx] = 1;

				// Get the region for this point
				let	newRegion = this.regionQuery(np), nrlen = newRegion.length;

				// If it's a valid region, append to the original region
				if(nrlen >= min) {
					for(let i=region.length,j=0;j<nrlen;i++,j++)
						region[i] = newRegion[j];
				}

				// if the point isn't assigned to any cluster, assign to current
				if(cluster[nidx]<0) {
					cluster[nidx] = kid;
					kdata.push(np);
				}
			}
		}
	}

	dbscan() {
		let data = this._data, visited = this._visited, cluster = this._cluster;
		let min = this._min,
				len = data.length,
				kid = 0,
				ks = [],		// Clusters
				noise = [],	// Noise
				k = null;		// Current cluster

		for(let j=0;j<len;j++) {
			let p = data[j];

			if(!visited[j]) {
				// Mark as visited
				visited[j] = 1;

				// Get the reachable region for this point
				let region = this.regionQuery(p);

				// Too small region
				if(region.length<min) {
					noise.push(p);
				}
				// Expand cluster from this region
				else {
					k = {id:kid++, data:[]};
					ks.push(k);
					this.expandCluster(j, region, k);
				}
			}
		}

		// Restore unidimiensional data that was transformed to
		// multidimensional for the algoryth purposes
		if(!this._multi) {
			ks.forEach(k=>{
				k.data = k.data.map(v=>v[0]);
			});
			noise = noise.map(p=>p[0]);
		}

		return {
			noise : noise,//.map(p=>p.v),
			clusters : ks
		}
	}
}

module.exports = function(data,eps,min) {
	return (new DBScan(data,eps,min)).dbscan();
}
