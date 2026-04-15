public class OppServiceAPI {
    @future(callout=true)
    public static void updateAccountOpp(List<Id> aIdsList) {
        List<Account> accList = [
            SELECT Id, Name
            FROM Account
            WHERE Id IN :aIdsList
        ];

        Map<Id, Decimal> max_map = new Map<Id, Decimal>();
        Map<Id, Decimal> min_map = new Map<Id, Decimal>();
        for (AggregateResult ar : [
            SELECT AccountId accId,MAX(Amount) max_amount,MIN(Amount) min_amount FROM Opportunity
            WHERE AccountId IN :aIdsList AND Amount != null GROUP BY AccountId]) 
        {
            Id accId = (Id) ar.get('accId');
            max_map.put(accId, (Decimal) ar.get('max_amount'));
            min_map.put(accId, (Decimal) ar.get('min_amount'));
        }
        Map<Id, List<Map<String, Object>>> oppMap = new Map<Id, List<Map<String, Object>>>();

        for (Opportunity opp : [ SELECT Id, Name, Amount, AccountId FROM Opportunity WHERE AccountId IN :aIdsList]) 
        {
            if (opp.AccountId == null) continue;
            if (!oppMap.containsKey(opp.AccountId)) {
                oppMap.put(opp.AccountId, new List<Map<String, Object>>());
            }
            oppMap.get(opp.AccountId).add(new Map<String, Object>{
                'ExternalOpportunityId' => opp.Id,
                'Name' => opp.Name,
                'Amount' => opp.Amount
            });
        }
        List<Account> updateAccList = new List<Account>();
        List<Map<String, Object>> acc_opp_list = new List<Map<String, Object>>();
        for (Account acc : accList) {
            Decimal max_amount = max_map.containsKey(acc.Id) ? max_map.get(acc.Id) : null;
            Decimal min_amount = min_map.containsKey(acc.Id) ? min_map.get(acc.Id) : null;
            acc.Max_Opportunity__c = max_amount;
            acc.Min_Opportunity__c = min_amount;
            updateAccList.add(acc);
            acc_opp_list.add(new Map<String, Object>{
                'ExternalAccountId' => acc.Id,
                'Name' => acc.Name,
                'MaxAmount' => max_amount,
                'MinAmount' => min_amount,
                'Opportunities' => oppMap.get(acc.Id)
            });
        }
        if (!updateAccList.isEmpty()) {
            update updateAccList;
        }
        customCalloutService(acc_opp_list);
    }
    private static void customCalloutService(List<Map<String, Object>> acc_opp_list) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:SF_Source_Org/services/apexrest/synchronize/Account');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(acc_opp_list));
        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug('Response: ' + res.getBody());
    }
}