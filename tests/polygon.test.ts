import {runEVMTestSuite} from './evm.shared';
import {validatePolygon} from '../src/chains/polygon';

runEVMTestSuite(validatePolygon, 'Polygon');
