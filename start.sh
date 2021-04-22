#!/bin/bash

#############################
# DOC:
# https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/private-locations/containerized-private-minion-cpm-maintenance-monitoring
# You can check the CPM with the following endpoints:
#
#:8080/status/check	: provides details about internal health checks that the minion performs. HTTP 200 means the status is healthy.
#:8080/status		: provides details about a minion's status, which is the same data published in Insights as SyntheticsPrivateMinion event.
#:8180/			: provides JVM application admin endpoints. This is an advanced view of a minion's Java Development Kit (JDK) internal state.
#
# custom module directory
# https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/private-locations/containerized-private-minion-cpm-configuration
#  docker run ... -v /example-custom-modules-dir:/var/lib/newrelic/synthetics/modules:rw ...



export PVT_LOCATION_KEY="MINION_KEY"
export IMAGE=quay.io/newrelic/synthetics-minion:latest

if [ ! -d ./custom-modules/node_modules ]; then
    cd ./custom-modules && npm install
fi


docker run \
  --rm \
  --name custom-synth-cpm \
  -e MINION_PRIVATE_LOCATION_KEY=$PVT_LOCATION_KEY \
  -p 8082:8080 \
  -p 8182:8180 \
  -v $PWD/tmp:/tmp:rw \
  -v /var/run/docker.sock:/var/run/docker.sock:rw \
  -v $PWD/custom-modules:/var/lib/newrelic/synthetics/modules:rw \
  $IMAGE


