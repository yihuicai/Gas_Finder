/*
ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var
          value = valueAccessor(),
          latLng = new google.maps.LatLng(value.latitude, value.longitude),
          mapOptions = {
            zoom: 10,
            center: latLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
            },
          map = new google.maps.Map(element, mapOptions),
          marker = new google.maps.Marker({
            position: latLng,
            map: map
          });
    }
};
*/

function ViewModel() {
    var self=this;
    this.map=ko.observable();
       // TODO: use a constructor to create a new map JS object. You can use the coordinates
       // we used, 40.7413549, -73.99802439999996 or your own!
    
    this.local=ko.observable({latitude: 37.4191334, longitude: -121.896173315})
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
    this.initMap= function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 40.7413549, lng: -73.9980244},
          zoom: 13
        });
      };
    
    
    this.result= ko.computed(function() {
        return this.street()+"+"+this.city()+"+"+this.state()+"+"+this.zipcode();
    }, this);
    this.valid= ko.pureComputed(function() {
        return this.street()&&this.city()&&this.state() ?  undefined : 'disabled';
    },this);
    this.load = function loadData(result) {
        console.log("success");
        var address = this.result();
        address = address.split(' ').join('+');
        var locationurl="https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyDsNP2t-xraE6Nn-rCuTM4SuF9zAPyXXjg";
        var markerlatlng;
        var getmarker=$.getJSON(locationurl, function(data){
            for(var i=0; i<Object.keys(data.results).length; i++){
                console.log(data.results[i].geometry.location);
                var markerlatlng=data.results[i].geometry.location;
            }
            self.map.setCenter(markerlatlng);
            self.map.setZoom(15);
            var marker = new google.maps.Marker({
                position: markerlatlng,
                map: self.map,
                title: 'First Marker!'
            });      
        });


        console.log(locationurl);
        return false;
    }
    
};
 
var vm = new ViewModel()
ko.applyBindings(vm);
    


