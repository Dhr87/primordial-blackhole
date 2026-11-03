import * as THREE from 'three';
import type { System } from '../core/System';

/** PLACEHOLDER_ escena mínima para validar el pipeline. Reemplazar en Fase 2. */
export class RenderSystem implements System {
  readonly name = 'rendering';
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;

  init(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x05070a);
    this.scene.fog = new THREE.FogExp2(0x05070a, 0.04);
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0.5, 0);

    this.scene.add(new THREE.HemisphereLight(0x4466aa, 0x110a08, 0.6));
    const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
    key.position.set(4, 6, 3);
    key.castShadow = true;
    this.scene.add(key);

    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x889099, metalness: 0.8, roughness: 0.35 }),
    );
    this.cube.name = 'PLACEHOLDER_cube';
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.9 }),
    );
    floor.name = 'PLACEHOLDER_floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    this.scene.add(floor);

    addEventListener('resize', this.onResize);
  }

  fixedUpdate(): void {}

  update(dt: number): void {
    this.cube.rotation.y += dt * 0.6;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private onResize = (): void => {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  };
}
