import React, { useReducer } from 'react';
import { UPDATE_RULE_TABLE, TABLE_INITIAL_STATE } from 'constants/actions';
import RuleContext from './rule-context';
import ruleReducer from './rule-reducer';

const RuleState = ({ children }) => {
    const [ruleState, dispatch] = useReducer(ruleReducer, TABLE_INITIAL_STATE);

    const updateRuleTableData = (data) => {
        dispatch({ type: UPDATE_RULE_TABLE, payload: data });
    };

    return (
        <RuleContext.Provider value={{ ruleTableData: ruleState, updateRuleTableData: updateRuleTableData }}>
            {children}
        </RuleContext.Provider>
    );
};

export default RuleState;
