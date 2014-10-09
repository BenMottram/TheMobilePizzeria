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
//The FindUsCtrl is used to govern the behavior of the map page.  Here the user is shown a google map and can select
//the days of monday to friday.  When doing this the map is updated to show new markers which correspond to where the vans
// will be.
//PLEASE NOTE THAT THIS AREA OF THE CODE IS DUE FOR REFACTORING AND WILL NOT REPRESENT FUTURE ITERATIONS
//One final bug remains where old markers appear on the map as artifacts.  This is not a huge issue since the info
//windows contain the relevant data, but for the moment this is still to be resolved.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
.controller('FindUsCtrl', function($scope, DBFactory, $rootScope, $q){
        DBFactory.selectToMarkers();
        google.maps.visualRefresh = true;
        $scope.q = $q.defer();

        $scope.monMarkers = [{},{}];
        $scope.tueMarkers = [{},{}];
        $scope.wedMarkers = [{},{}];
        $scope.thurMarkers = [{},{}];
        $scope.friMarkers = [{},{}];

        $rootScope.$on("markerdata-built", function(){
            console.log("marker data built");
            $scope.mMarkers = DBFactory.returnMondayJSON();
            $scope.tMarkers = DBFactory.returnTuesdayJSON();
            $scope.wMarkers = DBFactory.returnWednesdayJSON();
            $scope.thMarkers = DBFactory.returnThursdayJSON();
            $scope.fMarkers = DBFactory.returnFridayJSON();
            $rootScope.$broadcast("markers-built");
        });

        $rootScope.$on("markers-built", function(){
            $scope.buildMarker('mon');
            $scope.buildMarker('tue');
            $scope.buildMarker('wed');
            $scope.buildMarker('thur');
            $scope.buildMarker('fri');
            $scope.q.resolve();
        });


        $scope.q.promise
            .then(function(){
                $scope.map = {
                    center: {
                        latitude: 51.238384,
                        longitude: -0.208268
                    },
                    zoom: 12,
                    markerList: []
                };
                $scope.showMap = true;
                $scope.disMonMarkers = function() {
                    console.log("tueMarkers" + JSON.stringify($scope.monMarkers));
                    $scope.map.markerList = $scope.monMarkers;
                };
                $scope.disTueMarkers = function() {
                    console.log("tueMarkers" + JSON.stringify($scope.tueMarkers));
                    $scope.map.markerList = $scope.tueMarkers;
                };
                $scope.disWedMarkers = function() {
                    console.log("tueMarkers" + JSON.stringify($scope.wedMarkers));
                    $scope.map.markerList = $scope.wedMarkers;
                };
                $scope.disThurMarkers = function() {
                    console.log("tueMarkers" + JSON.stringify($scope.thurMarkers));
                    $scope.map.markerList = $scope.thurMarkers;
                };
                $scope.disFriMarkers = function() {
                    console.log("tueMarkers" + JSON.stringify($scope.friMarkers));
                    $scope.map.markerList = $scope.friMarkers;
                };
            });

        $scope.buildMarker = function(day){
            $scope.mdm = $scope.mMarkers;
            $scope.mdmID = 'mdm';
            $scope.tdm = $scope.tMarkers;
            $scope.tdmID = 'tdm';
            $scope.wdm = $scope.wMarkers;
            $scope.wdmID = 'wdm';
            $scope.thdm = $scope.thMarkers;
            $scope.thdmID = 'thdm';
            $scope.fdm = $scope.fMarkers;
            $scope.fdmID = 'fdm';
            var dayMarkers = '';
            var dayID = '';
            var ddm = '';

            if(day == 'mon'){
                dayMarkers = $scope.monMarkers;
                dayID = $scope.mdmID;
                ddm = $scope.mdm;
            }
            if(day == 'tue'){
                dayMarkers = $scope.tueMarkers;
                dayID = $scope.tdmID;
                ddm = $scope.tdm;
            }
            if(day == 'wed'){
                dayMarkers = $scope.wedMarkers;
                dayID = $scope.wdmID;
                ddm = $scope.wdm;
            }
            if(day == 'thur'){
                dayMarkers = $scope.thurMarkers;
                dayID = $scope.thdmID;
                ddm = $scope.thdm;
            }
            if(day == 'fri'){
                dayMarkers = $scope.friMarkers;
                dayID = $scope.fdmID;
                ddm = $scope.fdm;
            }
            console.log("marker lenght: " + $scope.tdm.length);

            if(ddm.length < 1){
                dayMarkers = [];
            }
            else{
                for(i = 0; i < ddm.length; i ++){
                    dayMarkers[i].id = dayID + i;
                    dayMarkers[i].latitude = ddm[i].latitude;
                    dayMarkers[i].longitude = ddm[i].longitude;
                    dayMarkers[i].showWindow = true;
                    dayMarkers[i].location = ddm[i].location;
                    dayMarkers[i].postCode = ddm[i].postCode;
                    dayMarkers[i].time = ddm[i].time;
                    dayMarkers[i].phoneNumber = ddm[i].phoneNumber;
                }
                console.log("Marker data:" + JSON.stringify(dayMarkers));
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

