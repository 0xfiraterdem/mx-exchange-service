import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { quote } from 'src/modules/pair/pair.utils';
import { PairComputeService } from 'src/modules/pair/services/pair.compute.service';
import { PriceDiscoveryAbiService } from './price.discovery.abi.service';
import { PriceDiscoveryService } from './price.discovery.service';
import { ErrorLoggerAsync } from 'src/helpers/decorators/error.logger';
import { GetOrSetCache } from 'src/helpers/decorators/caching.decorator';
import { CacheTtlInfo } from 'src/services/caching/cache.ttl.info';
import { IPriceDiscoveryComputeService } from './interfaces';
import { AnalyticsQueryService } from 'src/services/analytics/services/analytics.query.service';
import { HistoricDataModel } from 'src/modules/analytics/models/analytics.model';

@Injectable()
export class PriceDiscoveryComputeService
    implements IPriceDiscoveryComputeService
{
    constructor(
        private readonly pairCompute: PairComputeService,
        private readonly priceDiscoveryAbi: PriceDiscoveryAbiService,
        private readonly priceDiscoveryService: PriceDiscoveryService,
        private readonly analyticsQuery: AnalyticsQueryService,
    ) {}

    @ErrorLoggerAsync({
        className: PriceDiscoveryComputeService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'priceDiscovery',
        remoteTtl: CacheTtlInfo.Price.remoteTtl,
        localTtl: CacheTtlInfo.Price.localTtl,
    })
    async launchedTokenPrice(priceDiscoveryAddress: string): Promise<string> {
        return await this.computeLaunchedTokenPrice(priceDiscoveryAddress);
    }

    async computeLaunchedTokenPrice(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        const phase = await this.priceDiscoveryAbi.currentPhase(
            priceDiscoveryAddress,
        );

        if (phase.name === 'Redeem') {
            const latestPrice = await this.analyticsQuery.getPDlatestValue({
                series: priceDiscoveryAddress,
                metric: 'launchedTokenPrice',
            });
            return latestPrice?.value ?? '0';
        }

        const [
            launchedToken,
            acceptedToken,
            launchedTokenAmount,
            acceptedTokenAmount,
        ] = await Promise.all([
            this.priceDiscoveryService.getLaunchedToken(priceDiscoveryAddress),
            this.priceDiscoveryService.getAcceptedToken(priceDiscoveryAddress),
            this.priceDiscoveryAbi.launchedTokenAmount(priceDiscoveryAddress),
            this.priceDiscoveryAbi.acceptedTokenAmount(priceDiscoveryAddress),
        ]);

        const launchedTokenPrice = quote(
            new BigNumber(`1e${launchedToken.decimals}`).toFixed(),
            launchedTokenAmount,
            acceptedTokenAmount,
        );

        return new BigNumber(launchedTokenPrice)
            .multipliedBy(`1e-${acceptedToken.decimals}`)
            .toFixed();
    }

    @ErrorLoggerAsync({
        className: PriceDiscoveryComputeService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'priceDiscovery',
        remoteTtl: CacheTtlInfo.Price.remoteTtl,
        localTtl: CacheTtlInfo.Price.localTtl,
    })
    async acceptedTokenPrice(priceDiscoveryAddress: string): Promise<string> {
        return await this.computeAcceptedTokenPrice(priceDiscoveryAddress);
    }

    async computeAcceptedTokenPrice(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        const phase = await this.priceDiscoveryAbi.currentPhase(
            priceDiscoveryAddress,
        );

        if (phase.name === 'Redeem') {
            const latestPrice = await this.analyticsQuery.getPDlatestValue({
                series: priceDiscoveryAddress,
                metric: 'acceptedTokenPrice',
            });
            return latestPrice?.value ?? '0';
        }

        const [
            launchedToken,
            acceptedToken,
            launchedTokenAmount,
            acceptedTokenAmount,
        ] = await Promise.all([
            this.priceDiscoveryService.getLaunchedToken(priceDiscoveryAddress),
            this.priceDiscoveryService.getAcceptedToken(priceDiscoveryAddress),
            this.priceDiscoveryAbi.launchedTokenAmount(priceDiscoveryAddress),
            this.priceDiscoveryAbi.acceptedTokenAmount(priceDiscoveryAddress),
        ]);

        const acceptedTokenPrice = quote(
            new BigNumber(`1e${acceptedToken.decimals}`).toFixed(),
            acceptedTokenAmount,
            launchedTokenAmount,
        );

        return new BigNumber(acceptedTokenPrice)
            .multipliedBy(`1e-${launchedToken.decimals}`)
            .toFixed();
    }

    @ErrorLoggerAsync({
        className: PriceDiscoveryComputeService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'priceDiscovery',
        remoteTtl: CacheTtlInfo.Price.remoteTtl,
        localTtl: CacheTtlInfo.Price.localTtl,
    })
    async launchedTokenPriceUSD(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        return await this.computeLaunchedTokenPriceUSD(priceDiscoveryAddress);
    }

    async computeLaunchedTokenPriceUSD(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        const phase = await this.priceDiscoveryAbi.currentPhase(
            priceDiscoveryAddress,
        );

        if (phase.name === 'Redeem') {
            const latestPrice = await this.analyticsQuery.getPDlatestValue({
                series: priceDiscoveryAddress,
                metric: 'launchedTokenPriceUSD',
            });
            return latestPrice?.value ?? '0';
        }

        const acceptedToken = await this.priceDiscoveryService.getAcceptedToken(
            priceDiscoveryAddress,
        );
        const [launchedTokenPrice, acceptedTokenPriceUSD] = await Promise.all([
            this.computeLaunchedTokenPrice(priceDiscoveryAddress),
            this.pairCompute.tokenPriceUSD(acceptedToken.identifier),
        ]);

        return new BigNumber(launchedTokenPrice)
            .multipliedBy(acceptedTokenPriceUSD)
            .toFixed();
    }

    @ErrorLoggerAsync({
        className: PriceDiscoveryComputeService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'priceDiscovery',
        remoteTtl: CacheTtlInfo.Price.remoteTtl,
        localTtl: CacheTtlInfo.Price.localTtl,
    })
    async acceptedTokenPriceUSD(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        return await this.computeAcceptedTokenPriceUSD(priceDiscoveryAddress);
    }

    async computeAcceptedTokenPriceUSD(
        priceDiscoveryAddress: string,
    ): Promise<string> {
        const phase = await this.priceDiscoveryAbi.currentPhase(
            priceDiscoveryAddress,
        );

        if (phase.name === 'Redeem') {
            const latestPrice = await this.analyticsQuery.getPDlatestValue({
                series: priceDiscoveryAddress,
                metric: 'acceptedTokenPriceUSD',
            });
            return latestPrice?.value ?? '0';
        }

        const acceptedTokenID = await this.priceDiscoveryAbi.acceptedTokenID(
            priceDiscoveryAddress,
        );
        return await this.pairCompute.tokenPriceUSD(acceptedTokenID);
    }

    @ErrorLoggerAsync({
        className: PriceDiscoveryComputeService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'priceDiscovery',
        remoteTtl: CacheTtlInfo.Analytics.remoteTtl,
        localTtl: CacheTtlInfo.Analytics.localTtl,
    })
    async closingValues(
        priceDiscoveryAddress: string,
        metric: string,
        interval: string,
    ): Promise<HistoricDataModel[]> {
        return await this.computeClosingValues(
            priceDiscoveryAddress,
            metric,
            interval,
        );
    }

    async computeClosingValues(
        priceDiscoveryAddress: string,
        metric: string,
        interval: string,
    ): Promise<HistoricDataModel[]> {
        return await this.analyticsQuery.getPDCloseValues({
            series: priceDiscoveryAddress,
            metric,
            timeBucket: interval,
        });
    }
}
