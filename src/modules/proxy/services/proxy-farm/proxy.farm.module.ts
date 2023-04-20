import { forwardRef, Module } from '@nestjs/common';
import { MXCommunicationModule } from '../../../../services/multiversx-communication/mx.communication.module';
import { ContextModule } from '../../../../services/context/context.module';
import { ProxyFarmAbiService } from './proxy.farm.abi.service';
import { ProxyFarmTransactionsService } from './proxy.farm.transactions.service';
import { CachingModule } from '../../../../services/caching/cache.module';
import { ProxyPairModule } from '../proxy-pair/proxy.pair.module';
import { ProxyModule } from '../../proxy.module';
import { PairModule } from 'src/modules/pair/pair.module';
import { TokenModule } from 'src/modules/tokens/token.module';
import { FarmModule } from 'src/modules/farm/farm.module';

@Module({
    imports: [
        MXCommunicationModule,
        CachingModule,
        ContextModule,
        ProxyPairModule,
        forwardRef(() => ProxyModule),
        FarmModule,
        PairModule,
        TokenModule,
    ],
    providers: [ProxyFarmAbiService, ProxyFarmTransactionsService],
    exports: [ProxyFarmAbiService, ProxyFarmTransactionsService],
})
export class ProxyFarmModule {}
