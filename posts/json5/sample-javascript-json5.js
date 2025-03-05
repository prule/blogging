// The value assigned to sample here is a direct copy of the json5 content
const sample = {
    // Main title of the document
    title: 'json5 javascript example',
    // JSON5 allows single quotes
    number: 123,
    // Numbers remain the same
    boolean: true,
    // Booleans remain the same
    nested: {
        a: 'b',
        // No need for quotes on simple property names
    },
    // Trailing commas are allowed
    multiLineString: "this is \
                   a multi-line string",
    // Multi-line strings
}
console.log("Sample: ", sample);
