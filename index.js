var THREEPathDeform = function (up, axis, tangent) {
  if (!THREE) {
    throw new Error('THREEjs not found');
    return false;
  }

  var self = this,
      counter = 0;
  this.tangent = tangent ? new THREE.Vector3(tangent.x, tangent.y, tangent.z) : new THREE.Vector3();
  this.axis = axis ? new THREE.Vector3(axis.x, axis.y, axis.z) : new THREE.Vector3();
  this.up = up ? new THREE.Vector3(up.x, up.y, up.z) : new THREE.Vector3(0, 1, 0);

  this.generatePath = function (vectorArray, numPoints, options) {

    var options = options || {};

    this.color = options.color || 0xFFFFFF;
    this.visiblity = options.visiblity || false;

    var splineVector = vectorArray.map(function (v) {
      return new THREE.Vector3(v.x, v.y, v.z);
    });

    self.spline = new THREE.CatmullRomCurve3(splineVector);

    var splineMat = new THREE.LineBasicMaterial({
      color: this.color,
      visible: this.visiblity
    });

    var geometry = new THREE.Geometry();
    var splinePoints = self.spline.getPoints(numPoints);

    for (var i = 0; i < splinePoints.length; i++) {
      geometry.vertices.push(splinePoints[i]);
    }

    var line = new THREE.Line(geometry, splineMat);

    if (scene) scene.add(line);else throw new Error('scene is not declared or visiblity option is set to false');
  };

  // skeleton generator for objects
  this.generateSkeleton = function (boneVectors, options) {

    this.color = options.color || 0xFFFFFF;
    this.visiblity = options.visiblity || false;
    this.reverse = options.reverse || false;

    var self_ = this;

    var boneList = [];

    boneVectors.forEach(function (bone, i, r) {

      var _bone = new THREE.Geometry();

      bone.forEach(function (v) {
        _bone.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
      });

      var lineMat = new THREE.LineBasicMaterial({
        color: self_.color,
        visible: self_.visiblity
      });

      var boneLine = new THREE.Line(_bone, lineMat);

      boneList.push(boneLine);
    });

    if (this.reverse) {
      boneList.reverse();
    }

    boneList.forEach(function (ls, i) {
      if (scene) scene.add(ls);else throw new Error('scene is not declared');
    });

    return boneList.map(function (bone) {
      return bone.uuid;
    });
  };

  // generate interval
  this.generateInterval = function (start, count, interval) {
    var res = [];
    for (var i = 0; i < count; i++) {
      var cell = {};
      cell['in'] = start;
      cell['out'] = 1 + start;
      res.push(cell);
      start -= interval;
    }
    return res;
  };

  this.offsetCounter = function (c, high, low) {
    if (c > high) {
      return c - high;
    } else if (c < low) {
      return 0;
    } else {
      return c - low;
    }
  };

  this.getChildBase = function (uuid) {
    if (scene) {
      var index = scene.children.map(function (child) {
        return child.uuid;
      }).indexOf(uuid);
      return scene.children[index];
    } else {
      throw new Error('scene is not declared');
    }
  };

  this.deformObject = function (object, objectName, interval, verticesArray, options) {

    options = options || {};

    this.counterInterval = options.counterInterval || 0.005;
    this.hideOnLoop = options.hideOnLoop || false;
    this.softOpacity = options.softOpacity || false;
    this.intervalMax = options.intervalMax || 0.88;
    this.intervalMin = options.intervalMin || 0.22;
    this.opacityIncrement = options.opacityIncrement || 0.2;

    var that = this,
        lses = [];

    objectName.forEach(function (a, i) {
      lses.push(self.getChildBase(objectName[i]));
    });

    var c = objectName.map(function (a, i) {
      return self.offsetCounter(counter, interval[i].out, interval[i].in);
    });

    if (counter <= 1) {
      lses.forEach(function (ls, i) {

        ls.position.copy(self.spline.getPointAt(c[i]));

        self.tangent = self.spline.getTangentAt(c[i]).normalize();

        self.axis.crossVectors(self.up, self.tangent).normalize();

        var radians = Math.acos(self.up.dot(self.tangent));

        ls.quaternion.setFromAxisAngle(self.axis, radians);
      });

      var vectors = [];

      lses.forEach(function (ls) {
        ls.geometry.vertices.forEach(function (v) {
          var o = v.clone();
          o.applyMatrix4(ls.matrixWorld);
          vectors.push(o);
        });
      });

      var child = self.getChildBase(object);

      verticesArray.forEach(function (v, i) {
        for (attr in child.geometry.vertices[v]) {
          child.geometry.vertices[v][attr] = vectors[i][attr];
        }
      });

      //update vertices position
      child.geometry.verticesNeedUpdate = true;

      var rec_ = self.offsetCounter(counter, interval[0].out, interval[0].in);

      var rec_end = self.offsetCounter(counter, interval[interval.length - 1].out, interval[interval.length - 1].in);

      if (this.hideOnLoop) {
        if (rec_ > this.intervalMax) {
          child.material.visible = false;
        } else if (rec_end < this.intervalMin) {
          child.material.visible = false;
        } else {
          child.material.visible = true;
        }
      } else if (this.softOpacity) {

        if (rec_ > this.intervalMax) {
          child.material.opacity -= this.opacityIncrement;
        } else if (rec_ < this.intervalMin) {
          child.material.opacity += this.opacityIncrement;
        } else {
          child.material.opacity = 1;
        }
      } else {}

      counter += this.counterInterval;
    } else {
      counter = 0;
    }
  };
};

module.exports = THREEPathDeform;
