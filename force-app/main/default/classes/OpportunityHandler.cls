public with sharing class OpportunityHandler {
    /* public static void handleAfterInsert(List<Opportunity> newList) {
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
    }*/
    //  private static final String API_ENDPOINT =
    //     'callout:Currency_API/v6/bc11da32c74f67bdab3ba7da/latest/USD';
   
    //  @future(callout=true)
    // public static void convertAmount(Set<Id> oIds) {

    //     if (oIds == null || oIds.isEmpty()) return;
    //     List<Opportunity> oppList = [
    //         SELECT Id, Amount, Currency_Type__c
    //         FROM Opportunity
    //         WHERE Id IN :oIds
    //     ];
    //     HttpRequest req = new HttpRequest();
    //     req.setEndpoint(API_ENDPOINT);
    //     req.setMethod('GET');
    //     req.setHeader('Accept', 'application/json');
    //     Http http = new Http();
    //     HttpResponse res = http.send(req);
    //     if (res.getStatusCode() != 200) {
    //         System.debug('Currency API Failed: ' + res.getBody());
    //         return;
    //     }
    //     Map<String,Object> resMap =
    //         (Map<String,Object>) JSON.deserializeUntyped(res.getBody());
    //     Map<String,Object> rate_of_currency =
    //         (Map<String,Object>) resMap.get('conversion_rates');
    //     if (rate_of_currency == null) return;
    //     List<Opportunity> oppsToUpdate = new List<Opportunity>();
    //     for (Opportunity opp : oppList) {
    //         if (opp.Amount == null || String.isBlank(opp.Currency_Type__c)) continue;
    //         String cur_currency = opp.Currency_Type__c.toUpperCase();
    //         if (rate_of_currency.containsKey(cur_currency)) {
    //             Decimal rate =
    //                 Decimal.valueOf(String.valueOf(rate_of_currency.get(cur_currency)));
    //             oppsToUpdate.add(new Opportunity(
    //                 Id = opp.Id,
    //                 Converted_Amount__c = opp.Amount * rate
    //             ));
    //         }
    //     }
    //     if (!oppsToUpdate.isEmpty()) {
    //         update oppsToUpdate;
    //     }
    // }
}