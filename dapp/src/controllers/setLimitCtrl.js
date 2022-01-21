(
  function () {
    angular
    .module("multiSigWeb")
    .controller("setLimitCtrl", async function ($scope, $uibModalInstance, Utils, Transaction, wallet, Wallet) {
      const toBN = (num) => new Web3().utils.toBN(num);
      $scope.address = wallet.address;

      const limit = await Wallet
      .getLimit($scope.address, function () {
      }, false).call();
      if (limit) {
        $scope.limit = toBN(limit).div(toBN(1e18)).toNumber();
        $scope.$apply();
      }

      $scope.setLimit = function () {
        Wallet.updateLimit($scope.address, toBN($scope.limit).mul('1e18'), {onlySimulate: false}, function (e, tx){
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.notification("Update daily limit transaction was sent.");
            Transaction.add({txHash: tx, callback: function () {
              Utils.success("Update daily limit transaction was mined.");
            }});
          }
        });
      };

      $scope.sign = function () {
        Wallet.signLimit($scope.address, toBN($scope.limit).mul('1e18'), function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.signed(tx);
          }
        });
      };

      $scope.getNonce = function () {
        var data = Wallet.getUpdateLimitData($scope.address, toBN($scope.limit).mul('1e18'));
        Wallet.getNonce($scope.address, $scope.address, "0x0", data, function (e, nonce) {
          // Open modal
          $uibModalInstance.close();
          Utils.nonce(nonce);
        }).call();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
