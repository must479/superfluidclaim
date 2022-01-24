(
  function () {
    angular
    .module("multiSigWeb")
    .service("Token", function (Wallet, Web3Service) {
      var factory = {};

      factory.abi = abiJSON.token.abi;

      factory.balanceOf = function (address, owner, cb, isCallRequest = true) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, address);
        return Wallet.callRequest(
          instance.methods.balanceOf,
          [owner],
          cb,
          isCallRequest
        );
      };

      factory.name = function (address, cb) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, address);
        return Wallet.callRequest(
          instance.methods.name,
          [],
          cb
        );
      };

      factory.symbol = function (address, cb) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, address);
        return Wallet.callRequest(
          instance.methods.symbol,
          [],
          cb
        );
      };

      factory.decimals = function (address, cb) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, address);
        return Wallet.callRequest(
          instance.methods.decimals,
          [],
          cb
        );
      };

      factory.transfer = function (tokenAddress, to, value, options, cb) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, tokenAddress);
        Web3Service.sendTransaction(
          instance.methods.transfer,
          [
            to,
            value,
            Wallet.txDefaults({
              gas: 200000
            })
          ],
          options,
          cb
        );
      };

      factory.transferOffline = function (tokenAddress, to, value, cb) {
        var instance = new Web3Service.web3.eth.Contract(factory.abi, tokenAddress);
        var data = instance.methods.transfer.getData(to, value);

        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            //Wallet.offlineTransaction(tokenAddress, data, nonce, Wallet.txDefaults(), cb);
            Wallet.offlineTransaction(tokenAddress, data, nonce, cb);
          }
        });
      };

      factory.withdraw = function (tokenAddress, wallet, to, value, options, cb) {
        var walletInstance = new Web3Service.web3.eth.Contract(Wallet.json.multiSigDailyLimit.abi, wallet);
        var tokenInstance = new Web3Service.web3.eth.Contract(factory.abi, tokenAddress);
        var data = tokenInstance.methods.transfer.getData(
          to,
          value
        );
        // Get nonce
        Wallet.getTransactionCount(wallet, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
        
            Web3Service.configureGas(Wallet.txDefaults({gas: 500000}), function (gasOptions){
              walletInstance.methods.submitTransaction(
                tokenAddress, 
                "0x0", 
                data, 
                count, 
                Wallet.txDefaults({
                  gas: gasOptions.gas,
                  gasPrice: gasOptions.gasPrice
                }), 
                options, 
                cb);
            });
          }
        }).call();
      };

      factory.withdrawOffline = function (tokenAddress, wallet, to, value, cb) {
        var walletInstance = new Web3Service.web3.eth.Contract(Wallet.json.multiSigDailyLimit.abi, wallet);
        var tokenInstance = new Web3Service.web3.eth.Contract(factory.abi, tokenAddress);
        var data = tokenInstance.methods.transfer.getData(
          to,
          value
        );

        // Get nonce
        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = walletInstance.methods.submitTransaction.getData(tokenAddress, "0x0", data);
            Wallet.offlineTransaction(wallet, mainData, nonce, cb);
          }
        });
      };

      factory.withdrawData = function (tokenAddress, to, value) {
        var tokenInstance = new Web3Service.web3.eth.Contract(factory.abi, tokenAddress);
        return tokenInstance.methods.transfer.getData(
          to,
          value
        );
      };

      factory.setDefaultTokens = function (address) {
        /**
        * Set all the default tokens to a given wallet address
        */
        var tokens = {};
        var wallets = Wallet.getAllWallets();

        txDefault.tokens.map(function (token) {
          if (!tokens[token.address]) {
            tokens[token.address] = {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              address: token.address
            };
          }
        });

        Object.assign(wallets[address].tokens, tokens);
        localStorage.setItem("wallets", JSON.stringify(wallets));
      };

      return factory;
    });
  }
)();
