function ArchiveRecords() {
	new PageHeaderWidget("Archive & Start Fresh");
    
    new TextWidget("At the end of the semester or year, you can archive old lunch orders. Each student will start fresh.\n\n");
    new TextWidget("You can transfer the current balances if they are non-zero. It will appear in the student record as an \"Opening Balance\" payment.");
    
    new LineBreakWidget();
    
    this.rg = new RadioGroup();
    this.rg.add(new ReverseRadioButtonWidget("option", true, "Transfer balances to new records.", "transfer"));
    new LineBreakWidget(0);
    this.rg.add(new ReverseRadioButtonWidget("option", false, "Don't transfer. All students reset to zero balance.", "reset"));
    
    new LineBreakWidget();
    
    new EmphasizedButtonWidget("Archive Old Lunch Orders", this, "clickedArchive");
    
    new LineBreakWidget(2);
    
    this.tableMarker = new MarkerWidget();
    this.renderArchiveTable();
}

ArchiveRecords.prototype.clickedArchive = function() {
    this.dialog = new Dialog("Name the previous period");
    new TextWidget("The lunch records will be archived.\n\n");
    
    var option = this.rg.getRadioValue();
    
    if(option == "transfer") {
        new TextWidget("Students with non-zero balances will have their balances transfered.\n\n");
    } else if(option == "reset") {
        new TextWidget("Students will be reset to have zero balances.");
    }
    
    new TextWidget("Give the archive a name, which is usually the name of the previous semester.");
    new LineBreakWidget();
    
    var panel = new QueryPanelWidget(120);
    this.queryFields = new QueryFields(panel);
    
    panel.addLabel("Archive Name");
    this.queryFields.put("name", new InputFieldWidget(), ["notEmpty"]);
    
    this.queryFields.setEnterHandler(this, "confirmArchive");
    
    panel.finish();
    
    this.dialog.setOkCancel(this, "confirmArchive", "Confirm Archive");
    this.dialog.reposition();
};

ArchiveRecords.prototype.confirmArchive = function() {
    if(!this.queryFields.verify()) return false;
    
    var archive = new Archive();
    archive.setName(this.queryFields.getValue("name"));
    
    this.dialog.close();
    delete this.dialog;
    
    this.loadingWidget = new LoadingWidget("Creating archive...");
    Metis.save(archive, this, function() {
        this.loadingWidget.close();
        var createArchiveDialog = new CreateArchive(archive, this.rg.getRadioValue());
        createArchiveDialog.setRefreshHandler(this, "renderArchiveTable");
    });
};

ArchiveRecords.prototype.renderArchiveTable = function() {
    this.tableMarker.activate();
    
    new HeaderWidget("Previous Archives");
    
    var table = new DataTableWidget(this);
    
    table.addHeader("Date", "date", 120, {columnAlign: "center"});
    table.addColumn();
    
    table.addHeader("Archive Name", "name");
    table.addColumn();
    
    table.addHeader("", "actions");
    table.addColumn(function(archive) {
        var hpanel = new HorizontalPanelWidget(false);
        new ButtonWidget("See Archived Lunch Orders", this, "clickedViewArchive", archive);
        new ButtonWidget("Test Archive", this, function() {
            new CreateArchive(archive);
        })
        hpanel.finish();
    });
    
    table.renderMetisData(Metis, "Archives");
};

ArchiveRecords.prototype.clickedViewArchive = function(archive) {
    var dialog = new ViewArchive(archive);
};