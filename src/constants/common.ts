export const FILE_SAVER_PREFIX = 'data:application/bpmn20-xml;charset=UTF-8';

// Height and Width
export const HEADER_HEIGHT = 60;
export const FOOTER_HEIGHT = 0;
export const TOPBAR_HEIGHT = 37;
export const DRAWER_WIDTH = 275;
export const ACTION_EDIT = 'edit';
export const ACTION_DELETE = 'delete';
export const ACTION_PUBLISH = 'publish';

export const TABLE_HEADERS = [
    { id: 'id', label: '', disableSorting: true },
    { id: 'name', label: 'Name', disableSorting: true },
    { id: 'version', label: 'Version', disableSorting: true },
    { id: 'createdByName', label: 'Created By', disableSorting: true },
    { id: 'createdOn', label: 'Created On', disableSorting: false },
    { id: 'updatedByName', label: 'Modified By', disableSorting: true },
    { id: 'updatedOn', label: 'Modified On', disableSorting: false },
    { id: 'actions', label: 'Actions', disableSorting: true },
];
