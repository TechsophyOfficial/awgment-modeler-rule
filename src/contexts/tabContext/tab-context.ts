import { createContext } from 'react';

export type Index = number;
export interface Tab {
    key: string;
    id?: string;
    version?: string;
    name: string;
    content: string;
}

export interface TabsList {
    tabs: Tab[];
    activeTabIndex: number;
}

interface TabContextProps {
    tabsList: TabsList;
    updateActiveTabIndex: (index: Index) => void;
    addTab: (tab: Tab) => void;
    updateTab: (tab: Tab) => void;
    closeTab: (index: Index) => void;
}

const TabContext = createContext({} as TabContextProps);

export default TabContext;
