var lousyLoader = function(path, obj, callback) {

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
        if (xhr.total === xhr.loaded) {
            // console.log('loading obj files completed')
        }
    };

    var onError = function(xhr) {
        // console.log('loading obj files failed')
    };

    var objLoader = new THREE.OBJLoader();

    objLoader.setPath(path + '/');

    objLoader.load(obj, function(object) {
        callback(object)
    }, onProgress, onError);

}