import { customAlphabet } from 'nanoid';

interface GetNewDiagram {
    ruleName: string;
    newDMNDiagram: string;
}

const getNewDMNDiagram = (): GetNewDiagram => {
    const alphabets = '0123456789abcdefghijklmnopqrstuvwxyz';
    const getUniqueID = customAlphabet(alphabets, 7);
    const ruleID = getUniqueID();
    const ruleName = `Decision_${ruleID}`;

    const newDMNDiagram =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        `<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="Definitions_1" name="Definitions_1" namespace="http://camunda.org/schema/1.0/dmn">\n` +
        `  <decision id="Decision_${ruleID}" name="Decision 1">\n` +
        '    <decisionTable id="DecisionTable_014m7wx">\n' +
        '      <input id="Input_1">\n' +
        '        <inputExpression id="InputExpression_1" typeRef="string">\n' +
        '          <text></text>\n' +
        '        </inputExpression>\n' +
        '      </input>\n' +
        '      <output id="Output_1" typeRef="string" />\n' +
        '    </decisionTable>\n' +
        '  </decision>\n' +
        '  <dmndi:DMNDI>\n' +
        '    <dmndi:DMNDiagram>\n' +
        '    </dmndi:DMNDiagram>\n' +
        '  </dmndi:DMNDI>\n' +
        '</definitions>\n';
    return { ruleName, newDMNDiagram };
};

export default getNewDMNDiagram;
