public with sharing class OpportunityHandler {
    public static void handleAfterInsert(List<Opportunity> newList) {
        Set<Id> accountIds = new Set<Id>();

        for (Opportunity opp : newList) {
            if (opp.AccountId != null) {
                accountIds.add(opp.AccountId);
            }
        }

        updateAccountAggregates(accountIds);
    }
    public static void handleAfterUpdate(List<Opportunity> newList, Map<Id, Opportunity> oldMap) {
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity opp : newList) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            if (opp.AccountId != oldOpp.AccountId ||
                opp.Amount != oldOpp.Amount) {

                if (opp.AccountId != null) {
                    accountIds.add(opp.AccountId);
                }

                if (oldOpp.AccountId != null) {
                    accountIds.add(oldOpp.AccountId); 
                }
            }
        }
        updateAccountAggregates(accountIds);
    }
    public static void handleAfterDelete(List<Opportunity> oldList) {
        Set<Id> accountIds = new Set<Id>();

        for (Opportunity opp : oldList) {
            if (opp.AccountId != null) {
                accountIds.add(opp.AccountId);
            }
        }
        updateAccountAggregates(accountIds);
    }
    private static void updateAccountAggregates(Set<Id> accountIds) {
        if (accountIds.isEmpty()) return;
        List<AggregateResult> results = [
            SELECT AccountId,
                   MAX(Amount) maxAmt,
                   MIN(Amount) minAmt
            FROM Opportunity
            WHERE AccountId IN :accountIds
            GROUP BY AccountId
        ];
        Map<Id, Decimal> maxMap = new Map<Id, Decimal>();
        Map<Id, Decimal> minMap = new Map<Id, Decimal>();
        for (AggregateResult ar : results) {
            Id accId = (Id) ar.get('AccountId');
            maxMap.put(accId, (Decimal) ar.get('maxAmt'));
            minMap.put(accId, (Decimal) ar.get('minAmt'));
        }
        List<Account> accountsToUpdate = new List<Account>();
        for (Id accId : accountIds) {
            Account acc = new Account(Id = accId);
            acc.Max_Opportunity__c = maxMap.containsKey(accId)
                ? maxMap.get(accId)
                : null;
            acc.Min_Opportunity__c = minMap.containsKey(accId)
                ? minMap.get(accId)
                : null;
            accountsToUpdate.add(acc);
        }
        if (!accountsToUpdate.isEmpty()) {
            update accountsToUpdate;
        }
    }
}