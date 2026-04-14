import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getOpportunity from '@salesforce/apex/OpportunityController.getOpportunity';
import getAllAccounts from '@salesforce/apex/OpportunityController.getAllAccounts';
import updateOpportunities from '@salesforce/apex/OpportunityController.updateOpportunities';

export default class MyOpportunityContainer extends LightningElement {

    @track paginatedData = [];
    @track data = [];
    @track opportunityColumns = [];
    @track draftValues = [];
    @track errorMessage = '';
    @track accountOptions = [];

    rawData = [];
    wiredOppResult;
    searchTerm = '';

    currentPage = 1;
    pageSize = 5;
    totalPages = 0;

    queryModel = {
        logic: 'AND',
        expression: '',
        conditions: [],
        search: '',
        sortBy: 'Name',
        sortOrder: 'asc'
    };

    connectedCallback() {
        this.opportunityColumns = this.getOpportunityColumns();
        console.log('VALUE :', this.typeAttributes?.value);
        console.log('OPTIONS :', this.typeAttributes?.options);
    }

    @wire(getAllAccounts)
    wiredAccounts({ data }) {
        if (data) {
            this.accountOptions = data.map(acc => ({
                label: acc.Name,
                value: acc.Id
            }));
            if (this.rawData.length > 0) {
                this.rawData = this.rawData.map(row => ({
                    ...row,
                    accountOptions: this.accountOptions
                }));

                this.applyFilters();
            }
        }
    }

    getOpportunityColumns() {
        return [
            { label: 'Opportunity Name', fieldName: 'Name', editable: true },
            {
                label: 'Account Name',
                fieldName: 'AccountId',
                type: 'picklist',
                editable: true,
                typeAttributes: {
                    options: { fieldName: 'accountOptions' },
                    value: { fieldName: 'AccountId' },
                    context: { fieldName: 'Id' }
                }
            },
            { label: 'Stage Name', fieldName: 'StageName', editable: true },
            { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true }
        ];
    }


    @api
    get filters() {
        return this.queryModel.conditions;
    }
    @api
    get filterLogic() {
        return this.queryModel.logic === 'OR' ? 'any' : 'all';
    }
    @api
    get filterLogicExpression() {
        return this.queryModel.expression;
    }

    set filters(value) {
        this.queryModel.conditions = Array.isArray(value) ? [...value] : [];
        this.applyFilters();
    }

    set filterLogic(value) {
        this.queryModel.logic = value === 'any' ? 'OR' : 'AND';
        this.queryModel.expression = '';
        this.applyFilters();
    }

    set filterLogicExpression(value) {
        this.queryModel.expression = String(value || '').trim();
        this.applyFilters();
    }


    @wire(getOpportunity)
    wiredOpportunites(result) {
        this.wiredOppResult = result;
        const { data, error } = result;

        if (error) {
            console.error('OPPORTUNITY ERROR', error);
            this.errorMessage = error?.body?.message || error.message || 'Unknown error';
            this.rawData = [];
            this.data = [];
            this.updatePagination();
            return;
        }

        if (data) {
            this.errorMessage = '';
            this.rawData = data.map(opp => ({
                ...opp,
                AccountName: opp.Account?.Name || '',
                AccountId: opp.AccountId,
                accountOptions: this.accountOptions || [],
            }));
            this.applyFilters();
        }
    }

    applyFilters() {
        this.data = this.applyQueryModel(this.rawData);
        this.currentPage = 1;
        this.updatePagination();
    }

    applyQueryModel(data) {
        let result = [...data];

        if (this.queryModel.search?.length >= 3) {
            const term = this.queryModel.search.toLowerCase();
            result = result.filter(r =>
                r.Name?.toLowerCase().includes(term) ||
                r.StageName?.toLowerCase().includes(term)
            );
        }

        if (this.queryModel.conditions.length > 0) {
            result = result.filter(record => this.applyFilterLogic(record));
        }

        result.sort((a, b) => {
            const valA = this.getFieldValue(a, this.queryModel.sortBy);
            const valB = this.getFieldValue(b, this.queryModel.sortBy);

            if (valA === valB) return 0;

            return this.queryModel.sortOrder === 'asc'
                ? (valA > valB ? 1 : -1)
                : (valA < valB ? 1 : -1);
        });

        return result;
    }

    applyFilterLogic(record) {
        const { conditions, logic, expression } = this.queryModel;

        if (!conditions.length) return true;

        if (expression) {
            const tokens = this.parseLogicExpression(expression);

            if (!tokens) {
                console.warn('Invalid filter logic → fallback to ALL');
                return true;
            }

            return this.evaluateExpression(record, tokens);
        }

        const results = conditions.map(cond => {
            const value = this.getFieldValue(record, cond.field);
            return this.evaluateCondition(value, cond);
        });

        return logic === 'OR'
            ? results.some(Boolean)
            : results.every(Boolean);
    }

    getFieldValue(record, field) {
        if (field === 'AccountName') return record.AccountName;
        return record[field];
    }


    evaluateCondition(fieldValue, cond) {
        if (fieldValue == null) return false;

        const f = String(fieldValue).toLowerCase().trim();
        const v = String(cond.value).toLowerCase().trim();

        const fn = parseFloat(fieldValue);
        const vn = parseFloat(cond.value);

        switch (cond.operator) {
            case 'equals':
                return (!isNaN(fn) && !isNaN(vn))
                    ? Math.abs(fn - vn) < 0.0001
                    : f === v;

            case 'notequal': return f !== v;
            case 'contains': return f.includes(v);
            case 'doesnotcontains': return !f.includes(v);
            case 'startswith': return f.startsWith(v);
            case 'endswith': return f.endsWith(v);

            case 'greaterthan': return fn > vn;
            case 'lessthan': return fn < vn;
            case 'greaterorequal': return fn >= vn;
            case 'lessorequal': return fn <= vn;

            default: return true;
        }
    }


    parseLogicExpression(expression) {
        const normalized = String(expression || '')
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .trim();
        if (!normalized) return null;
        const tokens = normalized.match(/\d+|AND|OR|\(|\)/g);
        if (!tokens) return null;
        const max = this.queryModel.conditions.length;
        for (const token of tokens) {
            if (/^\d+$/.test(token)) {
                const num = parseInt(token, 10);
                if (num < 1 || num > max) {
                    console.error('Invalid condition index:', num);
                    return null;
                }
            }
        }

        return this.convertToPostfix(tokens);
    }

    convertToPostfix(tokens) {
        const precedence = { OR: 1, AND: 2 };
        const output = [];
        const operators = [];

        for (const token of tokens) {
            if (/^\d+$/.test(token)) {
                output.push(token);
            } else if (token === 'AND' || token === 'OR') {
                while (
                    operators.length &&
                    operators[operators.length - 1] !== '(' &&
                    precedence[operators[operators.length - 1]] >= precedence[token]
                ) {
                    output.push(operators.pop());
                }
                operators.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    output.push(operators.pop());
                }
                operators.pop();
            }
        }

        while (operators.length) {
            output.push(operators.pop());
        }

        return output;
    }

    evaluateExpression(record, postfixTokens) {
        const stack = [];

        for (const token of postfixTokens) {
            if (/^\d+$/.test(token)) {
                const index = parseInt(token, 10) - 1;
                const cond = this.queryModel.conditions[index];

                if (!cond) return false;

                const value = this.getFieldValue(record, cond.field);
                stack.push(this.evaluateCondition(value, cond));
            }
            else if (token === 'AND' || token === 'OR') {
                if (stack.length < 2) return false;

                const b = stack.pop();
                const a = stack.pop();

                stack.push(token === 'AND' ? (a && b) : (a || b));
            }
        }

        return stack.length === 1 ? stack[0] : false;
    }


    handleSearchChange(event) {
        this.queryModel.search = event.target.value;
        this.applyFilters();
    }


    updatePagination() {
        this.totalPages = Math.ceil(this.data.length / this.pageSize) || 1;

        const start = (this.currentPage - 1) * this.pageSize;
        this.paginatedData = this.data.slice(start, start + this.pageSize);
    }

    get hasData() {
        return this.paginatedData.length > 0;
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }
    getAccountName(accountId) {
        const acc = this.accountOptions.find(a => a.value === accountId);
        return acc ? acc.label : '';
    }
    handlePicklistChange(event) {
        const { context, value } = event.detail;
        this.data = this.data.map(row => {
            if (row.Id === context) {
                return { ...row, AccountId: value, AccountName: this.getAccountName(value) };
            }
            return row;
        });
    }
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagination();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
        }
    }
    handleEdit(event) {
        const { context, value } = event.detail;

        this.draftValues = this.draftValues || [];

        const existing = this.draftValues.find(d => d.Id === context);

        if (existing) {
            existing.AccountId = value;
        } else {
            this.draftValues = [
                ...this.draftValues,
                { Id: context, AccountId: value }
            ];
        }
        this.data = this.data.map(row => {
            if (row.Id === context) {
                return {
                    ...row,
                    AccountId: value,
                    AccountName: this.getAccountName(value)
                };
            }
            return row;
        });
    }
    handleSave(event) {
        const drafts = event.detail.draftValues || [];

        const updated = drafts.map(draft => {
            const record = { Id: draft.Id };

            if ('AccountId' in draft) {
                record.AccountId = draft.AccountId || null;
            }
            if ('Name' in draft) {
                record.Name = draft.Name;
            }
            if ('StageName' in draft) {
                record.StageName = draft.StageName;
            }
            if ('Amount' in draft) {
                record.Amount = draft.Amount;
            }

            return record;
        });

        updateOpportunities({ opportunities: updated })
            .then(() => {
                this.draftValues = [];
                return refreshApex(this.wiredOppResult);
            })
            .catch(error => {
                this.errorMessage = error?.body?.message || error?.message || 'Error saving changes';
            });
    }
}