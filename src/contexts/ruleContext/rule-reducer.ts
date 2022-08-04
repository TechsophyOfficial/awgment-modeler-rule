import { UPDATE_RULE_TABLE } from 'constants/actions';

const ruleReducer = (state, action) => {
    switch (action.type) {
        case UPDATE_RULE_TABLE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default ruleReducer;
