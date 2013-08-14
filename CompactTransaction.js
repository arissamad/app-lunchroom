/**
 * This is saved in the StudentPacket. It is designed to be as compact as possible
 * so that StudentPacket can efficiently save a list of these.
 */
function CompactTransaction() {
	this.id; // ID of transaction
    this.amount;
}
Metis.defineSubItem(CompactTransaction, "ct", "id", "amount");
Metis.createGettersAndSetters(CompactTransaction);

CompactTransaction.prototype.getAsMap = function() {
    var map = new MapClass();
	for(var attr in this) { 
		if(this.hasOwnProperty(attr)) {
			map.put(attr, this[attr]);
		}
	}
	return map;
}