import { LightningElement, wire, api } from 'lwc';
import getAssetRT from '@salesforce/apex/AssetController.getAssetRT';

const ACTIONS = [
    { label: 'Open Case', name: 'open_case' },
    { label: 'Extend Warranty', name: 'extend_warranty' }
];
export default class ExpsiteProduct extends LightningElement {
    @api type;
    rawData;
    error;
    currentPage = 1;
    pageSize = 4;
    pageSizeOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' }
    ];

    productColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
        { label: 'Warranty Status', fieldName: 'Warranty_Status__c', type: 'text' },
        { label: 'Product', fieldName: 'ProductName', type: 'text' },
        { label: 'Warranty End', fieldName: 'Warranty_End__c', type: 'date' },
        {
            type: 'action',
            typeAttributes: { rowActions: ACTIONS, menuAlignment: 'right' }
        }
    ];

    serviceColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Service Start', fieldName: 'Service_Start_Date__c', type: 'date' },
        { label: 'Service End', fieldName: 'Service_End_Date__c', type: 'date' },
        { label: 'Service Type', fieldName: 'Service_Type__c', type: 'text' },
        {
            type: 'action',
            typeAttributes: { rowActions: ACTIONS, menuAlignment: 'right' }
        }
    ];

    get columns() {
        return this.type === 'product' ? this.productColumns : this.serviceColumns;
    }

    @wire(getAssetRT)
    wiredAssets({ data, error }) {
        if (data) {
            this.rawData = data;
            this.currentPage = 1;
        } else if (error) {
            this.error = error;
            this.products = [];
            this.services = [];
        }
    }

    get finalData() {
        if (!this.rawData) return []
        const asset = this.rawData.al;
        const mp = this.rawData.rtMap;
        // const proRT = mp['Product']
        // const serRT = mp['Services']
        // const products = asset.filter(rec => rec.RecordTypeId === proRT)
        //     .map(rec => this.mapTable(rec));
        // const services = asset.filter(rec => rec.RecordTypeId === serRT)
        //     .map(rec => this.mapTable(rec));
        const proRT = Object.keys(mp).find(k => k.toLowerCase().includes('product'));
        const serRT = Object.keys(mp).find(k => k.toLowerCase().includes('service'));
        const productRTId = mp[proRT];
        const serviceRTId = mp[serRT];
        const products = asset
            .filter(rec => rec.RecordTypeId === productRTId)
            .map(rec => this.mapTable(rec));

        const services = asset
            .filter(rec => rec.RecordTypeId === serviceRTId)
            .map(rec => this.mapTable(rec));
        return this.type === 'product' ? products : services;
    }

    mapTable(rec) {
        return {
            Id: rec.Id,
            Name: rec.Name,
            Status: rec.Status,
            Quantity: rec.Quantity,
            Warranty_Status__c: rec.Warranty_Status__c,
            Warranty_End__c: rec.Warranty_End__c,
            ProductName: rec.Product2 ? rec.Product2.Name : '',
            Service_Start_Date__c: rec.Service_Start_Date__c,
            Service_End_Date__c: rec.Service_End_Date__c,
            Service_Type__c: rec.Service_Type__c
        };
    }

    get hasData() {
        return this.finalData && this.finalData.length > 0;
    }
    get totalPages() {
        return Math.max(1, Math.ceil((this.finalData ? this.finalData.length : 0) / this.pageSize));
    }

    get pagedData() {
        if (!this.hasData) return [];
        const start = (this.currentPage - 1) * this.pageSize;
        return this.finalData.slice(start, start + this.pageSize);
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'open_case') {
            this.dispatchEvent(new CustomEvent('opencreatemodal', { detail: { assetId: row.Id } }));
            this.dispatchEvent(new CustomEvent('createcase', { detail: row.Id }));
        } else if (actionName === 'extend_warranty') {
            this.dispatchEvent(new CustomEvent('openextendmodal', { detail: { assetId: row.Id } }));
            this.dispatchEvent(new CustomEvent('extend', { detail: row.Id }));
        }
    }

    createCase(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('createcase', {
                detail: assetId
            })
        );
        this.dispatchEvent(
            new CustomEvent('opencreatemodal', {
                detail: { assetId }
            })
        );
    }

    handleOpenCreate(event) {
        const assetId = event.currentTarget.dataset.id;
        this.createCase(event);
    }

    handleOpenExtend(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('openextendmodal', {
                detail: { assetId }
            })
        );
    }
    extendService(event) {
        const assetId = event.currentTarget.dataset.id;
        console.log('Service ', assetId);
    }
    extendWarranty(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('extend', {
            detail: assetId
        }))
    }
}