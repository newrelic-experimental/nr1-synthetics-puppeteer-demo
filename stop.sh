#!/bin/bash

docker stop custom-synth-cpm
docker rm $(docker ps -a -q)

