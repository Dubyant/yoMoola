import type { IVaultSettings } from '../../types';

const settings: IVaultSettings = Object.freeze({
  feeInfoEditable: true,
  privateKeyExportEnabled: true,
  tokenEnabled: true,
  txCanBeReplaced: true,

  importedAccountEnabled: true,
  hardwareAccountEnabled: true,
  externalAccountEnabled: true,
  watchingAccountEnabled: true,

  isUTXOModel: false,

  subNetworkSettings: {
    // GateChain
    'evm--86': {
      isIntegerGasPrice: true,
    },
  },

  supportFilterScam: true,
});

export default settings;
