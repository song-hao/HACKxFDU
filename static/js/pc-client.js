//var socket = io('http://localhost:8000');
var camera, controls, scene, renderer, stats;
var light, mesh;
var morphs = [];
var mixers = [];
var birdsGeometry = [];
var birds = [];
var playerFactory, particle, color, id;
var players = [];
var bullets = [];
var xyzLimit = 500;
var clock = new THREE.Clock();
var textureLoader = new THREE.TextureLoader();
var bulletMap = textureLoader.load("static/model/textures/sprite.png");
var loader = new THREE.JSONLoader();
var score = 0;
/*
 // Socket.io
 socket.on('init', function (socketID) {
 id = socketID;
 });
 socket.on('player', function (player) {
 console.log(player);
 if ('online' in player) {
 playerHandler(player.online[0], player.online[1][0], player.online[1][1]);
 } else if ('offline' in player) {
 scene.remove(players[player.offline]);
 delete players[player.offline];
 }
 });
 socket.on('bullet', function (bullet) {
 console.log(bullet);
 var position = new THREE.Vector3(bullet[0].x, bullet[0].y, bullet[0].z);
 var speed = new THREE.Vector3(bullet[1].x, bullet[1].y, bullet[1].z);
 AddBullet(position, speed, bullet[2]);
 });
 socket.on('hit', function (data) {
 console.log(data);
 if (id == data.hit) {
 var answer = confirm("You are dead, play again?");
 if (answer) {
 window.location.reload();
 } else {
 window.location = "about:blank";
 }
 } else {
 if (id == data.by) {
 console.log("You killed: " + data.hit);
 }
 scene.remove(players[data.hit]);
 }
 });
 socket.on('connect', function () {
 console.log('Connected');
 });
 socket.on('disconnect', function () {
 console.log('Disconnected');
 });
 socket.on('reconnect', function () {
 console.log('Reconnected to server');
 });
 socket.on('reconnecting', function (nextRetry) {
 console.log('Attempting to re-connect to the server, next attempt in ' + nextRetry + 'ms');
 });
 socket.on('reconnect_failed', function () {
 console.log('Reconnected to server FAILED.');
 });
 */
var time = 100;

$(function () {
    var i = 10;
    $('#retroclockbox1').flipcountdown({
        size: 'lg',
        tick: function () {
            return score;
        }
    });
    $('#retroclockbox2').flipcountdown({
        size: 'lg',
        tick: function () {
            return time;
        }
    });
});

// Fire
$(this).click(function () {
    var speed = camera.getWorldDirection().multiplyScalar(20); // create speed vactor
    AddBullet(camera.position, speed);
    //socket.emit('bullet', [controls.object.position, speed]);
});

function init() {

    // Stats Monitor
    //stats = new Stats();
    //stats.showPanel(0);
    //document.body.appendChild(stats.dom);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    //camera.position.set(Math.random() * 600 - 300, 25, Math.random() * 600 - 300);// Random create initial position [-400, 400]
    camera.position.set(-500, 25, 0);// Random create initial position [-400, 400]
    camera.lookAt(new THREE.Vector3(1, 130, 0));

    // Scene
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0x000000, 0.0025);

    // Light
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0.5, -1).normalize();
    scene.add(light);
    var ambienLight = new THREE.AmbientLight(0x88aaaa);
    scene.add(ambienLight);

    // Skybox
    var materials = [
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/px.jpg')}), // right
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/nx.jpg')}), // left
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/py.jpg')}), // top
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/ny.jpg')}), // bottom
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/pz.jpg')}), // back
        new THREE.MeshBasicMaterial({map: textureLoader.load('static/model/textures/cube/skybox/nz.jpg')})  // front
    ];
    mesh = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 10000, 7, 7, 7), new THREE.MultiMaterial(materials));
    mesh.position.y = 1000;
    mesh.scale.x = -1;
    scene.add(mesh);

    // Ground
    geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var vertex = geometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
    }
    for (var i = 0, l = geometry.faces.length; i < l; i++) {
        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    }
    material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, opacity: 0.5, transparent: true});
    mesh = new THREE.Mesh(geometry, material);
    //scene.add(mesh);
    //var helper = new THREE.GridHelper(500, 10, 0x444444, 0x444444);
    //helper.position.y = 0.1;
    //scene.add(helper);

    // Birds
    //mixer = new THREE.AnimationMixer(scene);
    function addMorph(geometry, speed, duration, x, y, z, fudgeColor) {
        var material = new THREE.MeshLambertMaterial({
            color: 0xffaa55,
            morphTargets: true,
            vertexColors: THREE.FaceColors
        });
        if (fudgeColor) {
            material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
        }
        var mesh = new THREE.Mesh(geometry, material);
        mesh.speed = speed;
        //var clip = geometry.animations[0];
        var mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(geometry.animations[0]).setDuration(1).play();

        mixers.push(mixer);

        mesh.position.set(x, y, z);
        mesh.rotation.y = Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        morphs.push(mesh);
    }

    loader.load("static/model/animated/stork.js", function (geometry) {
        birdsGeometry.push(geometry);
    });

    loader.load("static/model/animated/parrot.js", function (geometry) {
        birdsGeometry.push(geometry);
    });

    /*loader.load("static/model/animated/stork.js", function (geometry) {
     addMorph(geometry, 350, 1, 500 - Math.random() * 500, 0 + 350, 340, true);
     });
     loader.load("static/model/animated/parrot.js", function (geometry) {
     addMorph(geometry, 450, 0.5, 500 - Math.random() * 500, 0 + 300, 700, true);
     });*/

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 150;
    controls.lookSpeed = 0.3;
    controls.lookVertical = true;
    window.addEventListener('resize', onWindowResize, false);

    // Other Players
    loader.load('static/model/skinned/simple/simple.js', function (geometry, materials) {
        for (var k in materials) {
            materials[k].skinning = true;
        }
        playerFactory = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
        playerFactory.scale.set(2.5, 2.5, 2.5);
        //playerFactory.position.set(0, 15, 0);
        playerFactory.position.set(250, 15, 250);
        playerFactory.skeleton.useVertexTexture = false;
        //scene.add( skinnedMesh ); // Not add to scene
        mixer = new THREE.AnimationMixer(playerFactory);
        mixer.clipAction(playerFactory.geometry.animations[0]).play();
    });
}

function newBirds() {
    if (birds.length < 5) {
        var date = new Date();
        if (!birdsGeometry[birds.length % 2])
            return;
        // Generate Birds
        // amount, type, Postion[X, Y, Z], Speed[X, Y, Z]
        var type = Math.random() < 0.5 ? 0 : 1;
        birds.push(new Birds(1, birdsGeometry[type], [Math.random() * 150 - 100, Math.random() * 150 + 50, (1 - 2 * type) * 500], [-0.5 + Math.random(), -0.5 + Math.random(), (2 * type - 1) * (0.1 + Math.random() * 0.3)], scene, date.getTime()));
    }
}

function collide() {
    for (var i = birds.length - 1; i > 0; i--) {
        for (var j = birds[i].meshs.length - 1; j >= 0; j--) {
            var position = birds[i].meshs[j].position;
            if (( position.x > xyzLimit || position.x < -xyzLimit ) ||
                ( position.y > xyzLimit ) ||
                ( position.z > xyzLimit || position.z < -xyzLimit )) {
                scene.remove(birds[i].meshs[j]);
                birds[i].meshs.splice(j, 1);
                birds[i].mixers.splice(j, 1);
                continue;
            }
            for (var k = bullets.length - 1; k >= 0; k--) {
                var bullet = bullets[k].particle;
                if (bullet) {
                    var pos = bullet.position;
                    // Square < 100
                    if (Math.pow(0, 2) + Math.pow(position.y - pos.y, 2) + Math.pow(position.z - pos.z, 2) < 3000) {
                        scene.remove(birds[i].meshs[j]);
                        birds[i].meshs.splice(j, 1);
                        birds[i].mixers.splice(j, 1);
                        scene.remove(bullets[k].particle);
                        bullets.splice(k, 1);
                        score += 10;
                        $("#score").html("Your score: " + score);
                        break;
                    }
                }
            }
        }
        if (birds[i].meshs.length < 1) {
            birds.splice(i, 1);
            //console.log('collode: ' + i);
        }
    }
}

function animate() {
    //stats.begin();
    requestAnimationFrame(animate);
    //socket.emit('player', [controls.object.position]);
    // update position of all the bullets
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i].particle;
        if (bullet) {
            bullets[i].speed.y -= 0.05;
            // console.log(bullets[i].speed);
            bullet.position.add(bullets[i].speed);
            var outbounds = xyzLimit * 1.1;
            if (( bullet.position.x >= outbounds || bullet.position.x <= -outbounds ) ||
                ( bullet.position.y >= 500 || bullet.position.y <= 0 ) ||
                ( bullet.position.z >= outbounds || bullet.position.z <= -outbounds )) {
                // Bullet reached limit?
                console.log("remove outbounded bullet");
                scene.remove(bullets[i].particle);
                bullets.splice(i, 1);
            }
            bullet.verticesNeedUpdate = true;
        }
    }
    restrictField(controls, xyzLimit);
    render();
    //stats.end();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function render() {
    var delta = clock.getDelta();
    var date = new Date();
    //if (birds.length > 0)
    //	console.log(date.getTime() + " " + birds[0].createTime);
    for (var i = birds.length - 1; i >= 0; i--) {
        // Bird exited time = 5s
        if (date.getTime() - birds[i].createTime > 100000) {
            for (var j = 0; j < birds[i].meshs.length; j++)
                scene.remove(birds[i].meshs[j]);
            //console.log(date.getTime() + 'birds: ' + birds.length + ' runtime: ' + i);
            birds.splice(i, 1);
        }
    }
    collide();
    newBirds();
    for (var i = 0; i < birds.length; i++)
        birds[i].update(delta);
    /*for (var i = 0; i < morphs.length; i++) {
     morph = morphs[i];
     morph.position.x += morph.speed * delta;
     if (morph.position.x > 2000) {
     morph.position.x = -1000 - Math.random() * 500;
     }
     }*/
    controls.update(delta);
    /*for (i = 0; i < mixers.length; i++)
     mixers[i].update(delta);*/
    renderer.render(scene, camera);
}

function restrictField(controls, restrict) {
    if (controls.object.position.x > restrict) {
        controls.object.position.x = restrict;
    }
    if (controls.object.position.x < -restrict) {
        controls.object.position.x = -restrict;
    }
    controls.object.position.y = 25; // Height of view = 25
    if (controls.object.position.z > restrict) {
        controls.object.position.z = restrict;
    }
    if (controls.object.position.z < -restrict) {
        controls.object.position.z = -restrict;
    }
}

function playerHandler(id, position) {
    console.log("call");
    if (!players[id]) {
        console.log("add");
        addPlayer(id, position.x, position.y, position.z);
    } else {
        console.log("update");
        updatePlayer(id, position.x, position.y, position.z);
    }
}

function addPlayer(id, x, y, z) {
    var playerMesh = playerFactory.clone();
    playerMesh.position.set(x, y, z);
    scene.add(playerMesh);
    mixer = new THREE.AnimationMixer(playerMesh);
    mixer.clipAction(playerMesh.geometry.animations[0]).play();
    players[id] = playerMesh;

}

function updatePlayer(id, x, y, z) {
    var playerMesh = players[id];
    playerMesh.position.set(x, y, z);
}

function AddBullet(position, speed) {
    particle = new THREE.Sprite(new THREE.SpriteMaterial({map: bulletMap, color: 0xffffff, fog: true}));
    particle.position.x = position.x;
    particle.position.y = position.y;
    particle.position.z = position.z;
    particle.scale.x = particle.scale.y = 1.5;
    bullets.push(new Bullet(particle, speed));
    scene.add(particle);
}

function Bullet(particle, speed) {
    this.particle = particle;
    this.speed = speed;
    return this;
}