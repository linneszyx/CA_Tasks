import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ExpSiteAsset extends NavigationMixin(LightningElement) {
    caseNumber;
    handleSuccess(event) {
        this.caseNumber = event.detail.caseNumber;
    }
    navigateToCases() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/my-cases'
            }
        });
    }
}