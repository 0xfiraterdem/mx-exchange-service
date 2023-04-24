import { PairService } from './services/pair.service';
import { Resolver, Query, ResolveField, Parent, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
    BPConfig,
    FeeDestination,
    LiquidityPosition,
    LockedTokensInfo,
    PairModel,
} from './models/pair.model';
import { TransactionModel } from '../../models/transaction.model';
import {
    AddLiquidityArgs,
    RemoveLiquidityArgs,
    SwapTokensFixedInputArgs,
    SwapTokensFixedOutputArgs,
    WhitelistArgs,
} from './models/pair.args';
import { PairTransactionService } from './services/pair.transactions.service';
import { JwtOrNativeAuthGuard } from '../auth/jwt.or.native.auth.guard';
import { AuthUser } from '../auth/auth.user';
import { UserAuthResult } from '../auth/user.auth.result';
import { PairInfoModel } from './models/pair-info.model';
import { GqlAdminGuard } from '../auth/gql.admin.guard';
import { EsdtTokenPayment } from 'src/models/esdtTokenPayment.model';
import { EsdtToken } from '../tokens/models/esdtToken.model';
import { PairAbiService } from './services/pair.abi.service';
import { PairComputeService } from './services/pair.compute.service';

@Resolver(() => PairModel)
export class PairResolver {
    constructor(
        private readonly pairService: PairService,
        private readonly pairAbi: PairAbiService,
        private readonly pairCompute: PairComputeService,
        private readonly transactionService: PairTransactionService,
    ) {}

    @ResolveField()
    async firstToken(@Parent() parent: PairModel): Promise<EsdtToken> {
        return this.pairService.getFirstToken(parent.address);
    }

    @ResolveField()
    async secondToken(@Parent() parent: PairModel): Promise<EsdtToken> {
        return this.pairService.getSecondToken(parent.address);
    }

    @ResolveField()
    async liquidityPoolToken(@Parent() parent: PairModel): Promise<EsdtToken> {
        return this.pairService.getLpToken(parent.address);
    }

    @ResolveField()
    async firstTokenPrice(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.firstTokenPrice(parent.address);
    }

    @ResolveField()
    async firstTokenPriceUSD(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.firstTokenPriceUSD(parent.address);
    }

    @ResolveField()
    async secondTokenPriceUSD(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.secondTokenPriceUSD(parent.address);
    }

    @ResolveField()
    async secondTokenPrice(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.secondTokenPrice(parent.address);
    }

    @ResolveField()
    async liquidityPoolTokenPriceUSD(
        @Parent() parent: PairModel,
    ): Promise<string> {
        return this.pairCompute.lpTokenPriceUSD(parent.address);
    }

    @ResolveField()
    async firstTokenLockedValueUSD(
        @Parent() parent: PairModel,
    ): Promise<string> {
        return this.pairCompute.firstTokenLockedValueUSD(parent.address);
    }

    @ResolveField()
    async secondTokenLockedValueUSD(
        @Parent() parent: PairModel,
    ): Promise<string> {
        return this.pairCompute.secondTokenLockedValueUSD(parent.address);
    }

    @ResolveField()
    async lockedValueUSD(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.lockedValueUSD(parent.address);
    }

    @ResolveField()
    async firstTokenVolume24h(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.firstTokenVolume(parent.address, '24h');
    }

    @ResolveField()
    async secondTokenVolume24h(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.secondTokenVolume(parent.address, '24h');
    }

    @ResolveField()
    async volumeUSD24h(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.volumeUSD(parent.address, '24h');
    }

    @ResolveField()
    async feesUSD24h(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.feesUSD(parent.address, '24h');
    }

    @ResolveField()
    async feesAPR(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.feesAPR(parent.address);
    }

    @ResolveField()
    async info(@Parent() parent: PairModel): Promise<PairInfoModel> {
        return this.pairAbi.pairInfoMetadata(parent.address);
    }

    @ResolveField()
    async totalFeePercent(@Parent() parent: PairModel): Promise<number> {
        return this.pairAbi.totalFeePercent(parent.address);
    }

    @ResolveField()
    async specialFeePercent(@Parent() parent: PairModel): Promise<number> {
        return this.pairAbi.specialFeePercent(parent.address);
    }

    @ResolveField()
    async type(@Parent() parent: PairModel): Promise<string> {
        return this.pairCompute.type(parent.address);
    }

    async trustedSwapPairs(@Parent() parent: PairModel): Promise<string[]> {
        return this.pairAbi.trustedSwapPairs(parent.address);
    }

    @ResolveField()
    async state(@Parent() parent: PairModel): Promise<string> {
        return this.pairAbi.state(parent.address);
    }

    @ResolveField()
    async feeState(@Parent() parent: PairModel): Promise<boolean> {
        return this.pairAbi.feeState(parent.address);
    }

    @ResolveField()
    async lockedTokensInfo(
        @Parent() parent: PairModel,
    ): Promise<LockedTokensInfo> {
        return this.pairService.getLockedTokensInfo(parent.address);
    }

    @ResolveField()
    async whitelistedManagedAddresses(
        @Parent() parent: PairModel,
    ): Promise<string[]> {
        return this.pairAbi.whitelistedAddresses(parent.address);
    }

    @ResolveField()
    async externSwapGasLimit(@Parent() parent: PairModel): Promise<number> {
        return this.pairAbi.externSwapGasLimit(parent.address);
    }

    @ResolveField()
    async initialLiquidityAdder(@Parent() parent: PairModel): Promise<string> {
        return this.pairAbi.initialLiquidityAdder(parent.address);
    }

    @ResolveField()
    async transferExecGasLimit(@Parent() parent: PairModel): Promise<number> {
        return this.pairAbi.transferExecGasLimit(parent.address);
    }

    @ResolveField()
    async feeDestinations(
        @Parent() parent: PairModel,
    ): Promise<FeeDestination[]> {
        return this.pairAbi.feeDestinations(parent.address);
    }

    @Query(() => String)
    async getAmountOut(
        @Args('pairAddress') pairAddress: string,
        @Args('tokenInID') tokenInID: string,
        @Args('amount') amount: string,
    ): Promise<string> {
        return this.pairService.getAmountOut(pairAddress, tokenInID, amount);
    }

    @Query(() => String)
    async getAmountIn(
        @Args('pairAddress') pairAddress: string,
        @Args('tokenOutID') tokenOutID: string,
        @Args('amount') amount: string,
    ): Promise<string> {
        return this.pairService.getAmountIn(pairAddress, tokenOutID, amount);
    }

    @Query(() => String)
    async getEquivalent(
        @Args('pairAddress') pairAddress: string,
        @Args('tokenInID') tokenInID: string,
        @Args('amount') amount: string,
    ): Promise<string> {
        return (
            await this.pairService.getEquivalentForLiquidity(
                pairAddress,
                tokenInID,
                amount,
            )
        )
            .integerValue()
            .toFixed();
    }

    @Query(() => LiquidityPosition)
    async getLiquidityPosition(
        @Args('pairAddress') pairAddress: string,
        @Args('liquidityAmount') liquidityAmount: string,
    ): Promise<LiquidityPosition> {
        return this.pairService.getLiquidityPosition(
            pairAddress,
            liquidityAmount,
        );
    }

    @Query(() => Boolean)
    async getFeeState(
        @Args('pairAddress') pairAddress: string,
    ): Promise<boolean> {
        return this.pairAbi.feeState(pairAddress);
    }

    @Query(() => String)
    async getRouterManagedAddress(
        @Args('address') address: string,
    ): Promise<string> {
        return this.pairAbi.routerAddress(address);
    }

    @Query(() => String)
    async getRouterOwnerManagedAddress(
        @Args('address') address: string,
    ): Promise<string> {
        return this.pairAbi.routerOwnerAddress(address);
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => [TransactionModel])
    async addInitialLiquidityBatch(
        @Args() args: AddLiquidityArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel[]> {
        return this.transactionService.addInitialLiquidityBatch(
            user.address,
            args,
        );
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => [TransactionModel])
    async addLiquidityBatch(
        @Args() args: AddLiquidityArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel[]> {
        return this.transactionService.addLiquidityBatch(user.address, args);
    }

    @Query(() => EsdtTokenPayment)
    async updateAndGetSafePrice(
        @Args('pairAddress') pairAddress: string,
        @Args('esdtTokenPayment') esdtTokenPayment: EsdtTokenPayment,
    ): Promise<EsdtTokenPayment> {
        return this.pairAbi.updateAndGetSafePrice(
            pairAddress,
            esdtTokenPayment,
        );
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => TransactionModel)
    async addLiquidity(
        @Args() args: AddLiquidityArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        return this.transactionService.addLiquidity(user.address, args);
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => [TransactionModel])
    async removeLiquidity(
        @Args() args: RemoveLiquidityArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel[]> {
        return this.transactionService.removeLiquidity(user.address, args);
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => [TransactionModel])
    async swapTokensFixedInput(
        @Args() args: SwapTokensFixedInputArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel[]> {
        return this.transactionService.swapTokensFixedInput(user.address, args);
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => [TransactionModel])
    async swapTokensFixedOutput(
        @Args() args: SwapTokensFixedOutputArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel[]> {
        return this.transactionService.swapTokensFixedOutput(
            user.address,
            args,
        );
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => String)
    async getNumSwapsByAddress(
        @Args('pairAddress') pairAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<number> {
        return this.pairAbi.numSwapsByAddress(pairAddress, user.address);
    }

    @UseGuards(JwtOrNativeAuthGuard)
    @Query(() => String)
    async getNumAddsByAddress(
        @Args('pairAddress') pairAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<string> {
        return this.pairAbi.numAddsByAddress(pairAddress, user.address);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async whitelist(
        @Args() args: WhitelistArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(args.pairAddress, user.address);
        return this.transactionService.whitelist(args);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async removeWhitelist(
        @Args() args: WhitelistArgs,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(args.pairAddress, user.address);
        return this.transactionService.removeWhitelist(args);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async addTrustedSwapPair(
        @Args('pairAddress') pairAddress: string,
        @Args('swapPairAddress') swapPairAddress: string,
        @Args('firstTokenID') firstTokenID: string,
        @Args('secondTokenID') secondTokenID: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.addTrustedSwapPair(
            pairAddress,
            swapPairAddress,
            firstTokenID,
            secondTokenID,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async removeTrustedSwapPair(
        @Args('pairAddress') pairAddress: string,
        @Args('firstTokenID') firstTokenID: string,
        @Args('secondTokenID') secondTokenID: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.removeTrustedSwapPair(
            pairAddress,
            firstTokenID,
            secondTokenID,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setTransferExecGasLimit(
        @Args('pairAddress') pairAddress: string,
        @Args('gasLimit') gasLimit: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setTransferExecGasLimit(
            pairAddress,
            gasLimit,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setExternSwapGasLimit(
        @Args('pairAddress') pairAddress: string,
        @Args('gasLimit') gasLimit: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setExternSwapGasLimit(
            pairAddress,
            gasLimit,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async pause(
        @Args('pairAddress') pairAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.pause(pairAddress);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async resume(
        @Args('pairAddress') pairAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.resume(pairAddress);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setStateActiveNoSwaps(
        @Args('pairAddress') pairAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setStateActiveNoSwaps(pairAddress);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setFeePercents(
        @Args('pairAddress') pairAddress: string,
        @Args('totalFeePercent') totalFeePercent: number,
        @Args('specialFeePercent') specialFeePercent: number,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setFeePercents(
            pairAddress,
            totalFeePercent,
            specialFeePercent,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setMaxObservationsPerRecord(
        @Args('pairAddress') pairAddress: string,
        @Args('maxObservationsPerRecord') maxObservationsPerRecord: number,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setMaxObservationsPerRecord(
            pairAddress,
            maxObservationsPerRecord,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setBPSwapConfig(
        @Args('pairAddress') pairAddress: string,
        @Args('config') config: BPConfig,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setBPSwapConfig(pairAddress, config);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setBPRemoveConfig(
        @Args('pairAddress') pairAddress: string,
        @Args('config') config: BPConfig,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setBPRemoveConfig(pairAddress, config);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setBPAddConfig(
        @Args('pairAddress') pairAddress: string,
        @Args('config') config: BPConfig,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setBPAddConfig(pairAddress, config);
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setLockingDeadlineEpoch(
        @Args('pairAddress') pairAddress: string,
        @Args('newDeadline') newDeadline: number,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setLockingDeadlineEpoch(
            pairAddress,
            newDeadline,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setLockingScAddress(
        @Args('pairAddress') pairAddress: string,
        @Args('newAddress') newAddress: string,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setLockingScAddress(
            pairAddress,
            newAddress,
        );
    }

    @UseGuards(GqlAdminGuard)
    @Query(() => TransactionModel)
    async setUnlockEpoch(
        @Args('pairAddress') pairAddress: string,
        @Args('newEpoch') newEpoch: number,
        @AuthUser() user: UserAuthResult,
    ): Promise<TransactionModel> {
        await this.pairService.requireOwner(pairAddress, user.address);
        return this.transactionService.setUnlockEpoch(pairAddress, newEpoch);
    }
}
