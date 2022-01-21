(
  function () {
    angular
    .module("multiSigWeb")
    .controller("updateRequiredCtrl", async function ($scope, Wallet, Transaction, Utils, $uibModalInstance, wallet) {
      $scope.address = wallet.address;

      const required = await Wallet.getRequired(
        $scope.address,
        function () {},
        false
      ).call();
      $scope.required = Number(required);
      $scope.$apply();


      $scope.update = function () {
        Wallet.updateRequired($scope.address, $scope.required, {onlySimulate: false}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.notification("Update required confirmations transaction was sent.");
            Transaction.add({txHash: tx, callback: function () {
              Utils.success("Update required confirmations transaction was mined.");
            }});
          }
        });
      };

      $scope.signOffline = function () {
        Wallet.signUpdateRequired($scope.address, $scope.required, function (e, tx) {
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
        var data = Wallet.getUpdateRequiredData($scope.address, $scope.required);
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
