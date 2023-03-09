import React, { useContext, useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { BACKGROUND_COLOR, BACKGROUND_COLOR_2 } from 'theme/colors';
import DataList from 'tsf_datalist/dist/components/dataList';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import VersionPopup from 'components/version';
import Popup from 'tsf_popup/dist/components/popup';
import LayoutContext from 'contexts/layoutContext/layout-context';
import { TOPBAR_HEIGHT, ACTION_DELETE, ACTION_EDIT, TABLE_HEADERS } from 'constants/common';
import ConfirmationContext from 'contexts/confirmationContext/confirmation-context';
import NotificationContext from 'contexts/notificationContext/notification-context';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import TabContext from 'contexts/tabContext/tab-context';
import getNewDMNDiagram from 'constants/newDMNDiagram';
import { getRuleDetails, deleteRule, getAllRules } from 'services/RuleService';
import { RuleProps } from 'components/ruleModeler';
import RuleContext from 'contexts/ruleContext/rule-context';
import AppConfig from 'appConfig';

const actions = [
    {
        actionId: ACTION_EDIT,
        actionName: 'Edit',
        actionIcon: EditOutlined,
    },
    {
        actionId: ACTION_DELETE,
        actionName: 'Delete',
        actionIcon: DeleteOutlined,
    },
];

const MaximizeView = () => {
    const [versionOpen, setVersionOpen] = useState(false);
    const { minimizeLayout } = useContext(LayoutContext);
    const { confirmation, showConfirmation } = useContext(ConfirmationContext);
    const { pushNotification } = useContext(NotificationContext);
    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const {
        tabsList: { tabs },
        addTab,
        closeTab,
    } = useContext(TabContext);
    const { ruleTableData, updateRuleTableData } = useContext(RuleContext);
    const { ruleName, newDMNDiagram } = getNewDMNDiagram();
    const { rowsPerPage, sortBy, sortDirection, page } = ruleTableData;
    const appData = useContext<any>(AppConfig);

    useEffect(() => {
        fetchAllRules(rowsPerPage, page);
        // eslint-disable-next-line
    }, []);

    const useStyles = makeStyles(() => ({
        root: {
            backgroundColor: BACKGROUND_COLOR,
            minHeight: `calc(100% - ${TOPBAR_HEIGHT}px)`,
        },
        versionPopup: {
            '& .MuiDialog-paper': {
                backgroundColor: BACKGROUND_COLOR_2,
            },
        },
    }));

    const classes = useStyles();

    const fetchAllRules = async (noOfRows, pageNo, orderBy = sortBy, orderDirection = sortDirection) => {
        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const {
            success,
            data,
            message = '',
        } = await getAllRules({
            paginate: true,
            apiUrl: GATEWAY_URL,
            rowsPerPage: noOfRows,
            page: pageNo,
            sortBy: orderBy,
            sortDirection: orderDirection,
        });
        closeSpinner();
        if (success && data) {
            const { totalElements, size, page: currentPage, content } = data;
            const updateData = {
                recordsCount: totalElements,
                page: currentPage,
                rowsPerPage: size,
                records: content,
                sortBy: orderBy,
                sortDirection: orderDirection,
            };
            updateRuleTableData({
                ...ruleTableData,
                ...updateData,
            });
        } else {
            pushNotification({
                isOpen: true,
                message: message,
                type: 'error',
            });
        }
    };

    const handleVersionClicked = (e: string) => {
        setVersionOpen(false);
        minimizeLayout();
    };

    const fetchRuleDetails = async (id: string): Promise<void> => {
        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, message, data } = await getRuleDetails(id, GATEWAY_URL);
        if (success && data) {
            const { name, version, content }: RuleProps = data;
            const decodedRuleContent = atob(content);
            closeSpinner();
            minimizeLayout();
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

    const deleteRuleItem = async (id: string) => {
        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, message } = await deleteRule(id, GATEWAY_URL);
        if (success) {
            showConfirmation({
                ...confirmation,
                isOpen: false,
            });
            pushNotification({
                isOpen: true,
                message: message ? message : '',
                type: 'success',
            });
            closeSpinner();
            await fetchAllRules(rowsPerPage, page);
            const foundIndex = tabs.findIndex((x) => x.id === id);
            closeTab(foundIndex);
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message ? message : '',
                type: 'error',
            });
        }
    };

    const actionClicked = (e: string, id: string) => {
        if (e === ACTION_EDIT) {
            fetchRuleDetails(id);
        } else if (e === ACTION_DELETE) {
            showConfirmation({
                ...confirmation,
                isOpen: true,
                title: 'Are you sure,Do you want to delete?',
                subTitle: 'Please confirm if you want to delete this particular rule',
                confirmButtonLabel: 'Delete',
                onConfirm: () => deleteRuleItem(id),
            });
        }
    };

    const handleChangePage = (e, newPage) => {
        fetchAllRules(rowsPerPage, newPage + 1);
    };

    const handleChangeRowsPerPage = async (event) => {
        const selectedRowPerPage = parseInt(event.target.value, 10);
        await fetchAllRules(selectedRowPerPage, 1);
    };

    const handleSortRequest = async (cellId) => {
        const isAsc = sortBy === cellId && sortDirection === 'asc' ? 'desc' : 'asc';
        await fetchAllRules(rowsPerPage, 1, cellId, isAsc);
    };

    const handleSearch = async (
        searchTerm: string,
        noOfRows = 5,
        pageNo = 1,
        orderBy = sortBy,
        orderDirection = sortDirection,
    ): Promise<void> => {
        const isSearchTermEmpty = searchTerm === '' || searchTerm === undefined || searchTerm === null;
        if (isSearchTermEmpty) {
            fetchAllRules(noOfRows, pageNo, (orderBy = sortBy), (orderDirection = sortDirection));
            return;
        }

        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, data } = await getAllRules({ paginate: false, apiUrl: GATEWAY_URL, searchTerm: searchTerm });

        closeSpinner();
        if (success && data) {
            const updateData = { records: data };
            updateRuleTableData({
                ...ruleTableData,
                ...updateData,
            });
        }
    };

    return (
        <div className={classes.root}>
            <DataList
                data={ruleTableData}
                title="Rule List"
                columns={TABLE_HEADERS}
                maxView={true}
                showCreateNewButton={true}
                showSearchFeild={true}
                actions={actions}
                actionClicked={(e, id) => actionClicked(e, id)}
                rowClicked={({ id }) => fetchRuleDetails(id)}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                handleSortRequest={handleSortRequest}
                handleSearch={(event) => handleSearch(event?.target?.value)}
                handleCreateNew={() => {
                    minimizeLayout();
                    addTab({
                        key: ruleName,
                        name: ruleName,
                        content: newDMNDiagram,
                    });
                }}
            />
            <Popup size="xs" title={'Recommended Versions'} onShow={versionOpen} onClose={() => setVersionOpen(false)}>
                <VersionPopup id={'1'} onVersionClicked={handleVersionClicked} />
            </Popup>
        </div>
    );
};

export default MaximizeView;
