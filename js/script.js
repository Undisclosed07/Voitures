import * as THREE from '../vendor/three.js-master/build/three.module.js';
import Stats from '../vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../vendor/three.js-master/examples/jsm/loaders/FBXLoader.js';

const Scene = {
	vars: {
		container: null,
		scene: null,
		renderer: null,
		camera: null,
		stats: null,
		controls: null,
		texture: null,
		mouse: new THREE.Vector2(),
		raycaster: new THREE.Raycaster(),
		animSpeed: null,
		animPercent: 0.00,
		textBMW: "Bmw",
		textAudi: "Audi",
		textAston: "Aston"
	},
	animate: () => {		
		requestAnimationFrame(Scene.animate);
		Scene.customAnimation();
		Scene.render();
	},
	customAnimation: () => {
		let vars = Scene.vars;
        Scene.vars.bmw.rotation.y += .0150;
		Scene.vars.aston.rotation.y += .0150;
		Scene.vars.audi.rotation.y += .0150;		
	},
	render: () => {
		Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
		Scene.vars.stats.update();
	},
	loadFBX: (file, scale, position, rotation, color, namespace, callback) => {
		let vars = Scene.vars;
		let loader = new FBXLoader();

		if (file === undefined) {
			return;
		}

		loader.load('./fbx/' + file, (object) => {

			object.traverse((child) => {
				if (child.isMesh) {

					child.castShadow = true;
					child.receiveShadow = true;

					if (namespace === "plaquette") {
						child.material = new THREE.MeshBasicMaterial({
							map: Scene.vars.texture
						});
					}

					if (namespace === "statuette") {
						child.material = new THREE.MeshStandardMaterial({
							color: new THREE.Color(color),
							roughness: .3,
							metalness: .6
						})
                    }
                    
                    if (namespace === "bmw") {
						child.material = new THREE.MeshStandardMaterial({
							color: new THREE.Color(color),
							roughness: .3,
							metalness: .6
						})
					}

					child.material.color = new THREE.Color(color);
				}
			});

			object.position.x = position[0];
			object.position.y = position[1];
			object.position.z = position[2];

			object.rotation.x = rotation[0];
			object.rotation.y = rotation[1];
			object.rotation.z = rotation[2];

			object.scale.x = object.scale.y = object.scale.z = scale;
			Scene.vars[namespace] = object;

			callback();
		});
		
	},
	loadText: (textBMW, scale, position, rotation, color, namespace, callback) => {
		let loader = new THREE.FontLoader();

		if (textBMW === undefined || textBMW === "") {
			return;
		}

		loader.load('./vendor/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font) => {
			let geometry = new THREE.TextGeometry(textBMW, {
				font,
				size: 1,
				height: 0.1,
				curveSegments: 1,
				bevelEnabled: false
			});

			geometry.computeBoundingBox();
			let offset = geometry.boundingBox.getCenter().negate();
			geometry.translate(offset.x, offset.y, offset.z);

			let material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(color)
			});

			let mesh = new THREE.Mesh(geometry, material);

			mesh.position.x = position[0];
			mesh.position.y = position[1];
			mesh.position.z = position[2];

			mesh.rotation.x = rotation[0];
			mesh.rotation.y = rotation[1];
			mesh.rotation.z = rotation[2];

			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

			Scene.vars[namespace] = mesh;

			callback();
		});
	},
	onWindowResize: () => {
		let vars = Scene.vars;
		vars.camera.aspect = window.innerWidth / window.innerHeight;
		vars.camera.updateProjectionMatrix();
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	init: () => {
		let vars = Scene.vars;

		// Préparer le container pour la scène
		vars.container = document.createElement('div');
		vars.container.classList.add('fullscreen');
		document.body.appendChild(vars.container);

		// ajout de la scène
		vars.scene = new THREE.Scene();
		vars.scene.background = new THREE.Color(0xa0a0a0);
		vars.scene.fog = new THREE.Fog(vars.scene.background, 500, 3000);

		// paramétrage du moteur de rendu
		vars.renderer = new THREE.WebGLRenderer({ antialias: true });
		vars.renderer.setPixelRatio(window.devicePixelRatio);
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
		
		vars.renderer.shadowMap.enabled = true;
		vars.renderer.shadowMapSoft = true;

		vars.container.appendChild(vars.renderer.domElement);

		// ajout de la caméra
		vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
		vars.camera.position.set(-1.5, 40, 572);

		// ajout de la lumière
		const lightIntensityHemisphere = .5;
		let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, lightIntensityHemisphere);
		light.position.set(0, 700, 0);
		vars.scene.add(light);

		// ajout des directionelles
		const lightIntensity = .8;
		const d = 1000;
		let light1 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light1.position.set(0, 700, 0);
		light1.castShadow = true;
		light1.shadow.camera.left = -d;
		light1.shadow.camera.right = d;
		light1.shadow.camera.top = d;
		light1.shadow.camera.bottom = -d;
		light1.shadow.camera.far = 2000;
		light1.shadow.mapSize.width = 4096;
		light1.shadow.mapSize.height = 4096;
		vars.scene.add(light1);

		let light2 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light2.position.set(-400, 200, 400);
		light2.castShadow = true;
		light2.shadow.camera.left = -d;
		light2.shadow.camera.right = d;
		light2.shadow.camera.top = d;
		light2.shadow.camera.bottom = -d;
		light2.shadow.camera.far = 2000;
		light2.shadow.mapSize.width = 4096;
		light2.shadow.mapSize.height = 4096;
		vars.scene.add(light2);

		let light3 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light3.position.set(400, 200, 400);
		light3.castShadow = true;
		light3.shadow.camera.left = -d;
		light3.shadow.camera.right = d;
		light3.shadow.camera.top = d;
		light3.shadow.camera.bottom = -d;
		light3.shadow.camera.far = 2000;
		light3.shadow.mapSize.width = 4096;
		light3.shadow.mapSize.height = 4096;
		vars.scene.add(light3);

		// ajout du sol
		let mesh = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2000, 2000),
			new THREE.MeshLambertMaterial(
				{ color: new THREE.Color(0x888888) }
			)
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = false;
		vars.scene.add(mesh);

		let planeMaterial = new THREE.ShadowMaterial();
		planeMaterial.opacity = 0.07;
		let shadowPlane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2000, 2000),
			planeMaterial);
		shadowPlane.rotation.x = -Math.PI / 2;
		shadowPlane.receiveShadow = true;

		vars.scene.add(shadowPlane);

		// ajout de la sphère
		let geometry = new THREE.SphereGeometry(1000, 32, 32);
		let material = new THREE.MeshPhongMaterial({color: new THREE.Color(0xFFFFFF)});
		material.side = THREE.DoubleSide;
		let sphere = new THREE.Mesh(geometry, material);

		vars.texture = new THREE.TextureLoader().load('./texture/marbre.jpg');

		let hash = document.location.hash.substr(1);
		if (hash.length !== 0) {
			let textBMW = hash.substring();
			let textAston = hash.substring();
			let textAudi = hash.substring();
			Scene.vars.textBMW = decodeURI(textBMW);
			Scene.vars.textAston = decodeURI(textAston);
			Scene.vars.textAudi = decodeURI(textAudi);
		}

		Scene.loadFBX("Logo_Feelity.FBX", 10, [45, 22, 0], [0, 0, 0], 0xFFFFFF, 'logo', () => {
			Scene.loadFBX("Socle_Partie1.FBX", 10, [0, 0, 0], [0, 0, 0], 0x1A1A1A, 'socle1', () => {
				Scene.loadFBX("Socle_Partie2.FBX", 10, [0, 0, 0], [0, 0, 0], 0x1A1A1A, 'socle2', () => {
					Scene.loadFBX("Plaquette.FBX", 10, [0, 4, 45], [0, 0, 0], 0xFFFFFF, 'plaquette', () => {
						Scene.loadText(Scene.vars.textBMW, 10, [0, 23, 52], [0, 0, 0], 0x1A1A1A, "texteBMW", () => {
							Scene.loadText(Scene.vars.textAston, 10, [0, 23, 52], [0, 0, 0], 0x1A1A1A, "texteAston", () => {
								Scene.loadText(Scene.vars.textAudi, 10, [0, 23, 52], [0, 0, 0], 0x1A1A1A, "texteAudi", () => {
									Scene.loadFBX("bmw.FBX", 1, [0, 0, 0], [0, 0, 0], 0xFF0000, 'bmw', () => {
										Scene.loadFBX("aston.FBX", 1.5, [0, 0, 0], [0, 0, 0], 0x008000, 'aston', () => {
											Scene.loadFBX("audi.FBX", .5, [0, 0, 0], [0, 0, 0], 0x000000, 'audi', () => {
								
								let vars = Scene.vars;

								vars.bmw.position.y = 55;
								vars.bmw.position.z = -50;
								vars.bmw.rotation.y = Math.PI / 2;

								vars.aston.position.set(-200, 80, 0);
								vars.aston.rotation.y = Math.PI / 4;

								vars.audi.position.set(200, 55, 0);
								vars.audi.rotation.y = -Math.PI / 4;

								vars.scene.add(vars.bmw);
								vars.scene.add(vars.aston);
								vars.scene.add(vars.audi);
								
								let gold = new THREE.Group();
								gold.add(vars.socle1);
								gold.add(vars.socle2);
								gold.add(vars.logo);
								gold.add(vars.plaquette);

								let logo2 = vars.logo.clone();
								logo2.rotation.z = Math.PI;
								logo2.position.x = -45;
								vars.logo2 = logo2;
								gold.add(logo2);
								gold.position.z = -50;
								gold.position.y = 10;
								vars.scene.add(gold);
								vars.goldGroup = gold;

								let silver = gold.clone();
								silver.add(vars.texteAston);
								silver.position.set(-200, 10, 0);
								silver.rotation.y = Math.PI / 4;
								silver.children[2].traverse(node => {
									if (node.isMesh) {
										node.material = new THREE.MeshStandardMaterial({
											color: new THREE.Color(0xC0C0C0),
											metalness: .6,
											roughness: .3
										})
									}
								});
								vars.scene.add(silver);
								vars.silverGroup = silver;

								let bronze = gold.clone();
								bronze.position.set(200, 10, 0);
								bronze.rotation.y = -Math.PI / 4;
								bronze.children[2].traverse(node => {
									if (node.isMesh) {
										node.material = new THREE.MeshStandardMaterial({
											color: new THREE.Color(0xCD7F32),
											metalness: .6,
											roughness: .3
										})
									}
								});
								vars.scene.add(bronze);
								vars.bronzeGroup = bronze;

								gold.add(vars.texteBMW);
								vars.scene.add(gold);

								silver.add(vars.texteAston);
								vars.scene.add(silver);

								bronze.add(vars.texteAudi);
								vars.scene.add(bronze);

								let elem = document.querySelector('#loading');
								elem.parentNode.removeChild(elem);
							});
						});
					});
				});
			});
		});
	});
});
});
});
		
		// ajout des controles
		vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
		//vars.controls.position.set(-1.5, 40, 572);
		vars.controls.minDistance = 600;
		vars.controls.maxDistance = 600;
		vars.controls.minPolarAngle = Math.PI / 2;
		vars.controls.maxPolarAngle = Math.PI / 2;
		vars.controls.minAzimuthAngle = - Math.PI / 4;
		vars.controls.maxAzimuthAngle = Math.PI / 4;
		vars.controls.target.set(0, 30, 0);
		vars.controls.update();

		window.addEventListener('resize', Scene.onWindowResize, false);
		window.addEventListener('mousemove', Scene.onMouseMove, false);
        document.addEventListener("keydown", onDocumentKeyDown, false);

        function onDocumentKeyDown(event) {
            var keyCode = event.which;
			let vars = Scene.vars;
			
			//Espace   
			if (keyCode == 32) {
				Scene.customAnimation();
			}
			//Entrée 
			if(keyCode == 13){
				Scene.vars.bmw.position.set(0, 55, -50);
				Scene.vars.bmw.rotation.y = Math.PI / 2;

				Scene.vars.aston.position.set(-200, 80, 0);
				Scene.vars.aston.rotation.y = Math.PI / 4;

				Scene.vars.audi.position.set(200, 55, 0);
				Scene.vars.audi.rotation.y = -Math.PI / 4;
				
			}
        };

		vars.stats = new Stats();
		vars.container.appendChild(vars.stats.dom);

		Scene.animate();
	}
};

Scene.init();