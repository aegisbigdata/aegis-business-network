# AEGIS Blockchain

## About
This repository contains the model and logic files for the AEGIS blockchain. These files are created for use with [Hyperledger Composer](https://hyperledger.github.io/composer/) and [Hyperledger Fabric](https://www.hyperledger.org/projects/fabric).

## Setup Fabric Network

1. Install dependencies:
    - `npm install` (in the directory you cloned this repository)

2. Install fabric-tools (required to test with a fabric network)
    - `mkdir fabric-tools && cd fabric-tools`
    - `curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip`
    - `unzip fabric-dev-servers.zip`

3. Make sure you have Docker installed, and use run `./downloadFabric.sh` to download the docker images required

4. You start and stop the network using `./startFabric.sh` and `./stopFabric.sh`

5. To control the network, you have to create and install a Peer Admin Card (needed only once, unless you tear down the network):
    - `./createPeerAdminCard.sh`
    - `npx composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName aegis-business-network` (inside this repo directory)

Fabric network is now ready.

## Install AEGIS to Fabric Network

1. Enter the directory you cloned this repository and create a business network archive:
    - `npx composer archive create -t dir -n .`

2. Install the composer runtime:
    - `npx composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName aegis-business-network`

3. Deploy the business network to Fabric:
    - `npx composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile aegis-business-network@0.0.1.bna --file networkadmin.card`

4. Import the network administrator card to Fabric:
    - `npx composer card import --file networkadmin.card`

5. To test the network, use:
    - `npx composer network ping --card admin@aegis-business-network`

6. If everything is OK, you can start the rest-server and/or the composer playground:
    - Rest Server: `npx composer-rest-server -c admin@aegis-business-network -n never -w true`
    - Playground: `npx composer-playground`
