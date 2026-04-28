import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class ExpSiteAsset extends NavigationMixin(LightningElement) {
    showModal = false;
    showSuccess = false;
    selectedAssetId = null;
    caseNumber = null;
    handleCreateCase(event) {
        this.selectedAssetId = event.detail || null;
        this.showModal = true;
    }
    closeModal() {
        this.showModal = false;
        this.selectedAssetId = null;
    }
    handleSuccess(event) {
        this.caseNumber = (event && event.detail) ? event.detail : null;
        this.showModal = false;
        this.showSuccess = true;
    }
    goToCases() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'My_Cases__c'
            }
        });
    }
}
