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

var multi = false;
var visited = [];
var cluster = [];
var data = [];
var len = 0;
var eps = 0;
var min = 0;

function init(input,ieps,imin) {
	len = input.length;
	multi = input[0].length>0;
	eps = ieps || 1;
	min = imin || 3;
	data = new Array(len);
	visited = new Array(len);
	cluster = new Array(len);

	for(let i=0;i<len;i++) {
		//data[i] = multi? input[i] : [input[i]];
		visited[i] = 0;
		cluster[i] = -1;
	}

	data = input;
}

function regionQuery(p) {
	var ret = [];

	for(let i=0;i<len;i++) {
		let np = data[i];
		if(np!=p && visited[i]) continue;
		if(eudist(np,p,true) < eps)
			ret.push(i);
	}

	return ret;
}

function expandCluster(idx, region, k) {
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
			let	newRegion = regionQuery(np), nrlen = newRegion.length;

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

function dbscan(input,ieps,imin) {
	init(input,ieps,imin);

	var	kid = 0,
			ks = [],		// Clusters
			noise = [],	// Noise
			k = null;		// Current cluster

	for(let j=0;j<len;j++) {
		let p = data[j];

		if(!visited[j]) {
			// Mark as visited
			visited[j] = 1;

			// Get the reachable region for this point
			let region = regionQuery(p);

			// Too small region
			if(region.length<min) {
				noise.push(p);
			}
			// Expand cluster from this region
			else {
				k = {id:kid++, data:[]};
				ks.push(k);
				expandCluster(j, region, k);
			}
		}
	}

	// Restore unidimiensional data that was transformed to
	// multidimensional for the algoryth purposes
	if(!multi) {
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

module.exports = dbscan;
