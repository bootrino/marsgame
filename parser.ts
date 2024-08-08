// Define the types and interfaces for our parser

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

// Example usage
const input = "take the red apple with the key";
const command = parseInput(input);
console.log(command);
