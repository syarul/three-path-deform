var log = console.log.bind(console)

var controls, scene, camera;

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.set(0, 500, 700);
  camera.lookAt(new THREE.Vector3(0, 100, 0));
  scene = new THREE.Scene();
  controls = new THREE.TrackballControls(camera, render.domElement);

  var PathDeform = new THREEPathDeform(2)

  var pathVectors = [
    {x:0, y:112, z:0},
    {x:0, y:224, z:0},
    {x:0, y:336, z:0},
    {x:0, y:448, z:0},
    {x:22, y:557, z:0},
    {x:84, y:650, z:0},
    {x:176, y:711, z:0},
    {x:285, y:733, z:0},
    {x:397, y:733, z:0},
    {x:509, y:733, z:0}
  ]

  PathDeform.generatePath(1, pathVectors, 50, {
    color: 0x5792FF,
    // visiblity: true
  });

  var vbone1 = [
    {x:-20, y:0, z:0},
    {x:-40, y:0, z:0},
    {x:0, y:40, z:0},
    {x:40, y:0, z:0},
    {x:20, y:0, z:0}
  ]

  var vbone2 = [
    {x:-20, y:0, z:0},
    {x:20, y:0, z:0}
  ]

  var boneVectors = [vbone1, vbone2, vbone2, vbone2, vbone2];

  function setRandomMat(){
    return new THREE.MeshBasicMaterial({
      color: parseInt(randomColor().replace('#', '0x')),
      transparent: true
    });
  }

  lousyLoader('scene', 'deform.obj', function(object) {

    object.traverse(function(child) {

      if (child instanceof THREE.Mesh) {

        var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

        geometry.mergeVertices();

        var selectionNameList = []
        ,   selectionIds = []
        ,   arrowList = [];
        arrowList.length = 4;

        for(var i=0;i<arrowList.length;i++){
          arrow_ = new THREE.Mesh(geometry.clone(), setRandomMat());
          arrow_.material.side = THREE.DoubleSide;
          selectionIds.push(arrow_.uuid);

          scene.add(arrow_)

          var boneIds = PathDeform.generateSkeleton(boneVectors, {
            // visiblity: true,
            reverse: true
          });

          selectionNameList.push(boneIds);

          if(i === arrowList.length - 1){
            animate();
            var verts = [11, 12, 0, 2, 1, 3, 4, 5, 6, 10, 8, 9, 7];
            var deformOptions = {
              // softOpacity: true,
              hideOnLoop: true,
              intervalMax: 0.7,
              intervalMin: 0.3,
              counterInterval: 0.001
            }
            
            var boneLength = selectionNameList[0].length;

            setInterval(function() {
              var inter = 0;
              for (var j = 0; j < arrowList.length; j++) {
                PathDeform.deformObject(1, selectionIds[j], selectionNameList[j], PathDeform.generateInterval(inter, boneLength, 0.05), verts, deformOptions);
                inter -= 0.245
              }
            }, 10);
          }
        }
      }

    });
  });

  /*lousyLoader('scene', 'raw_arrow.obj', function(object) {
    log(object)
    // var geo = new THREE.Geometry().fromBufferGeometry(object.children[1].geometry)
    var geo = new THREE.Line(object.children[1].geometry, setRandomMat())//.fromBufferGeometry(object.children[1].geometry)
    log(object.children[1].geometry)
    
    // var attr = object.children[1].geometry.getAttribute('position');
    var vectors = PathDeform.generateVectorsFromBufferGeometry(object.children[1].geometry);

    var line = PathDeform.generatePath(2, vectors, 50, {
      color: 0x5792FF,
      visiblity: true
    });

    var path = scene.children.filter(function(c){
      return c.uuid === line
    })[0]

    log(path)

    function posByAttr(index){
      var pos = {};
      pos['x'] = vectors[index].x;
      pos['y'] = vectors[index].y;
      pos['z'] = vectors[index].z;
      return pos;
    }
    var boxgeometry = new THREE.BoxGeometry(2, 2, 2);
    box = new THREE.Mesh(boxgeometry, setRandomMat());
    scene.add(box)

    count = 0
    setInterval(function(){
      if (count >= path.geometry.vertices.length) count = 0
      for (var i in box.position) {
        // box.position[i] = posByAttr(count)[i]
        box.position[i] = path.geometry.vertices[count][i]
      }
      // box.position = path.geometry.vertices[count]
      count++
    }, 100)
  
    // scene.add(geo)
  })*/
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}