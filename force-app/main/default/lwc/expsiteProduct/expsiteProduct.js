import { LightningElement, wire, api } from 'lwc';
import getAssetRT from '@salesforce/apex/AssetController.getAssetRT';
export default class ExpsiteProduct extends LightningElement {

    @api type;
    rawData;
    error;

    //  PRODUCT_ID = '012gL000004p2LdQAI';
    //  SERVICE_ID = '012gL000004p2NFQAY';

    @wire(getAssetRT)
    wiredAssets({ data, error }) {
        console.log('Data ', data);
        if (data) {
            this.rawData = data;
        } else if (error) {
            this.error = error;
            this.products = [];
            this.services = [];
            // console.log('Error loading assets:', error);
            console.error('Error', JSON.stringify(error, null, 2))
        }
    }
    get finalData() {
        if (!this.rawData) return []
        const asset = this.rawData.al;
        const mp = this.rawData.rtMap;
        const proRT = mp['Product']
        const serRT = mp['Services']
        const products = asset.filter(rec => rec.RecordTypeId === proRT);
        const services = asset.filter(rec => rec.RecordTypeId === serRT);
        return this.type === 'product' ?
            products : services;
    }
    get hasData() {
        return this.finalData.length > 0;
    }
    createCase(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('createcase', {
                detail: assetId
            })
        );
    }
    extendService(event) {
        const assetId = event.currentTarget.dataset.id;
        console.log('Service ', assetId);
    }
}