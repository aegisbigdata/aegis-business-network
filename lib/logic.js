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
 * Defines an exclusivity period for an asset. Set to "None" to make it
 * non-exclusive.
 * @param {eu.aegis.ChangeExclusifityPeriod} changeExclusivity
 */
function onChangeExclusivity(changeExclusivity) {
    var registry;
    var id = changeExclusivity.relatedAsset.aid;

    return getAssetRegistry('eu.aegis.AEGISAsset')
        .then(function(ar) {
            registry = ar;
            return registry.get(id);
        })
        .then(function(asset) {
            asset.exclusivity = changeExclusivity.newPeriod;
            return registry.update(asset);
        });
}

/**
 * Buys the use of an asset
 * @param {eu.aegis.BuyAsset} buyAsset
 */
function onBuyAsset(buyAsset) {
    var participantRegistry, assetRegistry, asset, buyer;
    var buyerID = buyAsset.buyer.uid,
        sellerID = buyAsset.relatedAsset.owner.uid,
        assetID = buyAsset.relatedAsset.aid;

    if (buyerID === sellerID) {
        throw new Error('You can\'t buy your own dataset!');
    }

    if (buyAsset.buyer.externalAssets) {
        for (var i = 0; i < buyAsset.buyer.externalAssets.length; i++) {
            if (buyAsset.buyer.externalAssets[i].aid === assetID) {
                throw new Error('You have already bought this asset');
            }
        }
    }

    return getAssetRegistry('eu.aegis.AEGISAsset')
        .then(function(ar) {
            assetRegistry = ar;
            return assetRegistry.get(assetID);
        })
        .then(function(a) {
            if (a.status === 'Private') {
                throw new Error('You cannot buy this dataset');
            }
            asset = a;

            return getParticipantRegistry('eu.aegis.User');
        })
        .then(function(pr) {
            participantRegistry = pr;
            return participantRegistry.get(buyerID);
        })
        .then(function(p) {
            if (asset.cost > p.balance) {
                throw new Error('Insufficient funds');
            }

            buyer = p;
            return participantRegistry.get(sellerID);
        })
        .then(function(seller) {
            if (buyer.externalAssets == null) {
                buyer.externalAssets = [];
            }
            buyer.balance -= asset.cost;
            buyer.externalAssets.push(asset);

            seller.balance += asset.cost;
            return participantRegistry.updateAll([buyer, seller]);
        });
}
