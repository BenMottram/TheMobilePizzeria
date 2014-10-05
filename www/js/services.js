angular.module('mobilePizzeria.services', [])

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The updaterFactory contains all of the functions and variables associated with checking, collecting and reading the
//JSON files that provide content for the app.  This factory relies heavily on the cordova.plugin file which can be
//found at https://github.com/apache/cordova-plugin-file/blob/master/doc/index.md it also requires use of its sister plugin
//cordova.plugin.file-transfer found at https://github.com/apache/cordova-plugin-file-transfer/blob/master/doc/index.md
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
.factory('updaterFactory', function($rootScope) {
    var mobPizFileSystem = ''; //fileSystem for the mobile pizzeria app (redefined in the fileSysCB function)
    var contentJSON = ''; //the file entry object for the contentFile (redefined by the collectAppContentFile function)
    var streetFoodMenuFile = ''; //the file entry object for the StreetFoodMenu file (redefined by the collectAdditionalFiles function)
    var cateringMenuFile = ''; //the file entry object for the cateringMenuFile file (redefined by the collectAdditionalFiles function)
    var streetFoodSpotsFile = ''; //the file entry object for the streetFoodSpotsFile file (redefined by the collectAdditionalFiles function)

    return {
        //returns the mobPizFileSystem variable that represents the LocalFileSystem
        returnFileSystem: function(){
            console.log('fetching file system instance: '  + mobPizFileSystem.name);
            return mobPizFileSystem;
        },
        //returns the contentJSON variable that is the file entry representing the content of the masterContent.json
        returnContentJSON: function(){
            console.log("fetching JSON " + contentJSON.name);
            return contentJSON;
        },
        //returns the streetFoodMenuFile variable that is the file entry representing the content of the streetFoodMenu.json
        returnStreetFoodMenuFile: function(){
            console.log("fetching streetFoodMenuFile " + streetFoodMenuFile.name);
            return streetFoodMenuFile;

        },
        //returns the cateringMenuFile variable that is the file entry representing the content of the cateringMenu.json
        returnCateringMenuFile: function(){
            console.log("fetching cateringMenuFile " + cateringMenuFile.name);
            return cateringMenuFile;

        },
        //returns the streetFoodSpotsFile variable that is the file entry representing the content of the streetFoodSpots.json
        returnStreetFoodSpotsFile: function(){
            console.log("fetching streetFoodSpotsFile " + streetFoodSpotsFile.name);
            return streetFoodSpotsFile;

        },
        //Downloads the contentFile that will tell the app if further content files are required for download
        //it uses the the directory argument (in this case the dataDirectory described in the cordova-file plugin)
        //as the location for the download.  the encodeURI method creates the file path to the remote JSON file.
        ///once collected the returned file entry (result) is applied to the ContentJSON variable.
        //it then uses $broadcast to return it to the $on("collected-content" function)
        collectAppContentFile: function(directory){
            var contentFile = new FileTransfer();
            var dirPath = directory;
            console.log("downloading.... " + dirPath);
            contentFile.download(
                encodeURI("https://dl.dropboxusercontent.com/u/80193322/masterContent.json"),
                    dirPath + "masterContent.json",
                function(result) {
                    contentJSON = result;
                    $rootScope.$broadcast('collected-content', contentJSON.name);

                    console.log("download complete: " + contentJSON.toURL());
                    console.log("reading file:" + contentJSON.name);
                },
                function(error) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("download error code" + error.code);
                },
                false
            );
        },
        //CollectAdditionFiles works in a very similar manner to the collectContentFile it uses the cordova-file plugin
        //the main difference is that it uses an additional argument of missingContent which is an array of files to
        //download.  Once downloaded the result variable is set to its appropriate JSON file variable and
        //Once all of the downloads have been satisfied the promise deleteDefer is fulfilled which will delete old versions
        //of the downloaded files from the database.
        collectAdditionalFiles: function(directory, missingContent){
            var contentFile = new FileTransfer();
            var dirPath = directory;
            var missingFile = '';
            var missingData = [];
            for(i = 0; i < missingContent.length; i++){
                missingFile = missingContent[i].title;
                console.log("downloading.... " + dirPath + missingFile);
                contentFile.download(
                    encodeURI("https://dl.dropboxusercontent.com/u/80193322/" + missingFile),
                        dirPath + missingFile,
                    function(result) {
                        console.log("result file name: " + result.name);
                        if(result.name == "streetFoodMenu.json"){
                            streetFoodMenuFile = result;
                            console.log("download complete: " + streetFoodMenuFile.toURL());
                            console.log("reading file:" + streetFoodMenuFile.name);
                            missingData.push(missingContent[i]);
                            if(missingData.length == $rootScope.missingDownloads.length){
                                $rootScope.deleteDefer.resolve(missingContent);
                            }
                        }
                        if(result.name == "cateringMenu.json"){
                            cateringMenuFile = result;
                            console.log("download complete: " + cateringMenuFile.toURL());
                            console.log("reading file:" + cateringMenuFile.name);
                            missingData.push(missingContent[i]);
                            if(missingData.length == $rootScope.missingDownloads.length){
                                $rootScope.deleteDefer.resolve(missingContent);
                            }
                        }
                        if(result.name == "streetFoodSpots.json") {
                            streetFoodSpotsFile = result;
                            console.log("download complete: " + streetFoodSpotsFile.toURL());
                            console.log("reading file:" + streetFoodSpotsFile.name);
                            missingData.push(missingContent[i]);
                            if(missingData.length == $rootScope.missingDownloads.length){
                                $rootScope.deleteDefer.resolve(missingContent);
                            }
                        }
                    },
                    function(error) {
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("download error code" + error.code);
                    },
                    false
                );

            }
        },
        //readContent uses the cordova-file plugin to return a text version of a read file
        //the file varible is the fileEntry object and once complete it uses $broadcast to
        //activate the $on('read-content') function
        readContent: function(file){
            console.log("reading file: " + file.name);
            var reader = new FileReader();
            reader.onloadend = function(evt){
                console.log("read sucess!");
                console.log("details: " + evt.target.result);
                contentJSON = evt.target.result;
                $rootScope.$broadcast('read-content', contentJSON);
            };
            reader.readAsText(file);
        },
        //readAdditionalContent uses the same method as readContent to read the file entries of the additional content
        //as text. the main difference is that it uses the $rootScope.Syncing content variable as a target to read and will
        // fulfil a promise once this array length is of the appropriate length.
        readAdditionalContent: function(file){
            console.log("reading file: " + file.name);
            var reader = new FileReader();
            reader.onloadend = function(evt){
                console.log("read sucess!");
                console.log("details: " + evt.target.result);
                if(file.name == "streetFoodMenu.json"){
                    streetFoodMenuFile = evt.target.result;
                    $rootScope.syncingContent.push(file.name);
                    if ($rootScope.syncingContent.length == $rootScope.preSyncContent.length) {
                        $rootScope.defer.resolve($rootScope.syncingContent);
                    }
                }
                if(file.name == "cateringMenu.json"){
                    cateringMenuFile = evt.target.result;
                    $rootScope.syncingContent.push(file.name);
                    if ($rootScope.syncingContent.length == $rootScope.preSyncContent.length) {
                        $rootScope.defer.resolve($rootScope.syncingContent);
                    }
                }
                if(file.name == "streetFoodSpots.json"){
                    streetFoodSpotsFile = evt.target.result;
                    $rootScope.syncingContent.push(file.name);
                    if ($rootScope.syncingContent.length == $rootScope.preSyncContent.length) {
                        $rootScope.defer.resolve($rootScope.syncingContent);
                    }
                }
            };
            reader.readAsText(file);
        },
        //successful Callback on the initFileSystem function the console logs can be used to determine its success
        fileSysCB: function(fs){
            mobPizFileSystem = fs;
            console.log('File system is working: '  + mobPizFileSystem.name);
            console.log('File system root: '  + mobPizFileSystem.root.fullPath);
        },
        //Successful Callback on the requestFilesDir function sets the returned directory entry as a variable
        dirRequestCB: function(entry){
            console.log('file entry: To dataDirectory resolved');
            console.log("file path: " + entry.toURL());
        },
        //general error callback
        errorCB: function(error){
            var msg = '';

            switch (error.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            }
            console.log('Error: ' + msg)
        }
    }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The factory that governs the SQLlite database that this app uses to store and serve data to each page with dynamic content
//This factory makes heavy use of the ng-cordova library sqllite wrapper.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
.factory('DBFactory', function($rootScope, $cordovaSQLite) {
    var dbName ="mobPiz.db"; //the name of the app database
    var db = ''; //the varible that will be populated by the openDB function to be the database object
    var isDBEmpty = false; //a varible to determine if the masterTable is empty
    var streetFoodMenuTable = 'streetFoodMenuTable'; //The name of the matching table
    var cateringMenuTable = 'cateringMenuTable'; //The name of the matching table
    var streetFoodSpotsTable = 'streetFoodSpotsTable'; //The name of the matching table
    var streetFoodMenuJSON = []; //an array of JSON to be populated by the selectToStreetFood function
    var cateringStarterJSON = []; //an array of JSON to be populated by the selectToCatering function
    var cateringMainJSON = []; //an array of JSON to be populated by the selectToCatering function
    var cateringDessertJSON = []; //an array of JSON to be populated by the selectToCatering function
    var mondaySpotsJSON = []; //an array of JSON to be populated by the selectToCatering function
    var tuesdaySpotsJSON = []; //an array of JSON to be populated by the selectToMarkers function
    var wednesdaySpotsJSON = []; //an array of JSON to be populated by the selectToMarkers function
    var thursdaySpotsJSON = []; //an array of JSON to be populated by the selectToMarkers function
    var fridaySpotsJSON = []; //an array of JSON to be populated by the selectToMarkers function
    return{
        //uses the ng-cordova libary and the cordova-sqllite plugin to invoke the database
        openDB: function(){
            db = $cordovaSQLite.openDB(dbName);
            console.log("opening database");
            return db;
        },
        //returns the current value of the isDBEmpty variable
        returnDBSpace: function(){
            console.log("database empty: " +  isDBEmpty.toString());
            return isDBEmpty;
        },
        //returns the value of the streetFoodMenuJson variable
        returnStreetFoodMenuJSON: function(){
            console.log("fetching streetFoodMenuJSON... " + JSON.stringify(streetFoodMenuJSON));
            return streetFoodMenuJSON;
        },
        //returns the value of the cateringStarterJSON variable
        returnCateringStarterJSON: function(){
            console.log("fetching cateringStarterJSON... " + JSON.stringify(cateringStarterJSON));
            return cateringStarterJSON;
        },
        //returns the value of the cateringMainJSON variable
        returnCateringMainJSON: function(){
            console.log("fetching cateringDessertJSON... " + JSON.stringify(cateringDessertJSON));
            return cateringMainJSON;
        },
        //returns the value of the cateringDessertJSON variable
        returnCateringDessertJSON: function(){
            console.log("fetching cateringMainJSON... " + JSON.stringify(cateringMainJSON));
            return cateringDessertJSON;
        },
        //returns the value of the mondaySpotsJSON variable
        returnMondayJSON: function(){
            console.log("fecthing monday spot data..." + JSON.stringify(mondaySpotsJSON));
            return mondaySpotsJSON;
        },
        //returns the value of the tuesdaySpotsJSON variable
        returnTuesdayJSON: function(){
            console.log("fecthing tuesday spot data..." + JSON.stringify(tuesdaySpotsJSON));
            return tuesdaySpotsJSON;
        },
        //returns the value of the wednesdaySpotsJSON variable
        returnWednesdayJSON: function(){
            console.log("fecthing wednesday spot data..." + JSON.stringify(wednesdaySpotsJSON));
            return wednesdaySpotsJSON;
        },
        //returns the value of the thursdaySpotsJSON variable
        returnThursdayJSON: function(){
            console.log("fecthing thursday spot data..." + JSON.stringify(thursdaySpotsJSON));
            return thursdaySpotsJSON;
        },
        //returns the value of the fridaySpotsJSON variable
        returnFridayJSON: function(){
            console.log("fecthing friday spot data..." + JSON.stringify(fridaySpotsJSON));
            return fridaySpotsJSON;
        },
        //The createTable function creates a specific table That will be defined by the createQuery argument
        createTable: function(createQuery){
            $cordovaSQLite.execute(db, createQuery, [])
                .then(function(data){
                    console.log("table creation data: " + data);
                },
                function(error){
                    console.log("table creation error: " + error.code);
                });
        },
        //The createDateTable function works idenically to the createTable function but is used specifically to create the
        //dateTable table in the database
        createDateTable: function(){
            var createDateQuery = 'CREATE TABLE IF NOT EXISTS dateTable (id INTEGER PRIMARY KEY ASC, date_time INTEGER)';
            $cordovaSQLite.execute(db, createDateQuery, [])
                .then(function(data){
                    console.log("Datetable creation data: " + data);
                },
                function(error){
                    console.log("table creation error: " + error.code);
                });
        },
        //An insert method to insert data specifically into dateTable table, this will only add a Unix date if the current
        //table is empty
        populateDateTable: function(){
                var insertDateQuery = 'INSERT INTO dateTable (date_time) SELECT 1411689600 WHERE NOT EXISTS (SELECT * FROM dateTable)';
                $cordovaSQLite.execute(db, insertDateQuery, [])
                    .then(function(data){
                        console.log("Datetable insertion data: " + data);
                    },
                    function(error){
                        console.log("table creation error: " + error.code);
                    });
        },
        //A general function that inserts data into specific tables
        //the insert query determines the table to be inserted into whilst the insertInfo contains the values to be entered as an array
        insertToTable: function(insertQuery, insertInfo){
            console.log("insert data: " + insertInfo);
            console.log("insert Query" + insertQuery);
            $cordovaSQLite.execute(db, insertQuery, insertInfo)
                .then(function(data){
                    console.log("insertId: " + data.insertId);
                    console.log("rowsAffected: " + data.rowsAffected);
                },
                function(error){
                    console.log("Insert Error: " + error.code);
                });
        },
        //The isDatabaseEmpty checks the masterTable table to see if it is fully populated
        //it uses the data returned from the .then promise to determine the number of rows in the table
        //if the final count is less than required it changes isDBEmpty to true or false if otherwise.
        //once completed it will call the $broadcast to the $on('checked-DB') function.
        //This function is mostly used to populate the app's database on first use.
        IsDatabaseEmpty: function(){
            var selectQuery = 'SELECT * FROM masterTable';
            console.log("QUERY: " + selectQuery);
            $cordovaSQLite.execute(db, selectQuery, [])
                .then(function(data){
                    console.log("database row length: " + data.rows.length);
                    if(data.rows.length < 3){
                        console.log("the database is not fully formed.  It has " + data.rows.length + " entries");
                        isDBEmpty = true;
                    }
                    else{
                        console.log("database is complete with " + data.rows.length + " entries")
                        isDBEmpty = false;
                    }
                    $rootScope.$broadcast('checked-DB');
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });
        },
        //the selectDate function selects all the entries from the dataTable (ie one) and returns it as the returnDate varible
        // in the $broadcast for the $on('check-date') function.
        selectDate: function(){
            var dateQuery = 'SELECT * FROM dateTable';
            $cordovaSQLite.execute(db, dateQuery, [])
                .then(function(data){
                    console.log("date-time select data: " + JSON.stringify(data));
                    for (var i = 0; i < data.rows.length; i++) {
                       console.log("date table data: " + data.rows.item(i).date_time);
                        var returnDate = data.rows.item(i).date_time;
                    }
                    $rootScope.$broadcast('check-date', returnDate);

                },
                function(error){
                    console.log("Select Error: " + error.code);
                });

        },
        //selectToUpdate selects all entries from the masterTable it then uses the newContent argument which is an array
        //of file versions.  Upon the sucessful return of the data the result is compared against the current file versions
        //held in the database.  If the newContent version is higher an updateObject is created and added to the updateArray
        //this will then be inserted into the masterTable in the near future.
        //the function then calls the $broadcast to the $on('update-ready) function
        selectToUpdate: function(newContent){
            var selectQuery = 'SELECT * FROM masterTable';
            var updateArray = [];
            $cordovaSQLite.execute(db, selectQuery, [])
                .then(function(data){
                    for (var i = 0; i < data.rows.length; i++) {
                        if(newContent[i].version > data.rows.item(i).content_version) {
                            var updateObject = {};
                            updateObject.title = newContent[i].content;
                            updateObject.version = newContent[i].version;
                            updateArray.push(updateObject);
                        }
                    }
                    $rootScope.$broadcast("update-ready", updateArray);
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });
        },
        //selectTostreetFood follows a similar pattern to the selectToUpdate function
        //the returned data from the SELECT query is then added to a pizza object and pushed into the StreetFoodMenuJSON
        //array.
        selectToStreetFood: function(){
            var ctrlQuery = 'SELECT * FROM streetFoodMenuTable ORDER BY id';
            $cordovaSQLite.execute(db, ctrlQuery, [])
                .then(function(data){
                    for (var i = 0; i < data.rows.length; i++) {
                        pizza = {};
                        pizza.topping = data.rows.item(i).pizza_topping;
                        pizza.cost = data.rows.item(i).pizza_cost;
                        pizza.ingredients = data.rows.item(i).pizza_ingredients;
                        streetFoodMenuJSON.push(pizza);
                        console.log("pizza item: " + JSON.stringify(pizza));
                        console.log("res.rows.length: " + data.rows.length + " -- should be 1");
                    }
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });

        },
        //selectToCatering follows a similar pattern to the selectToUpdate function
        //the returned data from the SELECT query is then compared via a series of if statements to see if the content
        //should be added to the cateringStartJSON, cateringMainJSON or cateringDessertJSON array as an object
        selectToCatering: function(){
            var ctrlQuery = 'SELECT * FROM cateringMenuTable ORDER BY id';
            $cordovaSQLite.execute(db, ctrlQuery, [])
                .then(function(data){
                    for (var i = 0; i < data.rows.length; i++) {
                        if(data.rows.item(i).menu_type == "starter"){
                            var startItem = {};
                            startItem.menuItem = data.rows.item(i).menu_item;
                            startItem.menuText = data.rows.item(i).menu_text;
                            cateringStarterJSON.push(startItem);
                            console.log("start item: " + JSON.stringify(startItem));
                            console.log("res.rows.length: " + data.rows.length + " -- should be 1");
                        }
                        if(data.rows.item(i).menu_type == "main"){
                            var mainItem = {};
                            mainItem.menuItem = data.rows.item(i).menu_item;
                            mainItem.menuText = data.rows.item(i).menu_text;
                            cateringMainJSON.push(mainItem);
                            console.log("main item: " + JSON.stringify(mainItem));
                            console.log("res.rows.length: " + data.rows.length + " -- should be 1");
                        }
                        if(data.rows.item(i).menu_type == "dessert"){
                            var dessertItem = {};
                            dessertItem.menuItem = data.rows.item(i).menu_item;
                            dessertItem.menuText = data.rows.item(i).menu_text;
                            cateringDessertJSON.push(dessertItem);
                            console.log("dessert item: " + JSON.stringify(dessertItem));
                            console.log("res.rows.length: " + data.rows.length + " -- should be 1");
                        }
                    }
                },

                function(error){
                    console.log("Select Error: " + error.code);
                });
        },
        //selectToMarkers follows a similar pattern to the selectToUpdate function
        //the returned data from the SELECT query is then compared via a series of if statements to see which day marker
        //array it should be added to
        selectToMarkers: function(){
            var markerQuery = 'SELECT * FROM streetFoodSpotsTable ORDER BY id';
            $cordovaSQLite.execute(db, markerQuery, [])
                .then(function(data){
                    for(i = 0; i < data.rows.length; i ++){
                        if(data.rows.item(i).spot_day == "Monday"){
                            var mondaySpot = {};
                            mondaySpot.latitude = data.rows.item(i).spot_lat;
                            mondaySpot.longitude = data.rows.item(i).spot_long;
                            mondaySpot.location = data.rows.item(i).Location_name;
                            mondaySpot.postCode = data.rows.item(i).location_postcode;
                            mondaySpot.time = data.rows.item(i).spot_time;
                            mondaySpot.phoneNumber = data.rows.item(i).spot_tel;
                            mondaySpotsJSON.push(mondaySpot);
                        }
                        if(data.rows.item(i).spot_day == "Tuesday"){
                            var tuesdaySpot = {};
                            tuesdaySpot.latitude = data.rows.item(i).spot_lat;
                            tuesdaySpot.longitude = data.rows.item(i).spot_long;
                            tuesdaySpot.location = data.rows.item(i).Location_name;
                            tuesdaySpot.postCode = data.rows.item(i).location_postcode;
                            tuesdaySpot.time = data.rows.item(i).spot_time;
                            tuesdaySpot.phoneNumber = data.rows.item(i).spot_tel;
                            tuesdaySpotsJSON.push(tuesdaySpot);
                        }
                        if(data.rows.item(i).spot_day == "Wednesday"){
                            var wednesdaySpot = {};
                            wednesdaySpot.latitude = data.rows.item(i).spot_lat;
                            wednesdaySpot.longitude = data.rows.item(i).spot_long;
                            wednesdaySpot.location = data.rows.item(i).Location_name;
                            wednesdaySpot.postCode = data.rows.item(i).location_postcode;
                            wednesdaySpot.time = data.rows.item(i).spot_time;
                            wednesdaySpot.phoneNumber = data.rows.item(i).spot_tel;
                            wednesdaySpotsJSON.push(wednesdaySpot);

                        }
                        if(data.rows.item(i).spot_day == "Thursday"){
                            var thursdaySpot = {};
                            thursdaySpot.latitude = data.rows.item(i).spot_lat;
                            thursdaySpot.longitude = data.rows.item(i).spot_long;
                            thursdaySpot.location = data.rows.item(i).Location_name;
                            thursdaySpot.postCode = data.rows.item(i).location_postcode;
                            thursdaySpot.time = data.rows.item(i).spot_time;
                            thursdaySpot.phoneNumber = data.rows.item(i).spot_tel;
                            thursdaySpotsJSON.push(thursdaySpot);
                        }
                        if(data.rows.item(i).spot_day == "Friday"){
                            var fridaySpot = {};
                            fridaySpot.latitude = data.rows.item(i).spot_lat;
                            fridaySpot.longitude = data.rows.item(i).spot_long;
                            fridaySpot.location = data.rows.item(i).Location_name;
                            fridaySpot.postCode = data.rows.item(i).location_postcode;
                            fridaySpot.time = data.rows.item(i).spot_time;
                            fridaySpot.phoneNumber = data.rows.item(i).spot_tel;
                            fridaySpotsJSON.push(fridaySpot);
                        }
                    }
                    console.log("spots defined:");
                    $rootScope.$broadcast('markerdata-built', data.rows.length);
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });

        },
        //updateMaterTable is an UPDATE query that uses the version and title argument to replace the version value when considered out of date
        updateMasterTable: function(version, title){
            updateQuery = "UPDATE masterTable SET content_version = " + version + " WHERE content_title = " + "'" + title + "'";
            console.log("updateQuery: " + updateQuery);
            $cordovaSQLite.execute(db, updateQuery, [])
                .then(function(data){
                    console.log("update complete:" + JSON.stringify(data));
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });

        },
        //updateDateTable is an UPDATE query that uses the version and title argument to replace the date value when considered out of date
        updateDateTable: function(newDate){
            updateQuery = "UPDATE dateTable SET date_time = " + newDate + " WHERE date_time <= " + newDate;
            console.log("updateQuery: " + updateQuery);
            $cordovaSQLite.execute(db, updateQuery, [])
                .then(function(data){
                    console.log("update complete:" + JSON.stringify(data));
                },
                function(error){
                    console.log("Select Error: " + error.code);
                });

        },
        //deleteFromTable uses the missing content argument array to go through each table that requires refreshing of data
        //thsi function then deletes the content of that table before a future function repopulates it.
        deleteFromTable: function(missingContent){
            var tableName = '';
            for(i = 0; i < missingContent.length; i ++) {
                if(missingContent[i].title == 'streetFoodMenu.json'){
                    tableName = streetFoodMenuTable;
                }
                if(missingContent[i].title == 'cateringMenu.json'){
                    tableName = cateringMenuTable;
                }
                if(missingContent[i].title == 'streetFoodSpots.json'){
                    tableName = streetFoodSpotsTable;
                }
                var deleteQuery = "DELETE FROM " +  tableName;
                console.log("DELETE Query: " + deleteQuery);
                $cordovaSQLite.execute(db, deleteQuery, [])
                    .then(function (data) {
                        console.log("deletion complete: " + tableName);
                    },
                    function (error) {
                        console.log("delete Error: " + error.code);
                    });
            }
            $rootScope.$broadcast("DBread-required", missingContent);
        },
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //suite of SQL queries that are used in various CREATE, INSERT, UPDATE and SELECT queries
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        returnMasterTable: function(){
            var query = 'CREATE TABLE IF NOT EXISTS masterTable (id INTEGER PRIMARY KEY ASC, content_title TEXT, content_version INTEGER)';
            return query;
        },
        returnDateTable: function(){
            var query = 'CREATE TABLE IF NOT EXISTS dateTable (id INTEGER PRIMARY KEY ASC, date_time INTEGER DEFAULT 1411689600)';
            return query;
        },
        returnStreetFoodMenuTable: function(){
            var query = 'CREATE TABLE IF NOT EXISTS streetFoodMenuTable (id INTEGER PRIMARY KEY ASC, pizza_topping TEXT, pizza_cost TEXT, pizza_ingredients TEXT)';
            return query;
        },
        returnCateringTable: function(){
            var query = 'CREATE TABLE IF NOT EXISTS cateringMenuTable (id INTEGER PRIMARY KEY ASC, menu_type TEXT, menu_item TEXT, menu_text TEXT)';
            return query;
        },
        returnStreetFoodSpotsTable: function(){
            var query = 'CREATE TABLE IF NOT EXISTS streetFoodSpotsTable (id INTEGER PRIMARY KEY ASC, spot_day TEXT, spot_lat REAL, spot_long REAL, Location_name TEXT, location_postcode TEXT, spot_time TEXT, spot_tel TEXT)';
            return query;
        },
        insertMasterQuery:  function(){
            var query = 'INSERT INTO masterTable (content_title, content_version) VALUES (?,?)';
            return query;
        },
        inserStreetFoodMenuQuery:  function(){
            var query = 'INSERT INTO streetFoodMenuTable (pizza_topping, pizza_cost, pizza_ingredients) VALUES (?,?,?)';
            return query;

        },
        insertCateringMenuQuery:  function(){
            var query = 'INSERT INTO cateringMenuTable (menu_type, menu_item, menu_text) VALUES (?,?,?)';
            return query;
        },
        insertStreetFoodSpotsQuery:  function(){
            var query = 'INSERT INTO streetFoodSpotsTable (spot_day, spot_lat, spot_long, Location_name, location_postcode, spot_time, spot_tel) VALUES (?,?,?,?,?,?,?)';
            return query;
        },
        selectMasterQuery: function(){
            var query = 'SELECT * FROM  masterTable ORDER BY id';
            return query;
        },
        selectStreetFoodMenuQuery:  function(){
            var query = 'SELECT * FROM streetFoodMenuTable ORDER BY id';
            return query;

        },
        selectCateringMenuQuery:  function(){
            var query = 'SELECT * FROM cateringMenuTable ORDER BY id';
            return query;
        },
        selectStreetFoodSpotsQuery:  function(){
            var query = 'SELECT * FROM streetFoodSpotsTable ORDER BY day';
            return query;
        }
    }
});
