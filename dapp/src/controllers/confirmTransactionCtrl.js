(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmTransactionCtrl", function ($scope, txId, address, Wallet, Transaction, $uibModalInstance, Utils) {
      $scope.send = function () {
        const ethersBNTxId = new ethers.BigNumber.from(txId.toString());
        Wallet.confirmTransaction(address, ethersBNTxId, {onlySimulate: false}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.notification("Confirmation transaction was sent.");
            Transaction.add({txHash: tx, callback: function () {
              Utils.success("Confirmation transaction was mined.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.simulate = function () {
        Wallet.confirmTransaction(address, txId, {onlySimulate: true}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.simulatedTransaction(tx);
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
