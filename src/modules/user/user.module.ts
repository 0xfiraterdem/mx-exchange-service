import { Module } from '@nestjs/common';
import { ContextModule } from '../../services/context/context.module';
import { MXCommunicationModule } from 'src/services/multiversx-communication/mx.communication.module';
import { PairModule } from '../pair/pair.module';
import { ProxyFarmModule } from '../proxy/services/proxy-farm/proxy-farm.module';
import { ProxyPairModule } from '../proxy/services/proxy-pair/proxy-pair.module';
import { ProxyModule } from '../proxy/proxy.module';
import { UserResolver } from './user.resolver';
import { UserMetaEsdtService } from './services/user.metaEsdt.service';
import { LockedAssetModule } from '../locked-asset-factory/locked-asset.module';
import { WrappingModule } from '../wrapping/wrap.module';
import { UserMetaEsdtComputeService } from './services/metaEsdt.compute.service';
import { CachingModule } from 'src/services/caching/cache.module';
import { StakingModule } from '../staking/staking.module';
import { StakingProxyModule } from '../staking-proxy/staking.proxy.module';
import { PriceDiscoveryModule } from '../price-discovery/price.discovery.module';
import { SimpleLockModule } from '../simple-lock/simple.lock.module';
import { UserTokenResolver } from './user.token.resolver';
import { TokenModule } from '../tokens/token.module';
import { RemoteConfigModule } from '../remote-config/remote-config.module';
import { RouterModule } from '../router/router.module';
import { UserEsdtService } from './services/user.esdt.service';
import { UserEsdtComputeService } from './services/esdt.compute.service';
import { FarmModule } from '../farm/farm.module';
import { EnergyModule } from '../energy/energy.module';
import { UserNftsResolver } from './user.nfts.resolver';
import { FeesCollectorModule } from '../fees-collector/fees-collector.module';
import { UserEnergyGetterService } from './services/userEnergy/user.energy.getter.service';
import { UserEnergyComputeService } from './services/userEnergy/user.energy.compute.service';
import { LockedTokenWrapperModule } from '../locked-token-wrapper/locked-token-wrapper.module';
import { UserEnergySetterService } from './services/userEnergy/user.energy.setter.service';
import { UserInfoByWeekResolver } from './user.info-by-week.resolver';
import { UserEnergyTransactionService } from './services/userEnergy/user.energy.transaction.service';
import { WeekTimekeepingModule } from 'src/submodules/week-timekeeping/week-timekeeping.module';
import { WeeklyRewardsSplittingModule } from 'src/submodules/weekly-rewards-splitting/weekly-rewards-splitting.module';
import { FarmModuleV2 } from '../farm/v2/farm.v2.module';

@Module({
    imports: [
        MXCommunicationModule,
        CachingModule,
        ContextModule,
        RouterModule,
        PairModule,
        ProxyModule,
        ProxyPairModule,
        ProxyFarmModule,
        FarmModule,
        FarmModuleV2,
        LockedAssetModule,
        WrappingModule,
        StakingModule,
        StakingProxyModule,
        PriceDiscoveryModule,
        SimpleLockModule,
        EnergyModule,
        TokenModule,
        RemoteConfigModule,
        FeesCollectorModule,
        LockedTokenWrapperModule,
        WeekTimekeepingModule,
        WeeklyRewardsSplittingModule,
    ],
    providers: [
        UserEsdtService,
        UserMetaEsdtService,
        UserEsdtComputeService,
        UserMetaEsdtComputeService,
        UserEnergyComputeService,
        UserEnergyGetterService,
        UserEnergySetterService,
        UserEnergyTransactionService,
        UserResolver,
        UserTokenResolver,
        UserNftsResolver,
        UserInfoByWeekResolver,
    ],
    exports: [
        UserMetaEsdtService,
        UserInfoByWeekResolver,
        UserEnergyComputeService,
        UserEnergyGetterService,
        UserEnergySetterService,
        UserEnergyTransactionService,
    ],
})
export class UserModule {}
