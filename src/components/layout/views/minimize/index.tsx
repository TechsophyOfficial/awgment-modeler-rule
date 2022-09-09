import React, { useCallback, useContext, useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import LayoutContext from 'contexts/layoutContext/layout-context';
import TabContext from 'contexts/tabContext/tab-context';
import { BACKGROUND_COLOR, WHITE } from 'theme/colors';
import DataList from 'tsf_datalist/dist/components/dataList';
import BrowserTabs from 'components/browserTabs';
import { DRAWER_WIDTH, TOPBAR_HEIGHT } from 'constants/common';
import { getAllRules, getRuleDetails } from 'services/RuleService';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import NotificationContext from 'contexts/notificationContext/notification-context';
import getNewDMNDiagram from 'constants/newDMNDiagram';
import EmptyCardLayout from 'tsf_empty_card/dist/components/emptyCardLayout';
import { RuleProps } from 'components/ruleModeler';
import AppConfig from 'appConfig';

const MinimizeView = () => {
    const {
        layout: { isHidden, isMinimized },
    } = useContext(LayoutContext);
    const appData: any = useContext(AppConfig);

    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
            width: '100%',
            position: 'relative',
        },
        sidebar: {
            backgroundColor: WHITE,
            width: `${isMinimized ? `${DRAWER_WIDTH}px` : 0}`,
            display: `${isHidden ? 'none' : 'block'}`,
            minHeight: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
                width: '6px',
                display: 'block',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme?.palette?.primary.main,
            },
        },
        content: {
            flexGrow: 1,
            marginTop: -TOPBAR_HEIGHT,
            marginLeft: `${isHidden ? `${TOPBAR_HEIGHT}px` : '0px'}`,
            width: `${isMinimized ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%'}`,
            backgroundColor: BACKGROUND_COLOR,
        },
        emptyListWrapper: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            '& > div': {
                marginLeft: 'auto',
                marginRight: 'auto',
            },
        },
    }));

    const classes = useStyles();

    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const {
        addTab,
        tabsList: { tabs, activeTabIndex },
    } = useContext(TabContext);
    const [ruleTableData, updateRuleTableData] = useState([]);
    const { pushNotification } = useContext(NotificationContext);
    const { ruleName, newDMNDiagram } = getNewDMNDiagram();

    const fetchAllRules = useCallback(async () => {
        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const {
            success,
            data,
            message = '',
        } = await getAllRules({ paginate: false, apiUrl: GATEWAY_URL, sortBy: 'updatedOn' });
        closeSpinner();
        if (success && data) {
            updateRuleTableData(data);
        } else {
            pushNotification({
                isOpen: true,
                message: message,
                type: 'error',
            });
        }
    }, [openSpinner, closeSpinner, pushNotification]);

    useEffect(() => {
        fetchAllRules();
        // eslint-disable-next-line
    }, []);

    const fetchRuleDetails = async (id: string): Promise<void> => {
        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, message, data } = await getRuleDetails(id, GATEWAY_URL);
        if (success && data) {
            const { name, version, content }: RuleProps = data;
            const decodedRuleContent = atob(content);
            closeSpinner();
            addTab({
                key: ruleName,
                id: id,
                name: name,
                version: version.toString(),
                content: decodedRuleContent,
            });
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Unable to fetch rule',
                type: 'error',
            });
        }
    };

    const handleSearch = async (searchTerm: string): Promise<void> => {
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, data } = await getAllRules({
            paginate: false,
            apiUrl: GATEWAY_URL,
            sortBy: 'updatedOn',
            searchTerm: searchTerm,
        });
        if (success && data) {
            updateRuleTableData(data);
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.sidebar}>
                <DataList
                    data={{ records: ruleTableData }}
                    showCreateNewButton={true}
                    showSearchFeild={true}
                    activeTaskId={tabs[activeTabIndex]?.id}
                    handleCreateNew={() =>
                        addTab({
                            key: ruleName,
                            name: ruleName,
                            content: newDMNDiagram,
                        })
                    }
                    handleSearch={(event) => handleSearch(event?.target?.value)}
                    rowClicked={({ id }) => fetchRuleDetails(id)}
                />
            </div>
            <div className={classes.content}>
                {tabs.length ? (
                    <BrowserTabs loadRecords={fetchAllRules} />
                ) : (
                    <div className={classes.emptyListWrapper}>
                        <EmptyCardLayout
                            title="Get started with Rule Modeler"
                            description="Build a series of tasks & decisions that make up your business process"
                            handleCreateNew={() =>
                                addTab({
                                    key: ruleName,
                                    name: ruleName,
                                    content: newDMNDiagram,
                                })
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinimizeView;
