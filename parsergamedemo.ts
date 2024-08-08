// Define the types and interfaces for our parser and game world

interface Word {
    word: string;
    type: WordType;
}

type WordType = 'verb' | 'noun' | 'adjective' | 'preposition' | 'connector' | 'pronoun' | 'unknown';

interface Command {
    action: string;
    object?: string;
    indirectObject?: string;
    preposition?: string;
}

interface Room {
    description: string;
    items: string[];
    exits: { [direction: string]: string };
}

interface GameWorld {
    rooms: { [name: string]: Room };
    playerLocation: string;
    inventory: string[];
}

// Comprehensive dictionary containing known words and their types
const dictionary: { [key: string]: WordType } = {
    take: 'verb',
    get: 'verb',
    pick: 'verb',
    drop: 'verb',
    put: 'verb',
    move: 'verb',
    open: 'verb',
    close: 'verb',
    read: 'verb',
    look: 'verb',
    examine: 'verb',
    eat: 'verb',
    drink: 'verb',
    go: 'verb',
    walk: 'verb',
    climb: 'verb',
    apple: 'noun',
    book: 'noun',
    door: 'noun',
    key: 'noun',
    box: 'noun',
    lamp: 'noun',
    sword: 'noun',
    coin: 'noun',
    table: 'noun',
    chair: 'noun',
    rope: 'noun',
    ladder: 'noun',
    window: 'noun',
    bed: 'noun',
    red: 'adjective',
    blue: 'adjective',
    green: 'adjective',
    old: 'adjective',
    new: 'adjective',
    small: 'adjective',
    large: 'adjective',
    shiny: 'adjective',
    rusty: 'adjective',
    with: 'preposition',
    in: 'preposition',
    on: 'preposition',
    at: 'preposition',
    under: 'preposition',
    over: 'preposition',
    behind: 'preposition',
    beside: 'preposition',
    and: 'connector',
    then: 'connector',
    it: 'pronoun',
    them: 'pronoun'
};

/**
 * Tokenize the input string into words.
 * @param input - The input string to tokenize.
 * @returns An array of words.
 */
function tokenize(input: string): string[] {
    return input.toLowerCase().match(/\b(\w+)\b/g) || [];
}

/**
 * Classify each word in the input using the dictionary.
 * @param words - Array of tokenized words.
 * @returns An array of classified words.
 */
function classifyWords(words: string[]): Word[] {
    return words.map(word => ({
        word,
        type: dictionary[word] || 'unknown'
    }));
}

/**
 * Parse the classified words into a command.
 * @param words - Array of classified words.
 * @returns Parsed command.
 */
function parseCommand(words: Word[]): Command | null {
    const command: Command = { action: '', object: '', indirectObject: '', preposition: '' };
    let currentWordIndex = 0;

    while (currentWordIndex < words.length) {
        const word = words[currentWordIndex];
        switch (word.type) {
            case 'verb':
                command.action = word.word;
                break;
            case 'noun':
                if (!command.object) {
                    command.object = word.word;
                } else {
                    command.indirectObject = word.word;
                }
                break;
            case 'preposition':
                command.preposition = word.word;
                break;
        }
        currentWordIndex++;
    }

    if (!command.action) {
        return null;
    }

    return command;
}

/**
 * Main function to parse input into a command.
 * @param input - The input string from the user.
 * @returns Parsed command.
 */
function parseInput(input: string): Command | null {
    const tokens = tokenize(input);
    const classifiedWords = classifyWords(tokens);
    return parseCommand(classifiedWords);
}

function executeCommand(command: Command | null, world: GameWorld): string {
    if (!command) {
        return "I don't understand that.";
    }

    switch (command.action) {
        case 'take':
            return takeItem(command.object, world);
        case 'drop':
            return dropItem(command.object, world);
        case 'look':
            return lookAround(world);
        case 'go':
            return movePlayer(command.preposition, world);
        default:
            return "I don't know how to do that.";
    }
}

function takeItem(item: string | undefined, world: GameWorld): string {
    if (!item) {
        return "Take what?";
    }
    const room = world.rooms[world.playerLocation];
    if (room.items.includes(item)) {
        room.items = room.items.filter(i => i !== item);
        world.inventory.push(item);
        return `You take the ${item}.`;
    } else {
        return `There is no ${item} here.`;
    }
}

function dropItem(item: string | undefined, world: GameWorld): string {
    if (!item) {
        return "Drop what?";
    }
    if (world.inventory.includes(item)) {
        world.inventory = world.inventory.filter(i => i !== item);
        world.rooms[world.playerLocation].items.push(item);
        return `You drop the ${item}.`;
    } else {
        return `You don't have a ${item}.`;
    }
}

function lookAround(world: GameWorld): string {
    const room = world.rooms[world.playerLocation];
    const itemsDescription = room.items.length > 0 ? `You see ${room.items.join(', ')}.` : "There's nothing here.";
    return `${room.description} ${itemsDescription}`;
}

function movePlayer(direction: string | undefined, world: GameWorld): string {
    if (!direction) {
        return "Go where?";
    }
    const room = world.rooms[world.playerLocation];
    const newLocation = room.exits[direction];
    if (newLocation) {
        world.playerLocation = newLocation;
        return lookAround(world);
    } else {
        return "You can't go that way.";
    }
}

// Main game loop
function gameLoop(input: string, world: GameWorld): string {
    const command = parseInput(input);
    return executeCommand(command, world);
}

// Define the game world
const gameWorld: GameWorld = {
    rooms: {
        'start': {
            description: 'You are in a small room with a table. There is a door to the north.',
            items: ['apple', 'key'],
            exits: { 'north': 'hallway' }
        },
        'hallway': {
            description: 'You are in a hallway. There are doors to the south and east.',
            items: [],
            exits: { 'south': 'start', 'east': 'kitchen' }
        },
        'kitchen': {
            description: 'You are in a kitchen. There is a shiny lamp here. The hallway is to the west.',
            items: ['lamp'],
            exits: { 'west': 'hallway' }
        }
    },
    playerLocation: 'start',
    inventory: []
};

// Example usage
let currentWorld = JSON.parse(JSON.stringify(gameWorld)); // Deep copy to reset world
console.log(gameLoop("look", currentWorld)); // Look around the initial room
console.log(gameLoop("take apple", currentWorld)); // Take the apple
console.log(gameLoop("go north", currentWorld)); // Move to the hallway
console.log(gameLoop("look", currentWorld)); // Look around the hallway
console.log(gameLoop("go east", currentWorld)); // Move to the kitchen
console.log(gameLoop("look", currentWorld)); // Look around the kitchen
console.log(gameLoop("take lamp", currentWorld)); // Take the lamp
console.log(gameLoop("go west", currentWorld)); // Move back to the hallway
console.log(gameLoop("go south", currentWorld)); // Move back to the starting room
console.log(gameLoop("drop apple", currentWorld)); // Drop the apple
