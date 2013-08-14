function Archive() {
	this.id;
    this.date = new Date();
    this.name;
}
Metis.define(Archive, "Archives", "id", "date", "name");
Metis.defineSortColumn(Archive, "date", "desc");
Metis.createGettersAndSetters(Archive);