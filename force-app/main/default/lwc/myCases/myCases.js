import { LightningElement, wire, api, track } from 'lwc';
import getAllCases from '@salesforce/apex/CaseController.getAllCases';

export default class MyCases extends LightningElement {
    @track cases = [];
    error;
    @track currentPage = 1;
    @track pageSize = 5;
    pageSizeOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' }
    ];
    @track selectedCase;

    @wire(getAllCases)
    wiredCases({ error, data }) {
        if (data) {
            this.cases = data;
            this.currentPage = 1;
        } else if (error) {
            this.error = error;
            this.cases = [];
        }
    }

    get hasCases() {
        return this.cases && this.cases.length > 0;
    }

    get totalPages() {
        return Math.max(1, Math.ceil((this.cases ? this.cases.length : 0) / this.pageSize));
    }

    get pagedCases() {
        if (!this.hasCases) return [];
        const start = (this.currentPage - 1) * this.pageSize;
        return this.cases.slice(start, start + this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage <= 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    handlePrev() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
        }
    }

    handlePageSizeChange(event) {
        const newSize = parseInt(event.target.value, 10);
        if (!isNaN(newSize) && newSize > 0) {
            this.pageSize = newSize;
            this.currentPage = 1;
        }
    }

    handleViewCase(event) {
        const caseId = event.currentTarget.dataset.id;
        const caseRecord = this.cases.find(c => c.Id === caseId);
        this.dispatchEvent(new CustomEvent('viewcase', {
            detail: { caseId, caseRecord }
        }));
    }

}