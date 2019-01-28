define(function (require) {

    //var utils = require('./utils');
    var gui = require('./gui');

    var camera, scene, renderer, controls;

    var node, count = 0;
    var bunchArray = [];

    var isCtrlDown = false;
    var isAni = false;
    var isStart = false;
    var isPause = false;
    var syc = 0;
    var mouseX = 0,
        mouseY = 0;
    var PI2 = Math.PI * 2;
    var isWire = false;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

        gui.createSideBar(randomButton, renderButton, exportButton);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.x = 11;
        camera.position.y = -1371;
        camera.position.z = 453;

        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        scene.add(new THREE.AmbientLight(0x505050));

        var light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);
        light.castShadow = true;

        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
        light.shadow.bias = -0.00022;

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        scene.add(light);

        generatePoints();
        generateSuperShape();


        var divCanvas = document.getElementById("canvas");
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        divCanvas.appendChild(renderer.domElement);
        addDragControls();

        window.addEventListener('resize', onWindowResize, false);
    }

    

    function randomButton() {

    }

    function renderButton(params) {

        console.log(JSON.stringify(params))
        /*
        params.m1 = getField('m1');
        params.n11 = getField('n11');
        params.n12 = getField('n12');
        params.n13 = getField('n13');

        params.m2 = getField('m2');
        params.n21 = getField('n21');
        params.n22 = getField('n22');
        params.n23 = getField('n23');

        params.resolution = getField('resolution');

        console.log(params.m1, params.n11, params.n12, params.n13, params.m2, params.n21, params.n22, params.n23);
        removeAllObjects();
        generatePoints();
        addDragControls();
        generateSuperShape();
        */
    }

    function exportButton() {

    }


    function generatePoints() {
        objects = [];
        var pointGeometry = new THREE.SphereGeometry(0.25);
        var material = new THREE.MeshStandardMaterial({

            color: new THREE.Color().setHSL(0xff0000, 1, 0.75),
            roughness: 0.5,
            metalness: 0,
            //flatShading: true

        });

        var theta = 0;
        var phi = 0;

        for (var i = 0; i < defaultSettings.resolution + 1; i++) {

            theta = THREE.Math.mapLinear(i, 0, defaultSettings.resolution, -Math.PI, Math.PI)
            for (var j = 0; j < defaultSettings.resolution + 1; j++) {

                phi = THREE.Math.mapLinear(j, 0, defaultSettings.resolution, -Math.PI / 2, Math.PI / 2);
                var r1 = supershape(theta, defaultSettings.a1, defaultSettings.b1, defaultSettings.m1, defaultSettings.n11, defaultSettings.n12, defaultSettings.n13);
                var r2 = supershape(phi, defaultSettings.a2, defaultSettings.b2, defaultSettings.m2, defaultSettings.n21, defaultSettings.n22, defaultSettings.n23);
                var point = getCoordinate(theta, phi, defaultSettings.radius1, r1, r2);

                var object = new THREE.Mesh(pointGeometry, material);
                object.position.copy(point);
                object.castShadow = true;
                object.receiveShadow = true;
                scene.add(object);
                objects.push(object);
            }
        }
    }

    function generateSuperShape() {

        var geo = new THREE.Geometry();
        geo.vertices = [];
        objects.forEach(function (object) {
            geo.vertices.push(object.position);
        });

        geo.faces = [];

        for (var i = 0; i < defaultSettings.resolution; i++) {

            for (var j = 0; j < defaultSettings.resolution; j++) {

                var first = (i * (defaultSettings.resolution + 1)) + j;
                var second = first + defaultSettings.resolution + 1;

                geo.faces.push(new THREE.Face3(first, second, first + 1));
                geo.faces.push(new THREE.Face3(first + 1, second, second + 1));

            }
        }
        geo.verticesNeedUpdate = true;
        geo.elementsNeedUpdate = true;

        geo.computeFaceNormals();
        geo.computeVertexNormals();

        var meshMaterial = new THREE.MeshNormalMaterial();
        meshMaterial.side = THREE.DoubleSide;
        var wireFrameMat = new THREE.MeshBasicMaterial({
            // color: new THREE.Color().setHSL(Math.random(), Math.random(), Math.random()),
            wireframe: true
        });

        var materials;
        if (isWire) {
            wireFrameMat.color = new THREE.Color().setHSL(Math.random(), Math.random(), Math.random());
            materials = [wireFrameMat];
        } else {
            materials = [meshMaterial, wireFrameMat];
        }

        superShape = THREE.SceneUtils.createMultiMaterialObject(geo, materials);
        superShape.castShadow = true;
        superShape.receiveShadow = true;
        scene.add(superShape);
    }

    function removeAllObjects() {
        objects.forEach(function (object) {
            scene.remove(object);
        });
        scene.remove(superShape);
    }

    function supershape(theta, a, b, m, n1, n2, n3) {

        var t1 = Math.cos(m * theta / 4);
        t1 = 1 / a * Math.abs(t1)
        t1 = Math.abs(t1)

        var t2 = Math.sin(m * theta / 4)
        t2 = 1 / b * Math.abs(t2);
        t2 = Math.abs(t2)

        var r = Math.pow(t1, n2) + Math.pow(t2, n3)
        r = Math.pow(r, -1 / n1)

        return r;
    }

    function getCoordinate(theta, phi, radius, r1, r2) {
        var x = radius * r1 * Math.cos(theta) * r2 * Math.cos(phi);
        var y = radius * r1 * Math.sin(theta) * r2 * Math.cos(phi);
        var z = radius * r2 * Math.sin(phi);

        return new THREE.Vector3(x, y, z)
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {

        requestAnimationFrame(animate);
        render();
    }

    function render() {

        controls.update();
        renderer.render(scene, camera);
    }

    function addDragControls() {
        var dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', function (event) {
            controls.enabled = false;
        });
        dragControls.addEventListener('dragend', function (event) {
            scene.remove(superShape);
            generateSuperShape();
            controls.enabled = true;
        });
    }

});