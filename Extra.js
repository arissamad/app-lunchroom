function Extra() {
    this.id = generateId();
    this.name;
    this.price;
}
Metis.define(Extra, "Extras", "id", "name", "price");
Metis.defineSortColumn(Extra, "name", "asc");
Metis.createGettersAndSetters(Extra);