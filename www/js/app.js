// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mobilePizzeria', ['ionic', 'mobilePizzeria.controllers', 'mobilePizzeria.services', 'ngCordova', 'google-maps'])

.run(function($ionicPlatform, updaterFactory, DBFactory, $rootScope, $q, $cordovaFile) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
        // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        //request the main file system allowing for use of the cordova-file and cordova-file-transfer plugins
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 5 * 1024 * 1024, updaterFactory.fileSysCB, updaterFactory.errorCB);

        //ensures the dataDirectory is reachable by the devices and calls the OpenAndCheckDB function to begin the process of
        //downloading files and populating the database
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, OpenAndCheckDB, updaterFactory.errorCB);

        //Opens the database and begins to create a number of tables via the DBFactory factory
        //Finally calls the DBFactory populateDateTable to create a date variable if none exists and the IsDatabaseEmpty
        //function to see if files are required for download.  This is generally only required on the first time loading
        //the app.
        function OpenAndCheckDB() {
            $rootScope.mobPizDB = DBFactory.openDB();
            masterQuery = DBFactory.returnMasterTable();
            streetFoodQuery = DBFactory.returnStreetFoodMenuTable();
            cateringQuery = DBFactory.returnCateringTable();
            streetFoodSpotsQuery = DBFactory.returnStreetFoodSpotsTable();
            dateQuery = DBFactory.returnDateTable();
            console.log("master Query" + masterQuery);
            DBFactory.createTable(masterQuery);
            DBFactory.createTable(streetFoodQuery);
            DBFactory.createTable(cateringQuery);
            DBFactory.createTable(streetFoodSpotsQuery);
            DBFactory.createDateTable();
            DBFactory.populateDateTable();
            DBFactory.IsDatabaseEmpty();
        }

        //sets the value of DBEmpty via the returnDBSpace function and then calls the selectDate function to collect
        //the date of when the next download check should be made
        $rootScope.$on('checked-DB', function (event) {
            console.log("database checked");
            $rootScope.DBEmpty = DBFactory.returnDBSpace();
            DBFactory.selectDate();

        });

        //Checks the stored date for the next download attempt to the current date
        //if the current date is greater the updateDateTable function UPDATES it with the futureDate variable
        //it then calls the updaterFactory.collectAppContentFile function to download the masterContent.json file
        //otherwise no further action is required
        $rootScope.$on('check-date', function(event, args){
            $rootScope.oldDate = args;
            console.log("old date: " + $rootScope.oldDate);
            $rootScope.nowDate = new Date().getTime() / 1000;
            $rootScope.nowDate = Math.round($rootScope.nowDate);
            console.log("date now: " + $rootScope.nowDate);
            $rootScope.futureDate = $rootScope.nowDate + 604800;
            console.log("future date: " + $rootScope.futureDate);

            if ($rootScope.oldDate <  $rootScope.nowDate) {
                DBFactory.updateDateTable($rootScope.futureDate);
                updaterFactory.collectAppContentFile(cordova.file.dataDirectory);
            }
            else {
                console.log("synchronisation not required");
            }

        });

        //once downloaded the masterContent variable is set to the fileEntry variable returned by the returnContentJSON
        //function it is then used to call the readContent function
        $rootScope.$on('collected-content', function (event, args) {
            console.log("master content collected: " + args);
            $rootScope.masterContent = updaterFactory.returnContentJSON();
            $rootScope.masterContent.file(updaterFactory.readContent, updaterFactory.errorCB);
        });

        //once the content has been turned to text the returned arguments are looped through and inserted into the appropriate
        //table if the DBEmpty variable is true.  Otherwise it calls the selectToUpdate function which will determine which tables
        //requires updating
        $rootScope.$on('read-content', function (event, args) {
            console.log("masterContent.json read");
            var newContent = JSON.parse("[" + args + "]");
            var missingContent = [];
            if ($rootScope.DBEmpty == true) {
                var masterInsert = DBFactory.insertMasterQuery();
                for (i = 0; i < newContent.length; i++) {
                    var contentArray = [];
                    contentArray.push(newContent[i].content);
                    contentArray.push(newContent[i].version);
                    var missingObject = {};
                    missingObject.title = (newContent[i].content);
                    missingObject.version = (newContent[i].version);
                    console.log("master insert: " + masterInsert);
                    DBFactory.insertToTable(masterInsert, contentArray);
                    missingContent.push(missingObject);
                }
                $rootScope.$broadcast('downloads-required', missingContent);
            }
            if ($rootScope.DBEmpty == false) {
                DBFactory.selectToUpdate(newContent);
            }
        });
        //Once the appropriate tables to be updated have been selected the missingContent  They are then added to the
        //missingContent arrray and the appropiate data is UPDATED via the updateMasterTable
        $rootScope.$on('update-ready', function (event, args) {
            var newContent = args;
            var missingContent = [];
            if (args.length > 0) {
                for (i = 0; i < newContent.length; i++) {
                    console.log("updating master content");
                    var missingObject = {};
                    missingObject.title = (newContent[i].title);
                    missingObject.version = (newContent[i].version);
                    missingContent.push(missingObject);
                    DBFactory.updateMasterTable(newContent[i].version, newContent[i].title);
                }
                $rootScope.$broadcast('downloads-required', missingContent);
            }
            else {
                console.log("Database synchronisation complete");
            }
        });

        //Here additional downloads as determined by the previous missingContent and the collectAdditionalFiles function is
        //used to download this content
        $rootScope.$on('downloads-required', function (event, args) {
            console.log("addition content required for download");
            $rootScope.missingDownloads = args;
            console.log("missing content: " + JSON.stringify($rootScope.missingDownloads));
            //download and update
            updaterFactory.collectAdditionalFiles(cordova.file.dataDirectory, $rootScope.missingDownloads);
        });

        //the defer object to be called when the DELETE query is required
        $rootScope.deleteDefer = $q.defer();

        //the promise that is called when it is determined which additional tables need to be updated
        //the deleteFromTable function is then called to delete the appropriate table information
        $rootScope.deleteDefer.promise
            .then(function(args){
                console.log("deleting from database");
                var missingContent = args;
                console.log("deleting content for overwrite: " + JSON.stringify(missingContent));
                DBFactory.deleteFromTable(missingContent);
            });

        //another defer object who's promise is used to sync the final additional content data
        $rootScope.defer = $q.defer();

        //determines the syncing content data that will be inserted back into the deleted tables.
        $rootScope.$on('DBread-required', function (event, args) {
            console.log("preparing files for syncing");
            $rootScope.preSyncContent = args;
            $rootScope.syncingContent = [];
            for (i = 0; i < $rootScope.preSyncContent.length; i++) {
                if($rootScope.preSyncContent[i].title == "streetFoodMenu.json") {
                    $rootScope.streetMenu = updaterFactory.returnStreetFoodMenuFile();
                    $rootScope.streetMenu.file(updaterFactory.readAdditionalContent, updaterFactory.errorCB);
                }
                if ($rootScope.preSyncContent[i].title == "cateringMenu.json") {
                    $rootScope.cateringMenu = updaterFactory.returnCateringMenuFile();
                    $rootScope.cateringMenu.file(updaterFactory.readAdditionalContent, updaterFactory.errorCB);
                }
                if ($rootScope.preSyncContent[i].title == "streetFoodSpots.json") {
                    $rootScope.streetSpots = updaterFactory.returnStreetFoodSpotsFile();
                    $rootScope.streetSpots.file(updaterFactory.readAdditionalContent, updaterFactory.errorCB);
                }
            }
        });

        //a series of functions that will INSERT data into the appropriate additional content tables.
        $rootScope.defer.promise
            .then(function (args) {
                console.log("Syncing with database");
                var syncingContent = args;
                console.log("sync data: " + syncingContent + " Data length: " + syncingContent.length);
                //collect data from return file and pass it to sync tables
                for(j = 0; j < syncingContent.length; j++){
                    console.log("syncing content loop: " + j + " Current file: " + syncingContent[j]);
                    if(syncingContent[j] ==  "streetFoodMenu.json"){
                        var streetFoodMenuRaws = JSON.parse("[" + updaterFactory.returnStreetFoodMenuFile() + "]");
                        var streetFoodMenuQuery = DBFactory.inserStreetFoodMenuQuery();
                        console.log("sync file: " + JSON.stringify(streetFoodMenuRaws));
                        for(i = 0; i < streetFoodMenuRaws.length; i++){
                            var streetFoodMenuArray = [];
                            streetFoodMenuArray.push(streetFoodMenuRaws[i].topping);
                            streetFoodMenuArray.push(streetFoodMenuRaws[i].cost);
                            streetFoodMenuArray.push(streetFoodMenuRaws[i].ingredients);
                            DBFactory.insertToTable(streetFoodMenuQuery, streetFoodMenuArray);
                        }

                    }
                    if(syncingContent[j] ==  "cateringMenu.json"){
                        var cateringMenuRaws = JSON.parse( "[" + updaterFactory.returnCateringMenuFile() + "]");
                        var cateringMenuQuery = DBFactory.insertCateringMenuQuery();
                        console.log("sync file " + JSON.stringify(cateringMenuRaws));
                        for(i = 0; i < cateringMenuRaws.length; i ++){
                            var cateringMenuArray = [];
                            cateringMenuArray.push(cateringMenuRaws[i].menuType);
                            cateringMenuArray.push(cateringMenuRaws[i].menuItem);
                            cateringMenuArray.push(cateringMenuRaws[i].menuText);
                            DBFactory.insertToTable(cateringMenuQuery, cateringMenuArray);
                        }
                    }
                    if(syncingContent[j] ==  "streetFoodSpots.json"){
                        var streetFoodSpotsRaws = JSON.parse("[" + updaterFactory.returnStreetFoodSpotsFile() + "]");
                        var streetFoodSpotsQuery = DBFactory.insertStreetFoodSpotsQuery();
                        console.log("sync file " + JSON.stringify(streetFoodSpotsRaws));
                        for(i = 0; i < streetFoodSpotsRaws.length; i ++){
                            var streetFoodSpotsArray = [];
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].day);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].latitude);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].longitude);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].location);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].postCode);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].time);
                            streetFoodSpotsArray.push(streetFoodSpotsRaws[i].phoneNumber);
                            DBFactory.insertToTable(streetFoodSpotsQuery, streetFoodSpotsArray);
                        }
                    }
                }
                console.log("syncing complete");

            });



    });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Each state's controller can be found in controllers.js
  $stateProvider

/////////////////////////////////////////////////////////
//Abstract state to set up the tabs
//////////////////////////////////////////////////////
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

//////////////////////////////////////////////////////
//Url redirect and template details for the home tab
/////////////////////////////////////////////////////
    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-home.html',
                controller: 'HomeCtrl'
            }
        }
    })

//////////////////////////////////////////////////////
//Url redirect and template details for the catering tab
/////////////////////////////////////////////////////
    .state('tab.catering', {
          url: '/catering',
          views: {
              'tab-catering': {
                  templateUrl: 'templates/tab-catering.html',
                  controller: 'CateringCtrl'
              }
          }
      })


///////////////////////////////////////////////////////////
//Url redirect and template details for the street food tab
///////////////////////////////////////////////////////////
    .state('tab.pizMenu', {
        url: '/pizMenu',
        views: {
            'tab-pizMenu': {
                templateUrl: 'templates/tab-pizMenu.html',
                controller: 'PizMenuCtrl'
            }
        }
    })

//////////////////////////////////////////////////////
//Url redirect and template details for the gallery tab
/////////////////////////////////////////////////////
    .state('tab.gallery', {
        url: '/gallery',
        views: {
            'tab-gallery': {
                templateUrl: 'templates/tab-gallery.html',
                controller: 'GalleryCtrl'
            }
        }
    })

//////////////////////////////////////////////////////
//Url redirect and template details for the find us tab
/////////////////////////////////////////////////////
  .state('tab.findUs', {
      url: '/findUs',
      views: {
          'tab-findUs': {
              templateUrl: 'templates/tab-findUs.html',
              controller: 'FindUsCtrl'
          }
      }
  })

//////////////////////////////////////////////////////
//Url redirect and template details for the contact us tab
/////////////////////////////////////////////////////
    .state('tab.contactUs', {
        url: '/contactUs',
        views: {
            'tab-contactUs': {
                templateUrl: 'templates/tab-contactUs.html',
                controller: 'ContactUsCtrl'
            }
        }
    });

//////////////////////////////////////////////////////////////
//defaults to the home tab if other redirects will not work.
//////////////////////////////////////////////////////////////
$urlRouterProvider.otherwise('/tab/home');

});

