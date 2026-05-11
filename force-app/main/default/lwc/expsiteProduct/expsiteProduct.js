import { LightningElement, wire, api } from 'lwc';
import getAssetRT from '@salesforce/apex/AssetController.getAssetRT';
import updateServiceStatus from '@salesforce/apex/AssetController.updateServiceStatus';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const PRODUCT_ACTIONS = [
    { label: 'Open Case', name: 'open_case' },
    { label: 'Extend Warranty', name: 'extend_warranty' }
];
const SERVICE_ACTIONS = [
    { label: 'Open Case', name: 'open_case' }
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
        { label: 'Asset Name', fieldName: 'Name', type: 'text' },
        { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
        { label: 'Warranty Status', fieldName: 'Warranty_Status__c', type: 'text' },
        { label: 'Product Name', fieldName: 'ProductName', type: 'text' },
        { label: 'Warranty End', fieldName: 'Warranty_End__c', type: 'date' },
        {
            type: 'action',
            typeAttributes: { rowActions: PRODUCT_ACTIONS, menuAlignment: 'right' }
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
            typeAttributes: { rowActions: SERVICE_ACTIONS, menuAlignment: 'right' }
        }
    ];

    get columns() {
        return this.type === 'product' ? this.productColumns : this.serviceColumns;
    }

    get isProduct() {
        return this.type === 'product';
    }

    get isService() {
        return this.type === 'service';
    }

    _wiredAssetsResult;
    @wire(getAssetRT)
    wiredAssets(result) {
        this._wiredAssetsResult = result;
        const { data, error } = result;
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

    get processedRows() {
        if (!this.pagedData || !this.columns) {
            return [];
        }
        return this.pagedData.map((r, rowIndex) => {
            const cells = this.columns.map((col) => {
                const field = col.fieldName || '';
                let value = '';
                if (field) {
                    if (r[field] !== undefined && r[field] !== null) {
                        value = r[field];
                    } else {
                        const parts = field.split('.');
                        value = parts.reduce((acc, part) => {
                            if (acc && acc[part] !== undefined && acc[part] !== null) {
                                return acc[part];
                            }
                            return '';
                        }, r);
                    }
                }
                if (value === 0) {
                    value = '0';
                } else if (value === null || value === undefined) {
                    value = '';
                } else if (typeof value === 'object') {
                    try {
                        value = String(value);
                    } catch (e) {
                        value = '';
                    }
                } else {
                    value = String(value);
                }
                return { key: field || String(Math.random()), value };
            });
            const rowKey = r.Id || rowIndex;
            const actionsVisible = this.visibleActionRows ? this.visibleActionRows.has(String(rowKey)) : false;
            const warrantyStatus = (r.Warranty_Status__c || '').toString();
            const isWarrantyActive = warrantyStatus && warrantyStatus.toLowerCase() === 'active';
            const hasWarrantyStatus = Boolean(r.Warranty_Status__c);
            const serviceStatus = (r.Status || '').toString();
            const isServiceActive = serviceStatus && serviceStatus.toLowerCase() === 'active';
            const hasServiceStatus = Boolean(r.Status);

            return {
                original: r,
                _cells: cells,
                _rowKey: String(rowKey),
                _actionsVisible: actionsVisible,
                _isWarrantyActive: isWarrantyActive,
                _hasWarrantyStatus: hasWarrantyStatus,
                _isServiceActive: isServiceActive,
                _hasServiceStatus: hasServiceStatus
            };
        });
    }

    visibleActionRows = new Set();

    toggleRowActions(event) {
        const rowKey = event.currentTarget.dataset.rowKey;
        if (!rowKey) return;
        if (this.visibleActionRows.has(rowKey)) {
            this.visibleActionRows.delete(rowKey);
        } else {
            this.visibleActionRows.add(rowKey);
        }
        this.visibleActionRows = new Set(this.visibleActionRows);
    }

    isRowActionsVisible(rowKey) {
        return this.visibleActionRows.has(rowKey);
    }

    handleOpenCaseClick(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('createcase', { detail: assetId }));
        this.dispatchEvent(new CustomEvent('opencreatemodal', { detail: { assetId } }));
        const rowKey = event.currentTarget.dataset.rowKey;
        if (rowKey && this.visibleActionRows.has(rowKey)) {
            this.visibleActionRows.delete(rowKey);
            this.visibleActionRows = new Set(this.visibleActionRows);
        }
    }

    handleExtendClick(event) {
        const assetId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('openextendmodal', { detail: { assetId } }));
        this.dispatchEvent(new CustomEvent('extend', { detail: assetId }));
        const rowKey = event.currentTarget.dataset.rowKey;
        if (rowKey && this.visibleActionRows.has(rowKey)) {
            this.visibleActionRows.delete(rowKey);
            this.visibleActionRows = new Set(this.visibleActionRows);
        }
    }

    renewServiceClick(event) {
        const assetId = event.currentTarget.dataset.id;
        updateServiceStatusWithExtension({ assetId, newStatus: 'Active', monthsToAdd: 6 })
            .then((updated) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Service Renewed',
                        message: 'Service status set to Active and end date extended by 6 months.',
                        variant: 'success'
                    })
                );
                if (this._wiredAssetsResult) {
                    refreshApex(this._wiredAssetsResult);
                }
            })
            .catch((err) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Could not renew service: ' + (err.body ? err.body.message : err.message),
                        variant: 'error'
                    })
                );
            });
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