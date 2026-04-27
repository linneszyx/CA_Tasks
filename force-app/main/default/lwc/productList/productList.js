import { LightningElement, wire } from 'lwc';
import getAsset from '@salesforce/apex/AssetController.getAsset';

export default class ProductList extends LightningElement {
    products = [];
    error;
    @wire(getAsset)
    wiredAssets({ data, error }) {
        if (data) {
            this.products = data;
        }
        else {
            this.error = error;
        }
    }
}