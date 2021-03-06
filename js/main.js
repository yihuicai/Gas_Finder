function ViewModel() {
    var self=this;
    this.showname=ko.observable();
    this.name=ko.observable();
    this.map=ko.observable();
    this.marker=ko.observable();
    this.changed = ko.observable(false);
    this.markers = ko.observableArray([]);
    this.type=ko.observable();
    this.remain=function(){alert("This part is not finished, sorry :(");};
    this.types=ko.observableArray(['Park', 'Home', 'Company','Restaurant', 'Others']);
    this.local= {lat: 37.4191334, lng: -121.896173315};
	  this.street= ko.observable();
    this.city= ko.observable();
    this.show_gas=ko.observableArray([]);
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
        return this.street()+' '+this.city()+' '+this.state()+' '+this.zipcode();
    }, this);
    this.valid= ko.pureComputed(function() {
        return this.name()&&this.type()&&this.street() ?  undefined : 'disabled';
    },this);
    var bound;
    var gmarkers=[];

    this.DATA=[]
    this.placeArray=ko.observableArray([]);
    /*
    Set the searchQuery first because when the placeArrayResult
    found it was cleared, it will showAll() again.
    */
    this.hideall=function(){
      self.searchQuery(null);
      self.hideAll();
    };

    this.hideAll=function(){
      //let the bouncing markers stop
      if(bounce){
        toggleBounce(bounce);
        self.infowindow.marker=null;
        self.infowindow.close();
      }
      for (var i=0;i<Object.keys(self.markers()).length; i++)
        self.markers()[i].setMap(null);
      for (i=0; i<gmarkers.length;i++)
        gmarkers[i].setMap(null);
      //clear all gas markers, this is the best way to clear an array
      gmarkers.length=0;
    };

    this.showall=function(){
      self.searchQuery(null);
      self.showAll();
    };

    this.showAll=function(){
      self.hideAll();
      for (var i=0;i<Object.keys(self.markers()).length; i++){
        self.markers()[i].setMap(self.map);
        self.bound.extend(self.markers()[i].position);
        self.boundSet(self.bound);
      }
    };

    this.searchQuery=ko.observable();
    this.placeArrayResult=ko.computed(function(){
      this.ret=ko.observableArray([]);
      var placeTitle;
      self.showAll();
      if(!self.searchQuery())
        return self.placeArray();
      self.hideAll();
      for(var i=0;i<Object.keys(self.placeArray()).length;i++){
        placeTitle=self.placeArray()[i].name.toLowerCase();
        //match the query to placeArray first(the query is substring of placeArray)
        if(placeTitle.startsWith(self.searchQuery().toLowerCase())){
          //Then loop over marker and see if there is a match with marker(the query is the first few letters of a marker's title )
          for(i=0;i<Object.keys(self.markers()).length;i++){
            if(self.markers()[i].title.toLowerCase().startsWith(self.searchQuery().toLowerCase())){
              self.markers()[i].setMap(self.map);
              ret.push(self.placeArray()[i]);
            }
          }
        }
      }
      return this.ret();
    });

    var infowindow;
    this.f_new_place=ko.observable(false);
    this.f_findPlace=ko.observable(true);
    this.f_big_map=ko.pureComputed(function(){
        return !(this.f_new_place()||this.f_findPlace());
    }, this);
    this.f_small_map=ko.pureComputed(function(){
        return (this.f_new_place()&&this.f_findPlace());
    }, this);

    $(".close").on("click", function(){
        $(this).parent().addClass("noshow");
        
        if($(this).parent().attr("id")==="info"){
            self.f_findPlace(false);
        }else{
            self.f_new_place(false);
        }
        if(self.f_small_map()===false){
            $("#map_wrapper").removeClass("col-xs-6");
        }
        if(self.f_big_map()===true){
            $("#map_wrapper").removeClass("col-xs-9");
        }        
    });

    $("#find").on("click", function(){
         $("#info").removeClass("noshow");
         self.f_findPlace(true);
         if(self.f_big_map()===false){
            var add="col-xs-9";
            if(self.f_small_map()===true){
              add="col-xs-6";
            }
            $("#map_wrapper").addClass(add);
         }
    });
    $("#add").on("click", function(){
         $("#getaddr").removeClass("noshow");
         self.f_new_place(true);
         if(self.f_big_map()===false){
            var add="col-xs-9";
            if(self.f_small_map()===true){
              add="col-xs-6";
            }
            $("#map_wrapper").addClass(add);
         }
         self.Mapset();
    });
    this.DeletePlace = function(place){
      for (var i = 0; i < self.placeArray().length; i++){
        if (self.placeArray()[i].latlng.lat === place.latlng.lat){
          self.placeArray.splice(i, 1);
          self.changed = ko.observable(true);
          break
        }
      }
      for (var i=0;i<self.markers().length; i++){
        //console.log(self.markers()[i]);
        if(self.markers()[i].position.lat() === place.latlng.lat){
          //console.log(place.latlng);
          self.markers()[i].setMap(null);
          self.markers.splice(i, 1);
        }
      }

    }
    this.viewPlace=function(place){
      for (var i=0;i<Object.keys(self.markers()).length; i++){
        if(self.markers()[i].position.lat()!==place.latlng.lat){
          self.markers()[i].setMap(null);
        }
        else{
          self.markers()[i].setMap(self.map);
          toggleBounce(self.markers()[i]);
          renderMarkers(self.markers()[i].position,self.markers()[i].title);
          popInfowindow(self.markers()[i], self.infowindow);
        }
      }
    };
    var bounce=null;
    function toggleBounce(marker){
      if (bounce!==marker&&bounce!==null){
        bounce.setAnimation(null);
      }
      if (marker.getAnimation()!==null){
        marker.setAnimation(null);
        bounce=null;
      }else{
        marker.setAnimation(google.maps.Animation.BOUNCE);
        bounce=marker;
      }
    }
    function renderMarkers(latlng,Locname){
      $.ajax({
        crossDomain : true,
        dataType : 'json',
        method : 'GET',
        url : 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=gas&latitude='+latlng.lat()+'&longitude='+latlng.lng()+'&open_now=true&categories=servicestations&sort_by=distance&limit=25',
        headers : {
        'authorization': 'Bearer IyepryQA29OGHKN0Hyw2aLBVg0rYRlsc-Fqxz2DYBtjRhP4mv8nT_4bjIybvOr3A6p8oNcGESXPGsygBBQmVB24X3ZHmD0XzJNJSxULgJNeKP5igN20QtU99cK5eWXYx'
        },
        success: function( response ){
          self.show_gas.removeAll();
          self.showname(Locname);
          //$('#city').replaceWith('<h3 id="city" class="text-center">'+ Locname +'</h4>');
          self.bound = new google.maps.LatLngBounds();
          self.bound.extend({lat: latlng.lat(), lng: latlng.lng()});
          for(var i=0;i<gmarkers.length;i++){
            gmarkers[i].setMap(null);
          }
          gmarkers.length=0;
          i=0;
          var j=0;
          if(response.businesses.length===0){
            alert("No local gas stations.:( Ask Yelp to update the data");
            return 0;
          }
          while(i<3 && j<20 && response.businesses[j]!==undefined){

            var gaslatlng=response.businesses[j].coordinates;
            var markerlatlng = {lat: gaslatlng.latitude, 
                                lng: gaslatlng.longitude};
            //console.log(response.businesses[j]);
            // render the gas station info below the map
            self.show_gas.push({
              distance : response.businesses[j].distance.toFixed(0) + " meters away",
              img : "url('" + response.businesses[j].image_url + "')",
              name : response.businesses[j].name,
              address0 : response.businesses[j].location.display_address[0],
              address1 : response.businesses[j].location.display_address[1]
            });
            /* The old jQuery methond of rendering gas station information below the map
            $('#gas_title'+i).replaceWith('<div id="gas_title'+ i +'"><strong>'+response.businesses[j].name+'</strong><h5>'+response.businesses[j].location.display_address[0]+'<br>'+response.businesses[j].location.display_address[1]+'</h5></div>');
            $('#gas_img'+i).replaceWith('<img width="100%" id="gas_img'+ i +'" src="'+response.businesses[j].image_url+'" width="200px" meters away</img>');
            $('#gas_distance'+i).replaceWith('<p id="gas_distance'+ i +'">'+response.businesses[j].distance.toFixed(0)+' meters away</p>');
            */
            i++;
            // If the latlng location is not available, skip the marker setup
            if (!(markerlatlng.lat&&markerlatlng.lng)){
                j++;//continue to next business
                continue;
              }
            // set the marker infowindow.
            var title = response.businesses[j].name;
            var type = response.businesses[j].categories;
            j++;
              //create and push the marker
            self.marker = new google.maps.Marker({
                  position: markerlatlng,
                  map: self.map,
                  title: title,
                  type: type,
                  animation: google.maps.Animation.DROP,
                  icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            });
            gmarkers.push(self.marker);
              // make the marker within bound
            self.bound.extend(self.marker.position);
              // Set infowindow
            infowindow = new google.maps.InfoWindow();
            self.addgMarker(self.marker);
          }
          self.boundSet(self.bound);
          self.map.setCenter(latlng);
        }}).fail(function(){
        alert("Cannot load Yelp API to retreive the gas stations info.");
      });
    }

    this.addgMarker= function(marker){
      marker.addListener("click", function(){
          popInfowindowg(this, self.infowindow);
          if(bounce)
            toggleBounce(bounce);
      });
    };

    function popInfowindowg(marker, infowindow){
      if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        var content='<strong>' + marker.title+'</strong>';
        for (var i=0;i<marker.type.length;i++){
          content += '<div width="100px">'+ marker.type[i].title+'</div>';
        }
        content +='<a href="https://www.google.com/maps/dir/?api=1&destination='+marker.position.lat()+','+marker.position.lng()+'&travelmode=driving"  rel="noopener noreferrer" target="_blank">Direct to Here</a>';
        infowindow.setContent(content);
        infowindow.open(self.map, marker);
              // Make sure the marker property is cleared if the infowindow is closed.
        google.maps.event.addListenerOnce(infowindow, 'closeclick', function(event) {
          infowindow.marker=null;
        }); 
      }
    }
    function popInfowindow(marker, infowindow){
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<strong width="100px">' + marker.title + '</strong>'+'<div width="100px">'+ marker.type+'</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          google.maps.event.addListenerOnce(infowindow, 'closeclick', function(event) {
            infowindow.marker=null;
            if(bounce)
              toggleBounce(marker);
          });
        }
    }

    this.initMap= function initMap(){
        // Constructor creates a new map
        var fb = firebase.database().ref("/alans-gas-station");
        self.placeArray.removeAll();
        fb.on('value', function(snapshot) {
          self.DATA = snapshot.val();
          //self.placeArray = ko.observableArray(self.DATA);
            //console.log(self.DATA[i]);
          var cp = self.DATA.slice();
          self.placeArray = ko.observableArray(cp);
          self.Mapset();
      });
        
    };
    this.Mapset = function (){
      self.map = new google.maps.Map(document.getElementById('map'), {
          center: self.local,
          zoom: 14
      }); 
      self.bound = new google.maps.LatLngBounds();
      self.markers.removeAll();
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            self.marker = new google.maps.Marker({
              position: pos,
              map: self.map,
              title: "Your Location",
              type: "Others",
              icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              animation: google.maps.Animation.DROP
            });
            self.markers.push(self.marker);
            self.infowindow = new google.maps.InfoWindow()
            self.addMarker(self.marker);
            renderMarkers(self.marker.position, self.marker.title);
          }, function() {
            alert("Cannot locate your place!");
          });
      }
      //loop over placeArray and set markers
      for(var i=0; i<Object.keys(self.placeArray()).length;i++){
        var markerlatlng = self.placeArray()[i].latlng;
        var title = self.placeArray()[i].name;
        var type = self.placeArray()[i].type;
        //create and push the marker
        self.marker = new google.maps.Marker({
          position: markerlatlng,
          map: self.map,
          title: title,
          type: type,
          animation: google.maps.Animation.DROP
        });
        self.markers.push(self.marker);
            // make the marker within bound
        self.bound.extend(self.marker.position);
            // Set infowindow
        self.infowindow = new google.maps.InfoWindow();
        self.addMarker(self.marker);
      }

        self.boundSet(self.bound);
    };
    this.boundSet= function(bound){
        self.map.fitBounds(bound);
        google.maps.event.addListenerOnce(self.map, 'bounds_changed', function(event){
            if (self.map.getZoom() > 12) {
                self.map.setZoom(12);
            }
        });
    };
    this.addMarker= function(marker){
      marker.addListener("click", function(){
        toggleBounce(marker);
        if(gmarkers.length===0||self.showname()!==marker.title){
          renderMarkers(marker.position, marker.title);
        }
        popInfowindow(marker, self.infowindow);
      });
    };
    
    this.load = function loadData(fulladdr) {
        var address = self.fulladdr();
        while(address.search(' undefined')!=-1){
          address = address.replace(' undefined','');
        }
        address = address.split(' ').join('+');
        //console.log(address);

        var locationurl="https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyDsNP2t-xraE6Nn-rCuTM4SuF9zAPyXXjg";
        var addNewlocation=$.getJSON(locationurl, function(data){
          if(data.results.length===0){
            alert("Cannot find the place. please write it precisely!");
            return 0;
          }
          var feedback;
          //console.log(data.results[0].partial_match);
          if(data.results[0].partial_match===true){
            feedback=confirm("The address found is:\n"+ data.results[0].formatted_address+"\n Are you sure about it? Click Cancel to change.");
            if(feedback===false)
              return 0;
          }
          var latlng=data.results[0].geometry.location;
          var place={
                name : self.name(),
                type : self.type(),
                location : self.fulladdr(),
                latlng: latlng,
                remember : self.remember()
              };
          self.placeArray.push(place);
          var pre=false
          if (self.changed())
            pre = true;
          self.changed = ko.observable(true);
          if (place.remember){
            self.DATA.push(place);
            firebase.database().ref("/alans-gas-station").set(self.DATA);
            self.changed = ko.observable(pre);
          }
          self.Mapset();
        }).fail(function(){self.mapError();});
    };
    this.mapError=function() {
          //var e=textStatus + ", " + error;
          alert("Cannot load Google Map!");
          $("#map").text("Google Maps cannot be loaded.");
        };

    this.updateAddress = function() {
      if (!self.changed()){
        alert("You have not added any markers.");
        return;
      }
      else {
        alert("You have "+self.placeArray().length +" places now!");
        self.changed = ko.observable(false);
        self.DATA = self.placeArray.slice();
        return firebase.database().ref("/alans-gas-station").set(self.DATA)};
      }
}

var vm = new ViewModel();
ko.applyBindings(vm);

/*
       * Open the drawer when the menu ison is clicked.
*/
var menu = document.querySelector('#menu');
var main = document.querySelector('.main');
var drawer = document.querySelector('.nav');
menu.addEventListener('click', function(e) {
  drawer.classList.toggle('open');
  e.stopPropagation();
});

main.addEventListener('click', function() {
  drawer.classList.remove('open');
});

var config = {
    apiKey: "AIzaSyDWPUcOwALBoUG-j_5vR-Qifd21IVXiZSs",
    authDomain: "alans-gas-station.firebaseapp.com",
    databaseURL: "https://alans-gas-station.firebaseio.com",
    projectId: "alans-gas-station",
    storageBucket: "alans-gas-station.appspot.com",
    messagingSenderId: "1062835632013"
  };
firebase.initializeApp(config);            // Initialize Firebase
var database = firebase.database()


    


