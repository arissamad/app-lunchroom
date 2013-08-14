function EditMeal(addOrEdit, mealInfo) {
    ClassUtil.mixin(EditMeal, this, Refreshable);
    ClassUtil.mixin(EditMeal, this, Dialogable);
    
	this.addOrEdit = addOrEdit;
    this.mealInfo = mealInfo;
    
    if(addOrEdit == "add") {
        this.dialog = new Dialog("Add Meal");
        this.dialog.setOkCancel(this, "clickedSave", "Add");
    } else {
        this.dialog = new Dialog("Edit Meal");
        this.dialog.setOkCancel(this, "clickedSave", "Update");
    }
    
    var panel = new QueryPanelWidget(120);
    this.queryFields = new QueryFields(panel, this.mealInfo);
    
    panel.addLabel("Meal Name");
    this.queryFields.put("name", new InputFieldWidget(), ["notEmpty"]);
    
    panel.addLabel("Price");
    this.queryFields.put("price", new InputFieldWidget(), ["notEmpty", "numberOnly"]);
    
    panel.finish();
    
    if(this.addOrEdit == "edit") {
        new DeleteOption("Delete", "Click below to delete this meal.", this, function() {
            Metis.remove(this.mealInfo, this, function() {
                this.closeDialogBox();
                this.refreshAction.call();
            });
        });
    }
    
    this.dialog.reposition();
}

EditMeal.prototype.clickedSave = function() {
    if(!this.queryFields.verify()) return false;
    
    if(this.mealInfo == null) {
        this.mealInfo = new Meal();
    }
    
    this.mealInfo.setName(this.queryFields.getValue("name"));
    this.mealInfo.setPrice(this.queryFields.getValue("price"));
    
    Metis.save(this.mealInfo, this, function(){
        this.closeDialogBox();
        this.refreshAction.call();
    });
    
    return false;
}