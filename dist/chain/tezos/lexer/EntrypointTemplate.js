"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
const moo = require("moo");
const lexer = moo.compile({
    wspace: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    annot: /:[^ );]+|%[^ );]+/,
    parameter: 'parameter',
    or: 'or',
    pair: 'pair',
    data: ['int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit'],
    singleArgType: ['option', 'list', 'contract'],
    semicolon: ';'
});
const breakParameter = (d) => { return d[2]; };
const branchOrWithAnnot = (d) => {
    const leftEntrypoints = d[6];
    const rightEntrypoints = d[8];
    const branchedEntrypoints = [];
    for (const leftEntrypoint of leftEntrypoints) {
        const branchedEntrypoint = {
            name: leftEntrypoint.name,
            parameters: leftEntrypoint.parameters,
            structure: '(Left ' + leftEntrypoint.structure + ')',
            generateParameter: leftEntrypoint.generateParameter
        };
        branchedEntrypoints.push(branchedEntrypoint);
    }
    for (const rightEntrypoint of rightEntrypoints) {
        const branchedEntrypoint = {
            name: rightEntrypoint.name,
            parameters: rightEntrypoint.parameters,
            structure: '(Right ' + rightEntrypoint.structure + ')',
            generateParameter: rightEntrypoint.generateParameter
        };
        branchedEntrypoints.push(branchedEntrypoint);
    }
    return branchedEntrypoints;
};
const branchOr = (d) => {
    const leftEntrypoints = d[4];
    const rightEntrypoints = d[6];
    const branchedEntrypoints = [];
    for (const leftEntrypoint of leftEntrypoints) {
        const branchedEntrypoint = {
            name: leftEntrypoint.name,
            parameters: leftEntrypoint.parameters,
            structure: '(Left ' + leftEntrypoint.structure + ')',
            generateParameter: leftEntrypoint.generateParameter
        };
        branchedEntrypoints.push(branchedEntrypoint);
    }
    for (const rightEntrypoint of rightEntrypoints) {
        const branchedEntrypoint = {
            name: rightEntrypoint.name,
            parameters: rightEntrypoint.parameters,
            structure: '(Right ' + rightEntrypoint.structure + ')',
            generateParameter: rightEntrypoint.generateParameter
        };
        branchedEntrypoints.push(branchedEntrypoint);
    }
    return branchedEntrypoints;
};
const mergePairWithAnnot = (d) => {
    const annot = d[4];
    const firstEntrypoints = d[6];
    const secondEntrypoints = d[8];
    const pairedEntrypoints = [];
    for (const firstEntrypoint of firstEntrypoints) {
        for (const secondEntrypoint of secondEntrypoints) {
            const pairedEntrypoint = {
                name: annot.toString(),
                parameters: firstEntrypoint.parameters.concat(secondEntrypoint.parameters),
                structure: `(Pair ${firstEntrypoint.structure} ${secondEntrypoint.structure})`,
                generateParameter: firstEntrypoint.generateParameter
            };
            pairedEntrypoints.push(pairedEntrypoint);
        }
    }
    return pairedEntrypoints;
};
const mergePair = (d) => {
    const firstEntrypoints = d[4];
    const secondEntrypoints = d[6];
    const pairedEntrypoints = [];
    for (const firstEntrypoint of firstEntrypoints) {
        for (const secondEntrypoint of secondEntrypoints) {
            let pairedEntrypointName = undefined;
            if (firstEntrypoint.name != undefined) {
                pairedEntrypointName = firstEntrypoint.name;
            }
            else if (secondEntrypoint.name != undefined) {
                pairedEntrypointName = secondEntrypoint.name;
            }
            const pairedEntrypoint = {
                name: pairedEntrypointName,
                parameters: firstEntrypoint.parameters.concat(secondEntrypoint.parameters),
                structure: `(Pair ${firstEntrypoint.structure} ${secondEntrypoint.structure})`,
                generateParameter: firstEntrypoint.generateParameter
            };
            pairedEntrypoints.push(pairedEntrypoint);
        }
    }
    return pairedEntrypoints;
};
const recordSingleArgTypeWithAnnot = (d) => {
    const singleArgType = d[0].toString();
    const annot = d[2].toString();
    const entrypoints = d[4];
    entrypoints[0].parameters[0].name = annot;
    entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
    entrypoints[0].structure = `(${entrypoints[0].structure})`;
    return entrypoints;
};
const recordSingleArgType = (d) => {
    const singleArgType = d[0].toString();
    const entrypoints = d[2];
    entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
    entrypoints[0].structure = `(${entrypoints[0].structure})`;
    return entrypoints;
};
const stripParen = (d) => { return d[2]; };
const recordDataWithAnnot = (d) => {
    const annot = d[2].toString();
    let parameterName = undefined;
    let entrypointName = undefined;
    if (annot.charAt(0) === '%') {
        entrypointName = annot;
    }
    else {
        parameterName = annot;
    }
    const parameter = {
        name: parameterName,
        type: d[0].toString()
    };
    const entrypoint = {
        name: entrypointName,
        parameters: [parameter],
        structure: '$PARAM',
        generateParameter(...vars) {
            let invocationParameter = this.structure;
            for (let i = 0; i < this.parameters.length; i++) {
                invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
            }
            return invocationParameter;
        }
    };
    return [entrypoint];
};
const recordData = (d) => {
    const parameter = {
        name: undefined,
        type: d[0].toString()
    };
    const entrypoint = {
        name: undefined,
        parameters: [parameter],
        structure: '$PARAM',
        generateParameter(...vars) {
            let invocationParameter = this.structure;
            for (let i = 0; i < this.parameters.length; i++) {
                invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
            }
            return invocationParameter;
        }
    };
    return [entrypoint];
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "entry", "symbols": [(lexer.has("parameter") ? { type: "parameter" } : parameter), "_", "parameters", "_", (lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": breakParameter },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": branchOrWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": branchOr },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": mergePairWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": mergePair },
    { "name": "parameters", "symbols": [(lexer.has("singleArgType") ? { type: "singleArgType" } : singleArgType), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters"], "postprocess": recordSingleArgTypeWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("singleArgType") ? { type: "singleArgType" } : singleArgType), "_", "parameters"], "postprocess": recordSingleArgType },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": stripParen },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data), "_", (lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": recordDataWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data)], "postprocess": recordData },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"] }
];
exports.ParserStart = "entry";
//# sourceMappingURL=EntrypointTemplate.js.map