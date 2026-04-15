public class OppServiceAPI {
    public static void updateAccountAmount(List<Opportunity> oppList) {
        Set<Id> aIds = new Set<Id>();
        for(Opportunity o : oppList) {
            if(o.AccountId!=null) {
                aIds.add(o.AccountId);
            }
        }
        if(aIds.isEmpty()) return;
        Map<Id,Decimal> max_map = new Map<Id,Decimal>();
        Map<Id,Decimal> min_map = new Map<Id,Decimal>();
        for(AggregateResult ar : [SELECT AccountId, MAX(Amount) max_amount,MIN(Amount) min_amount FROM Opportunity WHERE AccountId IN :aIds GROUP BY AccountId]) {
            Id accId = (Id)ar.get('AccountId');
            Decimal maxAmount = (Decimal)ar.get('max_amount');
            Decimal minAmount = (Decimal)ar.get('min_amount');
            max_map.put(accId, maxAmount);
            min_map.put(accId, minAmount);
        }
        List<Account> accList = [SELECT Id,Name FROM  Account WHERE Id IN :aIds];
        List<Opportunity> oppList = [SELECT Id,Name,Amount,AccountId FROM Opportunity WHERE AccountId IN :aIds];
        Map<Id,List<Map<String,Object>>> accOppMap = new Map<Id,List<Map<String,Object>>>();
        for(Opportunity o : oppList) {
            if(!accOppMap.containsKey(o.AccountId)) {
                accOppMap.put(o.AccountId,new List<Map<String,Object>>());
            }
            accOppMap.get(o.AccountId).add(new Map<String,Object>{
                'ExternalOpportunityId' => o.Id,
                'Name' => o.Name,
                'Amount' => o.Amount
            });
        }

        List<Account> accupdateList = new List<Account>();
        List<Map<String,Object>> accDataList = new List<Map<String,Object>>();
        for(Account acc : accList) {
            Decimal max_Amount = max_map.containsKey(acc.Id) ? max_map.get(acc.Id) : null;
            Decimal min_Amount = min_map.containsKey(acc.Id) ? min_map.get(acc.Id) : null; 
            acc.Max_Opportunity__c  = max_Amount;
            acc.Min_Opportunity__c  = min_Amount;
            accupdateList.add(acc);
            accDataList.add(new Map<String,Object>{ 
                'ExternalAccountId' => acc.Id,  
                'Name' => acc.Name,
                'Max_Opportunity__c' => max_Amount,
                'Min_Opportunity__c' => min_Amount,
                'Opportunities' => accOppMap.containsKey(acc.Id)
            });
        }
        if(!accupdateList.isEmpty()) {
            update accupdateList;
        }
        customCallout(accDataList);
    }
    @future(callout=true) 
    public static void customCallout(List<Map<String,Object>> accDataList) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:SF_Source_Org/services/apexrest/synchronize/Account/');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(accDataList));
        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug('Response Status: ' + res.getStatus());
        System.debug('Response Body: ' + res.getBody());
    }
}