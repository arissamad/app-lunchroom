function Meal() {
    this.id;
	this.name;
    this.price;
}
Metis.define(Meal, "Meals", "id", "name", "price");
Metis.defineSortColumn(Meal, "name", "asc");
Metis.createGettersAndSetters(Meal);