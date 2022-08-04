import React, { useState } from 'react';
import { FilePicker } from 'react-file-picker';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import PublishIcon from '@mui/icons-material/Publish';

interface ActionMenuProps {
    viewHandler: () => void;
    importHandler: (file) => void;
    exportHandler: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ viewHandler, importHandler, exportHandler }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const useStyles = makeStyles((theme) => ({
        root: {
            backgroundColor: theme.palette.secondary.main,
            height: 36,
            width: 36,
            marginRight: 10,
            '&:hover': {
                backgroundColor: theme.palette.secondary.main,
                opacity: 0.8,
            },
        },
        menuIcon: {
            color: theme.palette.primary.main,
        },
        menuItemButton: {
            fontSize: 15,
            fontWeight: 500,
            color: theme.palette.primary.main,
            textTransform: 'none',
            '&:hover': {
                backgroundColor: 'transparent',
            },
        },
        menuItem: {
            display: 'block',
        },
    }));
    const classes = useStyles();

    const handleAnchorElClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const onView = () => {
        setAnchorEl(null);
        viewHandler();
    };

    const onImport = (file) => {
        setAnchorEl(null);
        importHandler(file);
    };

    const onExport = () => {
        setAnchorEl(null);
        exportHandler();
    };

    return (
        <>
            <IconButton
                id="rule_actions_menu_button"
                className={classes.root}
                onClick={handleAnchorElClick}
                size="large">
                <DragIndicatorIcon className={classes.menuIcon} />
            </IconButton>
            <Menu id="menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={onView} className={classes.menuItem}>
                    <Button
                        className={classes.menuItemButton}
                        variant="text"
                        size="small"
                        startIcon={<VisibilityIcon />}>
                        View
                    </Button>
                </MenuItem>
                <MenuItem className={classes.menuItem} sx={{ display: 'block' }}>
                    <Button className={classes.menuItemButton} variant="text" size="small" startIcon={<PublishIcon />}>
                        <FilePicker extensions={['dmn']} onChange={(file) => onImport(file)} onError={alert}>
                            <span>Import</span>
                        </FilePicker>
                    </Button>
                </MenuItem>
                <MenuItem onClick={onExport} className={classes.menuItem}>
                    <Button className={classes.menuItemButton} variant="text" size="small" startIcon={<GetAppIcon />}>
                        Export
                    </Button>
                </MenuItem>
            </Menu>
        </>
    );
};

export default ActionMenu;
