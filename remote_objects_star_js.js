var HOMELESSLINKSTARS = (function () {

    // allows users to toggle individual lines on and off
    var toggleChartItem = function (id) {
        $j("#" + id).toggle("slow");
    };

    // allows users to toggle the help container
    var toggleHelp = function (id) {
        $j("star-help").toggle("slow");
    }
 
    // retrieves the star lines using remote objects
    var getStarLines = function (starName, RecordId, RecordIdOfParent, imagePath, relationshipField, dateField, scoreFields,
                                 starOpacity, starStrokeWidth, starOrigin, starColours, starGrays, userGray, userWidth,
                                 remoteStarObject, remoteConfigDetailObject, namespacePrefix, namespacePrefixObject) {
        // object to hold metadata
        var starMetaData = {};
        // the ist of score fields from the page as an array
        var scorefieldArray = scoreFields.split(',');
        // set up the query object to retrieve the records
        var queryRecords = makeRecordQuery(namespacePrefixObject, relationshipField, RecordIdOfParent, dateField);
        // set up the query object to retrieve the metadata
        var queryMeta = makeMetaQuery(namespacePrefix, starName);
        // array to hold star line data 
        var starLineData = [];
        // the list of colours - can be toggled to grayscale by a field on the user record
        var colours = chooseColourOrGray(starColours, userGray, starGrays); 
        // the width of the lines - can be overriden by a field on the user record
        var lineWidth =  getlineWidth(starStrokeWidth, userWidth);
        // this is used to temporarily hold the star co-ordinates of a record while all the records are being iterated over
        var starCurrentCoordinate;
        // retreive the star config detail records... 
        remoteConfigDetailObject.retrieve(
            queryMeta,
            function(err, records, event){
                if(err) {
                    handleErrors(err);
                }
                else {
                    // populate the metadata with the default value for empty picklists
                    processMetaData(scorefieldArray, starMetaData, starOrigin, records, namespacePrefix);
                    // retrieve the star records - this is a nested callback but only 2 deep ...
                    remoteStarObject.retrieve(
                        queryRecords,
                        function(err, records, event){
                            if(err) {
                                handleErrors(err);
                            }
                            else {
                                // merge the metadata and star records into something usable by the front-end and pass this to makeStars
                                mergeStarData(
                                    records, starCurrentCoordinate, scorefieldArray, starMetaData, 
                                    namespacePrefixObject, starLineData, colours, dateField, starOpacity, lineWidth
                                );
                                makeStars(starLineData, imagePath, RecordId);
                            }
                        }
                    );
                }
            }
        );
    }; 
    
    // formats dates for display on the chart legend
    var formatDate = function(date) {
        var dt = date.getDate();
        var mt = date.getMonth() + 1; 
        var yr = date.getFullYear();
        var retVal;
        if(dt < 10) {
            dt = '0' + dt;
        } 
        if(mt<10) {
            mt = '0' + mt;
        } 
        retVal = dt + '/' + mt + '/' + yr;    
        return retVal;           
    };

    // constructs the query to retrieve records
    var makeRecordQuery = function(namespacePrefixObject, relationshipField, RecordIdOfParent, dateField) {
        // set up the query filter for record retrieval using values from the page
        var filterRecords = standardFilter();
        var fieldname = namespacePrefixObject + relationshipField;
        filterRecords[fieldname] = {eq: RecordIdOfParent};
        // set up the sort order for the records
        var sortOrder = {};
        var sortFieldRecords = namespacePrefixObject + dateField;
        sortOrder[sortFieldRecords] = 'DESC';
        // set up the query object to retrieve the records using the filter and sort order
        return {
            where: filterRecords,
            orderby: [ sortOrder ],
            limit: 100
        };
    };

    var makeMetaQuery = function(namespacePrefix, starName) {
        var filterMetaData  = standardFilter();
        var starFieldName = namespacePrefix + 'Star_Name__c';
        filterMetaData[starFieldName] = {eq: starName};
        // set up the sort order for the records
        var sortOrderMeta = [];
        var sortFieldMeta1 = {};
        sortFieldMeta1[namespacePrefix + 'Field_Name__c'] = 'ASC';
        sortOrderMeta.push(sortFieldMeta1);
        var sortFieldMeta2 = {};
        sortFieldMeta2[namespacePrefix + 'Score__c'] = 'ASC';
        sortOrderMeta.push(sortFieldMeta2);
        // set up the query object to retrieve the metadata using the filter and sort order
        return {
            where: filterMetaData,
            orderby: sortOrderMeta,
            limit: 100
        };

    };

    // the base filter used in other queries; ensures deleted records are not returned
    var standardFilter = function() {
        return {
            IsDeleted: {eq: false}
        };
    };

    var chooseColourOrGray = function(starColours, userGray, starGrays) {
        var retVal = [];
        retVal = starColours.split(',');
        if (userGray === true) {
            retVal = starGrays.split(',');
        }
        return retVal;
    };      

    var getlineWidth = function(starStrokeWidth, userWidth) {
        var retVal = starStrokeWidth;
        if (!isNaN(userWidth) && userWidth > 0) {
            retVal = userWidth;
        }
        return retVal;
    };

    var processMetaData = function(scorefieldArray, starMetaData, starOrigin, records, namespacePrefix) {
        for (var scoreIndex = 0; scoreIndex < scorefieldArray.length; scoreIndex++) {
            starMetaData[scorefieldArray[scoreIndex].trim() + '#' + '0'] = starOrigin;
        }                            
        records.forEach(function(record) {
            starMetaData[record.get(namespacePrefix + "Field_Name__c") + '#' + record.get(namespacePrefix + "Score__c")] = record.get(namespacePrefix + "Co_ordinate__c");
        });
    };

    // function to merge star record data with star metadata, creating an object with the data required by makeStars
    var mergeStarData = function(records, starCurrentCoordinate, scorefieldArray, 
                                starMetaData, namespacePrefixObject,  starLineData, colours,
                                dateField, starOpacity, lineWidth) {
        var colourIdx = 0;
        var starId;
        records.forEach(function(record) {
            // set the starCoordinates
            starCurrentCoordinate = '';
            // get the co-ordinates for each score field based on the data
            for (var scoreIndex = 0; scoreIndex < scorefieldArray.length; scoreIndex++) {
                starCurrentCoordinate += starMetaData[scorefieldArray[scoreIndex].trim() + '#' + record.get(namespacePrefixObject + scorefieldArray[scoreIndex].trim())] + ' ';
            }
            // set the starId
            starId = record.get("Id");
            // add the star to the star object array
            starLineData.push(
                { 
                    starColor: colours[colourIdx],
                    starCoordinates: starCurrentCoordinate,
                    starDate: formatDate(record.get(namespacePrefixObject + dateField)),
                    starId: record.get("Id"),
                    starOpacity: starOpacity,
                    starStrokeWidth: lineWidth
                }
            );
            colourIdx++;
            // makes the color list go back to the beginning when it reaches the end
            if (colourIdx >= colours.length - 1 && colourIdx % colours.length === 0) {
                colourIdx = 0;
            }                                            
        });
    };

    // constructs the stars and appends the SVG and its child elements to the DOM
    // mixes JavaScript & jQuery doesn't support createElementNS which is needed for SVG
    var makeStars = function(data, imageURL, IdOfRecord) {
        // start by hiding the chart's container while we manipulate it
        $j("#chart-component-container").hide();
        // create the SVG
        var svgElement;
        svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        makeSVGElement(svgElement, imageURL);
        // get the image
        makeImage(svgElement, imageURL);
        // get the lines and draw them                
        makePolygons(data, svgElement, IdOfRecord);
        // get the legend, draw it 
        appendLegendtoDOM(data);
        // end by showing the chart's container - we need a 750 millisecond delay because of rendering glitches in S1
        setTimeout(function(){ 
            // show the container
            $j( "#chart-component-container" ).show(); 
        }, 750);
    };

    // Makes the SVG element
    var makeSVGElement = function(svgTag, imageURI) {
        // dynamically get the image size
        var starImage = new Image();                        
        starImage.onload = function() {
            if (detectBrokenBrowsers() === true) { // detects IE
            // only doing the next 2 lines on IE
                svgTag.setAttribute("width", starImage.width);
                svgTag.setAttribute("height", starImage.height);  
            }
            svgTag.setAttribute("id", "chart");             
            svgTag.setAttribute("preserveAspectRatio", "xMinYMin meet");
            svgTag.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svgTag.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            svgTag.setAttribute("viewBox", '0 0 ' + starImage.width + ' ' + starImage.height);                 
        };
        starImage.src = imageURI;
    };

    // gets the image element
    var makeImage = function(svgTag, imagePath) {
        var imageElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
        imageElement.setAttributeNS(null, "height", "100%");
        imageElement.setAttributeNS(null, "width", "100%");
        imageElement.setAttributeNS(null, "x", "0");
        imageElement.setAttributeNS("http://www.w3.org/1999/xlink","href", imagePath);
        imageElement.setAttributeNS(null, "y", "0");
        imageElement.setAttributeNS(null, "visibility", "visible");  
        $j( "#chart-component-container" ).append(svgTag); 
        $j ( svgTag ).append(imageElement);
    };

    // Makes the polygons for the lines
    var makePolygons = function(data, svgTag, IdOfRecord) {
        var polygonElement;
        $j.each(data, function(idx, starObject) {  
            polygonElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");                                
            polygonElement.setAttribute("id", starObject.starId);
            polygonElement.setAttribute("points", starObject.starCoordinates);
            polygonElement.setAttribute("style", "stroke:" + starObject.starColor + ";" + "fill:" + starObject.starColor + ";fill-opacity:" + starObject.starOpacity + ";stroke-width:" + starObject.starStrokeWidth);                    
            $j ( svgTag ).append(polygonElement);
            if (starObject.starId !== IdOfRecord && idx !== data.length - 1) {
                $j( '#'+starObject.starId ).hide();
            }
        });                
    }; 


    // appends the SVG and its child elements to the DOM
    var appendLegendtoDOM = function(data) {
        var chartLegend = "<span id=\"chart-legend-container\">";
        chartLegend = chartLegend + "<span id=\"chart-legend-items\">";
        $j.each(data, function(idx, starObject) {
            chartLegend = chartLegend + "<div class=\"chart-legend-item\" onclick=\"HOMELESSLINKSTARS.toggleChartItem('" + starObject.starId  + "')\">";
            chartLegend = chartLegend + "<div class=\"chart-legend-button\" style=\"background-color:" + starObject.starColor +";\"";
            chartLegend = chartLegend + ">&nbsp;";
            chartLegend = chartLegend + "</div>"; // end chart-legend-button
            chartLegend = chartLegend + "<div class=\"chart-legend-label\">" + starObject.starDate + "</div>";
            chartLegend = chartLegend + "</div>"; // chart-legend-item
        }); 
        chartLegend = chartLegend + "</span>"; // end chart-legend-items
        chartLegend = chartLegend + "</span>"; // end chart-legend
        $j( "#chart-component-container" ).append(chartLegend);
        $j( "#progress-bar").remove();
    };

    // detects Internet Explorer - works on 9 & 11; may need re-testing when 12 is released
    var detectBrokenBrowsers = function() {
        var retVal = false;
        if(navigator.appVersion.indexOf("MSIE 9.")!=-1 || navigator.appVersion.indexOf("MSIE 10.")!=-1) {
            retVal = true;
            return retVal;
        }         
        if ((navigator.appName === 'Microsoft Internet Explorer') || (navigator.appName == 'Netscape')) {
            var regExpress = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
            if (regExpress.exec(navigator.userAgent) !== null) {
                retVal = true;
            }
        }
        return retVal;
    };

    var handleErrors = function(evt) {
        $j( "#progress-bar" ).remove();
        var errMsg = "<div id=\"chart-error-text\">Something has gone wrong while comparing these stars.&nbsp;";
        errMsg = errMsg + "Please contact In-Form Support with the message below.</div>";
        errMsg = errMsg + "<div id=\"chart-error-message\">" + evt.message + "</div>";
        $j( "body" ).prepend("<div id=\"chart-error-container\">" + errMsg + "</div>");
    };
    
    // The module's "public" functions
    return {
        toggleChartItem: toggleChartItem, 
        getStarLines: getStarLines
    };         
})();  