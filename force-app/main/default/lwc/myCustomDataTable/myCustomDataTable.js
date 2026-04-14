import LightningDataTable from 'lightning/datatable';
import picklistView from './picklistView.html';
import picklistEdit from './picklistEdit.html';
export default class MyCustomDataTable extends LightningDataTable {
    static customTypes = {
        picklist: {
            template: picklistView,
            editTemplate: picklistEdit,
            standardCellLayout: true,
            typeAttributes: ['options', 'value', 'context'],
            editable: true
        }
    };
}