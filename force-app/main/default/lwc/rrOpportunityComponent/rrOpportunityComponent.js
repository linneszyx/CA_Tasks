import { LightningElement, track } from 'lwc';

export default class RrOpportunityComponent extends LightningElement {
    @track page = 1;
    oppId;
    get isPage1() {
        return this.page === 1;
    }
    get isPage2() {
        return this.page === 2;
    }
    get isPage3() {
        return this.page === 3;
    }
    get isPage4() {
        return this.page === 4;
    }
    handleNext(e) {
        if (e.detail.oppId)
            this.oppId = e.detail.oppId;
    }
}