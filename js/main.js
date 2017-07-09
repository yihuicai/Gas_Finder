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
    this.name=ko.observable();
    this.map=ko.observable();
    this.markers = [];
       // TODO: use a constructor to create a new map JS object. You can use the coordinates
       // we used, 40.7413549, -73.99802439999996 or your own!
    this.type=ko.observable();
    
    this.types=ko.observableArray(['Park', 'Home', 'Company','Restaurant', 'Others']);
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
    this.fulladdr= ko.computed(function() {
        return this.street()+"+"+this.city()+"+"+this.state()+"+"+this.zipcode();
    }, this);
    this.valid= ko.pureComputed(function() {
        return this.name()&&this.type()&&this.street() ?  undefined : 'disabled';
    },this);
    var bound;
    this.placeArray=ko.observableArray([
        {latlng : { lat: 37.4158559, lng: -121.8975733 },
         location : "447 Great Mall Dr+Milpitas+California+95035",
         type : "Others",
         name : "Greate Mall",
         remember : false},
        {latlng : { lat: 37.4176568 , lng: -121.9016895 } ,
         location : "62 Sun Song+Milpitas+California+95035",
         type : "Home",
         name : "Alan's Home",
         remember : false}
         ]);
    var infowindow;
    
    this.f_new_place=ko.observable(false);
    this.f_findPlace=ko.observable(false)
    this.f_big_map=ko.pureComputed(function(){
        return !(this.f_new_place()||this.f_findPlace());
    }, this);

    $(".close").on("click", function(){
        $(this).parent().addClass("noshow");
        
        if($(this).parent().attr("id")==="info"){
            self.f_findPlace(false);
        }else{
            self.f_new_place(false);
        };
        if(self.f_big_map()===true){
            $("#map_wrapper").removeClass("smallmap");
        };
        
        self.initMap();
    });
    $("#find").on("click", function(){
         $("#info").removeClass("noshow");
         self.f_findPlace(true);
         if(self.f_big_map()===false){
            $("#map_wrapper").addClass("smallmap");
         };
    });
    $("#add").on("click", function(){
         $("#getaddr").removeClass("noshow");
         self.f_new_place(true);
         if(self.f_big_map()===false){
            $("#map_wrapper").addClass("smallmap");
         };
         self.initMap();
    });
    function renderComments(latlng){
      console.log(latlng);
      var url="https://api.yelp.com/v3/businesses/search?latitude="+latlng.lat+"&longitude="+latlng.lng+"&term=food";
      //console.log(url);
      var settings = {
        "url": 'https://api.yelp.com/v3/businesses/search?term=food&latitude=37.4158559&longitude=-121.8975733',
        "method": "GET",
        "dataType" : "json",
        "headers": {
          'authorization': 'Bearer IyepryQA29OGHKN0Hyw2aLBVg0rYRlsc-Fqxz2DYBtjRhP4mv8nT_4bjIybvOr3A6p8oNcGESXPGsygBBQmVB24X3ZHmD0XzJNJSxULgJNeKP5igN20QtU99cK5eWXYx',
        }
      }

      $.ajax(settings).done(function (response) {
        console.log(response);
      });   
/*
      $.ajaxSetup(
        {
          "async" : true,
          "headers" : {
          "Authorization" :  "Bearer IyepryQA29OGHKN0Hyw2aLBVg0rYRlsc-Fqxz2DYBtjRhP4mv8nT_4bjIybvOr3A6p8oNcGESXPGsygBBQmVB24X3ZHmD0XzJNJSxULgJNeKP5igN20QtU99cK5eWXYx"
        }
      })
      $.ajax({
        type: "GET",
        dataType :"json",
        url: url
              }).done(function(data){
        console.log(data);
      });
*/
    };


    function popInfowindow(marker, infowindow){
        if (infowindow.marker != marker) {
          infowindow.marker = marker;

          infowindow.setContent('<div>' + marker.title + '</div>'+'<div>'+marker.type+'</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
    };

    this.initMap= function initMap() {
        // Constructor creates a new map
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: self.placeArray()[0].latlng, //{lat: 40.7413549, lng: -73.9980244},
          zoom: 14
        });
        
        self.bound= new google.maps.LatLngBounds();
        //loop over placeArray and set markers
        for(var i=0; i<Object.keys(self.placeArray()).length;i++){
            var markerlatlng = self.placeArray()[i].latlng;
            var title = self.placeArray()[i].name;
            var type = self.placeArray()[i].type;
            //create and push the marker
            var marker = new google.maps.Marker({
                position: markerlatlng,
                map: self.map,
                title: title,
                animation: google.maps.Animation.DROP
            });
            self.markers.push(marker);
            // make the marker within bound
            self.bound.extend(marker.position);
            // Set infowindow
            self.infowindow = new google.maps.InfoWindow();
            renderComments(markerlatlng);
            marker.addListener("click", function(){
                popInfowindow(this, self.infowindow);
            });
        };
        self.map.fitBounds(self.bound);
        google.maps.event.addListenerOnce(self.map, 'bounds_changed', function(event) {
            if (this.getZoom() > 15) {
                this.setZoom(14);
            };
        });
      };
    
    this.processing = function() {
        
    }

       
    this.load = function loadData(fulladdr) {
        
        var address = self.fulladdr();
        address = address.split(' ').join('+');
        var locationurl="https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyDsNP2t-xraE6Nn-rCuTM4SuF9zAPyXXjg";
        var addNewlocation=$.getJSON(locationurl, function(data){
            
            var latlng=data.results[0].geometry.location;

            //self.map.setCenter(latlng);
            //self.map.setZoom(15);
            self.place={
                name : self.name(),
                type : self.type(),
                location : self.fulladdr(),
                latlng: latlng,
                remember : self.remember()
            };
            
            var marker = new google.maps.Marker({
                position: latlng,
                map: self.map,
                title: self.name(),
                animation: google.maps.Animation.DROP
            });
            self.bound.extend(marker.position);
            self.map.fitBounds(self.bound);
            console.log(self.place);
            self.placeArray.push(self.place);
            //var gasurl="https://api.yelp.com/v2/search";
            /*var getgas=$.ajax({
                url: gasurl,
                data: {
                    term: "gas",
                    cll: markerlatlng.lat+","+markerlatlng.lng,
                    
                    
                }}).done(function(data){
                console.log(data);});
            
            load.getgas();
            */
        });
        
        console.log("success");
        
        
        console.log(self.placeArray());
        return false;
    };
};
/*
var yelp_call=function(){
  $.ajax({
            type : 'POST',
            url : 'https://api.yelp.com/oauth2/token',
            dataType :'application/json',
            data : {
              grant_type : "client_credentials",
              client_id : "ZNxD5HfCBsAnw2sYjs6QHw",
              client_secret : "01DifFhVwFGoKyuFcOrQH3ulF5hN5ojROFKiXowZpsHC99mWeOPtLUJVjmhQNPB6"
            },

          }).success(function(result){console.log(result);});
}
*/


var vm = new ViewModel()
ko.applyBindings(vm);
    


