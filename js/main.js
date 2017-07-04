function viewModel() {
	this.street= ko.observable();
    this.city= ko.observable();
    this.states= ko.observableArray(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
            'Delaware', 'Florida', 'Georgia' ,'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
            'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
            'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 
            'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
            'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);
    this.state= ko.observable();
    this.zipcode= ko.observable();
    this.remember= ko.observable(false);
    this.result= ko.computed(function() {
        return this.street()+", "+this.city()+", "+this.state()+" "+this.zipcode();
    }, this);
    this.valid= ko.pureComputed(function() {
        return this.street()&&this.city()&&this.state()&&this.zipcode() ?  undefined : 'disabled';
    },this);
};


ko.applyBindings(new viewModel());
