import { createContext } from 'react';
import { RuleInstance } from 'services/RuleService';

export interface RuleTable {
    rowsPerPageOptions: number[];
    recordsCount: number;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    records: RuleInstance[] | [];
}

export interface RuleContextProps {
    ruleTableData: RuleTable;
    updateRuleTableData: (data: RuleTable) => void;
}

const RuleContext = createContext({} as RuleContextProps);

export default RuleContext;
