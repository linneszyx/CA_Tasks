import { LightningElement, track } from 'lwc';
export default class MyContainerComponent extends LightningElement {
    showFilter = false;
    @track selectedFilters = [];
    @track filterLogic = 'all';
    @track filterLogicExpression = '';
    handleToggleFilter(event) {
        this.showFilter = event.detail.isOpen;
    }
    handleFilterChange(event) {
        this.selectedFilters = event.detail?.selectedFilters || [];
        this.filterLogic = event.detail?.filterLogic || 'all';
        this.filterLogicExpression = event.detail?.filterLogicExpression || '';
    }
    handleCancelFilter() {
        this.showFilter = false;
    }
}