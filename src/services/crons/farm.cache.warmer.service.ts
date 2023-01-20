import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MXApiService } from '../multiversx-communication/mx.api.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from '../redis.pubSub.module';
import { farmsAddresses, farmVersion } from 'src/utils/farm.utils';
import { TokenSetterService } from 'src/modules/tokens/services/token.setter.service';
import { FarmVersion } from 'src/modules/farm/models/farm.model';
import { FarmComputeServiceV1_2 } from 'src/modules/farm/v1.2/services/farm.v1.2.compute.service';
import { FarmComputeServiceV1_3 } from 'src/modules/farm/v1.3/services/farm.v1.3.compute.service';
import { FarmAbiFactory } from 'src/modules/farm/farm.abi.factory';
import { FarmAbiServiceV1_2 } from 'src/modules/farm/v1.2/services/farm.v1.2.abi.service';
import { FarmComputeFactory } from 'src/modules/farm/farm.compute.factory';
import { FarmSetterFactory } from 'src/modules/farm/farm.setter.factory';

@Injectable()
export class FarmCacheWarmerService {
    private invalidatedKeys = [];

    constructor(
        private readonly farmAbiFactory: FarmAbiFactory,
        private readonly farmAbiV1_2: FarmAbiServiceV1_2,
        private readonly farmComputeFactory: FarmComputeFactory,
        private readonly farmComputeV1_2: FarmComputeServiceV1_2,
        private readonly farmComputeV1_3: FarmComputeServiceV1_3,
        private readonly farmSetterFactory: FarmSetterFactory,
        private readonly apiService: MXApiService,
        private readonly tokenSetter: TokenSetterService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async cacheFarmsTokens(): Promise<void> {
        const farmsAddress: string[] = farmsAddresses();
        const promises = farmsAddress.map(async (farmAddress) => {
            const [farmTokenID, farmingTokenID, farmedTokenID] =
                await Promise.all([
                    this.farmAbiFactory
                        .useAbi(farmAddress)
                        .getFarmTokenID(farmAddress),
                    this.farmAbiFactory
                        .useAbi(farmAddress)
                        .getFarmingTokenID(farmAddress),
                    this.farmAbiFactory
                        .useAbi(farmAddress)
                        .getFarmedTokenID(farmAddress),
                ]);

            const [farmToken, farmingToken, farmedToken] = await Promise.all([
                this.apiService.getNftCollection(farmTokenID),
                this.apiService.getToken(farmingTokenID),
                this.apiService.getToken(farmedTokenID),
            ]);

            const cacheKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmTokenID(farmAddress, farmTokenID),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmingTokenID(farmAddress, farmingTokenID),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmedTokenID(farmAddress, farmedTokenID),
                this.tokenSetter.setNftCollectionMetadata(
                    farmTokenID,
                    farmToken,
                ),
                this.tokenSetter.setTokenMetadata(farmingTokenID, farmingToken),
                this.tokenSetter.setTokenMetadata(farmedTokenID, farmedToken),
            ]);
            this.invalidatedKeys.push(cacheKeys);
            await this.deleteCacheKeys();
        });

        await Promise.all(promises);
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cacheFarmsV1_2(): Promise<void> {
        for (const address of farmsAddresses()) {
            if (farmVersion(address) !== FarmVersion.V1_2) {
                continue;
            }
            const [
                aprMultiplier,
                farmingTokenReserve,
                unlockedRewardsAPR,
                lockedRewardsAPR,
            ] = await Promise.all([
                this.farmAbiV1_2.getLockedRewardAprMuliplier(address),
                this.farmAbiV1_2.getFarmingTokenReserve(address),
                this.farmComputeV1_2.computeUnlockedRewardsAPR(address),
                this.farmComputeV1_2.computeLockedRewardsAPR(address),
            ]);

            const cachedKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(address)
                    .setLockedRewardAprMuliplier(address, aprMultiplier),
                this.farmSetterFactory
                    .useSetter(address)
                    .setFarmingTokenReserve(address, farmingTokenReserve),
                this.farmSetterFactory
                    .useSetter(address)
                    .setUnlockedRewardsAPR(address, unlockedRewardsAPR),
                this.farmSetterFactory
                    .useSetter(address)
                    .setLockedRewardsAPR(address, lockedRewardsAPR),
            ]);
            this.invalidatedKeys.push(...cachedKeys);
            await this.deleteCacheKeys();
        }
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cacheFarmsV1_3(): Promise<void> {
        for (const address of farmsAddresses()) {
            if (farmVersion(address) !== FarmVersion.V1_3) {
                continue;
            }

            const [apr] = await Promise.all([
                this.farmComputeV1_3.computeFarmAPR(address),
            ]);
            const cachedKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(address)
                    .setFarmAPR(address, apr),
            ]);
            this.invalidatedKeys.push(...cachedKeys);
            await this.deleteCacheKeys();
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async cacheFarmInfo(): Promise<void> {
        for (const farmAddress of farmsAddresses()) {
            const [
                minimumFarmingEpochs,
                penaltyPercent,
                rewardsPerBlock,
                state,
                produceRewardsEnabled,
            ] = await Promise.all([
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getMinimumFarmingEpochs(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getPenaltyPercent(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getRewardsPerBlock(farmAddress),
                this.farmAbiFactory.useAbi(farmAddress).getState(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getProduceRewardsEnabled(farmAddress),
            ]);

            const cacheKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setMinimumFarmingEpochs(farmAddress, minimumFarmingEpochs),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setPenaltyPercent(farmAddress, penaltyPercent),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setRewardsPerBlock(farmAddress, rewardsPerBlock),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setState(farmAddress, state),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setProduceRewardsEnabled(
                        farmAddress,
                        produceRewardsEnabled,
                    ),
            ]);
            this.invalidatedKeys.push(cacheKeys);
            await this.deleteCacheKeys();
        }
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cacheFarmReserves(): Promise<void> {
        for (const farmAddress of farmsAddresses()) {
            const [
                farmTokenSupply,
                lastRewardBlockNonce,
                farmRewardPerShare,
                rewardReserve,
            ] = await Promise.all([
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getFarmTokenSupply(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getLastRewardBlockNonce(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getRewardPerShare(farmAddress),
                this.farmAbiFactory
                    .useAbi(farmAddress)
                    .getRewardReserve(farmAddress),
            ]);
            const cacheKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmTokenSupply(farmAddress, farmTokenSupply),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setLastRewardBlockNonce(farmAddress, lastRewardBlockNonce),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setRewardPerShare(farmAddress, farmRewardPerShare),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setRewardReserve(farmAddress, rewardReserve),
            ]);
            this.invalidatedKeys.push(cacheKeys);
            await this.deleteCacheKeys();
        }
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cacheFarmTokensPrices(): Promise<void> {
        for (const farmAddress of farmsAddresses()) {
            const [
                farmedTokenPriceUSD,
                farmingTokenPriceUSD,
                totalValueLockedUSD,
            ] = await Promise.all([
                this.farmComputeFactory
                    .useCompute(farmAddress)
                    .computeFarmedTokenPriceUSD(farmAddress),
                this.farmComputeFactory
                    .useCompute(farmAddress)
                    .computeFarmingTokenPriceUSD(farmAddress),
                this.farmComputeFactory
                    .useCompute(farmAddress)
                    .computeFarmLockedValueUSD(farmAddress),
            ]);
            const cacheKeys = await Promise.all([
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmedTokenPriceUSD(farmAddress, farmedTokenPriceUSD),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setFarmingTokenPriceUSD(farmAddress, farmingTokenPriceUSD),
                this.farmSetterFactory
                    .useSetter(farmAddress)
                    .setTotalValueLockedUSD(farmAddress, totalValueLockedUSD),
            ]);
            this.invalidatedKeys.push(cacheKeys);
            await this.deleteCacheKeys();
        }
    }

    private async deleteCacheKeys() {
        await this.pubSub.publish('deleteCacheKeys', this.invalidatedKeys);
        this.invalidatedKeys = [];
    }
}
