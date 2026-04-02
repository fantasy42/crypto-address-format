import {runEVMTestSuite} from './evm.shared';
import {validateETH} from '../src/chains/eth';

runEVMTestSuite(validateETH, 'Ethereum');
