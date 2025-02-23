import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
    EffectComposer
} from 'three/addons/postprocessing/EffectComposer.js';
import {
    RenderPass
} from 'three/addons/postprocessing/RenderPass.js';
import {
    UnrealBloomPass
} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
    SMAAPass
} from 'three/addons/postprocessing/SMAAPass.js';

// Initialize loading manager
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
let assetsLoaded = false;

const parentDiv = document.getElementById('renderDiv');
let canvas = document.getElementById('threeRenderCanvas');
if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'threeRenderCanvas';
    parentDiv.appendChild(canvas);
}

// Create loading screen
const loadingScreen = document.createElement('div');
loadingScreen.style.position = 'absolute';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
loadingScreen.style.color = 'white';
loadingScreen.style.display = 'flex';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.fontSize = '24px';
loadingScreen.innerHTML = 'Loading... 0%';
parentDiv.appendChild(loadingScreen);

// Loading manager events
loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    const progress = ((itemsLoaded / itemsTotal) * 100).toFixed(0);
    loadingScreen.innerHTML = `Loading... ${progress}%`;
};

loadingManager.onLoad = function() {
    assetsLoaded = true;
    loadingScreen.style.display = 'none';
};

// Initialize the scene
const scene = new THREE.Scene();
// Character creation
const characterGeometry = new THREE.Group();
// Create arms
const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
const armMaterial = new THREE.MeshStandardMaterial({
    color: 0x2194ce
});
// Left arm
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.65, 1, 0);
leftArm.rotation.z = -0.3;
leftArm.castShadow = true;
characterGeometry.add(leftArm);
// Right arm
const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.65, 1, 0);
rightArm.rotation.z = 0.3;
rightArm.castShadow = true;
characterGeometry.add(rightArm);
// Create body
const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2194ce
});
const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
bodyMesh.position.y = 0.75;
bodyMesh.castShadow = true;
characterGeometry.add(bodyMesh);
// Create head
const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xec9f83
});
const headMesh = new THREE.Mesh(headGeometry, headMaterial);
headMesh.position.y = 1.75;
headMesh.castShadow = true;
characterGeometry.add(headMesh);
// Position the whole character
characterGeometry.position.set(0, 0, 0);
// Create sword
const swordGroup = new THREE.Group();
// Sword blade
const bladeGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2
});
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 0.6;
swordGroup.add(blade);
// Sword handle
const handleGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3000
});
const handle = new THREE.Mesh(handleGeometry, handleMaterial);
handle.position.y = -0.15;
swordGroup.add(handle);
// Sword guard
const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
const guard = new THREE.Mesh(guardGeometry, bladeMaterial);
swordGroup.add(guard);
// Position sword relative to right arm
swordGroup.position.set(0.8, 1, 0.2);
swordGroup.rotation.z = 0.3;
characterGeometry.add(swordGroup);
// Create axe
const axeGroup = new THREE.Group();
// Axe handle
const axeHandleGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1);
const axeHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3000
});
const axeHandle = new THREE.Mesh(axeHandleGeometry, axeHandleMaterial);
axeGroup.add(axeHandle);
// Axe head
const axeHeadGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
const axeHeadMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.8,
    roughness: 0.2
});
const axeHead = new THREE.Mesh(axeHeadGeometry, axeHeadMaterial);
axeHead.position.set(0.2, 0.5, 0);
axeGroup.add(axeHead);
// Position axe relative to left arm
axeGroup.position.set(-0.8, 1, 0.2);
axeGroup.rotation.z = -0.3;
characterGeometry.add(axeGroup);
scene.add(characterGeometry);
// Enemy class definition
class Enemy {
    constructor(position) {
        this.health = 100;
        this.group = new THREE.Group();

        // Enemy body
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000
        }); // Dark red
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.position.y = 0.75;
        this.bodyMesh.castShadow = true;
        this.group.add(this.bodyMesh);

        // Enemy head
        const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000
        });
        this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
        this.headMesh.position.y = 1.75;
        this.headMesh.castShadow = true;
        this.group.add(this.headMesh);

        // Enemy weapon (sword)
        const swordGroup = new THREE.Group();
        const bladeGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.8,
            roughness: 0.2
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 0.5;
        swordGroup.add(blade);

        const handleGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = -0.15;
        swordGroup.add(handle);

        swordGroup.position.set(0.7, 1, 0);
        this.group.add(swordGroup);

        // Set initial position
        this.group.position.copy(position);

        // Add to scene
        scene.add(this.group);

        // Initialize properties
        this.detectionRadius = 10;
        this.attackRadius = 2;
        this.moveSpeed = 0.05;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second cooldown
    }

    update(playerPosition) {
        const distanceToPlayer = this.group.position.distanceTo(playerPosition);

        // Check if player is within detection radius
        if (distanceToPlayer <= this.detectionRadius) {
            // Move towards player if not in attack range
            if (distanceToPlayer > this.attackRadius) {
                const direction = new THREE.Vector3()
                    .subVectors(playerPosition, this.group.position)
                    .normalize();
                this.group.position.add(direction.multiplyScalar(this.moveSpeed));

                // Rotate enemy to face player
                this.group.lookAt(playerPosition);
            } else {
                // Attack if in range and cooldown is complete
                const currentTime = Date.now();
                if (currentTime - this.lastAttackTime >= this.attackCooldown) {
                    this.attack();
                    this.lastAttackTime = currentTime;
                }
            }
        }
    }

    attack() {
        this.isAttacking = true;
        // Add attack animation here later
        setTimeout(() => {
            this.isAttacking = false;
        }, 500);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        scene.remove(this.group);
        // Add death animation or particle effects here later
    }
}

