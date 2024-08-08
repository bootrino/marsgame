import { World, System, Entity } from 'perform-ecs';

// Define components
class Position {
    room: string;
    previousRoom?: string;
    constructor(room: string) {
        this.room = room;
    }
}

class Description {
    description: string;
    constructor(description: string) {
        this.description = description;
    }
}

class Movable {
    destination?: string;
    constructor(destination?: string) {
        this.destination = destination;
    }
}

class NPC {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class ObjectComponent {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class Interaction {
    constructor() {}
}

class VisitedRooms {
    rooms: Set<string>;
    constructor() {
        this.rooms = new Set();
    }
}

class Inventory {
    items: Set<string>;
    constructor() {
        this.items = new Set();
    }
}

class Container {
    isOpen: boolean;
    items: Set<string>;

    constructor(isOpen: boolean = false) {
        this.isOpen = isOpen;
        this.items = new Set();
    }
}

class GameState {
    earthquakeOccurred: boolean;
    constructor() {
        this.earthquakeOccurred = false;
    }
}

// Define systems
class MovementSystem extends System {
    update(): void {
        this.entities.forEach(entity => {
            const movable = entity.getComponent(Movable);
            const position = entity.getComponent(Position);
            const npc = entity.getComponent(NPC);

            if (movable && movable.destination) {
                const previousRoom = position.room;
                position.previousRoom = previousRoom;
                position.room = movable.destination;
                movable.destination = undefined;

                // Output messages
                if (npc) {
                    console.log(`${npc.name} leaves the ${previousRoom}.`);
                    console.log(`${npc.name} enters the ${position.room}.`);
                }
            }
        });
    }
}

class DescriptionSystem extends System {
    update(): void {
        this.entities.forEach(entity => {
            const description = entity.getComponent(Description);
            const position = entity.getComponent(Position);
            if (description && position) {
                console.log(`You are in ${position.room}: ${description.description}`);
            }
        });
    }
}

class EventSystem extends System {
    private turnCounter: number = 0;

    update(): void {
        this.turnCounter++;
        if (this.turnCounter === 120) {
            this.triggerEarthquake();
        }
    }

    triggerEarthquake(): void {
        console.log("An earthquake shakes the ship!");
        this.entities.forEach(entity => {
            const position = entity.getComponent(Position);
            const description = entity.getComponent(Description);
            if (position && description && position.room === 'Cryo Room') {
                description.description = 'The room is now rubble and wreckage.';
            }
        });

        // Update global game state
        const gameState = world.getEntity(gameStateEntity).getComponent(GameState);
        gameState.earthquakeOccurred = true;
    }
}

class InteractionSystem extends System {
    update(): void {
        this.entities.forEach(entity => {
            const interaction = entity.getComponent(Interaction);
            if (interaction) {
                const npc = entity.getComponent(NPC);
                if (npc) {
                    this.interactWithFloyd(npc.name);
                }
                entity.removeComponent(Interaction);
            }
        });
    }

    interactWithFloyd(name: string): void {
        if (name === 'Floyd') {
            const responses = [
                "Floyd says: 'Oh boy! I love being with you!'",
                "Floyd says: 'Did you know I once saved the ship from a space weevil invasion?'",
                "Floyd says: 'I'm here to help you, buddy!'",
                "Floyd says: 'Can I help you with something?'"
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            console.log(response);
        }
    }
}

class FloydMovementSystem extends System {
    private roomAdjacency: { [key: string]: { [key: string]: string | null } };

    constructor(roomAdjacency: { [key: string]: { [key: string]: string | null } }) {
        super();
        this.roomAdjacency = roomAdjacency;
    }

    update(): void {
        this.entities.forEach(entity => {
            const npc = entity.getComponent(NPC);
            const position = entity.getComponent(Position);
            if (npc && position && npc.name === 'Floyd') {
                if (Math.random() < 0.5) { // 50% chance to move
                    const adjacentRooms = this.roomAdjacency[position.room];
                    const directions = Object.keys(adjacentRooms).filter(dir => adjacentRooms[dir] !== null);
                    const newRoom = adjacentRooms[directions[Math.floor(Math.random() * directions.length)]];
                    entity.getComponent(Movable).destination = newRoom;
                }
            }
        });
    }
}

class InventorySystem extends System {
    update(): void {
        this.entities.forEach(entity => {
            const inventory = entity.getComponent(Inventory);
            if (inventory) {
                console.log('You are carrying:');
                inventory.items.forEach(item => console.log(item));
            }
        });
    }
}

class ContainerSystem extends System {
    update(): void {
        this.entities.forEach(entity => {
            const container = entity.getComponent(Container);
            const position = entity.getComponent(Position);
            const description = entity.getComponent(Description);
            if (container && position && description) {
                if (container.isOpen) {
                    console.log(`You open the ${description.description}. Inside you see:`);
                    container.items.forEach(item => {
                        console.log(` - ${item}`);
                    });
                } else {
                    console.log(`The ${description.description} is closed.`);
                }
            }
        });
    }

    openContainer(entity: Entity): void {
        const container = entity.getComponent(Container);
        if (container) {
            container.isOpen = true;
            this.update();
        } else {
            console.log("This entity is not a container.");
        }
    }
}

class SomeOtherSystem extends System {
    update(): void {
        const gameState = world.getEntity(gameStateEntity).getComponent(GameState);
        if (gameState.earthquakeOccurred) {
            // Perform actions based on the earthquake occurrence
            console.log("The earthquake has occurred. Adjusting behavior.");
        }

        // Other update logic
    }
}

// Setup the game world
const world = new World();

// Define rooms
const rooms = [
    { name: 'Observation Deck', description: 'A deck with a panoramic view of space.' },
    { name: 'Bridge', description: 'The command center of the ship with a large view screen.' },
    { name: 'Crew Quarters', description: 'A place where the crew rests and sleeps.' },
    { name: 'Med Bay', description: 'A medical facility with various instruments and a sick bay.' },
    { name: 'Engine Room', description: 'The heart of the ship, filled with complex machinery.' },
    { name: 'Cryo Room', description: 'A cold room with cryo chambers lining the walls.' },
    { name: 'Cargo Hold', description: 'A large area filled with crates and supplies.' },
    { name: 'Laboratory', description: 'A lab filled with scientific equipment and experiments.' },
    { name: 'Armory', description: 'A room stocked with weapons and armor.' },
    { name: 'Mess Hall', description: 'The dining area for the crew with tables and food dispensers.' }
];

// Room adjacency map with compass directions and vertical movement
const roomAdjacency = {
    'Observation Deck': { S: 'Bridge' },
    'Bridge': { N: 'Observation Deck', S: 'Engine Room', W: 'Crew Quarters' },
    'Crew Quarters': { E: 'Bridge', S: 'Med Bay' },
    'Med Bay': { N: 'Crew Quarters', W: 'Armory' },
    'Engine Room': { N: 'Bridge', S: 'Cryo Room' },
    'Cryo Room': { N: 'Engine Room', S: 'Cargo Hold' },
    'Cargo Hold': { N: 'Cryo Room', S: 'Laboratory' },
    'Laboratory': { N: 'Cargo Hold', S: 'Mess Hall' },
    'Armory': { E: 'Med Bay' },
    'Mess Hall': { N: 'Laboratory' }
};

// Create room entities
rooms.forEach(room => {
    const roomEntity = world.createEntity();
    roomEntity.addComponent(new Position(room.name));
    roomEntity.addComponent(new Description(room.description));
});

// Create global game state entity
const gameStateEntity = world.createEntity();
const gameState = new GameState();
gameStateEntity.addComponent(gameState);

// Create player entity
const player = world.createEntity();
player.addComponent(new Position('Cryo Room'));
player.addComponent(new Description('A cold room with cryo chambers lining the walls.'));
player.addComponent(new VisitedRooms());
player.addComponent(new Inventory());

// Create NPC entity with container
const floyd = world.createEntity();
floyd.addComponent(new Position('Cryo Room'));
floyd.addComponent(new Description('An NPC named Floyd, who seems friendly.'));
floyd.addComponent(new NPC('Floyd'));
floyd.addComponent(new Movable());
floyd.addComponent(new Container());

// Add an item (screwdriver) to Floyd's container
const floydContainer = floyd.getComponent(Container);
floydContainer.items.add('screwdriver');

// Create object entities
const objects = [
    { name: 'Keycard', room: 'Cryo Room', description: 'A keycard used to access secure areas.' },
    { name: 'Medkit', room: 'Med Bay', description: 'A medical kit for treating injuries.' },
    { name: 'Blaster', room: 'Armory', description: 'A powerful energy weapon.' },
    { name: 'Food Rations', room: 'Mess Hall', description: 'Packets of food for the crew.' },
    { name: 'Scientific Notes', room: 'Laboratory', description: 'Notes on various experiments.' }
];

objects.forEach(obj => {
    const objectEntity = world.createEntity();
    objectEntity.addComponent(new Position(obj.room));
    objectEntity.addComponent(new Description(obj.description));
    objectEntity.addComponent(new ObjectComponent(obj.name));
});

// Add systems to the world
world.addSystem(new MovementSystem());
world.addSystem(new DescriptionSystem());
world.addSystem(new EventSystem());
world.addSystem(new InteractionSystem());
world.addSystem(new FloydMovementSystem(roomAdjacency));
world.addSystem(new InventorySystem());
world.addSystem(new ContainerSystem());
world.addSystem(new SomeOtherSystem());

const moveNPC = (npc: Entity, destination: string) => {
    const movable = npc.getComponent(Movable);
    if (movable) {
        movable.destination = destination;
    }
};

const interactWithNPC = (npc: Entity) => {
    npc.addComponent(new Interaction());
};

const movePlayer = (player: Entity, directionOrRoom: string) => {
    const position = player.getComponent(Position);
    const visitedRooms = player.getComponent(VisitedRooms);
    let newRoom = null;

    // Check if the input is a direction
    if (directionOrRoom in roomAdjacency[position.room]) {
        newRoom = roomAdjacency[position.room][directionOrRoom];
    }

    // Check if the input is a visited room
    if (!newRoom && visitedRooms.rooms.has(directionOrRoom)) {
        newRoom = directionOrRoom;
    }

    if (newRoom) {
        position.previousRoom = position.room;
        position.room = newRoom;
        visitedRooms.rooms.add(newRoom);
        console.log(`You move to the ${newRoom}.`);
    } else {
        console.log('You cannot move in that direction or to that room.');
    }
};

const takeObject = (player: Entity, objectName: string) => {
    const position = player.getComponent(Position);
    const inventory = player.getComponent(Inventory);
    world.entities.forEach(entity => {
        const obj = entity.getComponent(ObjectComponent);
        const objPosition = entity.getComponent(Position);
        if (obj && obj.name === objectName && objPosition.room === position.room) {
            inventory.items.add(objectName);
            entity.removeComponent(Position);
            console.log(`You take the ${objectName}.`);
        }
    });
};

const dropObject = (player: Entity, objectName: string) => {
    const position = player.getComponent(Position);
    const inventory = player.getComponent(Inventory);
    if (inventory.items.has(objectName)) {
        inventory.items.delete(objectName);
        const objectEntity = world.createEntity();
        objectEntity.addComponent(new Position(position.room));
        objectEntity.addComponent(new Description(`A ${objectName} dropped here.`));
        objectEntity.addComponent(new ObjectComponent(objectName));
        console.log(`You drop the ${objectName}.`);
    } else {
        console.log(`You don't have a ${objectName}.`);
    }
};

const examineObject = (objectName: string) => {
    world.entities.forEach(entity => {
        const obj = entity.getComponent(ObjectComponent);
        const description = entity.getComponent(Description);
        if (obj && obj.name === objectName && description) {
            console.log(description.description);
        }
    });
};

const openContainer = (containerName: string) => {
    world.entities.forEach(entity => {
        const obj = entity.getComponent(ObjectComponent);
        const container = entity.getComponent(Container);
        const description = entity.getComponent(Description);
        if (obj && container && description && obj.name === containerName) {
            const containerSystem = world.getSystem(ContainerSystem);
            containerSystem.openContainer(entity);
        }
    });
};

// Command dictionary
const commands = {
    look: () => world.update(1),
    move: (directionOrRoom: string) => movePlayer(player, directionOrRoom),
    take: (objectName: string) => takeObject(player, objectName),
    drop: (objectName: string) => dropObject(player, objectName),
    inventory: () => world.update(1),
    examine: (objectName: string) => examineObject(objectName),
    open: (containerName: string) => openContainer(containerName),
    talk: (npcName: string) => {
        if (npcName === 'Floyd') {
            interactWithNPC(floyd);
        } else {
            console.log('There is no one by that name here.');
        }
    },
    quit: () => {
        gameOver = true;
        console.log('Game over!');
    }
};

// Game state
let gameOver = false;

// Main game loop (turn-based)
const gameLoop = () => {
    if (gameOver) {
        return;
    }

    // Wait for player input
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Enter a command: ', (command: string) => {
        const parts = command.split(' ');
        const action = parts[0];
        const argument = parts.slice(1).join(' ');

        if (action in commands) {
            commands[action](argument);
        } else {
            console.log('Unknown command.');
        }

        readline.close();
        gameLoop();
    });
};

// Start the game loop
gameLoop();
