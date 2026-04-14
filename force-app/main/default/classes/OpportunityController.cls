public with sharing class OpportunityController {
    private static Boolean isSupportedType(Schema.DisplayType type) {
    return type == Schema.DisplayType.STRING ||
           type == Schema.DisplayType.TEXTAREA ||
           type == Schema.DisplayType.PICKLIST ||
           type == Schema.DisplayType.CURRENCY ||
           type == Schema.DisplayType.DOUBLE ||
           type == Schema.DisplayType.INTEGER ||
           type == Schema.DisplayType.DATE ||
           type == Schema.DisplayType.DATETIME ||
           type == Schema.DisplayType.BOOLEAN;
}
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllAccounts() {
        try {
            return [SELECT Name FROM Account ORDER BY Name];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching accounts: ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
public static List<Map<String, Object>> getOpportunityFields() {
    try {
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Opportunity.fields.getMap();
        List<Map<String, Object>> fieldList = new List<Map<String, Object>>();

        for (String apiName : fieldMap.keySet()) {
            Schema.DescribeFieldResult fieldDesc = fieldMap.get(apiName).getDescribe();
            if (!isSupportedType(fieldDesc.getType())) {
                continue;
            }
            Map<String, Object> fieldInfo = new Map<String, Object>();
         String apiNameCorrected = apiName;

if (apiName == 'StageName') {
    fieldInfo.put('label', 'Stage'); 
    fieldInfo.put('apiName', 'StageName'); 
} else {
    fieldInfo.put('label', fieldDesc.getLabel());
    fieldInfo.put('apiName', apiName);
}
            fieldInfo.put('type', String.valueOf(fieldDesc.getType()));

            if (fieldDesc.getType() == Schema.DisplayType.PICKLIST) {
                List<Map<String, String>> picklistValues = new List<Map<String, String>>();

                for (Schema.PicklistEntry entry : fieldDesc.getPicklistValues()) {
                    if (entry.isActive()) {
                        picklistValues.add(new Map<String, String>{
                            'label' => entry.getLabel(),
                            'value' => entry.getValue()
                        });
                    }
                }

                fieldInfo.put('picklistValues', picklistValues);
            }

            fieldList.add(fieldInfo);
        }

        fieldList.add(new Map<String, Object>{
            'label' => 'Account Name',
            'apiName' => 'AccountName',
            'type' => 'STRING'
        });

        return fieldList;

    } catch (Exception e) {
        throw new AuraHandledException('Error fetching opportunity fields: ' + e.getMessage());
    }
}
    @AuraEnabled(cacheable=true)
public static List<SObject> getOpportunity() {
    try {
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Opportunity.fields.getMap();
        List<String> fields = new List<String>();

        for (String fieldName : fieldMap.keySet()) {
            fields.add(fieldName);
        }
        String query = 'SELECT ' + String.join(fields, ',') + ', Account.Name FROM Opportunity';
        return Database.query(query);
    } catch (Exception e) {
        throw new AuraHandledException('Error fetching opportunities: ' + e.getMessage());
    }
}
    @AuraEnabled
    public static void updateOpportunities(List<Opportunity> opportunities) {
        try {
            update opportunities;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating opportunities: ' + e.getMessage());
        }
    }
}