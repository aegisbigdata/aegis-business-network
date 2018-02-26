# AEGIS Blockchain

## About
This repository contains the model and logic files for the AEGIS blockchain. These files are created for use with [Hyperledger Composer](https://hyperledger.github.io/composer/) and [Hyperledger Fabric](https://www.hyperledger.org/projects/fabric).

## Setup Fabric Network

1. Install dependencies:
    - `npm install -g composer-cli composer-rest-server`
    - `npm install -g composer-playground` (for browser testing of the network)

2. Install fabric-tools (required to test with a fabric network)
    - `mkdir fabric-tools && cd fabric-tools`
    - `curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip`
    - `unzip fabric-dev-servers.zip`

3. Make sure you have Docker installed, and use run `./downloadFabric.sh` to download the docker images required

4. You start and stop the network using `./startFabric.sh` and `./stopFabric.sh`

5. To control the network, you have to create and install a Peer Admin Card (needed only once, unless you tear down the network):
    - `./createPeerAdminCard.sh`
    - `composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName aegis-business-network`

Fabric network is now ready.

## Install AEGIS to Fabric Network

1. Enter the directory you cloned this repository and create a business network archive:
    - `composer archive create -t dir -n .`

2. Install the composer runtime:
    - `composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName aegis-business-network`

3. Deploy the business network to Fabric:
    - `composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile aegis-business-network@0.0.1.bna --file networkadmin.card`

4. Import the network administrator card to Fabric:
    - `composer card import --file networkadmin.card`

5. To test the network, use:
    - `composer network ping --card admin@aegis-business-network`

6. If everything is OK, you can start the rest-server and/or the composer playground:
    - Rest Server: `composer-rest-server -c admin@aegis-business-network -n never -w true`
    - Playground: `composer-playground`

## TODO

- Finalize AEGIS model
- Decide which transactions will be logged to the network
- Create a solid network, for partners
- Add Access Control
- Integrate with AEGIS platform