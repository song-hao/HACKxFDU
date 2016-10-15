function Birds(n, geometry, position, speed, scene, createTime) {
	this.speed = speed;
	//console.log(speed);
	//this.position;
	this.meshs = [];
	this.mixers = [];
	this.createTime = createTime;
	//console.log(createTime);
	for (var i = 0; i < n; i++) {
		var material = new THREE.MeshLambertMaterial({
            color: 0xffaa55,
            morphTargets: true,
            vertexColors: THREE.FaceColors
        });
        material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
        var mesh = new THREE.Mesh(geometry, material);

        var mixer = new THREE.AnimationMixer(mesh);
        //console.log(geometry.animations);
        mixer.clipAction(geometry.animations[0]).setDuration(1).play();
        this.mixers.push(mixer);

        var x, y, z;
        x = position[0] + Math.random() * 10 - 5;
        y = position[1] + Math.random() * 10 - 5;
        z = position[2] + Math.random() * 10 - 5;
        mesh.position.set(x, y, z);
        mesh.rotation.y = Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
        this.meshs.push(mesh);
	}
}

Birds.prototype = {
	constructor : birds,
	update : function(delta) {
		//console.log('del');
		for (var i = 0; i < this.meshs.length; i++) {
			this.meshs[i].position.x += this.speed[0] * 35;
			this.meshs[i].position.y += this.speed[1] * 35;
			this.meshs[i].position.z += this.speed[2] * 35;
			//console.log(this.meshs[i].position);
		}
		for (var i = 0; i < this.mixers.length; i++) {
			this.mixers[i].update(delta);
		}
	}
}