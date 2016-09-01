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

  var PathDeform = new THREEPathDeform()

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

  PathDeform.generatePath(pathVectors, 50, {
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
              intervalMin: 0.3
            }
            
            var boneLength = selectionNameList[0].length;

            setInterval(function() {
              var inter = 0;
              for (var j = 0; j < arrowList.length; j++) {
                PathDeform.deformObject(selectionIds[j], selectionNameList[j], PathDeform.generateInterval(inter, boneLength, 0.05), verts, deformOptions);
                inter -= 0.245
              }
            }, 100);
          }
        }
      }

    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}