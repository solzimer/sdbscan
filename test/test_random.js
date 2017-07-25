const sdbscan = require("../main.js");
const data = require("./data/random_pts.js");

var res = sdbscan(data,0.75,3);
console.error(JSON.stringify(res,null,2));

var out = [];
res.clusters.forEach(k=>{
	k.data.forEach(v=>{
		out.push({k:`K_${k.id}`,x:v[0],y:v[1]});
	});
});
console.log(JSON.stringify(out,null,2));
