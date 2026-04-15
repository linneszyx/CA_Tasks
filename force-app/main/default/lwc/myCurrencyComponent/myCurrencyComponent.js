import { LightningElement, wire, track } from 'lwc';
import getCurrencyInfo from '@salesforce/apex/CurrencyService.getCurrencyInfo';

export default class MyCurrencyComponent extends LightningElement {

    fullData = [];
    filteredData = [];
    @track currencyTable = [];

    columns = [
        { label: 'S.No', fieldName: 'sno' },
        { label: 'Currency', fieldName: 'currency' },
        { label: 'Rate', fieldName: 'rate', type: 'number' }
    ];

    pageSize = 5;
    currentPage = 1;
    totalPages = 1;
    searchKey = '';
    @wire(getCurrencyInfo)
    wiredCurrency({ data, error }) {
        if (data) {
            this.fullData = data.currencyTable;
            this.filteredData = [...this.fullData];
            this.calculatePagination();
        } else if (error) {
            console.error(error);
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.filteredData = this.fullData.filter(item =>
            item.currency.toLowerCase().includes(this.searchKey)
        );
        this.currentPage = 1; 
        this.calculatePagination();
    }
    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        this.updatePageData();
    }
    updatePageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.currencyTable = this.filteredData.slice(start, end);
    }
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePageData();
        }
    }
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageData();
        }
    }
    get isPreviousDisabled() {
        return this.currentPage === 1;
    }
    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }
}