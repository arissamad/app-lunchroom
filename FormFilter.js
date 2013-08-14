function FormFilter(actionObject, actionMethod) {
	ClassUtil.inherit(FormFilter, this, Widget);
	this._super("FormFilter");
    
    this.action = new Action(arguments);

    current = this.widget.find(".appSearchBox");
	this.searchWidget = new SearchWidget("fullName");
	this.searchWidget.input.watermark($T("Search by student"));
    
    this.classFormTemplate = this.extractTemplate("class-form");
    
	this.attach();
}

FormFilter.prototype.getSearchWidget = function() {
    return this.searchWidget;
}

FormFilter.prototype.add = function(classForm, text, isSelected) {
    var formJq = this.classFormTemplate.clone();
	formJq.setText(text);
    
    if(isSelected == true) {
        formJq.addClass("selected");
    }
    
	ClickHandler.wrap(formJq, this, "clickedForm", formJq, classForm);
};

FormFilter.prototype.clickedForm = function(formJq, classForm) {
    this.widget.find(".selected").removeClass("selected");
    formJq.addClass("selected");
    
    this.action.call(classForm);
};