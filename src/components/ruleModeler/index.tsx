import React, { useContext, useEffect, useRef, useState } from 'react';
import './index.scss';
import { TextField } from '@mui/material';
import DmnModeler, { DmnModelerType } from 'dmn-js/lib/Modeler';
import camundaModdleDescriptor from 'camunda-dmn-moddle/resources/camunda.json';
import minimapModule from 'diagram-js-minimap';
import XMLViewer from 'react-xml-viewer';
import { saveAs } from 'file-saver';
import TabContext, { Tab } from 'contexts/tabContext/tab-context';
import makeStyles from '@mui/styles/makeStyles';
import { FILE_SAVER_PREFIX } from 'constants/common';
import ActionButton from 'components/common/actionButton';
import ActionMenu from './ActionMenu';
import Popup from 'tsf_popup/dist/components/popup';
import { deleteRule, deployRule, saveRule } from 'services/RuleService';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import NotificationContext from 'contexts/notificationContext/notification-context';
import ConfirmationContext from 'contexts/confirmationContext/confirmation-context';
import AppConfig from '../../appConfig';

interface Id {
    id: string;
}

export interface SaveRuleResponse extends Id {
    version: string;
}
interface InitialRule {
    name: string;
}

interface SaveRuleProps extends InitialRule {
    content: string;
}
export interface RuleProps extends SaveRuleProps, SaveRuleResponse {}

interface FormState {
    name: string;
    version: string;
    deploymentName: string;
}

export interface RuleDeployProps extends Id, FormState {
    content: string;
}

type XML = string;

interface FormFieldProps {
    label: string;
    name: string;
    inputType?: string;
    required?: boolean;
    disabled?: boolean;
}

interface RuleModelerProps {
    tab: Tab;
    loadRecords: () => void;
}

const RuleModeler: React.FC<RuleModelerProps> = ({ tab, loadRecords }) => {
    const canvas = useRef(null);
    const { content } = tab;
    const {
        tabsList: { tabs },
        updateTab,
        closeTab,
    } = useContext(TabContext);
    const { pushNotification } = useContext(NotificationContext);
    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const { confirmation, showConfirmation } = useContext(ConfirmationContext);

    const [DMNmodeler, setDMNModeler] = useState<DmnModelerType | undefined>();
    const [viewRule, setViewRule] = useState<boolean>(false);
    const [currentXML, setCurrentXML] = useState<XML>('');
    const [openFormModal, setOpenFormModal] = useState<boolean>(false);
    const [isDeploy, setIsDeploy] = useState<boolean>(false);
    const [formState, setFormState] = useState<FormState>({
        name: '',
        version: '',
        deploymentName: '',
    });
    const appData: any = useContext(AppConfig);

    const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%',
            display: 'flex',
        },
        canvasWrapper: {
            width: '100%',
        },
        canvas: {
            height: '100%',
            '& .djs-minimap': {
                cursor: 'pointer',
                position: 'absolute',
                top: 70,
                zIndex: 100,
                '& .map': {
                    width: 150,
                    height: 100,
                },
                '&:not(.open) .toggle': {
                    width: 38,
                    height: 37,
                },
            },
            '& .bjs-powered-by, .powered-by': {
                display: 'none',
            },
            '& .dmn-decision-table-container, .dmn-literal-expression-container': {
                padding: 15,
                width: '95%',
            },
        },
        actionButtonsWrapper: {
            position: 'absolute',
            right: 10,
            marginTop: 13,
            zIndex: 10,
        },
        actionButton: {
            marginRight: 10,
        },
        formButton: {
            marginLeft: 10,
        },
        formField: {
            marginBottom: 15,
        },
        formActionButtonWrapper: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
    }));

    const classes = useStyles();

    useEffect(() => {
        const dmnModeler: DmnModelerType = new DmnModeler({
            container: canvas.current,
            drd: {
                additionalModules: [minimapModule],
            },
            moddleExtensions: {
                camunda: camundaModdleDescriptor,
            },
        });
        setDMNModeler(dmnModeler);
        dmnModeler.importXML(content);
        // eslint-disable-next-line
    }, []);
    const generateAndSetCurrentXml = () => {
        return DMNmodeler?.saveXML({ format: true }, (err, xml) => {
            const newXml = xml.match(/<decision.*name="Decision\s1">(.|\n)*<\/decision>\n(\s\s<de)/);
            if (newXml) {
                setCurrentXML(xml.replace(newXml[0], '<de'));
                return;
            }
            setCurrentXML(xml);
            return;
        });
    };

    const viewHandler = async () => {
        await generateAndSetCurrentXml();
        setViewRule(true);
    };

    const importHandler = async (file) => {
        const ruleXML = await file.text();
        updateTab({ ...tab, name: file.name, content: ruleXML });
        await DMNmodeler?.importXML(ruleXML);
    };

    const exportHandler = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        DMNmodeler?.saveXML({ format: true }, (_err, xml) => {
            saveAs(`${FILE_SAVER_PREFIX},${encodeURIComponent(xml)}`, `${tab.name}.dmn`);
        });
    };

    const handleSaveOrDeploy = async (deployState = false) => {
        await generateAndSetCurrentXml();
        setIsDeploy(deployState);
        setFormState({ ...formState, name: tab.name, version: tab.version || '', deploymentName: '' });
        setOpenFormModal(true);
    };

    const onSaveRule = async (): Promise<void> => {
        const { id } = tab;
        const { name } = formState;
        let ruleData: SaveRuleProps | RuleProps = {
            name: name,
            content: currentXML,
        };

        if (id) {
            ruleData = {
                ...ruleData,
                id: id,
            };
        }

        openSpinner();
        const GATEWAY_URL = `${appData.apiGatewayUrl}`;
        const { success, data, message } = await saveRule(ruleData, GATEWAY_URL);
        if (success && data) {
            const { id: newId, version } = data;
            setOpenFormModal(false);
            updateTab({ ...tab, id: newId, version: version.toString(), name });
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Rule saved successfully',
                type: 'success',
            });
            loadRecords();
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Unable to save rule',
                type: 'error',
            });
        }
    };

    const onDeployRule = async (): Promise<void> => {
        if (tab.id && tab.version) {
            const { id, name, version } = tab;
            const { deploymentName } = formState;
            openSpinner();
            const GATEWAY_URL = `${appData.apiGatewayUrl}`;
            const { success } = await deployRule(
                {
                    id,
                    name,
                    version,
                    deploymentName,
                    content: currentXML,
                },
                GATEWAY_URL,
            );
            closeSpinner();
            setOpenFormModal(false);
            if (success) {
                pushNotification({
                    isOpen: true,
                    message: 'Rule deployed successfully',
                    type: 'success',
                });
            } else {
                pushNotification({
                    isOpen: true,
                    message: 'Failed to deploy',
                    type: 'error',
                });
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLElement>): void => {
        event.preventDefault();
        updateTab({ ...tab, content: currentXML });
        isDeploy ? onDeployRule() : onSaveRule();
    };

    const onDeleteRule = async (): Promise<void> => {
        if (tab.id) {
            openSpinner();
            const GATEWAY_URL = `${appData.apiGatewayUrl}`;
            const { success = false, message } = await deleteRule(tab.id, GATEWAY_URL);
            if (success) {
                showConfirmation({
                    ...confirmation,
                    isOpen: false,
                });
                closeSpinner();
                const foundIndex = tabs.findIndex((x) => x.key === tab.key);
                closeTab(foundIndex);
                pushNotification({
                    isOpen: true,
                    message: message || 'Rule deleted successfully',
                    type: 'success',
                });
                loadRecords();
            } else {
                closeSpinner();
                pushNotification({
                    isOpen: true,
                    message: message || 'We are facing an internal issue, Please try again later',
                    type: 'error',
                });
            }
        }
    };

    const renderModelerCanvas = (): React.ReactElement => {
        return (
            <div className={classes.canvasWrapper}>
                <div className={classes.actionButtonsWrapper}>
                    <ActionButton
                        variant="primary"
                        buttonProps={{ id: 'rule_save_button', className: classes.actionButton }}
                        onClick={() => handleSaveOrDeploy()}>
                        Save
                    </ActionButton>
                    {tab.id && (
                        <>
                            <ActionButton
                                variant="secondary"
                                buttonProps={{ id: 'rule_deploy_button', className: classes.actionButton }}
                                onClick={() => handleSaveOrDeploy(true)}>
                                Deploy
                            </ActionButton>
                            <ActionButton
                                variant="secondary"
                                buttonProps={{ id: 'rule_delete_button', className: classes.actionButton }}
                                onClick={() =>
                                    showConfirmation({
                                        ...confirmation,
                                        isOpen: true,
                                        title: 'Are you sure,Do you want to delete?',
                                        subTitle: 'Please confirm if you want to delete this particular rule',
                                        confirmButtonLabel: 'Delete',
                                        onConfirm: () => onDeleteRule(),
                                    })
                                }>
                                Delete
                            </ActionButton>
                        </>
                    )}
                    <ActionMenu viewHandler={viewHandler} importHandler={importHandler} exportHandler={exportHandler} />
                </div>
                <div className={classes.canvas} id="js-canvas" ref={canvas} />
            </div>
        );
    };

    const renderPopup = (): React.ReactElement => {
        return (
            <Popup onShow={viewRule} onClose={() => setViewRule(false)}>
                <XMLViewer xml={currentXML} />
            </Popup>
        );
    };

    const onInputChange = (statename: string, event): void => {
        const { value } = event.target;
        setFormState({
            ...formState,
            [statename]: value,
        });
    };

    const renderFormDetails = ({
        label,
        name,
        required = false,
        disabled = false,
    }: FormFieldProps): React.ReactElement => {
        return (
            <TextField
                className={classes.formField}
                label={label}
                name={name}
                size="small"
                variant="outlined"
                required={required}
                disabled={disabled}
                fullWidth
                value={formState[name]}
                onChange={(event): void => onInputChange(name, event)}
            />
        );
    };

    const renderFormModal = (): React.ReactElement => {
        return (
            <Popup
                title={isDeploy ? 'Deploy Rule' : 'Save Rule'}
                onShow={openFormModal}
                size="xs"
                onClose={() => setOpenFormModal(false)}>
                <form autoComplete="off" onSubmit={handleSubmit}>
                    {!isDeploy &&
                        renderFormDetails({
                            label: 'Name',
                            name: 'name',
                            required: true,
                        })}
                    {!isDeploy &&
                        tab.id &&
                        renderFormDetails({
                            label: 'Version',
                            name: 'version',
                            disabled: true,
                        })}
                    {isDeploy &&
                        renderFormDetails({
                            label: 'Deployment Name',
                            name: 'deploymentName',
                            required: true,
                        })}
                    <div className={classes.formActionButtonWrapper}>
                        <ActionButton
                            variant="secondary"
                            buttonProps={{ id: 'rule_popup_cancel_button', className: classes.formButton }}
                            onClick={(): void => setOpenFormModal(false)}>
                            Cancel
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            buttonProps={{
                                id: `rule_popup_${isDeploy ? 'deploy' : 'save'}_button`,
                                className: classes.formButton,
                                type: 'submit',
                            }}>
                            {isDeploy ? 'Deploy' : 'Save'}
                        </ActionButton>
                    </div>
                </form>
            </Popup>
        );
    };

    return (
        <div className={classes.root}>
            {renderModelerCanvas()}
            {renderPopup()}
            {renderFormModal()}
        </div>
    );
};

export default RuleModeler;
