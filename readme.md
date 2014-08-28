# PolTri 

PolTri is a simple polygon triangulation library for Javascript. Simple import, send it an ordered array of points, and you'll get back a 2D array of points representing triangles.

## Example

```
<script type="text/javascript">
  var polTri = new PolTri();

  var square = [
                 {x: 10,y: 10},
                 {x: 50,y: 10},
                 {x: 50,y: 50},
                 {x: 10,y: 50}
               ];

  var triangulatedSquare = polTri.triangulate(square);

  console.log(JSON.stringify(triangulatedSquare));
/* RETURNS
  [ 
    [
      {"x":50,"y":10},
      {"x":50,"y":50},
      {"x":10,"y":50}
    ], 
    [
      {"x":50,"y":10},
      {"x":10,"y":10},
      {"x":10,"y":50}
    ] 
  ]
*/
</script>
```