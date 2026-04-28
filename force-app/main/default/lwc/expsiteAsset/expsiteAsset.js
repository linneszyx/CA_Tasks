import { LightningElement, track } from 'lwc';

export default class ExpsiteAsset extends LightningElement {
    @track showCaseModal = false;
    @track showExtendModal = false;
    selectedAssetId = null;

    handleCreateCase(event) {
        this.selectedAssetId = event.detail;
        this.showCaseModal = true;
    }

    handleOpenCreateModal(event) {
        this.selectedAssetId = event.detail.assetId || event.detail;
        this.showCaseModal = true;
    }

    handleOpenExtendModal(event) {
        this.selectedAssetId = event.detail.assetId || event.detail;
        this.showExtendModal = true;
    }

    closeCaseModal() {
        this.showCaseModal = false;
        this.selectedAssetId = null;
    }

    closeExtendModal() {
        this.showExtendModal = false;
        this.selectedAssetId = null;
    }

    handleCaseSuccess(event) {
        this.closeCaseModal();
        this.dispatchEvent(new CustomEvent('casecreated', { detail: event.detail }));
    }

    handleConfirmExtend() {
        console.log('Extend warranty for asset: ', this.selectedAssetId);
        this.closeExtendModal();
        this.dispatchEvent(new CustomEvent('warrantyextended', { detail: this.selectedAssetId }));
    }

    handleOpenCreateModal(event) {
        this.selectedAssetId = event.detail.assetId || event.detail;
        this.showCaseModal = true;
    }

    handleOpenExtendModal(event) {
        this.selectedAssetId = event.detail.assetId || event.detail;
        this.showExtendModal = true;
    }

    closeCaseModal() {
        this.showCaseModal = false;
        this.selectedAssetId = null;
    }

    closeExtendModal() {
        this.showExtendModal = false;
        this.selectedAssetId = null;
    }

    handleCaseSuccess(event) {
        this.closeCaseModal();
        this.dispatchEvent(new CustomEvent('casecreated', { detail: event.detail }));
    }

    handleConfirmExtend() {
        console.log('Extend warranty for asset: ', this.selectedAssetId);
        this.closeExtendModal();
        this.dispatchEvent(new CustomEvent('warrantyextended', { detail: this.selectedAssetId }));
    }
}