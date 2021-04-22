const moment= require('moment');

// Docs:
// http://www.softwareishard.com/blog/har-12-spec/#entries
// https://chromedevtools.github.io/devtools-protocol/

// TODO:
// Capture:
// - long running tasks metrics
// - AJAX calls metrics
// - page load metrics





module.exports=function(perfTimingData,  env, customEnv){

  var {navigation:navTiming, resource:resourceTiming, paint:paintTiming} = perfTimingData;

  var {firstContentfulPaint, firstPaint} = (function(){
                                              let {paint}= paintTiming;
                                              let firstContentfulPaint = paint.filter( t=> t.name === 'first-contentful-paint');
                                              let firstPaint = paint.filter( t=> t.name === 'first-paint');

                                              return {firstContentfulPaint,firstPaint};
                                          })();
  const _commonData={
                        "id":env.JOB_ID,
                        "checkId":env.JOB_ID,
                        "jobId":env.JOB_ID,
                        "monitorId": env.MONITOR_ID,
                        "location": env.LOCATION || customEnv.LOCATION,
                        "locationLabel": env.LOCATION_LABEL || customEnv.LOCATION_LABEL,
                        "minionId":customEnv.MINION_ID,
                        "minion": customEnv.MINION,
                        "entityGuid": customEnv.ENTITY_GUID
                      };


  function getNavTiming(url){
    let results= navTiming.filter( timing=>timing.name === url)
    if (results.length>1){
      // console.log(`getNavTiming() results >2 url[${url}] results=${results}`);
    }
    return (results && results.length ==0)? null : results[0]
  }

  function getHeaderValue(headers, key){
    let results= headers.filter( header=> header.name === key)
    if (results.length ==0){
      // console.log(`getHeaderValue() key[${key}] not found.`);
    }else {
      if (results.length>1){
        console.log(`getHeaderValue() results >2 key[${key}] results=${results}`);
      }
    }

    return (results && results.length ==0)? "" : results[0]
  }
  function pageRequest(harEntry){
    const {request, response, startedDateTime, serverIPAddress, time:duration, timings, pageref} = harEntry;
    const {headers:requestHeaders} = request;

    let entryNavTiming = getNavTiming(request.url);

    const partial={
      "URL": request.url,
      "contentCategory": response.content.mimeType,
      "domContentLoadedEventEnd": entryNavTiming?entryNavTiming.domContentLoadedEventEnd:-1,
      "domContentLoadedEventStart": entryNavTiming?entryNavTiming.domContentLoadedEventStart:-1,
      "domInteractive": entryNavTiming?entryNavTiming.domInteractive:-1,
      "domain": getHeaderValue(requestHeaders, ":authority"),
      "duration": duration,
      "durationBlocked": timings.blocked,
      "durationConnect": timings.connect,
      "durationDNS": timings.dns,
      "durationReceive": timings.receive,
      "durationSSL": timings.ssl,
      "durationSend": timings.send,
      "durationWait": timings.wait,

      "externalResource": false,
      "firstContentfulPaint": firstContentfulPaint.duration,
      "firstPaint": firstPaint.duration,
      "hierarchicalURL": "newrelic.com/",
      "host": "newrelic.com",

      "isAjax": false,
      "isNavigationRoot": true,

      "loadEventEnd":  entryNavTiming?entryNavTiming.loadEventEnd:-1,
      "loadEventStart":  entryNavTiming?entryNavTiming.loadEventStart:-1,

      "longRunningTasksAvgTime": -1,
      "longRunningTasksCount": -1,
      "longRunningTasksMaxTime": -1,
      "longRunningTasksMinTime": -1,


      "onPageContentLoad": -1,
      "onPageLoad": -1,
      "pageref": pageref,
      "path": getHeaderValue(requestHeaders, ":path"),
      "port": (getHeaderValue(requestHeaders, ":scheme") === 'https')?443 : -1,
      "requestBodySize": request.bodySize,
      "requestHeaderSize": request.headersSize,
      "responseBodySize": response.bodySize,
      "responseCode": response.status,
      "responseHeaderSize": response.headersSize,
      "responseStatus": response.statusText,
      "serverIPAddress": serverIPAddress,
      "timestamp": moment(startedDateTime).local().unix(),

      "unloadEventEnd": navTiming.unloadEventEnd,
      "unloadEventStart": navTiming.unloadEventStart,

      "verb": request.method
    };

    return Object.assign({},  partial, _commonData, { "eventType":"SyntheticRequest"});
  }


  return{
    pageRequest
  }

}


