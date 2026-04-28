import { LightningElement, wire, api } from 'lwc';
import getAssetRT from '@salesforce/apex/AssetController.getAssetRT';
export default class ExpsiteProduct extends LightningElement {

    @api type;
    rawData;
    error;

    @wire(getAssetRT)
    wiredAssets({ data, error }) {
        console.log('Data ', data);
        console.log('type :', this.type)
        console.log('data  :', JSON.stringify(data))
        console.log('error : ', JSON.stringify(error))
        if (data) {
            this.rawData = data;
            console.log('Asset length :', data.al ? data.al.length : 'al is null')
            console.log('rtMap : ', JSON.stringify(data.rtMap))
        } else if (error) {
            this.error = error;
            this.products = [];
            this.services = [];
            console.log('Error loading assets:', error);
            console.error('Error', JSON.stringify(error, null, 2))
        }
    }
    get finalData() {
        console.log('rawdata : ', this.rawData)
        console.log('Type : ', this.type)
        if (!this.rawData) return []
        const asset = this.rawData.al;
        const mp = this.rawData.rtMap;
        console.log('Mp Product : ', mp['Product'])
        console.log('Mp Services : ', mp['Services'])
        console.log('First Asset RecordTypeId : ', asset[0]?.RecordTypeId)
        const proRT = mp['Product']
        const serRT = mp['Services']
        const products = asset.filter(rec => rec.RecordTypeId === proRT);
        const services = asset.filter(rec => rec.RecordTypeId === serRT);
        console.log('Product Count : ', products.length)
        console.log('Services Count : ', services.length)
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