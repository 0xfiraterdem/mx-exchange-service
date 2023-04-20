import { Injectable } from '@nestjs/common';
import { Interaction } from '@multiversx/sdk-core/out/smartcontracts/interaction';
import { MXProxyService } from 'src/services/multiversx-communication/mx.proxy.service';
import { GenericAbiService } from 'src/services/generics/generic.abi.service';
import { ErrorLoggerAsync } from 'src/helpers/decorators/error.logger';
import { GetOrSetCache } from 'src/helpers/decorators/caching.decorator';
import { CacheTtlInfo } from 'src/services/caching/cache.ttl.info';
import { oneHour } from 'src/helpers/helpers';
import { AddressValue } from '@multiversx/sdk-core/out';

@Injectable()
export class ProxyPairAbiService extends GenericAbiService {
    constructor(protected readonly mxProxy: MXProxyService) {
        super(mxProxy);
    }

    @ErrorLoggerAsync({
        className: ProxyPairAbiService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'proxyPair',
        remoteTtl: CacheTtlInfo.Token.remoteTtl,
        localTtl: CacheTtlInfo.Token.localTtl,
    })
    async wrappedLpTokenID(proxyAddress: string): Promise<string> {
        return this.getWrappedLpTokenIDRaw(proxyAddress);
    }

    async getWrappedLpTokenIDRaw(proxyAddress: string): Promise<string> {
        const contract = await this.mxProxy.getProxyDexSmartContract(
            proxyAddress,
        );
        const interaction: Interaction =
            contract.methodsExplicit.getWrappedLpTokenId();
        const response = await this.getGenericData(interaction);
        return response.firstValue.valueOf().toString();
    }

    @ErrorLoggerAsync({
        className: ProxyPairAbiService.name,
        logArgs: true,
    })
    @GetOrSetCache({
        baseKey: 'proxyPair',
        remoteTtl: oneHour(),
    })
    async intermediatedPairs(proxyAddress: string): Promise<string[]> {
        return this.getIntermediatedPairsRaw(proxyAddress);
    }

    async getIntermediatedPairsRaw(proxyAddress: string): Promise<string[]> {
        const contract = await this.mxProxy.getProxyDexSmartContract(
            proxyAddress,
        );

        const interaction: Interaction =
            contract.methodsExplicit.getIntermediatedPairs();
        const response = await this.getGenericData(interaction);
        return response.firstValue
            .valueOf()
            .map((pairAddress: AddressValue) => {
                return pairAddress.valueOf().toString();
            });
    }
}
