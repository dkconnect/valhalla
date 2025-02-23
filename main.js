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







---------------- new ---------------------

// ChatManager is already imported in the current scope.

const baseStyle = `
    font-family: 'Trebuchet MS', serif;
    font-size: 20px;
    border: 2px solid #4e342e;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.9);
`;

const chatLogStyle = `
    ${baseStyle}
    width: 240px;
    height: 570px;
    background-color: rgba(0, 0, 0, 0.0);
    padding: 10px;
    direction: ltr;
    box-shadow: none;
    border: none;
    overflow-y: auto;
`;

const inputStyle = `
    ${baseStyle}
    width: 270px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: none;
`;

const sendButtonStyle = `
    ${baseStyle}
    width: 270px;
    height: 44px;
    color: #e0d7c5;
    background: linear-gradient(to bottom, #957d5f, #6c543e);
    box-shadow: none;
`;

const closeButtonStyle = `
    ${baseStyle}
    width: 30px;
    height: 30px;
    border-radius: 30px; // makes the button circular
    color: #fff; // white text color
    background-color: #ff6347; // tomato red background
    font-size: 30px; // larger font size for the 'X'
    text-align: center; // centers the 'X' in the button
    line-height: 30px; // vertically centers the 'X' in the button
    cursor: pointer; // changes cursor to pointer on hover
`;

class ChatScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'ChatScene'
        });
        this.gameState = {
            currentQuest: null,
            questProgress: 0,
            hasSpokenToNPC: new Set(),
            inventory: new Set()
        };
    }
    preload() {
        this.load.image('background', 'https://play.rosebud.ai/assets/forest_rpg_stage.png?TzbC');
        this.load.image('player', 'https://play.rosebud.ai/assets/character_04.png?Poo4'); // Using character_04 for Viking-like appearance
        this.load.image('scroll', `https://play.rosebud.ai/assets/scroll_bg.png?dShX`);
        this.load.bitmapFont('roboto', 'https://play.rosebud.ai/assets/rosebud_roboto.png?xgsY', 'https://play.rosebud.ai/assets/rosebud_roboto.xml?B7yh');
    }

    create() {
        this.add.image(550, 445, 'background').setScale(0.5);
        this.add.image(1225, 445, 'scroll');
        // Create Van Erikson - our Viking hero
        this.player = this.physics.add.image(360, 300, 'player');
        this.addPlayerBreathingAnimation(this.player);
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.5);
        this.player.setInteractive();
        this.player.setDepth(1); // Ensure player renders above background

        // Add movement dampening for smoother stops
        this.player.setDrag(1000);
        this.player.setAngularDrag(100);

        // Add name bar for Van Erikson
        this.playerNameBar = this.addNameBar(this.player, 'Van Erikson');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.isChatOpen = false;
        this.chatDialogs = new Map();
        // Add NPCs with quests
        this.npc01 = new NPC(this, 600, 500, 'character_01',
            'You are a wise elder of the village seeking help to gather magical herbs. You speak with authority and wisdom.',
            'Elder Sage');
        this.npc01.setScale(0.5);
        this.npc01.quest = {
            id: 'gather_herbs',
            title: 'Gather Magical Herbs',
            description: 'The village needs magical herbs for healing potions.',
            status: 'inactive'
        };
        this.npc02 = new NPC(this, 800, 650, 'character_02',
            'You are a mysterious merchant with rare artifacts. You speak in riddles and trade in secrets.',
            'Merchant Mystique');
        this.npc02.setScale(0.5);
        this.npc02.quest = {
            id: 'find_artifact',
            title: 'Search for Lost Artifact',
            description: 'A powerful artifact has been lost in the forest.',
            status: 'inactive'
        };
        // Add quest UI elements
        this.questText = this.add.bitmapText(20, 20, 'roboto', 'Current Quest: None', 20)
            .setScrollFactor(0)
            .setDepth(1000);
        // Add colliders
        this.physics.add.collider(this.player, [this.npc01, this.npc02]);
    }

    addNameBar(character, name) {
        const nameBar = this.add.graphics();
        nameBar.fillStyle(0x000000, 0.7);
        const nameWidth = Math.max(name.length * 12, 100); // Adjust base on name length
        nameBar.fillRoundedRect(-nameWidth / 2, -125, nameWidth, 30, 15);
        const nameText = this.add.bitmapText(0, -110, 'roboto', name, 20).setOrigin(0.5);

        const container = this.add.container(character.x, character.y, [nameBar, nameText]);

        character.on('destroy', () => {
            container.destroy();
        });

        return container;
    }

    update() {
        // Update Van Erikson's name bar position
        if (this.playerNameBar) {
            this.playerNameBar.setPosition(this.player.x, this.player.y);
        }
        if (this.isChatOpen) {
            if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
                this.closeChat();
            }
            return;
        }

        const speed = 5; // Increased base speed
        this.player.setVelocity(0);
        // Diagonal movement
        let moveX = 0;
        let moveY = 0;
        if (this.cursors.left.isDown) {
            moveX = -1;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            moveX = 1;
            this.player.setFlipX(false);
        }
        if (this.cursors.up.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown) {
            moveY = 1;
        }
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const normalizedSpeed = Math.sqrt(0.5);
            moveX *= normalizedSpeed;
            moveY *= normalizedSpeed;
        }
        // Apply movement
        this.player.setVelocityX(moveX * speed * 60);
        this.player.setVelocityY(moveY * speed * 60);
        // Add breathing effect based on movement
        if (moveX !== 0 || moveY !== 0) {
            this.player.scaleX = this.player.scaleX * 0.99;
            this.player.scaleY = this.player.scaleY * 1.01;
        } else {
            this.player.scaleX = 0.5;
            this.player.scaleY = 0.5;
        }

    }

    addBreathingAnimation(sprite, duration, scale) {
        this.tweens.add({
            targets: sprite,
            scaleX: sprite.scaleX * scale,
            scaleY: sprite.scaleY * scale,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    addPlayerBreathingAnimation(sprite) {
        this.addBreathingAnimation(sprite, 1000, 0.55);
    }

    addNPC01BreathingAnimation(sprite) {
        this.addBreathingAnimation(sprite, 1100, 0.54);
    }

    addNPC02BreathingAnimation(sprite) {
        this.addBreathingAnimation(sprite, 950, 0.56);
    }

    addNPC03BreathingAnimation(sprite) {
        this.addBreathingAnimation(sprite, 1050, 0.53);
    }

    playerInRange(npc) {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        return distance < 230;
    }

    openChat(npc) {
        if (this.isChatOpen) return;
        this.isChatOpen = true;

        const uniqueIdSuffix = npc.characterDescription.replace(/\s+/g, '-').toLowerCase();

        if (this.chatDialogs.has(npc)) {
            const dialog = this.chatDialogs.get(npc);
            dialog.chatLog.setVisible(true);
            dialog.chatInput.setVisible(true);
            dialog.sendButton.setVisible(true);
            dialog.closeButton.setVisible(true);
            dialog.chatInput.node.focus();
        } else {
            const chatLog = this.add.dom(1230, 400).createFromHTML(`
                <div id="${npc.chatLogId}" style="${chatLogStyle}"></div>`);

            const chatInputId = `chatInput-${uniqueIdSuffix}`;
            const chatInput = this.add.dom(1220, 720).createFromHTML(`
                <input type="text" id="${chatInputId}" style="${inputStyle}" />`);

            const sendButtonId = `sendButton-${uniqueIdSuffix}`;
            const sendButton = this.add.dom(1220, 770).createFromHTML(`
                <button id="${sendButtonId}" style="${sendButtonStyle}">Send</button>`);

            const closeButtonId = `closeButton-${uniqueIdSuffix}`;
            const closeButton = this.add.dom(1350, 115).createFromHTML(`
                <button id="${closeButtonId}" style="${closeButtonStyle}">X</button>`);

            chatInput.node.addEventListener('keydown', (event) => {
                event.stopPropagation();
                if (event.key === "Enter" || event.keyCode === 13) {
                    this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
                }
            });

            sendButton.addListener('click').on('click', () => {
                this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
            });

            closeButton.addListener('click').on('click', () => {
                this.closeChat();
            });

            chatInput.node.focus();

            this.chatDialogs.set(npc, {
                chatLog,
                chatInput,
                sendButton,
                closeButton
            });
        }
    }

    closeChat() {
        if (!this.isChatOpen) return;
        this.isChatOpen = false;

        for (let dialog of this.chatDialogs.values()) {
            dialog.chatLog.setVisible(false);
            dialog.chatInput.setVisible(false);
            dialog.sendButton.setVisible(false);
            dialog.closeButton.setVisible(false);
        }
    }

    updateChatLog(chatLogNode, role, message, characterName) {
        const color = role === 'Player' ? '#3d1e01' : '#8a0094';
        const displayName = role === 'Player' ? 'Player' : characterName;
        chatLogNode.innerHTML += `<p style="color: ${color}; font-family: 'roboto', sans-serif;">${displayName}: ${message}</p>`;
        chatLogNode.scrollTop = chatLogNode.scrollHeight;
    }

    async sendChatMessage(npc, chatManager, chatInputId, chatLogId) {
        const chatInputNode = document.getElementById(chatInputId);
        const chatLogNode = document.getElementById(chatLogId);
        if (chatInputNode && chatLogNode) {
            const inputValue = chatInputNode.value;
            if (inputValue) {
                // Check for quest-related keywords
                if (this.checkQuestTriggers(inputValue.toLowerCase(), npc)) {
                    chatInputNode.value = '';
                    return;
                }
                chatManager.addMessage('user', inputValue);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Player', inputValue, 'Player');
                const response = await chatManager.getCharacterResponse();
                chatManager.addMessage('assistant', response);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Character', response, npc.name);
                chatInputNode.value = '';
            }
        }
    }
    checkQuestTriggers(input, npc) {
        if (input.includes('quest') || input.includes('help') || input.includes('task')) {
            if (npc.quest && npc.quest.status === 'inactive') {
                this.startQuest(npc.quest);
                this.updateChatLog(
                    document.getElementById(npc.chatLogId),
                    'Character',
                    `New Quest: ${npc.quest.title}\n${npc.quest.description}`,
                    npc.name
                );
                return true;
            }
        }
        return false;
    }
    startQuest(quest) {
        this.gameState.currentQuest = quest;
        quest.status = 'active';
        this.questText.setText(`Current Quest: ${quest.title}`);
    }
    completeQuest(quest) {
        quest.status = 'completed';
        this.gameState.currentQuest = null;
        this.questText.setText('Current Quest: None');
        // Add rewards or consequences here
    }
    async sendChatMessage(npc, chatManager, chatInputId, chatLogId) {
        const chatInputNode = document.getElementById(chatInputId);
        const chatLogNode = document.getElementById(chatLogId);

        if (chatInputNode && chatLogNode) {
            const inputValue = chatInputNode.value;
            if (inputValue) {
                chatManager.addMessage('user', inputValue);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Player', inputValue, 'Player');

                const response = await chatManager.getCharacterResponse();
                chatManager.addMessage('assistant', response);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Character', response, npc.name);

                chatInputNode.value = '';
            }
        }
    }
}

class NPC extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, characterDescription, name) {
        super(scene, x, y, key);

        this.scene = scene;
        this.characterDescription = characterDescription;
        this.chatLogId = 'chatLogContent-' + characterDescription.replace(/\s+/g, '-').toLowerCase();
        this.name = name;

        this.setInteractive();
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.body.setSize(this.width * 0.5, this.height * 0.5);

        this.chatManager = new ChatManager(characterDescription);

        this.scene.addBreathingAnimation(this);
        this.nameBar = this.scene.addNameBar(this, name);
    }

    setCursorStyle() {
        this.on('pointerover', () => {
            if (this.scene.playerInRange(this)) {
                this.scene.input.setDefaultCursor('pointer');
            }
        });

        this.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default');
        });
    }

    updateNameBarPosition() {
        if (this.nameBar) {
            this.nameBar.setPosition(this.x, this.y);
        }
    }
}

const config = {
    parent: 'renderDiv',
    type: Phaser.AUTO,
    scene: ChatScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1400,
        height: 890,
    },
    dom: {
        createContainer: true
    },
    input: {
        keyboard: {
            capture: [37, 38, 39, 40]
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

window.phaserGame = new Phaser.Game(config);
