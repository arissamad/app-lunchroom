function EditExtra(addOrEdit, extraInfo) {
    ClassUtil.mixin(EditExtra, this, Refreshable);
    ClassUtil.mixin(EditExtra, this, Dialogable);
    
    this.addOrEdit = addOrEdit;
    this.extraInfo = extraInfo;
    
    if(addOrEdit == "add") {
        this.dialog = new Dialog("Add Extra");
        this.dialog.setOkCancel(this, "clickedSave", "Add");
    } else {
        this.dialog = new Dialog("Edit Extra");
        this.dialog.setOkCancel(this, "clickedSave", "Update");
    }
    
    var panel = new QueryPanelWidget(120);
    this.queryFields = new QueryFields(panel, this.extraInfo);
    
    panel.addLabel("Extra Name");
    this.queryFields.put("name", new InputFieldWidget(), ["notEmpty"]);
    
    panel.addLabel("Price");
    this.queryFields.put("price", new InputFieldWidget(), ["notEmpty", "numberOnly"]);
    
    panel.finish();
    if(this.addOrEdit == "edit") {
        new DeleteOption("Delete", "Click below to delete this extra.", this, function() {
            Metis.remove(this.extraInfo, this, function() {
                this.closeDialogBox();
                this.refreshAction.call();
            });
        });
    }
    
    this.dialog.reposition();
}

EditExtra.prototype.clickedSave = function() {
    if(!this.queryFields.verify()) return false;
    
    if(this.extraInfo == null) {
        this.extraInfo = new Extra();
    }
    
    this.extraInfo.setName(this.queryFields.getValue("name"));
    this.extraInfo.setPrice(this.queryFields.getValue("price"));
    
    Metis.save(this.extraInfo, this, function() {
        this.closeDialogBox();
        this.refreshAction.call();
    });
    
    return false;
}