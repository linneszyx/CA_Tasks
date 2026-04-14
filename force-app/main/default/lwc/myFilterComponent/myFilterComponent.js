import { LightningElement, wire } from 'lwc';
import getOpportunityFields from '@salesforce/apex/OpportunityController.getOpportunityFields';

const OPERATOR_SETS = {
    STRING: [
        { label: 'equals', value: 'equals' },
        { label: 'not equal to', value: 'notequal' },
        { label: 'contains', value: 'contains' },
        { label: 'does not contain', value: 'doesnotcontains' },
        { label: 'starts with', value: 'startswith' },
        { label: 'ends with', value: 'endswith' }
    ],
    NUMBER: [
        { label: 'equals', value: 'equals' },
        { label: 'not equal to', value: 'notequal' },
        { label: 'less than', value: 'lessthan' },
        { label: 'greater than', value: 'greaterthan' },
        { label: 'less or equal', value: 'lessorequal' },
        { label: 'greater or equal', value: 'greaterorequal' }
    ],
    PICKLIST: [
        { label: 'equals', value: 'equals' },
        { label: 'not equal to', value: 'notequal' }
    ],
    DATE: [
        { label: 'equals', value: 'equals' },
        { label: 'not equal to', value: 'notequal' },
        { label: 'before', value: 'lessthan' },
        { label: 'after', value: 'greaterthan' },
        { label: 'on or before', value: 'lessorequal' },
        { label: 'on or after', value: 'greaterorequal' }
    ],
    BOOLEAN: [
        { label: 'equals', value: 'equals' },
        { label: 'not equal to', value: 'notequal' }
    ]
};

const LOGIC_OPTIONS = [
    { label: 'Match All Conditions', value: 'all' },
    { label: 'Match Any Condition', value: 'any' }
];

export default class MyFilterComponent extends LightningElement {
    showFilterOptions = true;
    showFilterForm = false;
    showLogicEditor = false;

    filterLogic = 'all';
    filterLogicExpression = '';

    filters = [];

    @wire(getOpportunityFields) wiredOpportunityFields;

    connectedCallback() {
        this.handleAddFilter();
    }

    get logicOptions() {
        return LOGIC_OPTIONS;
    }

    get fieldOptions() {
        const wire = this.wiredOpportunityFields;
        if (!wire?.data) return [];

        return wire.data.map(f => ({
            label: f.label,
            value: f.apiName
        }));
    }

    toggleFilterForm() {
        this.showFilterForm = !this.showFilterForm;
    }

    toggleLogicEditor() {
        this.showLogicEditor = !this.showLogicEditor;
    }

    handleLogicChange(event) {
        this.filterLogic = event.detail.value;
    }

    handleFilterLogicExpressionChange(event) {
        this.filterLogicExpression = event.target.value;
    }

    handleAddFilter() {
        this.filters = [
            ...this.filters,
            {
                id: Date.now(),
                field: '',
                operator: '',
                value: '',
                fieldMeta: {},
                operatorOptions: []
            }
        ];
    }

    isPicklist(filter) {
        return filter && filter.fieldMeta && filter.fieldMeta.picklistValues;
    }

    isPicklistField(filter) {
        return filter?.fieldMeta?.picklistValues?.length > 0;
    }

    handleFieldChange(event) {
        const id = event.target.dataset.id;
        const value = event.detail.value;
        const fields = this.wiredOpportunityFields.data || [];
        this.filters = this.filters.map(f => {
            if (f.id == id) {

                const selectedField = fields.find(fl => fl.apiName === value);

                let operatorOptions = [];
                let picklistOptions = [];
                let isPicklist = false;

                if (selectedField) {
                    const type = (selectedField.type || '').toUpperCase();

                    if (type === 'PICKLIST') {
                        operatorOptions = OPERATOR_SETS.PICKLIST;
                        isPicklist = true;

                        picklistOptions = (selectedField.picklistValues || []).map(p => ({
                            label: p.label,
                            value: p.value
                        }));
                    }
                    else if (['CURRENCY', 'DOUBLE', 'INTEGER', 'PERCENT'].includes(type)) {
                        operatorOptions = OPERATOR_SETS.NUMBER;
                    }
                    else if (['DATE', 'DATETIME'].includes(type)) {
                        operatorOptions = OPERATOR_SETS.DATE;
                    }
                    else if (type === 'BOOLEAN') {
                        operatorOptions = OPERATOR_SETS.BOOLEAN;
                    }
                    else {
                        operatorOptions = OPERATOR_SETS.STRING;
                    }
                }

                return {
                    ...f,
                    field: value,
                    operator: operatorOptions[0]?.value || '',
                    value: '',
                    fieldMeta: selectedField ? { ...selectedField } : {},
                    operatorOptions: [...operatorOptions],
                    picklistOptions,
                    isPicklist
                };
            }
            return f;
        });

        this.filters = [...this.filters];
    }

    handleOperatorChange(event) {
        const id = event.target.dataset.id;
        const value = event.detail.value;

        this.filters = this.filters.map(f =>
            f.id == id ? { ...f, operator: value } : f
        );
    }

    handleValueChange(event) {
        const id = event.target.dataset.id;
        const value = event.detail.value;

        this.filters = this.filters.map(f =>
            f.id == id ? { ...f, value: value } : f
        );
    }

    handleRemoveFilter(event) {
        const id = event.target.dataset.id;
        this.filters = this.filters.filter(f => f.id != id);
    }

    handleRemoveAll() {
        this.filters = [];
        this.handleAddFilter();
    }

    mapField(field) {
        if (field === 'Stage') return 'StageName';
        if (field === 'Account') return 'AccountName';
        return field;
    }

    handleApplyFilters() {
        const formatted = this.filters
            .filter(f => f.field && f.operator && f.value)
            .map(f => ({
                id: f.id,
                field: this.mapField(f.field),
                operator: f.operator,
                value: f.value,
                label: f.fieldMeta?.label || f.field
            }));

        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: {
                selectedFilters: formatted,
                filterLogic: this.filterLogic,
                filterLogicExpression: this.filterLogicExpression
            },
            bubbles: true,
            composed: true
        }));
    }
}