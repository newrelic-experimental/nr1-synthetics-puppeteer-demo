const { harFromMessages } = require('chrome-har');
module.exports= function(page){
  let $page= page;
  let $events=[];
  let $client={};

  const Methods = [
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.dataReceived',
    'Network.responseReceived',
    'Network.resourceChangedPriority',
    'Network.loadingFinished',
    'Network.loadingFailed',

    'Page.loadEventFired',
    'Page.lifecycleEvent',
    'Page.navigate',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameNavigated',
    'Page.frameAttached',

    'Performance.metrics',
    'LayerTree.layerPainted'
  ];

  function start(){
    return $page.target().createCDPSession()
    .then(client=>{
      $client = client
      return Promise.resolve($client)
    })
    .then(_=>{
      return $client.send('Page.enable')
    })
    .then(_=>{
      return $client.send('LayerTree.enable')
    })
    .then(_=>{
      return $client.send('Performance.enable')
    })
    .then(_=>{
      return $client.send('Network.enable')
    })
    .then( _=>{
      Methods.forEach(method => {
        $client.on(method, params => {
          $events.push({ method, params });
        });
      });
    })
    .then(_=>{
      return {page:$page, client:$client, events:$events}
    })
  }

  function end(){
    let data = harFromMessages($events);
    return $client.detach()
    .then(_=>{
      return Promise.resolve(data)
    })

  }

  return{
    start,
    end
  }

}

