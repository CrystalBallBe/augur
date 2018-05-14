#!/usr/bin/env bash

if [ $# -eq 0 ]
  then
    echo "Please supply a valid market ID.";
    exit 1;
fi

MARKET_ID=$1
OUTCOME=1

# Data in form of:
# open	high	low	close	volume
# This data is a normalized version of the microsoft stock daily time series
curl https://gist.githubusercontent.com/justinbarry/bf6cd9afcd8778027e211105562b89d7/raw/cae40936cc1930e310411ec27d957769b93d8068/data.tsv | \
while IFS=$'\t' read -r -a dataArray
do
  for j in "${dataArray[@]}"
  do
    echo "Sell trade $j";
    ETHEREUM_PRIVATE_KEY=fae42052f82bed612a724fec3632f325f377120592c75bb78adfcceae6470c5a npx flash create-market-order --marketId $MARKET_ID --outcome $OUTCOME --orderType sell --shares "$(jot  -p 4 -r 1 0 1)" --price "$j"

    echo "Filling trade $j";
    ETHEREUM_PRIVATE_KEY=48c5da6dff330a9829d843ea90c2629e8134635a294c7e62ad4466eb2ae03712 npx flash fill-market-orders -m $MARKET_ID -o $OUTCOME -t buy;

    npx flash push-timestamp -s -c 600;
  done

  echo "Push time";
  npx flash push-timestamp -s -c 3600;
done
