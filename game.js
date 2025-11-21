const config = {
    type: Phaser.AUTO,
    width: 360, // Mobile portrait width
    height: 640, // Mobile portrait height
    backgroundColor: '#4da6ff', // Grass green-ish
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let elixir = 5;
let elixirText;
let enemies;
let allies;
let enemyTower;
let playerTower;

function preload() {
    // In a real game, load images here. We will use colored rectangles for now.
    // this.load.image('knight', 'assets/knight.png');
}

function create() {
    // 1. Draw the Arena (Simple River and Bridges)
    let river = this.add.rectangle(180, 320, 360, 40, 0x0000ff); // Blue river
    let bridge = this.add.rectangle(180, 320, 60, 45, 0x8b4513); // Brown bridge

    // 2. Create Towers
    enemyTower = this.physics.add.sprite(180, 50, null).setTint(0xff0000); // Red Enemy
    enemyTower.setDisplaySize(40, 40);
    enemyTower.health = 1000;
    
    playerTower = this.physics.add.sprite(180, 590, null).setTint(0x0000ff); // Blue Player
    playerTower.setDisplaySize(40, 40);
    playerTower.health = 1000;

    // 3. Groups for Units
    allies = this.physics.add.group();
    enemies = this.physics.add.group();

    // 4. UI - Elixir Bar
    let uiBg = this.add.rectangle(180, 620, 360, 40, 0x222222);
    elixirText = this.add.text(10, 610, 'Elixir: 5', { fontSize: '20px', fill: '#fff' });

    // 5. Elixir Regeneration Loop (1 elixir every 2 seconds)
    this.time.addEvent({
        delay: 2000,
        callback: () => {
            if (elixir < 10) elixir++;
            updateUI();
        },
        loop: true
    });

    // 6. Input (Tap to Spawn Unit)
    // Logic: If you tap lower half, spawn ally. If upper half, ignore (can't spawn in enemy zone)
    this.input.on('pointerdown', (pointer) => {
        if (pointer.y > 320 && elixir >= 3) {
            spawnAlly(this, pointer.x, pointer.y);
            elixir -= 3;
            updateUI();
        }
    });

    // 7. Simple Enemy AI (Spawns a unit every 5 seconds)
    this.time.addEvent({
        delay: 5000,
        callback: () => {
            spawnEnemy(this, 180, 100); // Spawn at top center
        },
        loop: true
    });
    
    // 8. Collision / Combat Logic
    this.physics.add.overlap(allies, enemies, handleCombat, null, this);
    this.physics.add.overlap(allies, enemyTower, attackTower, null, this);
    this.physics.add.overlap(enemies, playerTower, attackTower, null, this);
}

function update() {
    // Move Allies up
    allies.children.iterate((unit) => {
        if (unit && unit.active) {
            this.physics.moveToObject(unit, enemyTower, 60); // Speed 60
        }
    });

    // Move Enemies down
    enemies.children.iterate((unit) => {
        if (unit && unit.active) {
            this.physics.moveToObject(unit, playerTower, 60);
        }
    });
}

// --- Helper Functions ---

function spawnAlly(scene, x, y) {
    // Create a simple blue square unit
    let unit = scene.physics.add.sprite(x, y, null);
    unit.setTint(0x00ffff);
    unit.setDisplaySize(20, 20);
    unit.health = 100;
    allies.add(unit);
}

function spawnEnemy(scene, x, y) {
    // Create a simple red square unit
    let unit = scene.physics.add.sprite(x, y, null);
    unit.setTint(0xff4444);
    unit.setDisplaySize(20, 20);
    unit.health = 100;
    enemies.add(unit);
}

function updateUI() {
    elixirText.setText('Elixir: ' + elixir);
}

function handleCombat(ally, enemy) {
    // Simple instant kill logic for demo purposes
    // In real game: reduce HP, stop movement while attacking
    enemy.health -= 1;
    ally.health -= 1;

    if (enemy.health <= 0) enemy.destroy();
    if (ally.health <= 0) ally.destroy();
}

function attackTower(unit, tower) {
    tower.health -= 1;
    unit.destroy(); // Kamikaze style for this simple demo
    
    if (tower.health <= 0) {
        // Win condition
        tower.setTint(0x555555); // Darken to show destroyed
        alert("Tower Destroyed!");
        game.scene.pause("default");
    }
}
