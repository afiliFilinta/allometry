var container, stats, gui;
var camera, controls, scene, renderer;
var objects = [];
var superShape;
var isWire = false;

var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED, SELECTED;

var params = {
    radius1: 100,
    radius2: 100,
    a1: 1.0,
    b1: 1.0,
    m1: 5.7,
    n11: 0.5,
    n12: 1,
    n13: 2.5,
    a2: 1,
    b2: 1,
    m2: 10,
    n21: 3,
    n22: 0.2,
    n23: 1,
    resolution: 48
};

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);
    menu();

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

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);
    addDragControls();

    stats = new Stats();
    container.appendChild(stats.dom);
    window.addEventListener('resize', onWindowResize, false);
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

    for (var i = 0; i < params.resolution + 1; i++) {

        theta = THREE.Math.mapLinear(i, 0, params.resolution, -Math.PI, Math.PI)
        for (var j = 0; j < params.resolution + 1; j++) {

            phi = THREE.Math.mapLinear(j, 0, params.resolution, -Math.PI / 2, Math.PI / 2);
            var r1 = supershape(theta, params.a1, params.b1, params.m1, params.n11, params.n12, params.n13);
            var r2 = supershape(phi, params.a2, params.b2, params.m2, params.n21, params.n22, params.n23);
            var point = getCoordinate(theta, phi, params.radius1, r1, r2);

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

    for (var i = 0; i < params.resolution; i++) {

        for (var j = 0; j < params.resolution; j++) {

            var first = (i * (params.resolution + 1)) + j;
            var second = first + params.resolution + 1;

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
    stats.update();
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

function menu() {

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '20px';
    info.style.right = '20px';
    info.style.width = '100%';
    info.style.textAlign = 'right';
    info.innerHTML = 'Noktanin Hacim Ile Alometrik İliskisi';
    // info.innerHTML +=  '<br/><br/><img src="formule.PNG" style="width: auto; height: 60px;">'
    info.innerHTML += '<br/><br/>m1: <input class="inputField" type="number" id="m1" value="5.7">';
    info.innerHTML += '  n1.1: <input class="inputField" type="number" id="n11" value="0.5">';
    info.innerHTML += '  n1.2: <input class="inputField" type="number" id="n12" value="1">';
    info.innerHTML += '  n1.3: <input class="inputField" type="number" id="n13" value="2.5">';

    info.innerHTML += '<br/><br/>m2: <input class="inputField" type="number" id="m2" value="10">';
    info.innerHTML += '  n2.1: <input class="inputField" type="number" id="n21" value="3">';
    info.innerHTML += '  n2.2: <input class="inputField" type="number" id="n22" value="0.2">';
    info.innerHTML += '  n2.3: <input class="inputField" type="number" id="n23" value="1">';

    info.innerHTML += '<br/><br/> Wire: <input id="wire" type="checkbox" onchange="wireIsEnable()"  /> ';
    info.innerHTML += 'Resolution: <input class="inputField" type="number" id="resolution" value="48" min="1"> ';
    info.innerHTML += '<input id="renderShape" type="button" onclick="renderShape()" value="Render"/> ';
    info.innerHTML += '<input id="randomShape" type="button" onclick="randomShape()" value="Random"/> ';
    info.innerHTML += '<input id="downloadButton" type="button" onclick="exportObj()" value="Export"/> ';

    info.addEventListener('mousedown', disableControls, false);
    info.addEventListener('mouseup', enableControls, false);

    container.appendChild(info);

}

function wireIsEnable() {
    isWire = document.getElementById('wire').checked;
    console.log(isWire);
}

function exportObj() {

    /*
    objects.forEach(function (object) {
    	scene.remove(object);
    });
    */

    var exporter = new THREE.OBJExporter();
    var result = exporter.parse(superShape);
    download(result, "superShape.obj", "text/plain");
}

function renderShape() {
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
}

function randomShape() {
    params.m1 = setField('m1');
    params.n11 = setField('n11');
    params.n12 = setField('n12');
    params.n13 = setField('n13');

    params.m2 = setField('m2');
    params.n21 = setField('n21');
    params.n22 = setField('n22');
    params.n23 = setField('n23');

    params.resolution = getField('resolution');

    console.log(params.m1, params.n11, params.n12, params.n13, params.m2, params.n21, params.n22, params.n23);
    removeAllObjects();
    generatePoints();
    addDragControls();
    generateSuperShape();
}

function getField(str) {
    var elm = parseFloat(document.getElementById(str).value);
    if ((elm !== 0 && !elm) || (str === 'resolution' && elm < 1)) {
        console.log('undifened');
        elm = 1;
        document.getElementById(str).value = elm;
    }
    return elm;
}

function setField(str) {
    var elm = getRandomInt(-20, 20) * Math.random();
    document.getElementById(str).value = elm;
    return elm;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function disableControls() {
    controls.enabled = false;
}

function enableControls() {
    controls.enabled = true;
}
