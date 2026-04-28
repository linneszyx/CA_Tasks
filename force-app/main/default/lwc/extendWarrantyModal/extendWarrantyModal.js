import { LightningElement, api } from 'lwc';
import extendWarranty from '@salesforce/apex/AssetController.extendWarranty';
export default class ExtendWarrantyModal extends LightningElement {

    @api assetId;
    months = 6;

    handleChange(e) {
        this.months = e.target.value;
    }

    extend() {
        extendWarranty({
            assetId: this.assetId,
            months: parseInt(this.months, 10)
        })
            .then(result => {
                this.dispatchEvent(new CustomEvent('success', {
                    detail: 'Warranty Extended Successfully'
                }));
            });
    }

    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}