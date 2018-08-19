define(() => {

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandom3D() {
        var angle = Math.random() * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
    };

    function limit(max, node) {
        var mSq = Math.sqrt(Math.pow(node.x, 2) + Math.pow(node.y, 2) + Math.pow(node.z, 2));
        if (mSq > max * max) {
            return node.divideScalar(Math.sqrt(mSq)).multiplyScalar(max);
        }
        return node;
    };

    function seek(target, node) {
        var desired = new THREE.Vector3();
        desired = desired.sub(target, node.position);
        // desired.setLength(settings.maxForce);
        desired.setLength(4);
        desired.subSelf(node.velocity); 
        // desired.addSelf(getRandom3D()); // degisebilir
        // return limit(settings.maxSpeed, desired);
        return limit(0.7, desired);
    }

    function getSeparationForce(settings, node1, node2) {

        var steer = new THREE.Vector3();
        var sqrtDist = Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2);

        if (sqrtDist > 0 && sqrtDist < Math.pow(settings.desiredSeparation, 2)) {
            steer.sub(node1, node2);
            steer.normalize();
            steer.divideScalar(Math.sqrt(sqrtDist))
        }
        return steer;
    }


    function normalize(a) {
        var len = mag(a);
        if (len !== 0)
            a.multiplyScalar(1 / len);
        return a;
    };

    function mag(a) {
        return Math.sqrt(magSq(a));
    };

    function magSq(a) {
        var x = a.x;
        var y = a.y;
        var z = a.z;
        return x * x + y * y + z * z;
    };



    return {
        getRandomInt: getRandomInt,
        getRandomArbitrary: getRandomArbitrary,
        getSeparationForce: getSeparationForce,
        getRandom3D: getRandom3D,
        limit: limit,
        seek: seek,
        normalize: normalize
    };
});