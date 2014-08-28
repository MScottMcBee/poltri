### PolTri 

PolTri is a simple polygon triangulation library for Javascript. Simple import, send it an ordered array of points, and you'll get back a 2D array of points representing triangles.

## Example

```
  <script type="text/javascript">
    var polTri = new PolTri();

    var squareVerticies = [{x: 10,y: 10},{x: 50,y: 10},{x: 50,y: 50},{x: 10,y: 50}];

    var triangulatedSquare = polTri.triangulate(squareVerticies);

    console.log(JSON.stringify(triangulatedSquare));
    // "[ [{"x":50,"y":10},{"x":50,"y":50},{"x":10,"y":50}] , [{"x":50,"y":10},{"x":10,"y":10},{"x":10,"y":50}] ]""

  </script>
```