public with sharing class CurrencyService {

    public class CurrencyInfo {
        @AuraEnabled public List<String> currencies;
        @AuraEnabled public List<Map<String,Object>> currencyTable;
    }

    private static final String API_ENDPOINT =
        'callout:Currency_API/v6/bc11da32c74f67bdab3ba7da/latest/USD';
    @AuraEnabled(cacheable=true)
    public static CurrencyInfo getCurrencyInfo() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_ENDPOINT);
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');
        Http http = new Http();
        HttpResponse res = http.send(req);
        if (res.getStatusCode() != 200) {
            throw new AuraHandledException('API Error: ' + res.getStatus());
        }
        Map<String,Object> resMap =
            (Map<String,Object>) JSON.deserializeUntyped(res.getBody());
        Map<String,Object> rate_of_currency =
            (Map<String,Object>) resMap.get('conversion_rates');
        CurrencyInfo currency_wrap = new CurrencyInfo();
        currency_wrap.currencies = new List<String>();
        currency_wrap.currencyTable = new List<Map<String,Object>>();
        Integer i = 1;
        for (String key : rate_of_currency.keySet()) {
            currency_wrap.currencies.add(key);
            Map<String,Object> op = new Map<String,Object>();
            op.put('sno', i++);
            op.put('currency', key);
            op.put('rate', rate_of_currency.get(key));

            currency_wrap.currencyTable.add(op);
        }
        return currency_wrap;
    }
}