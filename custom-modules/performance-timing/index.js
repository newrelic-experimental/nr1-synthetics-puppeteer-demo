
module.exports=function (){

  function getNavigationTiming(page){

    return page.evaluate(() => {
      let navigationTiming = window.performance.getEntriesByType("navigation");
       return Promise.resolve( JSON.stringify({navigation:[...navigationTiming]}))
    })
    .then(data=>{
      return Promise.resolve(JSON.parse(data))
    })
  }

  function getResourceTiming(page){
    return page.evaluate(() => {
      let resourceTiming = window.performance.getEntriesByType("resource");
      return Promise.resolve(JSON.stringify({resource:[...resourceTiming]}))
    })
    .then(data=>{
      return Promise.resolve(JSON.parse(data))
    })
  }
  function getPaintTiming(page){
    return page.evaluate(() => {
      let paintTiming = window.performance.getEntriesByType("paint");
      return  Promise.resolve(JSON.stringify({paint:[...paintTiming]}))
    })
    .then(data=>{
      return Promise.resolve(JSON.parse(data))
    })
  }

  function parsePageTiming(page){
    return Promise.all([
      this.getNavigationTiming(page),
      this.getResourceTiming(page),
      this.getPaintTiming(page)])
      .then( results=>{

        let data= results.reduce(  (acc, curr)=>{
          return {...acc, ...curr}
        }, {})

        return Promise.resolve(data)
      })

  }

  return {
    getNavigationTiming,
    getResourceTiming,
    getPaintTiming,
    parsePageTiming
  }

}

