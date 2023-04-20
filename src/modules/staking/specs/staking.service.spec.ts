import { Test, TestingModule } from '@nestjs/testing';
import { ContextGetterServiceProvider } from 'src/services/context/mocks/context.getter.service.mock';
import { ApiConfigService } from 'src/helpers/api.config.service';
import { StakingService } from '../services/staking.service';
import { StakingComputeService } from '../services/staking.compute.service';
import { MXProxyServiceProvider } from 'src/services/multiversx-communication/mx.proxy.service.mock';
import { MXGatewayService } from 'src/services/multiversx-communication/mx.gateway.service';
import { MXApiServiceProvider } from 'src/services/multiversx-communication/mx.api.service.mock';
import { RemoteConfigGetterServiceProvider } from 'src/modules/remote-config/mocks/remote-config.getter.mock';
import { Address } from '@multiversx/sdk-core';
import { TokenGetterServiceProvider } from '../../tokens/mocks/token.getter.service.mock';
import { StakingAbiServiceProvider } from '../mocks/staking.abi.service.mock';
import { CachingModule } from 'src/services/caching/cache.module';

describe('StakingService', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [CachingModule],
            providers: [
                StakingService,
                StakingAbiServiceProvider,
                StakingComputeService,
                ContextGetterServiceProvider,
                RemoteConfigGetterServiceProvider,
                MXProxyServiceProvider,
                MXApiServiceProvider,
                MXGatewayService,
                ApiConfigService,
                TokenGetterServiceProvider,
            ],
        }).compile();
    });

    it('should be defined', () => {
        const service: StakingService =
            module.get<StakingService>(StakingService);
        expect(service).toBeDefined();
    });

    it('should get farms staking', async () => {
        const service: StakingService =
            module.get<StakingService>(StakingService);
        const farmsStaking = await service.getFarmsStaking();
        expect(farmsStaking.length).toBeGreaterThanOrEqual(1);
    });

    it('should get rewards for position', async () => {
        const service: StakingService =
            module.get<StakingService>(StakingService);
        const rewards = await service.getRewardsForPosition({
            farmAddress:
                'erd18h5dulxp5zdp80qjndd2w25kufx0rm5yqd2h7ajrfucjhr82y8vqyq0hye',
            liquidity: '1000000000000000',
            identifier: 'MEXFARML-772223-14',
            attributes:
                'AAAAAAAAAAAAAAQUAAAAAAAABBQAAAAMBP50cQa8hndHG4AAAAAAAAAAAAwE/nRxBryGd0cbgAA=',
            vmQuery: false,
            user: Address.Zero().bech32(),
        });
        expect(rewards).toEqual({
            decodedAttributes: {
                attributes:
                    'AAAAAAAAAAAAAAQUAAAAAAAABBQAAAAMBP50cQa8hndHG4AAAAAAAAAAAAwE/nRxBryGd0cbgAA=',
                compoundedReward: '0',
                currentFarmAmount:
                    '519205458813209018315265407815173060004346493743728287017479820327455628280230924139593728',
                identifier: 'MEXFARML-772223-14',
                rewardPerShare: '0',
                type: 'stakingFarmToken',
            },
            rewards: '150000000000000001046423',
        });
    });

    it('should get batch rewards for position', async () => {
        const service: StakingService =
            module.get<StakingService>(StakingService);
        const batchRewards = await service.getBatchRewardsForPosition([
            {
                farmAddress:
                    'erd18h5dulxp5zdp80qjndd2w25kufx0rm5yqd2h7ajrfucjhr82y8vqyq0hye',
                liquidity: '1000000000000000',
                identifier: 'MEXFARML-772223-14',
                attributes:
                    'AAAAAAAAAAAAAAQUAAAAAAAABBQAAAAMBP50cQa8hndHG4AAAAAAAAAAAAwE/nRxBryGd0cbgAA=',
                vmQuery: false,
                user: Address.Zero().bech32(),
            },
        ]);
        expect(batchRewards).toEqual([
            {
                decodedAttributes: {
                    attributes:
                        'AAAAAAAAAAAAAAQUAAAAAAAABBQAAAAMBP50cQa8hndHG4AAAAAAAAAAAAwE/nRxBryGd0cbgAA=',
                    compoundedReward: '0',
                    currentFarmAmount:
                        '519205458813209018315265407815173060004346493743728287017479820327455628280230924139593728',
                    identifier: 'MEXFARML-772223-14',
                    rewardPerShare: '0',
                    type: 'stakingFarmToken',
                },
                rewards: '150000000000000001046423',
            },
        ]);
    });
});
