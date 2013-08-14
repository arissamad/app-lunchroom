function ChargeItem() {
	this.id;
    this.description;
    this.amount;
}
Metis.defineSubItem(ChargeItem, "ci", "id", "description", "amount");
Metis.createGettersAndSetters(ChargeItem);