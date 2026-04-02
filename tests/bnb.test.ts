import {runEVMTestSuite} from './evm.shared';
import {validateBNB} from '../src/chains/bnb';

runEVMTestSuite(validateBNB, 'BNB');
