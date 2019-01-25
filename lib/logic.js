'use strict';
/**
 * Loads money to a user's balance
 * @param {eu.aegis.LoadBalance} changeBalance
 * @transaction
 */
function onLoadBalance(changeBalance) {
    var registry;
    var id = changeBalance.user.uid;

    return getParticipantRegistry('eu.aegis.User')
        .then(function(pr) {
            registry = pr;
            return registry.get(id);
        })
        .then(function(user) {
            user.balance += changeBalance.amount;
            return registry.update(user);
        });
}

/**
 * Changes the cost of an asset
 * @param {eu.aegis.ChangeAssetCost} changeAssetCost
 * @transaction
 */
function onChangeAssetCost(changeAssetCost) {
    var registry;
    var id = changeAssetCost.relatedAsset.aid;

    return getAssetRegistry('eu.aegis.AEGISAsset')
        .then(function(ar) {
            registry = ar;
            return registry.get(id);
        })
        .then(function(asset) {
            asset.cost = changeAssetCost.newCost;
            return registry.update(asset);
        });
}

/**
 * Changes the status of an asset
 * @param {eu.aegis.ChangeAssetStatus} changeAssetStatus
 */
function onChangeAssetStatus(changeAssetStatus) {
    var registry;
    var id = changeAssetStatus.relatedAsset.aid;

    return getAssetRegistry('eu.aegis.AEGISAsset')
        .then(function(ar) {
            registry = ar;
            return registry.get(id);
        })
        .then(function(asset) {
            asset.status = changeAssetStatus.newStatus;
            return registry.update(asset);
        });
}

/**
 * Validates a contract to buy an asset
 * @param {eu.aegis.ValidateContract} payload
 */
function onValidateContract(payload) {
    var draftContract = payload.draftContract;
    var contractID = draftContract.tid,
        buyerID = draftContract.buyer.uid,
        assetID = draftContract.relatedAsset.aid,
        sellerID = draftContract.relatedAsset.owner.uid;
    var participantRegistry, assetRegistry, contractRegistry;
    var asset, contract, buyer, seller;

    if (buyerID === sellerID) {
        throw new Error('You can\'t buy your own dataset!');
    }

    if (draftContract.buyer.externalAssets) {
        for (var i = 0; i < draftContract.buyer.externalAssets.length; i++) {
            if (draftContract.buyer.externalAssets[i].aid === assetID) {
                throw new Error('You have already bought this asset');
            }
        }
    }

    if (draftContract.status === 'Active') {
        throw new Error('Contract already active');
    }

    return getAssetRegistry('eu.aegis.Contract')
        .then(function(cr) {
            contractRegistry = cr;
            return contractRegistry.get(contractID);
        })
        .then(function(c) {
            contract = c;

            return getParticipantRegistry('eu.aegis.User');
        })
        .then(function(pr) {
            participantRegistry = pr;
            return participantRegistry.get(buyerID);
        })
        .then(function(b) {
            buyer = b;
            return getAssetRegistry('eu.aegis.AEGISAsset');
        })
        .then(function(ar) {
            assetRegistry = ar;
            return assetRegistry.get(assetID);
        })
        .then(function(a) {
            asset = a;

            if (asset.cost > buyer.balance) {
                throw new Error('Insufficient funds');
            }

            return participantRegistry.get(sellerID);
        })
        .then(function(s) {
            seller = s;

            if (buyer.externalAssets == null) {
                buyer.externalAssets = [];
            }

            if (buyer.contracts == null) {
                buyer.contracts = [];
            }

            buyer.balance -= asset.cost;
            buyer.externalAssets.push(asset);
            buyer.contracts.push(contract);

            seller.balance += asset.cost;
            return participantRegistry.updateAll([buyer, seller]);
        })
        .then(function() {
            contract.status = 'Active';
            contract.amountPaid = asset.cost;

            return contractRegistry.update(contract);
        });
}
