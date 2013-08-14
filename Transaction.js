function Transaction(type) {
	this.id;
    this.date = new Date();
    
    this.description;
    this.amount;
    this.items = [];
    
    if(type == null) type = "charge";
    
    // Either "charge" or "payment"
    this.type = type;
}
Metis.define(Transaction, "Transactions", "id", "date", "description", "amount", "items", "type");
Metis.defineSortColumn(Transaction, "date", "asc");
Metis.createGettersAndSetters(Transaction);

Transaction.prototype.containsKey = function(key) {
    return this.hasData(key);
}

Transaction.prototype.get = function(key) {
    return this.getData(key);
}