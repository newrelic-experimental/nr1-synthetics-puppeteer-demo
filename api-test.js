///////////////////////////////////
// New Relic Synthetics : API Test
// How to deploy
// 1. Create a Synthetics API Test after saving take note
// of the following properties you will need to set in this script:
//
// const insightsKey='<YOUR INSIGHTS INSERT KEY>'
//
// const customEnv={
//   ENTITY_GUID:'NO_GUID_DEFINED_YET',
//   MINION:'CUSTOM_MINION',
//   MINION_ID:'000',
//   LOCATION_LABEL:'Local_CPM'
// };
// 2. Replace the API test content with this script and validate


const assert = require('assert')
const puppeteer = require('puppeteer')

/////////////////////////
// Custom Scripts
const PerformanceTiming = require ('performance-timing')
const SyntheticRequestParser = require('syntheticrequest-parser')
const PageHar = require('page-har')
const InsightsClient = require('nr-insights-client')
/////////////////////////

const options = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ]
}


const postToInsights=true;
const insightsKey=$secure.INSIGHTS_INSERT_KEY
const customEnv={
  ENTITY_GUID:'NO_GUID_DEFINED_YET',
  MINION:'CUSTOM_MINION',
  MINION_ID:'000',
  LOCATION_LABEL:'Local_CPM'
};

puppeteer.launch(options)
  .then(browser => {
    var $page;

    browser.newPage()
      .then(page=>{
        $page =page
      })

      .then(_=>{
        // collect HAR data
        let har= PageHar($page)

        // start HAR collection
        return har.start()
        .then(_=>{
          return $page.goto('https://www.newrelic.com')
        })
        .then(_=>{
          // end HAR collection
          return har.end()
          .then(data=>{
            // console.log(data)
            return Promise.resolve(data)
          })
        })
        .then( harData =>{
          // collect using PerformanceTiming API
          let perfTiming = PerformanceTiming();
          return perfTiming.parsePageTiming($page)
          .then(pageTiming=>{

            let parser = SyntheticRequestParser(pageTiming, $env, customEnv);
            let {entries:harEntries} =harData.log;
            let synthRequests=  harEntries.map( entry => parser.pageRequest(entry, perfTiming))
            console.log(synthRequests);

            // let events= synthRequests.slice(0,2);
            let events=synthRequests;
            const insightsClient = InsightsClient($env.ACCOUNT_ID, insightsKey)
            if (postToInsights){
              console.log('post to Insights')
              return insightsClient.postEvents(events);
            }else{
              return Promise.resolve()
            }

          })
        })
      })

      .then(_ => {
        assert.ok(true)
        console.log("closing browser")
        return browser.close();
      })
  })

