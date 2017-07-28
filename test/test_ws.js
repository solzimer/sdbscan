const sdbscan = require("../main3.js");
const data = require("./data/well-separated.js");

var res = sdbscan(data,1,3);
console.error(JSON.stringify(res,null,2));

var out = [];
res.clusters.forEach(k=>{
	k.data.forEach(v=>{
		out.push({k:`K_${k.id}`,x:v[0],y:v[1]});
	});
});
console.log(JSON.stringify(out,null,2));
