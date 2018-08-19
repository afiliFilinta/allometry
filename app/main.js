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

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

        gui.createSideBar(enableControls, disableControls, startPuseButton, cleanButton, addLineButton, animateButton, resetButton);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;

        controls = new THREE.OrbitControls(camera);
        controls.addEventListener('change', render);

        scene = new THREE.Scene();
        var divCanvas = document.getElementById("canvas");
        renderer = new THREE.CanvasRenderer();
        renderer.setSize(divCanvas.offsetWidth, divCanvas.offsetHeight - 28);
        divCanvas.appendChild(renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('keydown', onDocumentKeyDown, false);
        document.addEventListener('keyup', onDocumentKeyUp, false);

        window.addEventListener('resize', onWindowResize, false);
    }


    function addNode(bunch, position, scaling, index) {
        var material = new THREE.ParticleCanvasMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });


        node = new THREE.Particle(material);
        bunch.nodes.splice(index, 0, node)
        node.position.x = position.x;
        node.position.y = position.y;
        node.scale.y = scaling;
        node.scale.x = scaling;

        node.velocity = utils.getRandom3D();
        node.acceleration = new THREE.Vector3();

        scene.add(node);
    }

    function test(bunch) {
        var material = new THREE.ParticleCanvasMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });
        var test = [];
        test[0] = new THREE.Vector3(650.0, 360.0, 0);
        test[1] = new THREE.Vector3(649.51056, 363.09018, 0);
        test[2] = new THREE.Vector3(648.09015, 365.87784, 0);
        test[3] = new THREE.Vector3(645.87787, 368.09018, 0);
        test[4] = new THREE.Vector3(643.09015, 369.51056, 0);
        test[5] = new THREE.Vector3(640.0, 370.0, 0);
        test[6] = new THREE.Vector3(636.90985, 369.51056, 0);
        test[7] = new THREE.Vector3(634.12213, 368.09018, 0);
        test[8] = new THREE.Vector3(631.90985, 365.87784, 0);
        test[9] = new THREE.Vector3(630.48944, 363.09018, 0);
        test[10] = new THREE.Vector3(630.0, 360.0, 0);
        test[11] = new THREE.Vector3(630.48944, 356.90982, 0);
        test[12] = new THREE.Vector3(631.90985, 354.12213, 0);
        test[13] = new THREE.Vector3(634.12213, 351.90982, 0);
        test[14] = new THREE.Vector3(636.90985, 350.48944, 0);
        test[15] = new THREE.Vector3(640.0, 350.0, 0);
        test[16] = new THREE.Vector3(643.0902, 350.48944, 0);
        test[17] = new THREE.Vector3(645.87787, 351.90985, 0);
        test[18] = new THREE.Vector3(648.09015, 354.12216, 0);
        test[19] = new THREE.Vector3(649.51056, 356.90985, 0);

        for (var i = 0; i < test.length; i++) {
            node = bunch.nodes[i] = new THREE.Particle(material);
            node.position.x = test[i].x;
            node.position.y = test[i].y;
            scene.add(node);
        }

    }

    function run(bunch) {
        if (isStart && !isPause) {
            differentiate(bunch);
            growth(bunch);
            console.log("******************************");
            console.log("Nokta sayısı: ", bunch.nodes.length);
            console.log("Iterasyon sayısı: ", syc);
            syc++;

            setTimeout(() => {
                run(bunch);
            }, 1);
        }
    }

    function growth(bunch) {
        for (var i = 0; i < bunch.nodes.length - 1; i++) {
            var n1 = bunch.nodes[i];
            var n2 = bunch.nodes[i + 1];

            var distance = new THREE.Vector3();
            distance.sub(n1.position, n2.position);
            if (distance.length() > bunch.settings.maxEdgeLen) {
                var index = i + 1;
                var middleNode = new THREE.Vector3();
                middleNode.add(n1.position, n2.position).divideScalar(2);
                addNode(bunch, middleNode, bunch.settings.scaling, index);
            }
        }
    }

    function differentiate(bunch) {
        var separationForces = getSeparationForces(bunch);
        var cohesionForces = getEdgeCohesionForces(bunch);

        for (var i = 0; i < bunch.nodes.length; i++) {
            var separation = separationForces[i];
            var cohesion = cohesionForces[i];
            // separation.multiplyScalar(settings.separationRation);
            separation.multiplyScalar(1.1);

            bunch.nodes[i].acceleration.addSelf(separation);
            bunch.nodes[i].acceleration.addSelf(cohesion);

            bunch.nodes[i].velocity.addSelf(bunch.nodes[i].acceleration);
            // bunch.nodes[i].velocity = utils.limit(settings.maxForce, bunch.nodes[i].velocity);
            bunch.nodes[i].velocity = utils.limit(4, bunch.nodes[i].velocity);
            bunch.nodes[i].position.addSelf(bunch.nodes[i].velocity);
            bunch.nodes[i].acceleration.multiplyScalar(0);

            //var acceleration = new THREE.Vector3();
            // acceleration = acceleration.add(separation, cohesion);
            // acceleration = utils.limit(settings.maxForce, acceleration);
            //bunch.nodes[i].position.addSelf(acceleration);
        }
    }

    function getSeparationForces(bunch) {

        var size = bunch.nodes.length;
        var separateForces = new Array();
        var nearNodes = [];

        for (var i = 0; i < size; i++) {
            separateForces[i] = new THREE.Vector3();
            nearNodes[i] = 0;
        }

        var nodei;
        var nodej;
        for (var i = 0; i < size; i++) {
            nodei = bunch.nodes[i].position;
            for (var j = i + 1; j < size; j++) {
                nodej = bunch.nodes[j].position;
                var forceij = utils.getSeparationForce(bunch.settings, nodei, nodej);
                if (forceij.length() > 0) {
                    separateForces[i].addSelf(forceij);
                    separateForces[j].subSelf(forceij);
                    nearNodes[i]++;

                    nearNodes[j]++;
                }
            }

            if (nearNodes[i] > 0) {
                separateForces[i].divideScalar(nearNodes[i]);
            }

            if (separateForces[i].length() > 0) {
                // separateForces[i].setLength(settings.maxSpeed);
                separateForces[i].setLength(0.7);
                separateForces[i].subSelf(bunch.nodes[i].velocity);
                // separateForces[i] = utils.limit(settings.maxForce, separateForces[i]);
                separateForces[i] = utils.limit(4, separateForces[i]);
            }
        }
        return separateForces;
    }

    function getEdgeCohesionForces(bunch) {
        var size = bunch.nodes.length;
        var cohesionForces = new Array();

        for (var i = 0; i < size; i++) {
            var sum = new THREE.Vector3();

            if (i != 0 && i != size - 1) {
                sum.addSelf(bunch.nodes[i - 1].position).addSelf(bunch.nodes[i + 1].position);
            } else if (i == 0) {
                sum.addSelf(bunch.nodes[size - 1].position).addSelf(bunch.nodes[i + 1].position);
            } else if (i == size - 1) {
                sum.addSelf(bunch.nodes[i - 1].position).addSelf(bunch.nodes[0].position);
            }
            sum.divideScalar(2);
            cohesionForces[i] = utils.seek(sum, bunch.nodes[i]);
        }
        return cohesionForces;
    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {

        requestAnimationFrame(animate);
        controls.update();
        render();
    }

    function render() {
        if (isAni) {
            // camera.position.x += (mouseX - camera.position.x) * .05;
            // camera.position.y += (-mouseY - camera.position.y) * .05;

            bunchArray.forEach(bunch => {
                bunch.nodes.forEach((node, index) => {
                    node.position.z = (Math.sin((index + count) * 0.3) * 50) + (Math.sin((index + count) * 0.5) * 50);
                    node.scale.x = node.scale.y = (Math.sin((index + count) * 0.3) + 1) * 0.5 + (Math.sin((index + count) * 0.5) + 1) * 0.5;
                });
                count += 0.1;
            });
        }
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }



    function onDocumentMouseDown(event) {
        //event.preventDefault();

        if (isStart && isCtrlDown) {
            var x = event.clientX;
            var y = event.clientY;

            var sideBar = document.getElementById("sidebar");
            var offsetx = window.innerWidth / 2;
            var offsety = window.innerHeight / 2;
            
            x = (x - offsetx) * 2;
            y = (offsety - y) * 2;

            var bunch = newBunch();
            setValues(bunch);
            bunch.settings.startPointX = x;
            bunch.settings.startPointY = y;

            var material = new THREE.ParticleCanvasMaterial({
                color: 0xffffff,
                program: function (context) {
                    context.beginPath();
                    context.arc(0, 0, 1, 0, PI2, true);
                    context.fill();
                }
            });

            for (var i = 0; i < bunch.settings.nodeCount; i++) {

                var space = 360 / bunch.settings.nodeCount;
                var min = i * space;
                var max = (i + 1) * space;
                var rnd = utils.getRandomArbitrary(min, max);

                node = bunch.nodes[i] = new THREE.Particle(material);
                node.position.x = bunch.settings.radius * Math.cos(rnd * Math.PI / 180) + bunch.settings.startPointX;
                node.position.y = bunch.settings.radius * Math.sin(rnd * Math.PI / 180) + bunch.settings.startPointY;
                // console.log(node.position);
                node.scale.y = bunch.settings.scaling;
                node.scale.x = bunch.settings.scaling;

                node.velocity = utils.getRandom3D();
                node.acceleration = new THREE.Vector3();

                scene.add(node);
            }
            bunchArray.push(bunch);
            run(bunch);


        }
    }

    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 17:
                isCtrlDown = true;
                break;
        }
    }

    function onDocumentKeyUp(event) {
        switch (event.keyCode) {
            case 17:
                isCtrlDown = false;
                break;
        }
    }

    function onDocumentMouseMove(event) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

    }

    function disableControls() {
        controls.userRotate = false;
    }

    function enableControls() {
        controls.userRotate = true;
    }


    function newBunch() {
        return {
            nodes: new Array(),
            settings: Object.assign({}, defaultSettings)
        }
    }

    // Button Events
    function startPuseButton() {
		if(isAni){
			return;
		}
		
        if (isStart) {
            if (isPause) {
                isPause = false;
                document.getElementById("startPause").innerHTML = 'Pause';
                bunchArray.forEach(bunch => {
                    run(bunch);
                });
            } else {
                isPause = true;
                document.getElementById("startPause").innerHTML = 'Resume';
            }
        } else {
            isStart = true;
            document.getElementById("startPause").innerHTML = 'Pause';

            var bunch = newBunch();
            setValues(bunch);
            var material = new THREE.ParticleCanvasMaterial({
                color: 0xffffff,
                program: function (context) {
                    context.beginPath();
                    context.arc(0, 0, 1, 0, PI2, true);
                    context.fill();
                }
            });

            for (var i = 0; i < bunch.settings.nodeCount; i++) {

                var space = 360 / bunch.settings.nodeCount;
                var min = i * space;
                var max = (i + 1) * space;
                var rnd = utils.getRandomArbitrary(min, max);

                node = bunch.nodes[i] = new THREE.Particle(material);
                node.position.x = bunch.settings.radius * Math.cos(rnd * Math.PI / 180) + bunch.settings.startPointX;
                node.position.y = bunch.settings.radius * Math.sin(rnd * Math.PI / 180) + bunch.settings.startPointY;
                // console.log(node.position);
                node.scale.y = bunch.settings.scaling;
                node.scale.x = bunch.settings.scaling;

                node.velocity = utils.getRandom3D();
                node.acceleration = new THREE.Vector3();

                scene.add(node);
            }
            bunchArray.push(bunch);
            run(bunch);
        }
    }

    function setValues(bunch) {
        bunch.settings.radius = document.getElementById("radius").value;
        bunch.settings.desiredSeparation = document.getElementById("desiredSeparation").value;
        bunch.settings.maxEdgeLen = document.getElementById("maxEdgeLen").value;
    }


    function cleanButton() {
        console.log("cleanButton");

        for (var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i] instanceof THREE.Particle || scene.children[i] instanceof THREE.Line ) {
                scene.remove(scene.children[i]);
            }
        }

        bunchArray = [];
        isStart = false;
        isPause = false;
        isAni = false;
        document.getElementById("startPause").innerHTML = 'Start';
        syc = 0;
    }

    function addLineButton() {

        if (isStart) {
            console.log("add line");
            bunchArray.forEach(bunch => {

                var geometry = new THREE.Geometry();
                bunch.nodes.forEach(node => {
                    scene.remove(node);
                    geometry.vertices.push(node.position);
                });
                var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.5
                }));
                scene.add(line);

            });
        }
    }

    function animateButton() {
        console.log("amnimate");

        if (isStart && isPause) {
            if (isAni) {
                isAni = false;
                bunchArray.forEach(bunch => {
                    bunch.nodes.forEach(node => {
                        node.position.z = 0;
                        node.scale.x = bunch.settings.scaling;
                        node.scale.y = bunch.settings.scaling;
                    });
                });
            } else {
                isAni = true;
                count = 0;
            }
        }
    }

    function resetButton() {
        console.log("reset");
        if (isAni) {
            isAni = false;

            bunchArray.forEach(bunch => {
                bunch.nodes.forEach(node => {
                    node.position.z = 0;
                    node.scale.x = bunch.settings.scaling;
                    node.scale.y = bunch.settings.scaling;
                });
            });
        }

        for (var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i] instanceof THREE.Particle || scene.children[i] instanceof THREE.Line ) {
                scene.remove(scene.children[i]);
            }
        }
        bunchArray.forEach(bunch => {
            bunch.nodes.forEach(node => {
                scene.add(node);
            });
        });
    }

});