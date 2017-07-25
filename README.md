# sdbscan

Super fast density based spatial clustering [DBSCAN](https://en.wikipedia.org/wiki/DBSCAN) implementation for unidimiensional and multidimensional data. Works on nodejs and browser.

## Installation
```
npm install sdbscan
```

## Usage
### NodeJS
```javascript
const sdbscan = require("sdbscan");

var data = [0, 1, 100, 101, 2, 102, 3, 104, 4, 103, 105, 5];
var res = sdbscan(data,2,3);
```

### Browser
```html
<!doctype html>
<html>
<head>
	<script src="sdbscan.js"></script>
</head>
<body>
	<script>
		var data = [0,1,100,101,2,102,3,104,4,103,105,5];
		var res = sdbscan(data,2,3);

		console.log(data);
		console.log(res);
	</script>
</body>
</html>
```

## Results
```javascript
{
	"noise": [],
	"clusters": [
    {
      "id": 0,
      "data": [5,4,3,2,1,0]
    },
    {
      "id": 1,
      "data": [105,103,104,102,101,100]
    }
  ]
}
```

## API
### sdbscan(data,epsilon,min)
Calculates unidimiensional and multidimensional dbscan clustering on *data*. Parameters are:
* **data** Unidimiensional or multidimensional array of values to be clustered. for unidimiensional data, takes the form of a simple array *[1,2,3.....,n]*. For multidimensional data, takes a
NxM array *[[1,2],[2,3]....[n,m]]*
* **epsilon** Maximum distance for two points to be considered in the same region.
* **min** Minimal region size. If a region for a point is lesser than *min*, this point will be considered as noise (cannot be included in any group).

The function will return an object with the following data:
* **noise** Points that cannot be added to any cluster.
* **clusters** An array of clusters, with an ID and the data points belonging to it.
