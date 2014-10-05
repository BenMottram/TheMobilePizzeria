angular.module('mobilePizzeria.controllers', [])

////////////////////////////////////////////////////////////////////////////////////////////
//the HomeCtrl controller:
//the homeTitle is a short JSON chain that provides the attributes used within the data binding
//for the front page title.
///////////////////////////////////////////////////////////////////////////////////////////
.controller('HomeCtrl', function($scope) {
        $scope.homeTitle = {source: 'pizzaOven.png', text: 'The Mobile Pizzeria', superText: 'Welcome To'};
})

.controller('PizMenuCtrl', function($scope, DBFactory) {

        DBFactory.selectToStreetFood();
        $scope.menuSelection = DBFactory.returnStreetFoodMenuJSON();
        $scope.pizza = {topping: $scope.menuSelection.topping, source: $scope.menuSelection.cost, ingredients: $scope.menuSelection.ingredients};
})

////////////////////////////////////////////////////////////////////////////////////////////////
//the cateringCtrl controller:
//the main function within uses DBFactory methods to retrieve a number of JSON files to be used within data binding.
// These returned values are derived from the downloaded JSON files.
////////////////////////////////////////////////////////////////////////////////////////////////
.controller('CateringCtrl', function($scope, DBFactory) {
        DBFactory.selectToCatering();

        $scope.startMenu = DBFactory.returnCateringStarterJSON();
        $scope.startItem = {menuItem: $scope.startMenu.menuItem, menuText: $scope.startMenu.menuText};

        $scope.mainMenu = DBFactory.returnCateringMainJSON();
        $scope.mainItem = {menuItem: $scope.mainMenu.menuItem, menuText: $scope.mainMenu.menuText};

        $scope.dessertMenu = DBFactory.returnCateringDessertJSON();
        $scope.dessertItem = {menuItem: $scope.dessertMenu.menuItem, menuText: $scope.dessertMenu.menuText};
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The FindUsCtrl is used to govern the behavoir of the map page.  Here the user is shown a googlemap and can select
//the days of monday to friday.  When doing this the map is updated to show new markers which corrispond to where the vans
// will be.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
.controller('FindUsCtrl', function($scope, DBFactory, $rootScope, $q){
    DBFactory.selectToMarkers();
    google.maps.visualRefresh = true;
    $scope.q = $q.defer();

    $rootScope.$on("markerdata-built", function(){
        console.log("marker data built");
        $scope.mMarkers = DBFactory.returnMondayJSON();
        $scope.tMarkers = DBFactory.returnTuesdayJSON();
        $scope.wMarkers = DBFactory.returnWednesdayJSON();
        $scope.thMarkers = DBFactory.returnThursdayJSON();
        $scope.fMarkers = DBFactory.returnFridayJSON();
        $scope.q.resolve();
    });

    $scope.q.promise
        .then(function(){
            $scope.map = {
                center: {
                    latitude: 51.238384,
                    longitude: -0.208268
                },
                mapControl: {},
                zoom: 12
            };
            $scope.marker1 = {
                idKey: 1,
                coords: {
                    latitude: null,
                    longitude: null
                },
                markerControl1: {}
            };

            $scope.marker2 = {
                idKey: 2,
                coords: {
                    latitude: null,
                    longitude: null
                },
                markerControl2 : {}
            };
            $scope.showMap = true;
        });

    $scope.disDayMarkers = function(dayMarker) {
        console.log("old marker data: " + JSON.stringify($scope.marker1) + JSON.stringify($scope.marker2));
        console.log("new marker data: " + JSON.stringify(dayMarker));
        //$scope.marker1 = {};
        //$scope.marker1.markerControl1.getGMarkers().setMap(null);
        //$scope.marker2.markerControl2.getGMarkers().setMap(null);
        //$scope.marker2 = {};
        $scope.map.mapControl.refresh({latitude: 51.238384, longitude: -0.208268});
        $scope.map.mapControl.getGMap().setZoom(12);


        for(i = 0; i < dayMarker.length; i ++){
            if(i == 0){
                //console.log("marker1 insert data: " + JSON.stringify(dayMarker[i]));
                //$scope.marker1 = {};
                $scope.marker1.coords = {};
                $scope.marker1.coords.latitude = dayMarker[i].latitude;
                $scope.marker1.coords.longitude = dayMarker[i].longitude;
                $scope.marker1.location = dayMarker[i].location;
                $scope.marker1.postCode = dayMarker[i].postCode;
                $scope.marker1.time = dayMarker[i].time;
                $scope.marker1.phoneNumber = dayMarker[i].phoneNumber;
                $scope.marker1.showWindow = true;
                $scope.marker1.idKey = 1;
                $scope.marker1.markerControl = {};
            }
            if(i == 1){
                //console.log("marker2 insert data: " + JSON.stringify(dayMarker[i]));
                //$scope.marker1 = {};
                $scope.marker2.coords = {};
                $scope.marker2.coords.latitude = dayMarker[i].latitude;
                $scope.marker2.coords.longitude = dayMarker[i].longitude;
                $scope.marker2.location = dayMarker[i].location;
                $scope.marker2.postCode = dayMarker[i].postCode;
                $scope.marker2.time = dayMarker[i].time;
                $scope.marker2.phoneNumber = dayMarker[i].phoneNumber;
                $scope.marker2.showWindow = true;
                $scope.marker2.idKey = 2;
                $scope.marker2.markerControl = {};
            }
        }
    }
})


///////////////////////////////////////////////////////////////////////////////////////////////
//The contactUsCtrl controller:
//Uses the $http.get request to retrieve JSON files to populate data.
///////////////////////////////////////////////////////////////////////////////////////////////
.controller('ContactUsCtrl', function($scope, $http){
        $http.get('json/contacts/contactDetails.json').success(function(data) {
            $scope.contactList = data;
            $scope.contact = {icon: data.icon, text: data.text, communication: data.communication, link: data.link};
        });
    }
)

/////////////////////////////////////////////////////////////////////////////////////////////
//The GalleryCtrl controller:
//like previous controllers the $http.get is used extensively to retrieve JSON files to create
//variables for data binding.  These are used within the galleryImage directives.
//Please note each get request retrieves a JSON file for a single row of four thumbnails.
/////////////////////////////////////////////////////////////////////////////////////////////
.controller('GalleryCtrl',['$scope', '$http', '$window',
    function($scope, $http, $window){
        $http.get('json/gallery/galleryRow1.json').success(function(data) {
            $scope.firstRow = data;
            $scope.firstRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow2.json').success(function(data) {
            $scope.secondRow = data;
            $scope.secondRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow3.json').success(function(data) {
            $scope.thirdRow = data;
            $scope.thirdRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow4.json').success(function(data) {
            $scope.forthRow = data;
            $scope.forthRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow5.json').success(function(data) {
            $scope.fifthRow = data;
            $scope.fifthRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow6.json').success(function(data) {
            $scope.sixthRow = data;
            $scope.sixthRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow7.json').success(function(data) {
            $scope.seventhRow = data;
            $scope.seventhRowImage = {text:data.title, source: data.id};
        });

        $http.get('json/gallery/galleryRow8.json').success(function(data) {
            $scope.eighthRow = data;
            $scope.eighthRowImage = {text:data.title, source: data.id};
        });
    }
])

/////////////////////////////////////////////////////////////////////////////////////
//The galleryImage directive:  This governs the behavior of gallery thumbnail images.
//image (defines the JSON object for the individual thumbnail images).
//The link selectImage function creates an ionic popup window showing an enlarged image
//of the current thumbnail.  The $ionicPopup.show method is native to the ionic platform.
/////////////////////////////////////////////////////////////////////////////////////
.directive('galleryImage', function($ionicPopup){
    return{
        restrict: 'E',
        replace: true,
        scope:{
            image: '='
        },
        templateUrl: "templates/directiveMarkups/galleryDisplay.html",
        link: function(scope, element){
            scope.selectImage = function(image){
                var popup = $ionicPopup.show({
                    template: '<img id="selectedImage" ng-src="img/galleryImages/' + image.id +'"  />',
                    title: image.title,
                    buttons: [
                        {text: 'Close'}
                    ]
                });

            }
        }
    };
})

///////////////////////////////////////////////////////////////////////////////////////////////
//titleDisplay Directive:
//basic directive linked to the titleDisplay.html this creates the isolate scope attributes of
//source (used to determine the url path of the image file).
//small (used to determine the super text for the title).
//text (used to determine the main text for the title).
//////////////////////////////////////////////////////////////////////////////////////////////
.directive('titleDisplay',function(){
    return{
        restrict: 'E',
        replace: true,
        scope:{
            source: '@',
            small: '@',
            text: '@'
        },
        templateUrl: "templates/directiveMarkups/titleDisplay.html"
    };
})

//////////////////////////////////////////////////////////////////////////////////
//cateringDisplay Directive:
//Basic directive linked to the caterMenu.html template to the attributes of various JSON
//item (used to determine the product name).
//text (used to determine the body of the product description).
//////////////////////////////////////////////////////////////////////////////////
.directive('cateringDisplay',function(){
    return{
        restrict: 'E',
        replace: true,
        scope:{
            item: '@',
            text: '@'
        },
        templateUrl: "templates/directiveMarkups/caterMenu.html"
    };
})

//////////////////////////////////////////////////////////////////////////////////////////////////
//menuDisplay Directive:
//basic directive linked to the menuItem.html template to use the attributes of the isolate scope.
//topping (used to determine the pizza name).
//cost (used to determine the cost of the pizza).
//ingredients (used to determine the ingredients).
//////////////////////////////////////////////////////////////////////////////////////////////////
.directive('menuDisplay',function(){
    return{
        restrict: 'E',
        replace: true,
        scope:{
            topping: '@',
            cost: '@',
            ingredients: '@'
        },
        templateUrl: "templates/directiveMarkups/menuItem.html"
    };
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//contactDisplay Directive:
//basic directive linked to the contactDisplay.html template to use the attributes of the isolate scope.
//icon (used to determine the button icon).
//text (used to determine the button text).
//communication (used to determine the media link for the button).
//link (used to determine the href link contents for the button).
//////////////////////////////////////////////////////////////////////////////////////////////////////////
.directive('contactDisplay',function(){
    return{
        restrict: 'E',
        replace: true,
        scope:{
            icon: '@',
            text: '@',
            communication: '@',
            link: '@'
        },
        templateUrl: "templates/directiveMarkups/contactDisplay.html"
    };
});

