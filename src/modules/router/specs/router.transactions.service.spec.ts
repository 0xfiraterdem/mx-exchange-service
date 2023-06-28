import { Test, TestingModule } from '@nestjs/testing';
import { ContextGetterService } from 'src/services/context/context.getter.service';
import { ContextGetterServiceMock } from 'src/services/context/mocks/context.getter.service.mock';
import { RouterTransactionService } from '../services/router.transactions.service';
import { MXProxyService } from 'src/services/multiversx-communication/mx.proxy.service';
import { ApiConfigService } from 'src/helpers/api.config.service';
import { WrapTransactionsService } from 'src/modules/wrapping/services/wrap.transactions.service';
import { RouterService } from '../services/router.service';
import { CachingModule } from 'src/services/caching/cache.module';
import { Address } from '@multiversx/sdk-core';
import { encodeTransactionData } from 'src/helpers/helpers';
import { EsdtLocalRole } from '../models/router.args';
import { mxConfig, gasConfig } from 'src/config';
import { PairService } from 'src/modules/pair/services/pair.service';
import { WrapAbiServiceProvider } from 'src/modules/wrapping/mocks/wrap.abi.service.mock';
import { WrapService } from 'src/modules/wrapping/services/wrap.service';
import { TokenGetterServiceProvider } from 'src/modules/tokens/mocks/token.getter.service.mock';
import { PairAbiServiceProvider } from 'src/modules/pair/mocks/pair.abi.service.mock';
import { PairComputeServiceProvider } from 'src/modules/pair/mocks/pair.compute.service.mock';
import { RouterAbiServiceProvider } from '../mocks/router.abi.service.mock';
import { InputTokenModel } from 'src/models/inputToken.model';

describe('RouterService', () => {
    let module: TestingModule;

    const ContextGetterServiceProvider = {
        provide: ContextGetterService,
        useClass: ContextGetterServiceMock,
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [CachingModule],
            providers: [
                ContextGetterServiceProvider,
                PairAbiServiceProvider,
                PairComputeServiceProvider,
                PairService,
                RouterAbiServiceProvider,
                WrapAbiServiceProvider,
                WrapService,
                WrapTransactionsService,
                ApiConfigService,
                MXProxyService,
                RouterTransactionService,
                TokenGetterServiceProvider,
                RouterService,
            ],
        }).compile();
    });

    it('should be defined', () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        expect(service).toBeDefined();
    });

    it('should get create pair transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.createPair(
            Address.Zero().bech32(),
            'TOK3-3333',
            'TOK4-123456',
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.createPair,
            data: encodeTransactionData(
                'createPair@TOK3-3333@TOK4-123456@erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get issue LP token transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.issueLpToken(
            'erd1sea63y47u569ns3x5mqjf4vnygn9whkk7p6ry4rfpqyd6rd5addqyd9lf2',
            'LiquidityPoolToken3',
            'LPT-3333',
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '50000000000000000',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.issueToken,
            data: encodeTransactionData(
                'issueLpToken@erd1sea63y47u569ns3x5mqjf4vnygn9whkk7p6ry4rfpqyd6rd5addqyd9lf2@LiquidityPoolToken3@LPT-3333',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get issue LP token duplication error', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        try {
            await service.issueLpToken(
                'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
                'LiquidityPoolTokenT1T4',
                'EGLDTOK4LP-abcdef',
            );
        } catch (error) {
            expect(error).toEqual(new Error('LP Token already issued'));
        }
    });

    it('should get set local roles transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setLocalRoles(
            'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.setLocalRoles,
            data: encodeTransactionData(
                'setLocalRoles@erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set pause state transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setState(
            'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            false,
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setState,
            data: encodeTransactionData(
                'pause@erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set resume state transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setState(
            'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            true,
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setState,
            data: encodeTransactionData(
                'resume@erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set fee OFF transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setFee(
            'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            Address.Zero().bech32(),
            'WEGLD-123456',
            false,
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setFee,
            data: encodeTransactionData(
                'setFeeOff@erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u@erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu@WEGLD-123456',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set fee ON transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setFee(
            'erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u',
            Address.Zero().bech32(),
            'WEGLD-123456',
            true,
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setFee,
            data: encodeTransactionData(
                'setFeeOn@erd1qqqqqqqqqqqqqpgqe8m9w7cv2ekdc28q5ahku9x3hcregqpn0n4sum0e3u@erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu@WEGLD-123456',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set local roles owner', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setLocalRolesOwner({
            tokenID: 'WEGLD-123456',
            address: Address.Zero().bech32(),
            roles: [EsdtLocalRole.Mint],
        });
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setLocalRolesOwner,
            data: encodeTransactionData(
                'setLocalRolesOwner@WEGLD-123456@erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu@01',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get remove pair transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.removePair(
            'WEGLD-123456',
            'USDC-123456',
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.removePair,
            data: encodeTransactionData('removePair@WEGLD-123456@USDC-123456'),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set pair creation enabled ON transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setPairCreationEnabled(true);
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setPairCreationEnabled,
            data: encodeTransactionData('setPairCreationEnabled@01'),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set pair creation enabled OFF transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setPairCreationEnabled(false);
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: gasConfig.router.admin.setPairCreationEnabled,
            data: encodeTransactionData('setPairCreationEnabled@'),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get clear pair temporary owner storage transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.clearPairTemporaryOwnerStorage();
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: 200000000,
            data: 'Y2xlYXJQYWlyVGVtcG9yYXJ5T3duZXJTdG9yYWdl',
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set temporary owner period transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setTemporaryOwnerPeriod(
            '1000000000000000000000000000000000',
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: 200000000,
            data: encodeTransactionData(
                'setTemporaryOwnerPeriod@1000000000000000000000000000000000',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get set pair template address transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setPairTemplateAddress(
            Address.Zero().bech32(),
        );
        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver:
                'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: 200000000,
            data: encodeTransactionData(
                'setPairTemplateAddress@erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it('should get user swap enable transaction', async () => {
        const service = module.get<RouterTransactionService>(
            RouterTransactionService,
        );

        const transaction = await service.setSwapEnabledByUser(
            Address.Zero().bech32(),
            new InputTokenModel({
                tokenID: 'LKESDT-1234',
                nonce: 1,
                amount: '1000000000000000000',
                attributes: 'AAAAClRPSzFVU0RDTFAAAAAAAAAAAAAAAAAAAAAC',
            }),
        );

        expect(transaction).toEqual({
            nonce: 0,
            value: '0',
            receiver: Address.Zero().bech32(),
            sender: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu',
            gasPrice: 1000000000,
            gasLimit: 50000000,
            data: encodeTransactionData(
                'ESDTNFTTransfer@LKESDT-1234@01@1000000000000000000@erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp@setSwapEnabledByUser@erd1qqqqqqqqqqqqqpgqq67uv84ma3cekpa55l4l68ajzhq8qm3u0n4s20ecvx',
            ),
            chainID: mxConfig.chainID,
            version: 1,
            options: undefined,
            signature: undefined,
        });
    });

    it(
        'should get error on user swap enable transaction ' + 'lock period',
        async () => {
            const service = module.get<RouterTransactionService>(
                RouterTransactionService,
            );

            await expect(
                service.setSwapEnabledByUser(
                    Address.Zero().bech32(),
                    new InputTokenModel({
                        tokenID: 'LKESDT-1234',
                        nonce: 1,
                        amount: '1000000000000000000',
                        attributes: 'AAAAClRPSzFVU0RDTFAAAAAAAAAAAAAAAAAAAAAA',
                    }),
                ),
            ).rejects.toThrow('Token not locked for long enough');
        },
    );

    it(
        'should get error on user swap enable transaction ' +
            'invalid locked token',
        async () => {
            const service = module.get<RouterTransactionService>(
                RouterTransactionService,
            );

            await expect(
                service.setSwapEnabledByUser(
                    Address.Zero().bech32(),
                    new InputTokenModel({
                        tokenID: 'LKESDT-abcdef',
                        nonce: 1,
                        amount: '1000000000000000000',
                        attributes: 'AAAAClRPSzFVU0RDTFAAAAAAAAAAAAAAAAAAAAAC',
                    }),
                ),
            ).rejects.toThrow('Invalid input token');
        },
    );

    it(
        'should get error on user swap enable transaction ' +
            'invalid LP token locked',
        async () => {
            const service = module.get<RouterTransactionService>(
                RouterTransactionService,
            );

            await expect(
                service.setSwapEnabledByUser(
                    Address.Zero().bech32(),
                    new InputTokenModel({
                        tokenID: 'LKESDT-abcdef',
                        nonce: 1,
                        amount: '1000000000000000000',
                        attributes: 'AAAAClRPSzJUT0szTFAAAAAAAAAAAAAAAAAAAAAA',
                    }),
                ),
            ).rejects.toThrow('Invalid locked LP token');
        },
    );

    it(
        'should get error on user swap enable transaction ' +
            'wrong common token',
        async () => {
            const service = module.get<RouterTransactionService>(
                RouterTransactionService,
            );

            await expect(
                service.setSwapEnabledByUser(
                    Address.Zero().bech32(),
                    new InputTokenModel({
                        tokenID: 'LKESDT-1234',
                        nonce: 1,
                        amount: '1000000000000000000',
                        attributes: 'AAAAClRPSzFUT0syTFAAAAAAAAAAAAAAAAAAAAAA',
                    }),
                ),
            ).rejects.toThrow('Not a valid user defined pair');
        },
    );

    it(
        'should get error on user swap enable transaction ' +
            'min value locked',
        async () => {
            const service = module.get<RouterTransactionService>(
                RouterTransactionService,
            );

            await expect(
                service.setSwapEnabledByUser(
                    Address.Zero().bech32(),
                    new InputTokenModel({
                        tokenID: 'LKESDT-1234',
                        nonce: 1,
                        amount: '1000000000000000',
                        attributes: 'AAAAClRPSzFVU0RDTFAAAAAAAAAAAAAAAAAAAAAC',
                    }),
                ),
            ).rejects.toThrow('Not enough value locked');
        },
    );
});
