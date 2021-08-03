var HOMELESSLINKACTIONS = (function () {

    // scope level variables
    var clients = []; // the array holding clients available for selection
    var addedClients = []; // the array holding clients selected by the user from the clients array
    var masterTimelineEventList = []; // the array of current timeline events at the session's project. Populated once, on load.
    var masterTimelineEventListDeDuped = []; // the array of current timeline events at the session's project with clients with > 1 timeline removed. Populated once, on load.
    var masterTimelineEventListDeDupedDeActioned = []; // the array of current timeline events at the session's project with clients with > 1 timeline removed && clients with an action at this session removed. Populated once, on load. It's the "master list" to use for filtering
    var maxMasterTimelineEventDisplay; // the maximum number of records that can be in masterTimelineEventList. Used to handle the fact that the Maximum SOQL offset allowed is 2000.
    var maxMasterTimelineEventQuery; // the maximum number of records that can be in masterTimelineEventList. Used to handle the fact that the Maximum SOQL offset allowed is 2000.
    var maxMasterTimelineEventDisplayMsgStart; // the start of the message to display when the maximum number of records that can be in masterTimelineEventList is reachhed
    var maxMasterTimelineEventDisplayMsgEnd; // the end of the message to display when the maximum number of records that can be in masterTimelineEventList is reachhed
    var clientsWithActionsAtThisSession = []; // the array of clients who have an action at this session
    var maxActionsAtThisSession; // // the maximum number of records that can be in clientsWithActionsAtThisSession
    var maxActionsAtThisSessionExceededMsg; 
    var createdActions = []; // the array of created actions. Populated once, when the user attempts to create actions.
    var creationErrors = []; // the array of clients with errors. Populated once, when the user attempts to create actions.
    var msgErrorPrefix; // A generic prefix to attach to the error messages, e.g. "Something has gone wrong. Please contact In-Form support with the message below."
    var selectedSession; // the id of the currently selected session.
    var sessionId; // the id of the session.
    var sessionStartDateTime; // the start date / time of the session.
    var sessionEndDateTime; // the end date / time of the session.
    var sessionRecordTypeName; // the name of the session's record type. 
    var actionRecordTypeId; // the Id of the record type of the actions that will be created. Retrieved using sessionRecordTypeName
    var remoteActionObject; // the remote action object for Action__c
    var remoteSessionObject; // the remote action object for Session__c
    var remoteTimelineObject; // the remote action object for Timeline__c
    var remoteRecordTypeObject; // the remote action object for Record Types
    var $jq; // a reference to jquery
    var tableStart; // the start of a table;
    var aciveTimelineStatuses; // the Timeline Event statuses that are active, e.g. 'Open', 'Referral', etc.
    var projectId; // the Id of the project the session is at
    var qryClient; // the query to get client records when Show All is selected
    var qryClientOffsetAtLastRun; // used by Show More; set to zero on page load, filter change and sort order change
    var qryClientPrimarySortField; // defaults to the name field; changed on Sort Order
    var qryClientSortOrder; // the sort order
    var qryTimelineLimit; // the limit on the timeline query
    var qryTimelineOffset; // the offset on the timeline query
    var qryTimelineParam; // the query object for getting timeline events
    var qryActionsAtThisSessionParam; // the query object for getting actions at this session
    var qryActionLimit; // the limit  on the action query
    var qryActionOffset; // the offset number on the action query
    var qryActionRecordTypeParam; // the query object for getting record types
    var noActionsCreatedMsg; // the message to display when no actions are created after the user presses 'Add'
    var s1Msg; // the message to display on the S1 interface
    var showMoreLabel; // the "Show More" label in the Clients section
    var addLabel; // the "Add" label on the Add button in the Added Clients section 
    var clientDisplayChunk; // how many records to display at once in the clients table. Starts out as 1 below clientDisplayChunk. 
    var clientDisplayStart; // the starting position in the client[] array. For the Show More button, always 0 and reset to 0 when the sort order is changed (or paging is implemented)
    var clientDisplayEnd; // the ending position of in the client[] array. For the Show More button.
    var clientSortOrderField; // the field to sort the client[] array by.
    var clientSortOrderDirecton; // the direction to sort the client array in.
    var clienttableHeaderRow; // the header row for the clients table.
    var addedTableHeader; // the header for the addeed clients table.
    var maxAddedClientsMsg; // the message to display when the maximum number of clients that can be added in one transation is reached
    var maxAddedClientsThreshold; // the maximum number of clients that can be added in one transation is reached
    var maxActionsAtThisSessionMsgStart; // the message to display when the maximum clients at a retreived session is reached
    var maxActionsAtThisSessionMsgEnd; // the message to display when the maximum clients at a retreived session is reached
    var showAllClientsMsgStart; // the message displayed to users when the Show All option is selected
    var showAllClientsMsgEnd; // the message displayed to users when the Show All option is selected
    var showClientsAtSelectedSessionMsgStart; //the message displayed to users when a previous session is selected
    var showClientsAtSelectedSessionMsgEnd; //the message displayed to users when a previous session is selected
    var qryActionsAtFindButtonParam; // the query object for getting actions at a selected session
    var qryActionsAtFindButtonLimit; // the limit on the query when the find button is pressed
    var qryActionsAtFindButtonOffset; // the offset on the query when the find button is pressed
    var maxActionsAtFindButtonDisplay; // the maximum number of records that can be retrieved and displayed
    var currentProjectName; // the name of the project the session is at
    var clickRowToRemoveMsg; // the message to display when hovering over a row in the added clients table
    var clickRowToAddMsg; // the message to display when hovering over a row the clients table
    var showAllLabel; // the label for the Show All picklist option in the 'filter'
    var noClientsFoundLabel; // the label for the clients table when no clients are found at a session or project
    var removeAllLabel; // the label for the 'Remove all' button
    var addedCountLabel; // the label for the added client container's header, e.g. 'Added Clients'
    var addedCountLabelSingular; //  the label for the added client container's header, e.g. 'Added Client'
    var noErrorsLabel; // when actions are created and there are no errors, this is displayed, e.g 'No errors'
    var noClientsAddedLabel; // when an attempt to create actions is made but non are created, this is displayed, e.g. 'No added clients'
    var errorTableHeader; // the header for the error table, e.g. '<th>Name</th><th>Error</th></thead><tbody>';
    var createdTableHeader; // the header for the created table

    // scope level functions

    // initializes the interface
    var initUI = function(currentSessionId, project, rType, roAction, roSession, roTimeline, roRType, $jqry, t0, t0a, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20, t21, t22, t23, t24, t25, t26, t27, t28, t29, t30, t31, t32, t33, t34) { 
        
        // initialize variables
        initVariables(currentSessionId, project, rType, roAction, roSession, roTimeline, roRType, $jqry, t0, t0a, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20, t21, t22, t23, t24, t25, t26, t27, t28, t29, t30, t31, t32, t33, t34);
        if( (typeof sforce != 'undefined') && (sforce != null) ) {
            s1Notice(true, $jq);
            return;
        }

        // initialize session data
        initSessionData();

        // check for valid record types - this will hide the UI and display an error message if they don't match
        checkValidRecordTypes();

        // get current timeline events at this project, removing duplicate clients and removing clients with actions at this session
        initTimelines();

        // populate the 'filter/ (i.e. drop-down of dates) with the other sessions at the same project as this session 
        populateFilter();

        // set up the find button
        bindFindButton();

        // set up the help link
        bindHelpLink();

    };

    // handle the S1 interface
    var s1Notice = function(nonFrame, $jqueryReference) {
        var s1Msg = 'This page is available on mobiles and tablets by logging into In-Form from your browser. (If you see the Salesforce1 interface, you will need to select the "Full Site" option from the menu on the left).';
        $jq = $jqueryReference;
        handleErrors(s1Msg, true);
        if (nonFrame === true) {
            $jq("#progress-bar, #title, #progress-bar-loading-ui").remove(); 
        } else {
            $jq("#create-actions-container").remove();
        }
    };

    // initialises scope level variables
    var initVariables = function(sId, pr, rT, roA, roS, roT, roR, $jqy, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20, t21, t22, t23, t24, t25, t26, t27, t28, t29, t30, t31, t32, t33, t34) {
        $jq = $jqy; 
        maxMasterTimelineEventQuery = 2000; 
        maxMasterTimelineEventDisplay = 2000;
        maxActionsAtFindButtonDisplay = 2000;
        maxActionsAtThisSession = 2000;
        remoteActionObject = roA;
        remoteSessionObject = roS;
        remoteTimelineObject = roT;  
        remoteRecordTypeObject = roR;  
        sessionRecordTypeName = convertRecordTypeName(rT);
        sessionId = sId;  
        projectId = pr; 
        tableStart = '<table class="table table-striped table-bordered">'; // the start of a table;
        tableStart += '<col style="width:5%"><col style="width:19%">';
        tableStart += '<col style="width:19%"><col style="width:19%"><col style="width:19%"><col style="width:19%">';
        aciveTimelineStatuses = t0; // active Timeline Event statuses as specified in the custom setting 
        var arrayLength = aciveTimelineStatuses.length;
        if (arrayLength == 0) { // if the custom setting is empty, use the default
            aciveTimelineStatuses = t0a;
        }
        msgErrorPrefix = '<p class="text-primary text-center">' + t1 + '</p><br />';
        maxMasterTimelineEventDisplayMsgStart = t2;
        maxMasterTimelineEventDisplayMsgEnd = t3;
        maxActionsAtThisSessionMsgStart = t4; //
        maxActionsAtThisSessionMsgEnd = t5;
        maxActionsAtThisSessionExceededMsg = t6;
        noActionsCreatedMsg =  t7;
        showAllClientsMsgStart = t8;
        showAllClientsMsgEnd = t9;
        showClientsAtSelectedSessionMsgStart = t10;
        showClientsAtSelectedSessionMsgEnd = t11;
        clickRowToRemoveMsg = t12;
        clickRowToAddMsg = t13; 
        maxAddedClientsThreshold = 100;
        maxAddedClientsMsg = t14 + maxAddedClientsThreshold + t15;
        showMoreLabel = t16;
        addLabel = t17;
        qryTimelineLimit = 100;
        qryClientSortOrder = 'ASC';
        qryTimelineOffset = 0;
        qryTimelineParam = {
            where: { In_Form__Project_Lookup__c: {eq: projectId}, In_Form__Status__c: {in: aciveTimelineStatuses}, IsDeleted: {eq: false} },
            orderby: [ {In_Form__Client__c: qryClientSortOrder}, {CreatedDate: 'ASC'} ],
            limit: qryTimelineLimit
        };
        qryActionOffset = 0;
        qryActionLimit = 100;
        qryActionsAtThisSessionParam = {
            where: { In_Form__Session__c: {eq: sessionId}, IsDeleted: {eq: false} },
            orderby: [ {In_Form__Client__c: 'ASC'} ],
            limit: qryActionLimit
        };
        qryActionRecordTypeParam = { 
            where: { SobjectType: { eq: 'In_Form__Action__c'}, DeveloperName: {eq: sessionRecordTypeName},  IsActive: {eq: true} },
            limit: 1
        };
        qryActionsAtFindButtonLimit = 100;
        qryActionsAtFindButtonOffset = 0;
        qryActionsAtFindButtonParam = {
            where: { In_Form__Session__c: {eq: selectedSession}, IsDeleted: {eq: false} },
            orderby: [ {In_Form__Client__c : qryClientSortOrder} ],
            limit: 100//qryActionsAtFindButtonLimit
        };
        clientDisplayChunk = 25;
        clientDisplayStart = 0; 
        clientDisplayEnd = 24; // starts out as 1 below clientDisplayChunk
        clientSortOrderField = 'In_Form__Client_last_name__c';
        clientSortOrderDirecton = 'DESC';
        clienttableHeaderRow = '<thead><tr>';
        clienttableHeaderRow +='<th class="glyph-click">';
        clienttableHeaderRow += '<button onclick="HOMELESSLINKACTIONS.addAllClients()" ';
        clienttableHeaderRow += 'id="add-all-clients-button" ';
        clienttableHeaderRow += 'type="button" class="btn btn-primary btn-xs">';
        clienttableHeaderRow += t18;
        clienttableHeaderRow += '</button>';
        clienttableHeaderRow += '</th>';
        clienttableHeaderRow += '<th><span clsss="client-column-header">' + t19 + '</span>';
        clienttableHeaderRow += '<span class="client-sort-button-container">';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_first_name__c\', \'ASC\')"><span class="glyphicon glyphicon-arrow-up small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_first_name__c\', \'DESC\')"><span class="glyphicon glyphicon-arrow-down small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '</span>';
        clienttableHeaderRow += '</th>';
        clienttableHeaderRow += '<th><span clsss="client-column-header">' + t20 +'</span>';
        clienttableHeaderRow += '<span class="client-sort-button-container">';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_last_name__c\', \'ASC\')"><span class="glyphicon glyphicon-arrow-up small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_last_name__c\', \'DESC\')"><span class="glyphicon glyphicon-arrow-down small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '</span>';
        clienttableHeaderRow += '</th>';
        clienttableHeaderRow += '<th><span clsss="client-column-header">' + t21 + '</span>';
        clienttableHeaderRow += '<span class="client-sort-button-container">';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_nickname__c\', \'ASC\')"><span class="glyphicon glyphicon-arrow-up small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_nickname__c\', \'DESC\')"><span class="glyphicon glyphicon-arrow-down small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '</span>';
        clienttableHeaderRow += '</th>';
        clienttableHeaderRow += '<th><span clsss="client-column-header">' + t22 + '</span>';
        clienttableHeaderRow += '<span class="client-sort-button-container">';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_gender__c\', \'ASC\')"><span class="glyphicon glyphicon-arrow-up small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Client_gender__c\', \'DESC\')"><span class="glyphicon glyphicon-arrow-down small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '</span>';
        clienttableHeaderRow += '</th>';
        clienttableHeaderRow += '<th><span clsss="client-column-header">' + t23 + '</span>';
        clienttableHeaderRow += '<span class="client-sort-button-container">';        
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Status__c\', \'ASC\')"><span class="glyphicon glyphicon-arrow-up small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '<span class="pull-right" onclick="HOMELESSLINKACTIONS.clientSortAndReRender(\'In_Form__Status__c\', \'DESC\')"><span class="glyphicon glyphicon-arrow-down small" aria-hidden="true"></span></span>';
        clienttableHeaderRow += '</span>';
        clienttableHeaderRow += '</th></thead><tbody>';
        addedTableHeader = '<th>' + t19 + '</th><th>' + t20 + '</th><th>' + t21 + '</th><th>' + t22 + '</th><th>' + t23 + '</th></thead><tbody>';
        showAllLabel = t24;
        noClientsFoundLabel = t25;
        removeAllLabel = t26;
        addedCountLabel = t27;
        addedCountLabelSingular = t28;
        noErrorsLabel = t29;
        noClientsAddedLabel = t30;
        errorTableHeader = '<th>' + t31 + '</th><th>' + t32 + '</th></thead><tbody>';
        createdTableHeader = '<th>' + t33 + '</th><th>' + t34 + '</th></thead><tbody>';
    };

    // gets the current session
    var initSessionData = function() {
        var qParamSession = getSessionQuery(sessionId);
        remoteSessionObject.retrieve(
            qParamSession,
            function(err,records, event) {
                if(err) {
                    handleErrors(msgErrorPrefix + err.message, true);
                } else {
                    getSessionDatesAndProject(err,records,event);

                }  
            }
        );
    };

    // gets the dates from the current sesssion; needed because we couldn't use the dates from the Visualforce page (wrong date format)
    var getSessionDatesAndProject = function(err, records, event) {
        records.forEach(function(record) { 
            sessionStartDateTime = record.get("In_Form__Start_date_time__c");
            sessionEndDateTime = record.get("In_Form__End_date_time__c");     
            currentProjectName = record.get("In_Form__Project_name__c"); 
        });
    };
    
    // returns the query object for the current session
    var getSessionQuery = function(sId) {
        return {
            where: { Id: {eq: sId}, IsDeleted: {eq: false} },
            limit: 1
        };
    };

    // functions to populate the filter
    // filter: retrieve the sessions
    var populateFilter = function() {
        var qParamSession = getFilterQuery(sessionId, projectId);
        remoteSessionObject.retrieve(
            qParamSession,
            function(err, records, event) {
                putSessionsInFilter(err, records, event);
            }
        );
    };

    // filter: build the query that populates the filter
    var getFilterQuery = function() {
        return {
            where: { In_Form__Project__c: {eq: projectId}, Id: {ne: sessionId}, IsDeleted: {eq: false} },
            orderby: [ {In_Form__Start_date_time__c: 'DESC'} ], 
            limit: 100
        };
    };

    //  filter: append the sessions to the filter's options
    var putSessionsInFilter = function(err, records, event) {
        var filterOptions = [];
        filterOptions.push('<option value="ShowAll">-' + showAllLabel + '-</option>');
        if(err) {
            handleErrors(msgErrorPrefix + err.message, true);
        } else {
            records.forEach(function(record) {
                filterOptions.push('<option value="'+record.get("Id")+'">'+formatDate(record.get("In_Form__Start_date_time__c"))+' - '+record.get("In_Form__Record_type_name__c")+'</option>');
            });
            buildFilter(filterOptions);
            renderFilter();
        }
    }; 

    // filter: set up the filter's change event
    var buildFilter = function(filterOptions) { 
        $jq('#filter').append(filterOptions);
        // bind an event handler to the filter's change event so that it sets the selectedSession variable
        $jq("#filter").change(function() {
            selectedSession = $jq("#filter").val();
        });
        selectedSession = $jq("#filter").val(); // initialize the selectedSession variable        
    };

    // filter: render the drop-down / picklist
    var renderFilter = function() {
        $jq('#filter-inner').fadeIn('slow');
    };

    // functions to set up the find button
    var bindFindButton = function() {
        // bind an event handler to the find button so that it empties clients[] and adds the clients at the session to clients[]
        $jq("#find-button").click(function() {
            if (selectedSession === 'ShowAll') {
                callShowAllClients();
            } else {
                showClientsAtSelectedSession();
            }
        });
    };

    // functions to set up the help link
    var bindHelpLink = function() {
        $jq("#createActionsHelpLink, #help-container").click(function() {
            if ($jq("#help-container").is(":hidden") ) {
                $jq("#help-container").slideDown("slow");
            } else {
                $jq("#help-container").slideUp("slow");
            }
        });
    };

    // populates the list of lients with actions at this session; used in initAcionsAtThisSessionAndRemoveFromMasterList
    var actionPush = function(err, records, event) {
        records.forEach(function(record) {
            clientsWithActionsAtThisSession.push(
                record.get("In_Form__Client__c")
            );
        });
    };

    // retrieve current timelines at the project; recursively calls itself till it reaches the remote object limit
    var initTimelines = function() {
        remoteTimelineObject.retrieve(
            qryTimelineParam,
            function(err, records, event) {
                if(err) {
                    handleErrors(msgErrorPrefix + err.message, true);
                } else {
                    timelinePush(err, records, event);
                    if (records.length == qryTimelineLimit && qryTimelineOffset < maxMasterTimelineEventQuery) {
                        qryTimelineOffset += qryTimelineLimit;
                        qryTimelineParam.offset = qryTimelineOffset;
                        initTimelines(); // the function calls itself again if the maximum amount that can be retrieved in one query is reached
                        initLoadProgressBar(40);
                    } else {
                        // remove dupes & remove clients with an action at this session
                        removeTimelineDuplicateClients();
                        initAcionsAtThisSessionAndRemoveFromMasterList();
                    }
                }
            }
        );
    };

    // push a chunk of records on to the master Timeline Event array; called by initTimelines
    var timelinePush = function(err, records, event) {
        records.forEach(function(record) {
            masterTimelineEventList.push(
                {
                    In_Form__Client_name__c: record.get("In_Form__Client_name__c"),
                    In_Form__Client_first_name__c: record.get("In_Form__Client_first_name__c"),
                    In_Form__Client_last_name__c: record.get("In_Form__Client_last_name__c"),
                    In_Form__Client__c: record.get("In_Form__Client__c"),
                    CreatedDate: record.get("CreatedDate"),
                    In_Form__Client_nickname__c: undefinedToString(record.get("In_Form__Client_nickname__c")),
                    In_Form__Client_gender__c: undefinedToString(record.get("In_Form__Client_gender__c")),
                    In_Form__Timeline_Event__c: record.get("Id"),
                    In_Form__Status__c: record.get("In_Form__Status__c")
                }
            );
        });
    };

    // removes duplicate clients from the list of current timeline events; called by initTimelines
    var removeTimelineDuplicateClients = function() {
        var currentIn_Form__Client__c = '';
        masterTimelineEventList.forEach(function(record) {
            if (currentIn_Form__Client__c !== record.In_Form__Client__c) {
                masterTimelineEventListDeDuped.push(record);
            }
            currentIn_Form__Client__c = record.In_Form__Client__c;
        });
        initLoadProgressBar(80);
    };

    // function that gets existing actions at this session and removes them from the master list
    var initAcionsAtThisSessionAndRemoveFromMasterList = function() {
        remoteActionObject.retrieve(
            qryActionsAtThisSessionParam,
            function(err, records, event) {
                if(err) {
                    handleErrors(msgErrorPrefix + err.message, true);
                } else {
                    initLoadProgressBar(90);
                    actionPush(err, records, event);
                    if (records.length == qryActionLimit && qryActionOffset < maxActionsAtThisSession) {
                        qryActionOffset += qryActionLimit;
                        qryActionsAtThisSessionParam.offset = qryActionOffset;
                        if (qryActionOffset >= maxActionsAtThisSession) {
                            handleErrors(msgErrorPrefix + '<p class="text-center">' + maxActionsAtThisSessionMsgStart + ' ' + maxActionsAtThisSession + ' ' + maxActionsAtThisSessionMsgEnd + '</p>', true);
                            $jq('#progress-data').hide(); 
                            return;
                        }
                        initAcionsAtThisSessionAndRemoveFromMasterList(); // the function calls itself again if the maximum amount that can be retrieved in one query is reached
                    } else {
                        initLoadProgressBar(95);
                        removeTimelineClientsWithActionsAtThisSession();
                        if (masterTimelineEventList.length >= maxMasterTimelineEventDisplay) {
                            handleErrors(msgErrorPrefix + '<p class="text-center">' + maxMasterTimelineEventDisplayMsgStart + ' ' + maxMasterTimelineEventDisplay + ' ' + maxMasterTimelineEventDisplayMsgEnd + '</p>', true);
                            $jq('#progress-data').hide(); 
                            return;
                        }                    
                        showFilter(); 
                        callShowAllClients();
                    }
                }
            }
        );
    }; 

    // remove clients with actions at this session
    var removeTimelineClientsWithActionsAtThisSession = function() {
        masterTimelineEventListDeDuped.forEach(function(record) {
            if (clientsWithActionsAtThisSession.indexOf(record.In_Form__Client__c) === -1) {
                masterTimelineEventListDeDupedDeActioned.push(record);
            }
        });
    };

    // display the Filter, Client and Added section after the initial UI rendering is completed
    var showFilter = function() {
        $jq('#progress-data').hide();     
        $jq('#filter-container').fadeIn('slow');
        $jq('#progress-bar-loading-ui').hide();
    };
    
    // calls showAllClients from the find button
    var callShowAllClients = function() {
        clientDisplayStart = 0;
        clientDisplayEnd = 24;
        $jq("#find-spinner-img").css('visibility', 'visible'); 
        $jq('#clients-container').fadeOut('slow');
        $jq('#added-clients-container').fadeOut('slow'); 
        $jq('#data-epicycle').fadeOut('slow');
        showAllClients();
    };

    // return all clients with a current timeline event at the session's project 
    var showAllClients = function() {
        clients.length = 0;
        masterTimelineEventListDeDupedDeActioned.forEach(function(record) {
            clients.push(
                {
                    In_Form__Client__c: record.In_Form__Client__c, 
                    In_Form__Timeline_Event__c: record.In_Form__Timeline_Event__c,
                    sessionId: sessionId,
                    In_Form__Client_name__c: undefinedToString(record.In_Form__Client_name__c),
                    In_Form__Client_first_name__c: undefinedToString(record.In_Form__Client_first_name__c),
                    In_Form__Client_last_name__c: undefinedToString(record.In_Form__Client_last_name__c),
                    In_Form__Client_nickname__c: undefinedToString(record.In_Form__Client_nickname__c),
                    In_Form__Client_gender__c: undefinedToString(record.In_Form__Client_gender__c),
                    In_Form__Status__c: record.In_Form__Status__c
                }
            );
        });
        renderClientTable(clients);
        renderAddedTable(addedClients);
        $jq("#find-spinner-img").css('visibility', 'hidden');
        $jq('#clients-container').fadeIn('slow');
        $jq('#added-clients-container').fadeIn('slow');
        $jq('#data-epicycle').html(showAllClientsMsgStart + currentProjectName + showAllClientsMsgEnd);
        $jq('#data-epicycle').fadeIn('slow');
    };

    // retrieves the clients at the selected session
    var showClientsAtSelectedSession = function() {
        clients.length = 0; 
        qryActionsAtFindButtonLimit = 100;
        qryActionsAtFindButtonOffset = 0;
        clientDisplayStart = 0;
        clientDisplayEnd = 24;
        $jq("#find-spinner-img").css('visibility', 'visible'); 
        $jq('#added-clients-container').fadeOut('slow'); 
        $jq('#clients-container').fadeOut('slow');
        $jq('#data-epicycle').fadeOut('slow');

        retrieveClientsAtSelectedSession(
            {
                where: { In_Form__Session__c: {eq: selectedSession}, IsDeleted: {eq: false} },
                orderby: [ {In_Form__Client__c : qryClientSortOrder} ],
                limit: qryActionsAtFindButtonLimit
            }
        );
    };

    // retrives the clients at the selected session
    var retrieveClientsAtSelectedSession = function(qryParam) {
        remoteActionObject.retrieve(
            qryParam,
            function(err, records, event) {
                if(err) {
                    handleErrors(msgErrorPrefix + err.message, true);
                } else {
                    updateClientsFromActions(err,records,event);
                    if (records.length == qryActionsAtFindButtonLimit && qryActionsAtFindButtonOffset < maxActionsAtFindButtonDisplay) {
                       qryActionsAtFindButtonOffset += qryActionsAtFindButtonLimit;
                        qryParam.offset = qryActionsAtFindButtonOffset;
                        retrieveClientsAtSelectedSession(qryParam); // the functino calls itself again if the maximum amount that can be retrieved in one query is received
                    } else {
                        if (qryActionsAtFindButtonOffset >= maxActionsAtFindButtonDisplay) {
                            alert(maxActionsAtThisSessionExceededMsg);
                            $jq("#find-spinner-img").css('visibility', 'hidden');    
                            $jq('#added-clients-container').fadeIn('slow'); 
                        } else {
                            renderClientTable(clients);
                            $jq("#find-spinner-img").css('visibility', 'hidden');
                            $jq('#added-clients-container').fadeIn('slow');
                            $jq('#clients-container').fadeIn('slow');
                            $jq('#data-epicycle').html(showClientsAtSelectedSessionMsgStart + currentProjectName + showClientsAtSelectedSessionMsgEnd);
                            $jq('#data-epicycle').fadeIn('slow');
                        }
                    }
                }                    
            }
        );
    };    

    // updates the clients[] array from the selected actions... the clients[] must be empty first as this is called repeatedly in a recursive function
    var updateClientsFromActions = function(err,records,event) {
        var currentIn_Form__Client__c = '';
        var previousIn_Form_Client__c = '';
        records.forEach(function(record) { 
                currentIn_Form__Client__c = record.get("In_Form__Client__c");
                // only update the client array if the client is in masterTimelineEventListDeDupedDeActioned and they haven't appeared in twice
                masterTimelineEventListDeDupedDeActioned.forEach(function(obj) {
                    if (currentIn_Form__Client__c === obj.In_Form__Client__c) {
                        if (previousIn_Form_Client__c !== currentIn_Form__Client__c) {
                            clients.push(
                                {
                                    In_Form__Client__c: obj.In_Form__Client__c, 
                                    In_Form__Timeline_Event__c: obj.In_Form__Timeline_Event__c,
                                    sessionId: sessionId,
                                    In_Form__Client_name__c: undefinedToString(obj.In_Form__Client_name__c),
                                    In_Form__Client_first_name__c: undefinedToString(obj.In_Form__Client_first_name__c),
                                    In_Form__Client_last_name__c: undefinedToString(obj.In_Form__Client_last_name__c),                                    
                                    In_Form__Client_nickname__c: undefinedToString(obj.In_Form__Client_nickname__c),
                                    In_Form__Client_gender__c: undefinedToString(obj.In_Form__Client_gender__c),
                                    In_Form__Status__c: obj.In_Form__Status__c
                                }
                            );
                        }
                    }                
                });  
                previousIn_Form_Client__c = currentIn_Form__Client__c;  
        });
    };

    // function to sort the client array
    var sortClients = function() {  
        if( clientSortOrderField === 'In_Form__Client_first_name__c' && clientSortOrderDirecton === 'DESC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_first_name__c > b.In_Form__Client_first_name__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_first_name__c < b.In_Form__Client_first_name__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }        
        if( clientSortOrderField === 'In_Form__Client_first_name__c' && clientSortOrderDirecton === 'ASC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_first_name__c < b.In_Form__Client_first_name__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_first_name__c > b.In_Form__Client_first_name__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }
        if( clientSortOrderField === 'In_Form__Client_last_name__c' && clientSortOrderDirecton === 'DESC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_last_name__c > b.In_Form__Client_last_name__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_last_name__c < b.In_Form__Client_last_name__c) {
                        return -1;
                    }      
                    return 0;          
             });
        } 
        if( clientSortOrderField === 'In_Form__Client_last_name__c' && clientSortOrderDirecton === 'ASC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_last_name__c < b.In_Form__Client_last_name__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_last_name__c > b.In_Form__Client_last_name__c) {
                        return -1;
                    }      
                    return 0;          
             });
        } 
        if( clientSortOrderField === 'In_Form__Client_nickname__c' && clientSortOrderDirecton === 'DESC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_nickname__c > b.In_Form__Client_nickname__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_nickname__c < b.In_Form__Client_nickname__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }
        if( clientSortOrderField === 'In_Form__Client_nickname__c' && clientSortOrderDirecton === 'ASC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_nickname__c < b.In_Form__Client_nickname__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_nickname__c > b.In_Form__Client_nickname__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }    
        if( clientSortOrderField === 'In_Form__Client_gender__c' && clientSortOrderDirecton === 'DESC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_gender__c > b.In_Form__Client_gender__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_gender__c < b.In_Form__Client_gender__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }
        if( clientSortOrderField === 'In_Form__Client_gender__c' && clientSortOrderDirecton === 'ASC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Client_gender__c < b.In_Form__Client_gender__c) {
                        return 1;
                    }
                    if (a.In_Form__Client_gender__c > b.In_Form__Client_gender__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }
        if( clientSortOrderField === 'In_Form__Status__c' && clientSortOrderDirecton === 'DESC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Status__c > b.In_Form__Status__c) {
                        return 1;
                    }
                    if (a.In_Form__Status__c < b.In_Form__Status__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }
        if( clientSortOrderField === 'In_Form__Status__c' && clientSortOrderDirecton === 'ASC') {
            clients.sort(function(a, b) {
                    if (a.In_Form__Status__c < b.In_Form__Status__c) {
                        return 1;
                    }
                    if (a.In_Form__Status__c > b.In_Form__Status__c) {
                        return -1;
                    }      
                    return 0;          
             });
        }  
    };

    // sorts the client table with the specified field
    var clientSortAndReRender = function(field, direction) {
        clientSortOrderField = field;
        clientSortOrderDirecton = direction;
        sortClients();
        renderClientTable(clients);
    };

    // renders the table of clients available for selection given an array of clients 
    var renderClientTable = function (arrayOfClientObjects) {
        var tableContainer = $jq("#clients-table-container");
        var currentPosition = 0;
        if (arrayOfClientObjects.length ===0) {
            var noRecordsMsg = getAlertMsg(noClientsFoundLabel, 'info', 'glyphicon-th-list', false);
            tableContainer.html(noRecordsMsg);
            return;
        }
        sortClients();
        var clientTable = tableStart;
        clientTable += clienttableHeaderRow;
        tableContainer.empty();
        var cName = '';
        var idx;
        $jq.each(arrayOfClientObjects, function(key, value) {
            if (key >= clientDisplayStart && key <= clientDisplayEnd) {
                idx = key + 1;
                clientTable += '<tr id="client-row-' + value.In_Form__Client__c + '"';
                if (getClientNameFromAdded(addedClients, value.In_Form__Client__c) !== '') {
                    clientTable += ' class="client-row-added"';
                }
                clientTable += ' onclick="HOMELESSLINKACTIONS.addClient(\'' + key + '\',' + true + ',' + true + ')">';
                clientTable += '<td class="client-idx" title="' + clickRowToAddMsg + '"><span class="client-idx">' + idx + '</span></td>';
                clientTable += '<td>' + value.In_Form__Client_first_name__c + '</td>';
                clientTable += '<td>' + value.In_Form__Client_last_name__c + '</td>';
                clientTable += '<td>' + value.In_Form__Client_nickname__c + '</td><td>' + value.In_Form__Client_gender__c + '</td>';
                clientTable += '<td>' + value.In_Form__Status__c + '</td></tr>';
            }
        });
        clientTable += '</tbody></table>';
        currentPosition = clientDisplayEnd + 1;
        if (currentPosition > clients.length) {
            currentPosition = clients.length;
        }
        clientTable += '<p class="text-center"><a class="btn btn-primary" onclick="HOMELESSLINKACTIONS.showMoreClients()" id="btnShowMore" role="button">' + showMoreLabel + '</a></p>';
        clientTable += '<p class="text-center"><small>' + currentPosition + ' of ' + clients.length + '</small></p>';
        tableContainer.append(clientTable);
    };

    // renders the table of clients available for selection given an array of clients 
    var renderAddedTable = function (arrayOfAddedObjects) {
        var tableContainer = $jq("#added-table-container");
        var addedCount = $jq("#added-clients-label");
        var addedCountMsg = addedCountLabel; 
        var addedCountMsgSingular = addedCountLabelSingular;         
        if (arrayOfAddedObjects.length ===0) {
            var noRecordsMsg = getAlertMsg(noClientsAddedLabel, 'info', 'glyphicon-th-list', false);
            tableContainer.html(noRecordsMsg);
            addedCount.html(addedCountMsg);
            return;
        }
        var clientTable = tableStart;
        clientTable += '<thead><tr><th class="glyph-click">';
        clientTable += '<button onclick="HOMELESSLINKACTIONS.removeAddedClients()" ';
        clientTable += 'id="remove-all-added-clients-button" ';
        clientTable += 'type="button" class="btn btn-primary btn-xs">';
        clientTable += removeAllLabel;
        clientTable += '</button>';
        clientTable += '</th>';
        clientTable += addedTableHeader; // = '<th>First Name</th><th>Last Name</th><th>Nickname</th><th>Gender</th><th>Timeline Status</th></thead><tbody>';
        tableContainer.empty();
        var idx;
        $jq.each(arrayOfAddedObjects, function(key, value) {
            idx = key + 1;
            clientTable += '<tr class=\'added-client-id' + idx + '\' onclick="HOMELESSLINKACTIONS.removeClient(\'' + value.In_Form__Client__c + '\')">';
            clientTable += '<td class="client-idx" title="' + clickRowToRemoveMsg + '"><span class="client-idx">' + idx + '</span></td>';
            clientTable += '<td>' + value.In_Form__Client_first_name__c + '</td>';
            clientTable += '<td>' + value.In_Form__Client_last_name__c + '</td>';
            clientTable += '</td><td>' + value.In_Form__Client_nickname__c + '</td><td>' + value.In_Form__Client_gender__c + '</td>';
            clientTable += '<td>' + value.In_Form__Status__c + '</td></tr>';
        });
        clientTable += '</tbody></table>';
        clientTable += '<p class="text-center"><a class="btn btn-primary" id="btnAdd" role="button">' +  addLabel + '</a></p>';
        tableContainer.append(clientTable);
        $jq("#btnAdd").one("click", function() {
            createAddedClients();
        });
        if (arrayOfAddedObjects.length > 0) {
            addedCountMsg = arrayOfAddedObjects.length.toString() + ' ' + addedCountMsg;
        } 
        if (arrayOfAddedObjects.length === 1) {
            addedCountMsg = arrayOfAddedObjects.length.toString() + ' ' + addedCountMsgSingular;
        }
        addedCount.html(addedCountMsg);
    };

    // renders the table of errors
    var renderErrorTable = function(arrayOfErrors) {
        var tableContainer = $jq("#error-table-container");
        if (arrayOfErrors.length ===0) {
            var noRecordsMsg = getAlertMsg(noErrorsLabel, 'success', 'glyphicon-ok', true);
            tableContainer.html(noRecordsMsg);
            return;
        }
        var errorTable = tableStart;
        errorTable += '<thead><tr><th>#</th><th><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span></th>';
        errorTable += errorTableHeader;
        tableContainer.empty();
        var idx;
        var cName;
        $jq.each(arrayOfErrors, function(key, value) {
            idx = key + 1;
            cName = getClientNameFromAdded(addedClients, value.In_Form__Client__c);
            errorTable += '<tr><td>&nbsp;' + idx + '</td><td><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span></td><td><a href="/' + value.In_Form__Client__c + '" target="_parent">' + cName + '</a></td><td>' + value.errMsg + '</td></tr>';
        });
        errorTable += '</tbody></table>';
        tableContainer.append(errorTable);
    };

    // renders the table of created records
    var renderCreatedTable = function(arrayOfCreated) {
        var tableContainer = $jq("#created-table-container");
        if (arrayOfCreated.length ===0) {
            var noRecordsMsg = getAlertMsg(noActionsCreatedMsg, 'danger', 'glyphicon-exclamation-sign', true);
            tableContainer.html(noRecordsMsg);
            return;
        }
        var createdTable = tableStart;
        createdTable += '<thead><tr><th>#</th><th><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></th>';
        createdTable += createdTableHeader;
        tableContainer.empty();
        var idx;
        var cName;
        $jq.each(arrayOfCreated, function(key, value) {
            idx = key + 1;
            cName = getClientNameFromAdded(addedClients, value.In_Form__Client__c);
            createdTable += '<tr><td>&nbsp;' + idx + '</td><td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td><td><a href="/' + value.In_Form__Client__c + '" target="_parent">' + cName + '</a></td><td><a href="/' + value.Id + '" target="_blank">View action</a></td></tr>';
        });
        createdTable += '</tbody></table>';
        tableContainer.append(createdTable);
    };    

    // shows more clients
    var showMoreClients = function() {
        if (clientDisplayStart + clientDisplayChunk < clients.length) {
            clientDisplayEnd += clientDisplayChunk;
            renderClientTable(clients);
        } 
    };

    // displays the progress bar. The w parameter is the width, i.e. the precentage
    var initLoadProgressBar = function(w) {
        var progressWidget = $jq("#progress-bar-loading-ui-widget");
        var progressBarClass = 'progress-bar-warning';
        if (w >= 75) {
            progressBarClass = 'progress-bar-info';
        }
        progressWidget.attr('style', 'width:' + w + '%');
        progressWidget.removeClass('progress-bar-danger progress-bar-warning progress-bar-info');
        progressWidget.addClass(progressBarClass);
        $jq('#progress-bar-loading-ui').show();
    };

    // gets the client's name when given a client id
    var getClientNameFromAdded = function(arrayOfAddedObjects, In_Form__Client__c) {
        var retVal = '';
        var processedData = $jq.grep(arrayOfAddedObjects, function(x) {
            return x.In_Form__Client__c == In_Form__Client__c;
        });
        if (processedData.length > 0) {
            retVal = processedData[0].In_Form__Client_name__c;
        }
        return retVal;
    };

    // adds all clients from clients[] to addedClients[] but only for records that are currently being displayed.
    var addAllClients = function() {
        var clientIndices = [];
        var hasDupes;
        // loop over the clients array adding the the item to clientIndices
        $jq.each(clients, function(idx, value) {
            hasDupes = false;
            hasDupes = checkAddedForDupes(idx);
            if (idx >= clientDisplayStart && idx <= clientDisplayEnd && hasDupes ===false) {
                clientIndices.push(idx);
            }
        });
        // if the number being added, i.e. what's in clientIndices, plus the length of the added[] array is greater than the threshold, display a message
        if (clientIndices.length + addedClients.length > maxAddedClientsThreshold) {
            alert(maxAddedClientsMsg);
            return;
        }
        $jq.each(clientIndices, function(ix, value) {
            addClient(value, false, false);
        });
        renderAddedTable(addedClients, false);
        $jq('body, html').animate({ scrollTop: $jq("#added-clients-container").offset().top }, 1000);
    };

    // adds a client
    var addClient = function(index, reRender, scrollToAdded) {
        var hasDupes = checkAddedForDupes(index);
        if (hasDupes === true) {
            return;
        }
        if (addedClients.length >= maxAddedClientsThreshold) {
            alert(maxAddedClientsMsg);
            return;
        }
        addedClients.push(clients[index]);
        $jq('#client-row-' + clients[index].In_Form__Client__c).addClass('client-row-added');
        if (reRender === true) {
            renderAddedTable(addedClients);
        }
    };    

    // checks for duplicates in added[] based on client id in clients[]
    var checkAddedForDupes = function(index) {
        var retVal = false;
        $jq.each(addedClients, function(idx, value) {
            if (clients[index].In_Form__Client__c === value.In_Form__Client__c) {
                retVal = true;
                return retVal;
            }
        });
        return retVal;
    };

    // removes a client
    var removeClient = function(iDofClient) {
        addedClients = $jq.grep(addedClients, function(e){ 
             return e.In_Form__Client__c != iDofClient; 
        }); 
        renderAddedTable(addedClients);
        $jq('#client-row-' + iDofClient).removeClass('client-row-added');   
    };

    // removes all added clients
    var removeAdded = function() {
        $jq.each(addedClients, function(idx, value) {
            $jq('#client-row-' + value.In_Form__Client__c).removeClass('client-row-added');
        });
        addedClients.length = 0;
        renderAddedTable(addedClients);
    };

    // creates actions for the added clients
    var createAddedClients = function() {
        // hide the filter, clients and added
        $jq('#filter-container').fadeOut('slow');
        $jq('#clients-container').fadeOut('slow');
        $jq('#added-clients-container').fadeOut('slow');
        $jq("#progress-bar").show();
        $jq('html, body').animate({
            scrollTop: $jq("#navigation-buttons").offset().top
        }, 800);
        window.parent.scroll(0,0);
        var acts = [];
        creationErrors.length = 0; 
        createdActions.length = 0;
        addedClients.forEach(function (obj, idx) {
            acts.push({ 
                In_Form__Client__c: obj.In_Form__Client__c,
                In_Form__Timeline_Event__c: obj.In_Form__Timeline_Event__c,
                In_Form__Session__c : sessionId,
                In_Form__Start_date_time__c : sessionStartDateTime,
                In_Form__End_date_time__c : sessionEndDateTime,
                RecordTypeId : actionRecordTypeId
            });
        });
        acts.forEach(function (obj, idx) {
            remoteActionObject.create(obj, function(err) {
                if(err) { 
                    creationErrors.push({
                        In_Form__Client__c: obj.In_Form__Client__c,
                        errMsg: err.message
                    });
                }
                else {
                    createdActions.push( {
                        In_Form__Client__c: obj.In_Form__Client__c,
                        Id: remoteActionObject.get('Id')
                    });
                }      
                if ((idx + 1) == acts.length) { // once last record has been created, draw the interface
                    $jq("#progress-bar").hide();
                    $jq('#title').hide();
                    renderCreatedTable(createdActions);
                    renderErrorTable(creationErrors);
                    $jq('#actions-container').fadeIn('slow');
                    $jq('#errors-container').fadeIn('slow');
                    $jq('html, body').animate({
                        scrollTop: $jq("#navigation-buttons").offset().top
                    }, 800);
                    window.parent.scroll(0,0);
                }
            });
        }); 
    };

    // generic error handler used everywhere database actions are performed except when the user tries to save the record, i.e. in createAddedClients
    var handleErrors = function(m, ctr) {
        var errorContainer = $jq("#error-message-container");
        var msg = '';
        if (ctr === true) {
            msg = '<p class="text-center"><strong>' + m + '</strong></p>';
        } else {
            msg = '<strong>' + m + '</strong></p>';
        }
        var noRecordsMsg = getAlertMsg(msg, 'danger', 'glyphicon-exclamation-sign', true);
        errorContainer.html(noRecordsMsg);
        $jq('#progress-bar-loading-ui').hide();
        $jq('#filter-container').remove();
        $jq('#clients-container').remove();
        $jq('#added-clients-container').remove();
        $jq('#errors-container').fadeIn('slow');
    }; 

    // returns HTML with a alert, requires an alert type and an icon
    var getAlertMsg = function(msg, alertType, alertIcon, ctr){ 
        var noRecordsMsg = '<div class="alert alert-' + alertType +'" role="alert">';
        if (ctr === true) {
            noRecordsMsg += '<p class="text-center">';
        }
        noRecordsMsg += '<span class="glyphicon ' + alertIcon + ' alert-msg" aria-hidden="true"></span>';
        noRecordsMsg += '<span class="sr-only">Error:</span>';
        noRecordsMsg += msg;
        if (ctr === true) {
            noRecordsMsg += '</p>';            
        }        
        noRecordsMsg += '</div>';
        return noRecordsMsg;
    };

    // converts a parameter that is undefined to an empty string
    var undefinedToString = function(fieldValue) {
            if (fieldValue === undefined) {
                return '';
            } else {
                return fieldValue;
            }
    };
    // allows the page to set the remote object model for actions
    var setActionModel = function(model) {
        remoteActionObject = model;
    };

    // allows system administrators to view the main array variables
    var consoleLogger = function() {
    };

    // checks that action record types match session record types
    var checkValidRecordTypes = function() {
        remoteRecordTypeObject.retrieve(
            qryActionRecordTypeParam,
            function(err, records, event) {
                if(err) {
                    handleErrors(msgErrorPrefix + err.message, true);
                } else {
                    if (records.length > 0) {
                        if (records[0].get("DeveloperName") === sessionRecordTypeName) { // && records[0].get("DeveloperName") == sessionRecordTypeName.replace(/ /g,'_')) {
                            actionRecordTypeId = records[0].get("Id");
                            return;
                        } else {
                            handleErrors(msgErrorPrefix + 'A record type named ' + sessionRecordTypeName + ' was not found on the Action object.', true);
                        }
                    } else {
                        handleErrors(msgErrorPrefix + 'A record type with the name ' + sessionRecordTypeName + ' was not found on the Action object.', true);
                    }
                }
            }
        );
    };

    // replaces non-alphanumeric characters in record types with underscorces
    var convertRecordTypeName = function(rTypeName) {
        var retVal = rTypeName.replace(/[^a-z0-9]/gi,'_');
        // = rTypeName.replace(/ /g,'_');
        return retVal;
    };

    // formats dates for display on the filter
    var formatDate = function(date) {
        var dt = formatDateParts(date.getDate());
        var mt = formatDateParts(date.getMonth() + 1); 
        var yr = formatDateParts(date.getFullYear());
        var hh = formatDateParts(date.getHours());
        var mm = formatDateParts(date.getMinutes());
        var retVal;
        retVal = dt + '/' + mt + '/' + yr + ' ' + hh + ':' + mm;    
        return retVal;           
    };

    // formats parts of dates that are single characters into multiple characters
    var formatDateParts = function(part) {
        if (part < 10) {
            part = '0' + part;
        }
        return part;
    };

     // The module's "public" functions 
    return {
        initUI: initUI,
        buildFilter: buildFilter, 
        addClient: addClient,
        removeClient: removeClient,
        createAddedClients: createAddedClients,
        removeAddedClients: removeAdded,
        addAllClients: addAllClients,
        showMoreClients: showMoreClients,
        clientSortAndReRender: clientSortAndReRender,
        s1Notice: s1Notice, 
        consoleLogger: consoleLogger
    };         
})();  